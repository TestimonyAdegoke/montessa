"use client"

import { useState } from "react"
import { WBNode, WBPageData, WBComponent } from "@/lib/website-builder/types"
import { BLOCK_REGISTRY } from "@/lib/website-builder/block-registry"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { 
  Plus, Trash2, Layers, Search, Settings, 
  ArrowUp, ArrowDown, Palette, Type, 
  FileText, Copy, Layout, Box, 
  ChevronRight, ChevronDown, EyeOff, Lock
} from "lucide-react"
import { cn } from "@/lib/utils"
import * as Icons from "lucide-react"

interface SidebarLeftProps {
  nodes: WBNode[]
  selectedNodeId: string | null
  onSelectNode: (id: string | null) => void
  onAddBlock: (type: string) => void
  onDeleteNode: (id: string) => void
  onReorderNodes: (parentId: string | null, from: number, to: number) => void
  pages: WBPageData[]
  currentPageId: string
  onSelectPage: (id: string) => void
  components: WBComponent[]
  onInsertComponent: (id: string) => void
  activeTab: string
  onTabChange: (tab: string) => void
}

export const SidebarLeft = ({
  nodes,
  selectedNodeId,
  onSelectNode,
  onAddBlock,
  onDeleteNode,
  onReorderNodes,
  pages,
  currentPageId,
  onSelectPage,
  components,
  onInsertComponent,
  activeTab,
  onTabChange
}: SidebarLeftProps) => {
  const [searchQuery, setSearchQuery] = useState("")

  const renderNodeTree = (node: WBNode, depth: number = 0) => {
    const isSelected = selectedNodeId === node.id
    const Icon = (Icons as any)[BLOCK_REGISTRY.find(b => b.type === node.type)?.icon || "Box"] || Box

    return (
      <div key={node.id}>
        <div
          className={cn(
            "group flex items-center justify-between py-1.5 px-2 rounded-md text-xs cursor-pointer transition-colors",
            isSelected ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted/50",
            node.hidden && "opacity-50"
          )}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
          onClick={() => onSelectNode(node.id)}
        >
          <div className="flex items-center gap-2 overflow-hidden">
            {node.children && node.children.length > 0 ? (
              <ChevronDown className="h-3 w-3 shrink-0 opacity-50" />
            ) : (
              <div className="w-3" />
            )}
            <Icon className="h-3.5 w-3.5 shrink-0 opacity-70" />
            <span className="truncate">{node.props?.title || node.props?.text || node.type}</span>
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon" className="h-5 w-5" onClick={(e) => { e.stopPropagation(); onDeleteNode(node.id) }}>
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
        {node.children?.map(child => renderNodeTree(child, depth + 1))}
      </div>
    )
  }

  const filteredBlocks = BLOCK_REGISTRY.filter(b => 
    b.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="w-[280px] border-r h-full flex flex-col bg-background/50 backdrop-blur-sm z-50 shrink-0">
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="font-bold text-xs uppercase tracking-wider">Website Builder</h2>
        <Button variant="ghost" size="icon" className="h-6 w-6"><Settings className="h-4 w-4" /></Button>
      </div>

      <Tabs value={activeTab} onValueChange={onTabChange} className="flex-1 flex flex-col overflow-hidden">
        <div className="px-2 pt-2">
          <TabsList className="w-full h-8 bg-muted/50 p-0.5">
            <TabsTrigger value="layers" className="flex-1 text-[10px] uppercase font-bold tracking-tighter">Layers</TabsTrigger>
            <TabsTrigger value="insert" className="flex-1 text-[10px] uppercase font-bold tracking-tighter">Insert</TabsTrigger>
            <TabsTrigger value="pages" className="flex-1 text-[10px] uppercase font-bold tracking-tighter">Pages</TabsTrigger>
            <TabsTrigger value="components" className="flex-1 text-[10px] uppercase font-bold tracking-tighter">Library</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="layers" className="flex-1 p-0 mt-0 overflow-hidden flex flex-col">
          <ScrollArea className="flex-1">
            <div className="p-2">
              {nodes.map(node => renderNodeTree(node))}
              {nodes.length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-[10px] uppercase tracking-widest font-bold">
                  Empty Page
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="insert" className="flex-1 p-0 mt-0 overflow-hidden flex flex-col">
          <div className="p-2 border-b">
            <div className="relative">
              <Search className="absolute left-2 top-2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                placeholder="Search blocks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-muted/40 h-8 rounded-md pl-7 p-2 text-[10px] focus:outline-none focus:ring-1 focus:ring-primary/20"
              />
            </div>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2 grid grid-cols-2 gap-2">
              {filteredBlocks.map((block) => {
                const Icon = (Icons as any)[block.icon] || Box
                return (
                  <button
                    key={block.type}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData("wb-block-type", block.type)
                      e.dataTransfer.effectAllowed = "copy"
                    }}
                    className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-lg border bg-card hover:border-primary/50 hover:bg-primary/5 transition-all group text-center"
                    onClick={() => onAddBlock(block.type)}
                  >
                    <div className="h-8 w-8 rounded-full bg-muted group-hover:bg-background flex items-center justify-center transition-colors shadow-sm">
                      <Icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <span className="text-[10px] font-medium truncate w-full">{block.label}</span>
                  </button>
                )
              })}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="pages" className="flex-1 p-0 mt-0 overflow-hidden flex flex-col">
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {pages.map((page) => (
                <div
                  key={page.id}
                  className={cn(
                    "flex items-center justify-between p-2 rounded-md text-xs cursor-pointer transition-colors",
                    currentPageId === page.id ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted/50"
                  )}
                  onClick={() => onSelectPage(page.id)}
                >
                  <div className="flex items-center gap-2">
                    {page.isHomepage ? <Icons.Home className="h-3.5 w-3.5" /> : <Icons.FileText className="h-3.5 w-3.5" />}
                    <span>{page.title}</span>
                  </div>
                  {page.status === "DRAFT" && <span className="text-[9px] bg-muted px-1 rounded text-muted-foreground uppercase font-bold">Draft</span>}
                </div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="components" className="flex-1 p-0 mt-0 overflow-hidden flex flex-col">
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-2">
              {components.map((comp) => (
                <button
                  key={comp.id}
                  className="w-full flex items-center gap-3 p-3 rounded-lg border bg-card hover:border-primary/50 hover:bg-primary/5 transition-all text-left group"
                  onClick={() => onInsertComponent(comp.id)}
                >
                  <div className="h-8 w-8 rounded bg-muted group-hover:bg-background flex items-center justify-center shrink-0 shadow-sm">
                    <Icons.Component className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-[10px] font-bold truncate uppercase">{comp.name}</p>
                    <p className="text-[9px] text-muted-foreground truncate">{comp.sourceNodes.length} nodes</p>
                  </div>
                </button>
              ))}
              {components.length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-[10px] uppercase font-bold">
                  No custom components
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  )
}
