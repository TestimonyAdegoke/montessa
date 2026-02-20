"use client"

import React, { useState, useRef, useEffect, useCallback } from "react"
import { Block } from "./types"
import { BLOCK_DEFINITIONS } from "./registry"
import { cn, hexToHSL } from "@/lib/utils"
import { DeviceProvider, DeviceMode } from "./device-context"
import { Monitor, Tablet, Smartphone, ZoomIn, ZoomOut, ArrowUp, ArrowDown, Trash2, GripVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
    DragStartEvent,
    DragOverlay,
} from "@dnd-kit/core"
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

interface CanvasProps {
    blocks: Block[]
    selectedBlockId: string | null
    onSelectBlock: (id: string | null) => void
    onBlockChange: (id: string, newProps: any) => void
    mode: "landing" | "login"
    loginContent?: React.ReactNode
    globalStyles?: any
    onDeleteBlock?: (id: string) => void
    onMoveBlock?: (id: string, direction: 'up' | 'down') => void
    onReorderBlocks?: (blocks: Block[]) => void
    onAddBlockFromSidebar?: (type: string) => void
}

// Sortable Block Wrapper
const SortableBlock = ({ block, selectedBlockId, onSelectBlock, onBlockChange, onDeleteBlock, onMoveBlock }: {
    block: Block
    selectedBlockId: string | null
    onSelectBlock: (id: string | null) => void
    onBlockChange: (id: string, newProps: any) => void
    onDeleteBlock?: (id: string) => void
    onMoveBlock?: (id: string, direction: 'up' | 'down') => void
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: block.id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        position: 'relative' as const,
        zIndex: isDragging ? 50 : undefined,
    }

    const def = BLOCK_DEFINITIONS[block.type]
    if (!def) return null
    const Component = def.component

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                "relative group transition-all",
                selectedBlockId === block.id ? "z-10" : "hover:z-10",
                isDragging && "ring-2 ring-primary/50 rounded-lg shadow-2xl"
            )}
            onClick={(e) => {
                e.stopPropagation()
                onSelectBlock(block.id)
            }}
        >
            {/* Drag Handle */}
            <div
                {...attributes}
                {...listeners}
                className={cn(
                    "absolute left-1/2 -translate-x-1/2 -top-3 z-30 flex items-center gap-1 px-2 py-1 rounded-full bg-primary/90 text-primary-foreground shadow-lg cursor-grab active:cursor-grabbing transition-all duration-200",
                    selectedBlockId === block.id || isDragging
                        ? "opacity-100 scale-100"
                        : "opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100"
                )}
                onClick={(e) => e.stopPropagation()}
            >
                <GripVertical className="h-3.5 w-3.5" />
                <span className="text-[9px] font-bold uppercase tracking-wider">{def.label}</span>
            </div>

            {/* Hover/Selection Outline */}
            <div className={cn(
                "absolute inset-0 border-2 border-transparent pointer-events-none transition-colors rounded-sm",
                selectedBlockId === block.id ? "border-primary" : "group-hover:border-primary/40"
            )} />

            {/* Action Buttons */}
            {selectedBlockId === block.id && (
                <div className="absolute top-0 right-2 -translate-y-full flex items-center gap-0.5 bg-primary text-primary-foreground text-[10px] px-1.5 py-1 rounded-t-lg font-bold shadow-lg pointer-events-auto z-20">
                    <button
                        onClick={(e) => { e.stopPropagation(); onMoveBlock?.(block.id, 'up') }}
                        className="p-1 hover:bg-white/20 rounded transition-colors"
                        title="Move Up"
                    >
                        <ArrowUp className="h-3 w-3" />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onMoveBlock?.(block.id, 'down') }}
                        className="p-1 hover:bg-white/20 rounded transition-colors"
                        title="Move Down"
                    >
                        <ArrowDown className="h-3 w-3" />
                    </button>
                    <div className="h-3 w-px bg-primary-foreground/30 mx-0.5" />
                    <button
                        onClick={(e) => { e.stopPropagation(); onDeleteBlock?.(block.id) }}
                        className="p-1 hover:bg-destructive rounded transition-colors"
                        title="Delete"
                    >
                        <Trash2 className="h-3 w-3" />
                    </button>
                </div>
            )}

            <Component
                block={block}
                onChange={onBlockChange}
                selected={selectedBlockId === block.id}
            />
        </div>
    )
}

export const Canvas = ({ blocks, selectedBlockId, onSelectBlock, onBlockChange, mode, loginContent, globalStyles, onDeleteBlock, onMoveBlock, onReorderBlocks, onAddBlockFromSidebar }: CanvasProps) => {
    const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">("desktop")
    const [scale, setScale] = useState(1)
    const [activeDragId, setActiveDragId] = useState<string | null>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    const handleDragStart = useCallback((event: DragStartEvent) => {
        setActiveDragId(event.active.id as string)
    }, [])

    const handleDragEnd = useCallback((event: DragEndEvent) => {
        const { active, over } = event
        setActiveDragId(null)

        if (over && active.id !== over.id) {
            const oldIndex = blocks.findIndex(b => b.id === active.id)
            const newIndex = blocks.findIndex(b => b.id === over.id)
            if (oldIndex !== -1 && newIndex !== -1) {
                const reordered = arrayMove(blocks, oldIndex, newIndex)
                onReorderBlocks?.(reordered)
            }
        }
    }, [blocks, onReorderBlocks])

    // Accept HTML5 drag-and-drop from the sidebar to add new blocks
    const handleSidebarDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        const types = Array.from(event.dataTransfer.types || [])
        if (types.includes("site-builder/block-type")) {
            event.preventDefault()
            event.dataTransfer.dropEffect = "copy"
        }
    }, [])

    const handleSidebarDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        const blockType = event.dataTransfer.getData("site-builder/block-type")
        if (blockType && onAddBlockFromSidebar) {
            event.preventDefault()
            onAddBlockFromSidebar(blockType)
        }
    }, [onAddBlockFromSidebar])

    // Auto-scale
    useEffect(() => {
        const updateScale = () => {
            if (!containerRef.current) return
            const containerWidth = containerRef.current.offsetWidth
            const targetWidth = device === "desktop" ? 1440 : device === "tablet" ? 768 : 375
            const s = (containerWidth - 96) / targetWidth // 96px padding
            setScale(Math.min(s, 1))
        }
        updateScale()
        window.addEventListener("resize", updateScale)
        return () => window.removeEventListener("resize", updateScale)
    }, [device])

    const targetWidth = device === "desktop" ? "1440px" : device === "tablet" ? "768px" : "375px"
    const targetHeight = device === "desktop" ? "900px" : device === "tablet" ? "1024px" : "667px"

    return (
        <div className="flex-1 flex flex-col h-full bg-muted/20 relative overflow-hidden">
            {/* Toolbar */}
            <div className="h-14 border-b bg-background/50 backdrop-blur-sm flex items-center justify-between px-4 shrink-0 z-40">
                <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg">
                    <Button variant={device === "desktop" ? "secondary" : "ghost"} size="sm" onClick={() => setDevice("desktop")}><Monitor className="h-4 w-4" /></Button>
                    <Button variant={device === "tablet" ? "secondary" : "ghost"} size="sm" onClick={() => setDevice("tablet")}><Tablet className="h-4 w-4" /></Button>
                    <Button variant={device === "mobile" ? "secondary" : "ghost"} size="sm" onClick={() => setDevice("mobile")}><Smartphone className="h-4 w-4" /></Button>
                </div>
                <span className="text-xs text-muted-foreground font-mono">{Math.round(scale * 100)}%</span>
            </div>

            {/* Viewport */}
            <div
                ref={containerRef}
                className="flex-1 w-full relative overflow-hidden flex items-center justify-center p-12"
                onClick={() => onSelectBlock(null)}
                onDragOver={handleSidebarDragOver}
                onDrop={handleSidebarDrop}
            >
                <div
                    className="bg-background shadow-2xl transition-all duration-300 origin-center overflow-y-auto overflow-x-hidden no-scrollbar"
                    style={{
                        width: targetWidth,
                        height: mode === 'landing' ? '100%' : targetHeight,
                        maxHeight: mode === 'landing' ? '100%' : targetHeight, // login is fixed height usually
                        transform: `scale(${scale})`,
                        fontFamily: globalStyles?.fontFamily || 'Inter',
                        "--primary": globalStyles?.primaryColor ? hexToHSL(globalStyles.primaryColor) : undefined,
                        "--secondary": globalStyles?.secondaryColor ? hexToHSL(globalStyles.secondaryColor) : undefined,
                        "--accent": globalStyles?.accentColor ? hexToHSL(globalStyles.accentColor) : undefined,
                    } as React.CSSProperties}
                    onClick={(e) => e.stopPropagation()} // Prevent deselecting
                >
                    {mode === "landing" ? (
                        <DeviceProvider device={device}>
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragStart={handleDragStart}
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext
                                items={blocks.map(b => b.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                <div className="min-h-full flex flex-col bg-background">
                                    {blocks.map((block) => (
                                        <SortableBlock
                                            key={block.id}
                                            block={block}
                                            selectedBlockId={selectedBlockId}
                                            onSelectBlock={onSelectBlock}
                                            onBlockChange={onBlockChange}
                                            onDeleteBlock={onDeleteBlock}
                                            onMoveBlock={onMoveBlock}
                                        />
                                    ))}

                                    {blocks.length === 0 && (
                                        <div className="flex flex-col items-center justify-center h-[500px] border-2 border-dashed border-muted m-12 rounded-xl">
                                            <div className="text-center space-y-3">
                                                <GripVertical className="h-8 w-8 text-muted-foreground/40 mx-auto" />
                                                <p className="text-muted-foreground font-medium">Add blocks from the sidebar</p>
                                                <p className="text-muted-foreground/60 text-sm">Drag to reorder them</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </SortableContext>

                            {/* Drag Overlay */}
                            <DragOverlay>
                                {activeDragId ? (
                                    <div className="opacity-80 shadow-2xl rounded-lg ring-2 ring-primary scale-[1.02] pointer-events-none">
                                        <div className="bg-primary/10 backdrop-blur-sm p-4 rounded-lg text-center">
                                            <span className="text-sm font-bold text-primary">
                                                {BLOCK_DEFINITIONS[blocks.find(b => b.id === activeDragId)?.type || '']?.label || 'Block'}
                                            </span>
                                        </div>
                                    </div>
                                ) : null}
                            </DragOverlay>
                        </DndContext>
                        </DeviceProvider>
                    ) : (
                        // Login Mode Render
                        <div className="h-full w-full">
                            {/* We can inject the Login Portal Preview component here */}
                            {loginContent}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
