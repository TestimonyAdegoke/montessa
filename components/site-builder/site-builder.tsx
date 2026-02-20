"use client"

import { useState, useCallback, useEffect } from "react"
import { Block, SiteConfig, GlobalStyles, SitePage, Site } from "./types"
import { SidebarLeft } from "./sidebar-left"
import { SidebarRight } from "./sidebar-right"
import { Template } from "./templates"

import { Canvas } from "./canvas"
import { BLOCK_DEFINITIONS } from "./registry"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { ExternalLink, Loader2, Save, Undo, Redo, Smartphone, Tablet, Monitor, X, AlertTriangle, FileText, Plus, Trash2, Home, GripVertical, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"

const generateId = () => Math.random().toString(36).substr(2, 9)

interface SiteBuilderProps {
    initialBlocks?: Block[]
    initialPages?: SitePage[]
    onSave: (blocks: Block[], options?: { auto?: boolean; pageId?: string }) => Promise<void>
    onSavePages?: (pages: SitePage[]) => Promise<void>
    onExit: () => void
    loading?: boolean
    globalStyles?: GlobalStyles
    onGlobalStyleChange?: (styles: GlobalStyles) => void
    multiPageMode?: boolean
}

export const SiteBuilder = ({ initialBlocks = [], initialPages, onSave, onSavePages, onExit, loading, globalStyles, onGlobalStyleChange, multiPageMode = false }: SiteBuilderProps) => {
    // Multi-page state
    const [pages, setPages] = useState<SitePage[]>(() => {
        if (initialPages && initialPages.length > 0) return initialPages
        // Default single page for backward compatibility
        return [{
            id: 'home',
            title: 'Home',
            slug: '',
            sortOrder: 0,
            status: 'DRAFT' as const,
            draftBlocks: initialBlocks,
            publishedBlocks: [],
            isHomePage: true
        }]
    })
    const [currentPageId, setCurrentPageId] = useState<string>(pages[0]?.id || 'home')
    const [showPagesPanel, setShowPagesPanel] = useState(multiPageMode)
    
    // Get current page
    const currentPage = pages.find(p => p.id === currentPageId) || pages[0]
    const blocks = currentPage?.draftBlocks || []
    
    const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null)
    const [pendingTemplate, setPendingTemplate] = useState<Template | null>(null)
    const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false)

    // History Stack for undo/redo (per page)
    const [historyMap, setHistoryMap] = useState<Record<string, Block[][]>>({ [currentPageId]: [blocks] })
    const [historyIndexMap, setHistoryIndexMap] = useState<Record<string, number>>({ [currentPageId]: 0 })
    
    const history = historyMap[currentPageId] || [blocks]
    const historyIndex = historyIndexMap[currentPageId] || 0

    // Sync initial blocks/pages if they change
    useEffect(() => {
        if (initialPages && initialPages.length > 0) {
            setPages(initialPages)
            if (!initialPages.find(p => p.id === currentPageId)) {
                setCurrentPageId(initialPages[0].id)
            }
        } else if (initialBlocks && initialBlocks.length > 0 && pages[0]?.draftBlocks.length === 0) {
            setPages(prev => prev.map((p, i) => i === 0 ? { ...p, draftBlocks: initialBlocks } : p))
        }
    }, [initialBlocks, initialPages])

    // Autosave functionality (silent draft save)
    useEffect(() => {
        const timer = setTimeout(() => {
            if (historyIndex > 0) { // Only autosave if there are changes
                // Auto-save as a background draft without blocking UI or showing publish toasts
                void onSave(blocks, { auto: true })
            }
        }, 5000) // Autosave every 5 seconds of inactivity

        return () => clearTimeout(timer)
    }, [blocks, onSave, historyIndex])

    // Update blocks for current page
    const setBlocks = (newBlocks: Block[]) => {
        setPages(prev => prev.map(p => 
            p.id === currentPageId ? { ...p, draftBlocks: newBlocks } : p
        ))
    }

    const pushHistory = (newBlocks: Block[]) => {
        const currentHistory = historyMap[currentPageId] || [blocks]
        const currentIndex = historyIndexMap[currentPageId] || 0
        const newHistory = currentHistory.slice(0, currentIndex + 1)
        newHistory.push(newBlocks)
        setHistoryMap(prev => ({ ...prev, [currentPageId]: newHistory }))
        setHistoryIndexMap(prev => ({ ...prev, [currentPageId]: newHistory.length - 1 }))
        setBlocks(newBlocks)
    }

    const undo = () => {
        if (historyIndex > 0) {
            const newIndex = historyIndex - 1
            setHistoryIndexMap(prev => ({ ...prev, [currentPageId]: newIndex }))
            setBlocks(history[newIndex])
        }
    }

    const redo = () => {
        if (historyIndex < history.length - 1) {
            const newIndex = historyIndex + 1
            setHistoryIndexMap(prev => ({ ...prev, [currentPageId]: newIndex }))
            setBlocks(history[newIndex])
        }
    }

    // Page management functions
    const addPage = () => {
        const newPage: SitePage = {
            id: generateId(),
            title: 'New Page',
            slug: `page-${pages.length + 1}`,
            sortOrder: pages.length,
            status: 'DRAFT',
            draftBlocks: [],
            publishedBlocks: [],
            isHomePage: false
        }
        setPages(prev => [...prev, newPage])
        setCurrentPageId(newPage.id)
        setHistoryMap(prev => ({ ...prev, [newPage.id]: [[]] }))
        setHistoryIndexMap(prev => ({ ...prev, [newPage.id]: 0 }))
    }

    const deletePage = (pageId: string) => {
        if (pages.length <= 1) return // Can't delete last page
        const page = pages.find(p => p.id === pageId)
        if (page?.isHomePage) return // Can't delete home page
        
        setPages(prev => prev.filter(p => p.id !== pageId))
        if (currentPageId === pageId) {
            setCurrentPageId(pages.find(p => p.id !== pageId)?.id || pages[0].id)
        }
    }

    const updatePageTitle = (pageId: string, title: string) => {
        setPages(prev => prev.map(p => 
            p.id === pageId ? { ...p, title, slug: title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') } : p
        ))
    }

    const setHomePage = (pageId: string) => {
        setPages(prev => prev.map(p => ({ ...p, isHomePage: p.id === pageId, slug: p.id === pageId ? '' : p.slug })))
    }

    const switchPage = (pageId: string) => {
        setSelectedBlockId(null)
        setCurrentPageId(pageId)
        // Initialize history for new page if needed
        if (!historyMap[pageId]) {
            const page = pages.find(p => p.id === pageId)
            setHistoryMap(prev => ({ ...prev, [pageId]: [page?.draftBlocks || []] }))
            setHistoryIndexMap(prev => ({ ...prev, [pageId]: 0 }))
        }
    }

    const handleAddBlock = (type: string) => {
        const def = BLOCK_DEFINITIONS[type]
        if (!def) return

        const newBlock: Block = {
            id: generateId(),
            type: def.type,
            props: { ...def.defaultProps },
            label: def.label
        }

        // Insert above the currently selected block when one is selected,
        // otherwise append to the end of the canvas.
        let insertIndex = blocks.length
        if (selectedBlockId) {
            const currentIndex = blocks.findIndex((b) => b.id === selectedBlockId)
            if (currentIndex !== -1) {
                insertIndex = currentIndex
            }
        }

        const newBlocks = [
            ...blocks.slice(0, insertIndex),
            newBlock,
            ...blocks.slice(insertIndex),
        ]
        pushHistory(newBlocks)
        setSelectedBlockId(newBlock.id)
    }

    const handleDeleteBlock = (id: string) => {
        const newBlocks = blocks.filter(b => b.id !== id)
        pushHistory(newBlocks)
        if (selectedBlockId === id) setSelectedBlockId(null)
    }

    const handleReorderBlocks = (newBlocks: Block[]) => {
        pushHistory(newBlocks)
    }

    const handleMoveBlock = (id: string, direction: 'up' | 'down') => {
        const index = blocks.findIndex(b => b.id === id)
        if (index === -1) return
        if ((direction === 'up' && index === 0) || (direction === 'down' && index === blocks.length - 1)) return

        const newBlocks = [...blocks]
        const targetIndex = direction === 'up' ? index - 1 : index + 1
        const temp = newBlocks[index]
        newBlocks[index] = newBlocks[targetIndex]
        newBlocks[targetIndex] = temp
        pushHistory(newBlocks)
    }


    const handleApplyTemplate = (template: Template) => {
        if (blocks.length > 0) {
            setPendingTemplate(template)
            setIsTemplateDialogOpen(true)
        } else {
            pushHistory(template.blocks)
            setSelectedBlockId(null)
        }
    }

    const confirmTemplateApply = () => {
        if (pendingTemplate) {
            pushHistory(pendingTemplate.blocks)
            setSelectedBlockId(null)
            setPendingTemplate(null)
            setIsTemplateDialogOpen(false)
        }
    }


    const handleBlockChange = (id: string, newProps: any) => {
        const newBlocks = blocks.map(b =>
            b.id === id ? { ...b, props: newProps } : b
        )

        // For text updates (InlineText), we might want to debounce history push?
        // For now, simple push.
        // If we type fast, history explodes. 
        // Optimization: Just update state, push history onBlur or extensive change?
        // For simplicity: just update state directly, push history only on significant actions?
        // Actually, InlineText calls onChange on every keystroke or blur?
        // InlineText calls onChange on Blur essentially or Debounced.
        // Let's assume onBlur for now or controlled. component calls it.

        setBlocks(newBlocks)
        // Update current history head without pushing new? Or replace head?
        // Replacing head avoids 1000 undo steps for typing "Hello".
        const newHistory = [...history]
        newHistory[historyIndex] = newBlocks
        setHistoryMap(prev => ({ ...prev, [currentPageId]: newHistory }))
    }

    const handleSaveClick = async () => {
        // Save current page blocks
        await onSave(blocks, { auto: false, pageId: currentPageId })
        // Also save all pages if in multi-page mode
        if (multiPageMode && onSavePages) {
            await onSavePages(pages)
        }
    }

    const publishCurrentPage = () => {
        setPages(prev => prev.map(p => 
            p.id === currentPageId ? { ...p, publishedBlocks: [...p.draftBlocks], status: 'PUBLISHED' as const } : p
        ))
    }

    return (
        <div className="fixed inset-0 z-50 bg-background flex flex-col h-screen w-screen overflow-hidden">
            {/* Top Bar */}
            <div className="h-14 border-b bg-background flex items-center justify-between px-4 shrink-0 z-50">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={onExit}>Exit</Button>
                    <div className="h-4 w-px bg-border" />
                    <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={undo} disabled={historyIndex === 0}><Undo className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={redo} disabled={historyIndex === history.length - 1}><Redo className="h-4 w-4" /></Button>
                    </div>
                    {multiPageMode && (
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setShowPagesPanel(!showPagesPanel)}
                            className={cn(showPagesPanel && "bg-muted")}
                        >
                            <FileText className="h-4 w-4 mr-2" />
                            Pages
                        </Button>
                    )}
                    <div className="h-4 w-px bg-border" />
                    <span className="text-sm font-semibold">
                        {currentPage?.title || 'Landing Page'}
                        {currentPage?.isHomePage && <Home className="h-3 w-3 inline ml-1 text-primary" />}
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <Button onClick={handleSaveClick} disabled={loading} size="sm">
                        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                        Publish
                    </Button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Pages Panel (Multi-page mode) */}
                {multiPageMode && showPagesPanel && (
                    <div className="w-[220px] border-r bg-muted/20 flex flex-col shrink-0">
                        <div className="h-12 border-b px-3 flex items-center justify-between bg-background/50">
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Pages</span>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={addPage}>
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                        <ScrollArea className="flex-1">
                            <div className="p-2 space-y-1">
                                {pages.map((page) => (
                                    <div
                                        key={page.id}
                                        className={cn(
                                            "group flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all",
                                            currentPageId === page.id 
                                                ? "bg-primary/10 border border-primary/20" 
                                                : "hover:bg-muted/50 border border-transparent"
                                        )}
                                        onClick={() => switchPage(page.id)}
                                    >
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-1">
                                                {page.isHomePage && <Home className="h-3 w-3 text-primary shrink-0" />}
                                                <span className="text-xs font-medium truncate">{page.title}</span>
                                            </div>
                                            <span className="text-[9px] text-muted-foreground font-mono">/{page.slug || ''}</span>
                                        </div>
                                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {!page.isHomePage && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                                    onClick={(e) => { e.stopPropagation(); deletePage(page.id) }}
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                        <div className="p-3 border-t bg-background/50">
                            <p className="text-[9px] text-muted-foreground text-center">
                                {pages.length} page{pages.length !== 1 ? 's' : ''}
                            </p>
                        </div>
                    </div>
                )}

                <SidebarLeft
                    blocks={blocks}
                    selectedBlockId={selectedBlockId}
                    onSelectBlock={setSelectedBlockId}
                    onAddBlock={handleAddBlock}
                    onDeleteBlock={handleDeleteBlock}
                    onReorderBlocks={handleReorderBlocks}
                    onApplyTemplate={handleApplyTemplate}
                    globalStyles={globalStyles}
                    onGlobalStyleChange={onGlobalStyleChange}
                />

                <Canvas
                    blocks={blocks}
                    selectedBlockId={selectedBlockId}
                    onSelectBlock={setSelectedBlockId}
                    onBlockChange={handleBlockChange}
                    mode="landing"
                    globalStyles={globalStyles}
                    onDeleteBlock={handleDeleteBlock}
                    onMoveBlock={handleMoveBlock}
                    onReorderBlocks={handleReorderBlocks}
                    onAddBlockFromSidebar={handleAddBlock}
                />

                <SidebarRight
                    selectedBlock={selectedBlockId ? blocks.find(b => b.id === selectedBlockId) || null : null}
                    onBlockChange={handleBlockChange}
                />
            </div>

            {/* Template Application Confirmation Dialog */}
            <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
                <DialogContent className="max-w-md rounded-3xl p-0 overflow-hidden border-none shadow-2xl ring-1 ring-black/5">
                    <div className="bg-primary/5 p-8 flex flex-col items-center text-center space-y-4">
                        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shadow-inner animate-in zoom-in duration-300">
                            <AlertTriangle className="w-8 h-8" />
                        </div>
                        <div className="space-y-2">
                            <DialogTitle className="text-xl font-black tracking-tight uppercase">Replace Content?</DialogTitle>
                            <DialogDescription className="text-muted-foreground text-sm leading-relaxed">
                                Applying the <span className="font-bold text-foreground underline underline-offset-4">&quot;{pendingTemplate?.name}&quot;</span> template will completely replace your current design. This action can be undone using the Undo button.
                            </DialogDescription>
                        </div>
                    </div>
                    <DialogFooter className="p-6 bg-background flex flex-col sm:flex-row gap-3 sm:gap-3 items-stretch sm:justify-center border-t">
                        <Button 
                            variant="outline" 
                            onClick={() => setIsTemplateDialogOpen(false)}
                            className="rounded-xl h-12 font-bold tracking-tight px-8 flex-1 sm:flex-none border-2"
                        >
                            Cancel
                        </Button>
                        <Button 
                            onClick={confirmTemplateApply}
                            className="rounded-xl h-12 font-bold tracking-tight px-8 flex-1 sm:flex-none shadow-lg shadow-primary/20"
                        >
                            Replace Design
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
