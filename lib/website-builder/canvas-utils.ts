// ─────────────────────────────────────────────────────────
// Canvas Utilities — Snapping, Guides, Measurements
// ─────────────────────────────────────────────────────────

export interface Rect {
  x: number
  y: number
  width: number
  height: number
}

export interface SnapGuide {
  type: "horizontal" | "vertical"
  position: number
  label?: string
}

export interface SnapResult {
  x: number
  y: number
  guides: SnapGuide[]
}

const SNAP_THRESHOLD = 6

export function getNodeRect(nodeId: string, containerEl: HTMLElement | null): Rect | null {
  if (!containerEl) return null
  const el = containerEl.querySelector(`[data-wb-id="${nodeId}"]`) as HTMLElement | null
  if (!el) return null
  const containerRect = containerEl.getBoundingClientRect()
  const elRect = el.getBoundingClientRect()
  return {
    x: elRect.left - containerRect.left,
    y: elRect.top - containerRect.top,
    width: elRect.width,
    height: elRect.height,
  }
}

export function getAllNodeRects(containerEl: HTMLElement | null, excludeIds: Set<string> = new Set()): Map<string, Rect> {
  const rects = new Map<string, Rect>()
  if (!containerEl) return rects
  const containerRect = containerEl.getBoundingClientRect()
  const elements = containerEl.querySelectorAll("[data-wb-id]")
  elements.forEach((el) => {
    const id = (el as HTMLElement).dataset.wbId
    if (!id || excludeIds.has(id)) return
    const r = el.getBoundingClientRect()
    rects.set(id, {
      x: r.left - containerRect.left,
      y: r.top - containerRect.top,
      width: r.width,
      height: r.height,
    })
  })
  return rects
}

export function computeSnap(
  draggingRect: Rect,
  siblingRects: Map<string, Rect>,
  parentRect: Rect | null,
  snapThreshold: number = SNAP_THRESHOLD
): SnapResult {
  let snapX = draggingRect.x
  let snapY = draggingRect.y
  const guides: SnapGuide[] = []

  const dragCenterX = draggingRect.x + draggingRect.width / 2
  const dragCenterY = draggingRect.y + draggingRect.height / 2
  const dragRight = draggingRect.x + draggingRect.width
  const dragBottom = draggingRect.y + draggingRect.height

  // Collect snap targets
  const hTargets: number[] = []
  const vTargets: number[] = []

  // Parent edges + center
  if (parentRect) {
    vTargets.push(parentRect.x, parentRect.x + parentRect.width / 2, parentRect.x + parentRect.width)
    hTargets.push(parentRect.y, parentRect.y + parentRect.height / 2, parentRect.y + parentRect.height)
  }

  // Sibling edges + centers
  siblingRects.forEach((r) => {
    vTargets.push(r.x, r.x + r.width / 2, r.x + r.width)
    hTargets.push(r.y, r.y + r.height / 2, r.y + r.height)
  })

  // Snap X (left, center, right of dragging element)
  const dragXPoints = [draggingRect.x, dragCenterX, dragRight]
  let bestDx = Infinity
  for (const dx of dragXPoints) {
    for (const target of vTargets) {
      const dist = Math.abs(dx - target)
      if (dist < snapThreshold && dist < bestDx) {
        bestDx = dist
        snapX = draggingRect.x + (target - dx)
        guides.push({ type: "vertical", position: target })
      }
    }
  }

  // Snap Y (top, center, bottom of dragging element)
  const dragYPoints = [draggingRect.y, dragCenterY, dragBottom]
  let bestDy = Infinity
  for (const dy of dragYPoints) {
    for (const target of hTargets) {
      const dist = Math.abs(dy - target)
      if (dist < snapThreshold && dist < bestDy) {
        bestDy = dist
        snapY = draggingRect.y + (target - dy)
        guides.push({ type: "horizontal", position: target })
      }
    }
  }

  // Spacing snap: equal spacing between siblings
  const sortedSiblings = Array.from(siblingRects.values()).sort((a, b) => a.y - b.y)
  if (sortedSiblings.length >= 2) {
    for (let i = 0; i < sortedSiblings.length - 1; i++) {
      const gap = sortedSiblings[i + 1].y - (sortedSiblings[i].y + sortedSiblings[i].height)
      // Check if dragging element could match this gap above or below a sibling
      const aboveTarget = sortedSiblings[i].y - gap - draggingRect.height
      const belowTarget = sortedSiblings[i].y + sortedSiblings[i].height + gap
      if (Math.abs(draggingRect.y - aboveTarget) < snapThreshold) {
        snapY = aboveTarget
        guides.push({ type: "horizontal", position: aboveTarget, label: `${Math.round(gap)}px` })
      }
      if (Math.abs(draggingRect.y - belowTarget) < snapThreshold) {
        snapY = belowTarget
        guides.push({ type: "horizontal", position: belowTarget, label: `${Math.round(gap)}px` })
      }
    }
  }

  return { x: snapX, y: snapY, guides }
}

export function measureDistance(rect1: Rect, rect2: Rect): { dx: number; dy: number } {
  const cx1 = rect1.x + rect1.width / 2
  const cy1 = rect1.y + rect1.height / 2
  const cx2 = rect2.x + rect2.width / 2
  const cy2 = rect2.y + rect2.height / 2
  return { dx: Math.round(cx2 - cx1), dy: Math.round(cy2 - cy1) }
}
