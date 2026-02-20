import { create } from "zustand"
import type { WBNode, WBStyles, WBEditorState, WBComponent, WBComponentEditableField } from "./types"

// ─────────────────────────────────────────────────────────
// Tree helpers
// ─────────────────────────────────────────────────────────

function findNode(nodes: WBNode[], id: string): WBNode | null {
  for (const n of nodes) {
    if (n.id === id) return n
    if (n.children) {
      const found = findNode(n.children, id)
      if (found) return found
    }
  }
  return null
}

function updateInTree(nodes: WBNode[], id: string, updater: (n: WBNode) => WBNode): WBNode[] {
  return nodes.map((n) => {
    if (n.id === id) return updater(n)
    if (n.children) return { ...n, children: updateInTree(n.children, id, updater) }
    return n
  })
}

function updateMultipleInTree(nodes: WBNode[], ids: Set<string>, updater: (n: WBNode) => WBNode): WBNode[] {
  return nodes.map((n) => {
    let next = n
    if (ids.has(n.id)) {
      next = updater(n)
    }
    if (next.children) {
      next = { ...next, children: updateMultipleInTree(next.children, ids, updater) }
    }
    return next
  })
}

function removeFromTree(nodes: WBNode[], id: string): WBNode[] {
  return nodes
    .filter((n) => n.id !== id)
    .map((n) => {
      if (n.children) return { ...n, children: removeFromTree(n.children, id) }
      return n
    })
}

function insertInTree(nodes: WBNode[], parentId: string | null, node: WBNode, index: number): WBNode[] {
  if (!parentId) {
    const copy = [...nodes]
    copy.splice(index, 0, node)
    return copy
  }
  return nodes.map((n) => {
    if (n.id === parentId) {
      const children = [...(n.children || [])]
      children.splice(index, 0, node)
      return { ...n, children }
    }
    if (n.children) return { ...n, children: insertInTree(n.children, parentId, node, index) }
    return n
  })
}

function cloneNode(node: WBNode): WBNode {
  const uid = Math.random().toString(36).slice(2, 10)
  return {
    ...node,
    id: uid,
    props: { ...node.props },
    styles: node.styles ? { ...node.styles } : undefined,
    children: node.children?.map(cloneNode),
  }
}

function assignComponentNodeIds(nodes: WBNode[]): WBNode[] {
  return nodes.map((node) => {
    const cloned: WBNode = {
      ...node,
      props: { ...node.props },
      componentNodeId: node.componentNodeId || `cmp_${Math.random().toString(36).slice(2, 10)}`,
      children: node.children ? assignComponentNodeIds(node.children) : undefined,
    }
    return cloned
  })
}

function collectEditableFields(nodes: WBNode[]): WBComponentEditableField[] {
  const fields: WBComponentEditableField[] = []
  const ALLOWLIST = ["title", "subtitle", "text", "buttonText", "ctaText", "ctaSecondaryText", "buttonHref", "ctaHref", "ctaSecondaryHref", "href"]

  const walk = (nodeList: WBNode[]) => {
    for (const node of nodeList) {
      const nodeId = node.componentNodeId
      if (nodeId) {
        for (const key of ALLOWLIST) {
          const val = node.props?.[key]
          if (typeof val === "string" && val.trim().length > 0) {
            fields.push({
              key: `${nodeId}:${key}`,
              label: `${node.type} • ${key}`,
              defaultValue: val,
            })
          }
        }
      }
      if (node.children?.length) walk(node.children)
    }
  }

  walk(nodes)
  return fields.slice(0, 24)
}

function createInstanceNode(component: WBComponent): WBNode {
  return {
    id: Math.random().toString(36).slice(2, 10),
    type: "componentInstance",
    props: {
      componentId: component.id,
      componentName: component.name,
      overrides: {},
    },
    children: [],
  }
}

// ─────────────────────────────────────────────────────────
// Store
// ─────────────────────────────────────────────────────────

const MAX_HISTORY = 50
let redoStack: WBNode[][] = []

export const useEditorStore = create<WBEditorState>((set, get) => ({
  pageId: null,
  nodes: [],
  selectedNodeId: null,
  multiSelectedIds: new Set<string>(),
  hoveredNodeId: null,
  clipboard: null,
  styleClipboard: null,

  history: [],
  historyIndex: -1,
  redoDepth: 0,
  isDirty: false,

  viewport: "desktop",
  zoom: 1,
  showGrid: false,

  uiMode: "minimal",

  leftPanel: null,
  rightPanel: null,

  // ── Setters ───────────────────────────────────────
  setNodes: (nodes) => set({ nodes, isDirty: true }),

  selectNode: (id) => set({ selectedNodeId: id, multiSelectedIds: new Set<string>() }),
  toggleSelectNode: (id) => {
    const state = get()
    const next = new Set(state.multiSelectedIds)
    if (next.has(id)) { next.delete(id) } else { next.add(id) }
    set({ multiSelectedIds: next, selectedNodeId: id })
  },
  clearMultiSelect: () => set({ multiSelectedIds: new Set<string>() }),
  hoverNode: (id) => set({ hoveredNodeId: id }),

  setPageId: (id) => set({ pageId: id }),
  setDirty: (d) => set({ isDirty: d }),

  // ── Node CRUD ─────────────────────────────────────
  addNode: (node, parentId, index) => {
    const state = get()
    state.pushHistory()
    const idx = index ?? (parentId ? (findNode(state.nodes, parentId)?.children?.length || 0) : state.nodes.length)
    const nodes = insertInTree(state.nodes, parentId || null, node, idx)
    set({ nodes, isDirty: true, selectedNodeId: node.id })
  },

  updateNode: (id, updates) => {
    const state = get()
    state.pushHistory()
    const nodes = updateInTree(state.nodes, id, (n) => ({ ...n, ...updates }))
    set({ nodes, isDirty: true })
  },

  updateNodeProps: (id, props) => {
    const state = get()
    state.pushHistory()
    const nodes = updateInTree(state.nodes, id, (n) => ({
      ...n,
      props: { ...n.props, ...props },
    }))
    set({ nodes, isDirty: true })
  },

  updateNodeStyles: (id, styles) => {
    const state = get()
    state.pushHistory()
    const nodes = updateInTree(state.nodes, id, (n) => {
      const nextStyles = { ...(n.styles || {}) }
      for (const [bp, overrides] of Object.entries(styles)) {
        nextStyles[bp as keyof WBStyles] = { ...(nextStyles[bp as keyof WBStyles] || {}), ...overrides }
      }
      return { ...n, styles: nextStyles }
    })
    set({ nodes, isDirty: true })
  },

  updateNodesProps: (ids, props) => {
    const state = get()
    state.pushHistory()
    const nodes = updateMultipleInTree(state.nodes, ids, (n) => ({
      ...n,
      props: { ...n.props, ...props },
    }))
    set({ nodes, isDirty: true })
  },

  updateNodesStyles: (ids, styles) => {
    const state = get()
    state.pushHistory()
    const nodes = updateMultipleInTree(state.nodes, ids, (n) => {
      const nextStyles = { ...(n.styles || {}) }
      for (const [bp, overrides] of Object.entries(styles)) {
        nextStyles[bp as keyof WBStyles] = { ...(nextStyles[bp as keyof WBStyles] || {}), ...overrides }
      }
      return { ...n, styles: nextStyles }
    })
    set({ nodes, isDirty: true })
  },

  removeNode: (id) => {
    const state = get()
    state.pushHistory()
    const nodes = removeFromTree(state.nodes, id)
    set({
      nodes,
      isDirty: true,
      selectedNodeId: state.selectedNodeId === id ? null : state.selectedNodeId,
    })
  },

  moveNode: (id, newParentId, index) => {
    const state = get()
    const node = findNode(state.nodes, id)
    if (!node) return
    state.pushHistory()
    const withoutNode = removeFromTree(state.nodes, id)
    const nodes = insertInTree(withoutNode, newParentId, node, index)
    set({ nodes, isDirty: true })
  },

  reorderNodes: (parentId, fromIndex, toIndex) => {
    const state = get()
    state.pushHistory()
    if (!parentId) {
      const arr = [...state.nodes]
      const [moved] = arr.splice(fromIndex, 1)
      arr.splice(toIndex, 0, moved)
      set({ nodes: arr, isDirty: true })
    } else {
      const nodes = updateInTree(state.nodes, parentId, (n) => {
        const children = [...(n.children || [])]
        const [moved] = children.splice(fromIndex, 1)
        children.splice(toIndex, 0, moved)
        return { ...n, children }
      })
      set({ nodes, isDirty: true })
    }
  },

  duplicateNode: (id) => {
    const state = get()
    const node = findNode(state.nodes, id)
    if (!node) return
    const clone = cloneNode(node)
    state.pushHistory()
    // Insert after the original at the same level
    // Find parent
    function findParent(nodes: WBNode[], targetId: string): string | null {
      for (const n of nodes) {
        if (n.children?.some((c) => c.id === targetId)) return n.id
        if (n.children) {
          const found = findParent(n.children, targetId)
          if (found) return found
        }
      }
      return null
    }
    const parentId = findParent(state.nodes, id)
    const siblings = parentId ? (findNode(state.nodes, parentId)?.children || []) : state.nodes
    const idx = siblings.findIndex((s) => s.id === id)
    const nodes = insertInTree(state.nodes, parentId, clone, idx + 1)
    set({ nodes, isDirty: true, selectedNodeId: clone.id })
  },

  copyNode: (id) => {
    const node = findNode(get().nodes, id)
    if (node) set({ clipboard: cloneNode(node) })
  },

  pasteNode: (parentId) => {
    const state = get()
    if (!state.clipboard) return
    const clone = cloneNode(state.clipboard)
    state.addNode(clone, parentId)
  },

  copyStyles: (id) => {
    const node = findNode(get().nodes, id)
    if (node && node.styles) {
      set({ styleClipboard: JSON.parse(JSON.stringify(node.styles)) })
    }
  },

  pasteStyles: (ids) => {
    const state = get()
    if (!state.styleClipboard) return
    state.pushHistory()
    const styles = JSON.parse(JSON.stringify(state.styleClipboard))
    const nodes = updateMultipleInTree(state.nodes, ids, (n) => ({
      ...n,
      styles: { ...n.styles, ...styles }
    }))
    set({ nodes, isDirty: true })
  },

  wrapInStack: (ids) => {
    const state = get()
    if (ids.size === 0) return
    
    // 1. Find common parent and indices
    let parentId: string | null = null
    let minIndex = Infinity
    const nodesToWrap: WBNode[] = []
    
    // Helper to find parent and index
    const findParentAndIndex = (nodes: WBNode[], targetId: string, currentParentId: string | null = null): { parentId: string | null, index: number, node: WBNode } | null => {
      for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].id === targetId) return { parentId: currentParentId, index: i, node: nodes[i] }
        if (nodes[i].children) {
          const found = findParentAndIndex(nodes[i].children!, targetId, nodes[i].id)
          if (found) return found
        }
      }
      return null
    }

    // Collect info for all nodes
    const nodeInfos: { parentId: string | null, index: number, node: WBNode }[] = []
    ids.forEach((id) => {
      const found = findParentAndIndex(state.nodes, id)
      if (found) nodeInfos.push(found)
    })
    
    if (nodeInfos.length === 0) return

    // Sort by index to maintain order
    nodeInfos.sort((a, b) => a.index - b.index)
    
    // Check if all nodes share the same parent
    const commonParentId = nodeInfos[0].parentId
    const allSameParent = nodeInfos.every(n => n.parentId === commonParentId)
    if (!allSameParent) return // or we could handle reparenting, but for now strict sibling wrapping is safer

    // Use the parent of the first node as the target parent
    parentId = commonParentId
    minIndex = nodeInfos[0].index
    
    // 2. Create Stack Node
    const stackId = Math.random().toString(36).slice(2, 10)
    const stackNode: WBNode = {
      id: stackId,
      type: "stack",
      props: {
        direction: "column",
        align: "stretch",
        justify: "start",
        gap: "gap-4",
        padding: "p-4",
        wrap: "nowrap",
        width: "w-full",
      },
      children: nodeInfos.map(info => ({ ...info.node })), // Clone not strictly necessary if we remove them, but safer
      styles: {}
    }

    state.pushHistory()

    // 3. Remove original nodes
    let newNodes = state.nodes
    const idsArray = Array.from(ids)
    for (const id of idsArray) {
      newNodes = removeFromTree(newNodes, id)
    }

    // 4. Insert Stack at minIndex in parentId
    newNodes = insertInTree(newNodes, parentId, stackNode, minIndex)

    set({ nodes: newNodes, isDirty: true, selectedNodeId: stackId, multiSelectedIds: new Set() })
  },

  // ── History ───────────────────────────────────────
  pushHistory: () => {
    const state = get()
    const history = state.history.slice(0, state.historyIndex + 1)
    history.push(JSON.parse(JSON.stringify(state.nodes)))
    if (history.length > MAX_HISTORY) history.shift()
    redoStack = []
    set({ history, historyIndex: history.length - 1, redoDepth: 0 })
  },

  resetHistory: () => {
    redoStack = []
    set({ history: [], historyIndex: -1, redoDepth: 0 })
  },

  undo: () => {
    const state = get()
    if (state.historyIndex < 0) return
    const nodes = state.history[state.historyIndex]
    redoStack.push(JSON.parse(JSON.stringify(state.nodes)))
    set({
      nodes: JSON.parse(JSON.stringify(nodes)),
      historyIndex: state.historyIndex - 1,
      redoDepth: redoStack.length,
      isDirty: true,
    })
  },

  redo: () => {
    const state = get()
    if (redoStack.length === 0) return
    const next = redoStack.pop()!

    // Preserve current state as an undo point before applying redo state.
    const history = state.history.slice(0, state.historyIndex + 1)
    history.push(JSON.parse(JSON.stringify(state.nodes)))
    if (history.length > MAX_HISTORY) history.shift()

    set({
      nodes: JSON.parse(JSON.stringify(next)),
      history,
      historyIndex: history.length - 1,
      redoDepth: redoStack.length,
      isDirty: true,
    })
  },

  // ── Viewport ──────────────────────────────────────
  setViewport: (v) => set({ viewport: v }),
  setZoom: (z) => set({ zoom: Math.max(0.25, Math.min(2, z)) }),
  toggleGrid: () => set((s) => ({ showGrid: !s.showGrid })),

  setLeftPanel: (p) => set({ leftPanel: p }),
  setRightPanel: (p) => set({ rightPanel: p }),

  setUiMode: (m) => set((s) => ({
    uiMode: m,
    leftPanel: m === "minimal" ? null : (s.leftPanel || "insert"),
    rightPanel: m === "minimal" ? null : (s.rightPanel || "inspector"),
  })),

  // ── Reusable Components ─────────────────────────
  components: [],

  deleteComponent: (id) => {
    set((s) => ({ components: s.components.filter((c) => c.id !== id) }))
  },

  setComponents: (components) => {
    set({ components })
  },

  insertComponent: (componentId) => {
    const state = get()
    const comp = state.components.find((c) => c.id === componentId)
    if (!comp) return
    const instanceNode = createInstanceNode(comp)
    state.pushHistory()
    const nodes = [...state.nodes, instanceNode]
    set({ nodes, isDirty: true, selectedNodeId: instanceNode.id })
  },

  createComponent: (name, sourceNodes) => {
    const id = Math.random().toString(36).slice(2, 10)
    const normalizedSource = assignComponentNodeIds(JSON.parse(JSON.stringify(sourceNodes)))
    const comp = {
      id,
      name,
      sourceNodes: normalizedSource,
      editableFields: collectEditableFields(normalizedSource),
      createdAt: Date.now(),
    }
    set((s) => ({ components: [...s.components, comp] }))
  },
}))
