"use client"

import { useState, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { Bold, Italic, Underline, Link as LinkIcon, Link2Off, List, ListOrdered, AlignLeft, AlignCenter, AlignRight, Palette } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

interface InlineTextProps extends Omit<React.HTMLAttributes<HTMLElement>, 'onChange'> {
    value: string
    onChange: (value: string) => void
    tagName?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div'
    placeholder?: string
    editable?: boolean
    multiline?: boolean
}

export function InlineText({
    value,
    onChange,
    tagName: Tag = 'div',
    className,
    placeholder,
    editable = true,
    multiline = false,
    ...props
}: InlineTextProps) {
    const [isFocused, setIsFocused] = useState(false)
    const [toolbarVisible, setToolbarVisible] = useState(false)
    const [linkDialogOpen, setLinkDialogOpen] = useState(false)
    const [linkUrl, setLinkUrl] = useState("")
    const [textColor, setTextColor] = useState("#000000")
    const [colorPickerOpen, setColorPickerOpen] = useState(false)
    const [toolbarPosition, setToolbarPosition] = useState({ top: 0, left: 0 })
    const ref = useRef<HTMLElement>(null)

    // Sync content when value changes externally (and not focused)
    useEffect(() => {
        if (ref.current && !isFocused && ref.current.innerHTML !== value) {
            ref.current.innerHTML = value || ""
        }
    }, [value, isFocused])

    const handleMouseUp = () => {
        if (!editable) return
        const selection = window.getSelection()
        if (selection && selection.toString().length > 0) {
            const range = selection.getRangeAt(0)
            const rect = range.getBoundingClientRect()
            setToolbarPosition({
                top: rect.top - 50 + window.scrollY,
                left: rect.left + rect.width / 2 - 100 + window.scrollX
            })
            setToolbarVisible(true)
        } else {
            setToolbarVisible(false)
        }
    }

    const execCommand = (command: string, value: string = '') => {
        if (command === 'createLink') {
            setLinkUrl("")
            setLinkDialogOpen(true)
            return
        }
        if (command === 'unlink') {
            document.execCommand('unlink', false)
            if (ref.current) {
                onChange(ref.current.innerHTML)
            }
            return
        }
        document.execCommand(command, false, value)
        if (ref.current) {
            onChange(ref.current.innerHTML)
        }
    }

    const handleLinkConfirm = () => {
        if (linkUrl) {
            document.execCommand('createLink', false, linkUrl)
            if (ref.current) {
                onChange(ref.current.innerHTML)
            }
        }
        setLinkDialogOpen(false)
        setToolbarVisible(false)
    }

    const handleColorChange = (color: string) => {
        document.execCommand('foreColor', false, color)
        if (ref.current) {
            onChange(ref.current.innerHTML)
        }
        setColorPickerOpen(false)
    }

    if (!editable) {
        return <Tag className={className} dangerouslySetInnerHTML={{ __html: value || placeholder || "" }} {...props} />
    }

    return (
        <>
            <AnimatePresence>
                {toolbarVisible && isFocused && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        style={{ top: toolbarPosition.top, left: toolbarPosition.left }}
                        className="fixed z-[9999] flex items-center gap-0.5 p-1 bg-background border rounded-xl shadow-2xl ring-1 ring-black/5"
                        onMouseDown={(e) => e.preventDefault()} // Prevent blur
                    >
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => execCommand('bold')}>
                            <Bold className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => execCommand('italic')}>
                            <Italic className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => execCommand('underline')}>
                            <Underline className="h-4 w-4" />
                        </Button>
                        <div className="w-px h-4 bg-border mx-1" />
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => execCommand('insertUnorderedList')}>
                            <List className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => execCommand('insertOrderedList')}>
                            <ListOrdered className="h-4 w-4" />
                        </Button>
                        <div className="w-px h-4 bg-border mx-1" />
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => execCommand('justifyLeft')}>
                            <AlignLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => execCommand('justifyCenter')}>
                            <AlignCenter className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => execCommand('justifyRight')}>
                            <AlignRight className="h-4 w-4" />
                        </Button>
                        <div className="w-px h-4 bg-border mx-1" />
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => execCommand('createLink')}>
                            <LinkIcon className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => execCommand('unlink')}>
                            <Link2Off className="h-4 w-4" />
                        </Button>
                        <div className="w-px h-4 bg-border mx-1" />
                        <div className="relative">
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 rounded-lg" 
                                onClick={() => setColorPickerOpen(!colorPickerOpen)}
                            >
                                <Palette className="h-4 w-4" style={{ color: textColor }} />
                            </Button>
                            <AnimatePresence>
                                {colorPickerOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9, y: 5 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.9, y: 5 }}
                                        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 bg-background border rounded-xl shadow-2xl flex gap-1.5"
                                    >
                                        {['#000000', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ffffff'].map((c) => (
                                            <button
                                                key={c}
                                                onClick={() => handleColorChange(c)}
                                                className="w-6 h-6 rounded-full border border-black/5 shadow-sm transition-transform hover:scale-125"
                                                style={{ backgroundColor: c }}
                                            />
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
                <DialogContent className="max-w-sm rounded-3xl p-6 border-none shadow-2xl ring-1 ring-black/5">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-black tracking-tight uppercase">Insert Link</DialogTitle>
                        <DialogDescription className="text-xs">
                            Enter the destination URL for the selected text.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Input 
                            placeholder="https://example.com" 
                            value={linkUrl}
                            onChange={(e) => setLinkUrl(e.target.value)}
                            className="h-11 rounded-xl border-muted-foreground/10 focus:ring-primary/20"
                            autoFocus
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault()
                                    handleLinkConfirm()
                                }
                            }}
                        />
                    </div>
                    <DialogFooter className="flex gap-2">
                        <Button variant="outline" onClick={() => setLinkDialogOpen(false)} className="rounded-xl flex-1 border-2">Cancel</Button>
                        <Button onClick={handleLinkConfirm} className="rounded-xl flex-1">Apply Link</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Tag
                ref={ref as any}
                contentEditable
                suppressContentEditableWarning
                onFocus={() => setIsFocused(true)}
                onBlur={(e: React.FocusEvent<HTMLElement>) => {
                    setIsFocused(false)
                    setToolbarVisible(false)
                    onChange(e.currentTarget.innerHTML)
                }}
                onMouseUp={handleMouseUp}
                onKeyDown={(e: React.KeyboardEvent) => {
                    if (!multiline && e.key === 'Enter') {
                        e.preventDefault()
                        ref.current?.blur()
                    }
                    // Basic rich text shortcuts
                    if (e.ctrlKey || e.metaKey) {
                        if (e.key === 'b') {
                            e.preventDefault()
                            execCommand('bold')
                        }
                        if (e.key === 'i') {
                            e.preventDefault()
                            execCommand('italic')
                        }
                        if (e.key === 'u') {
                            e.preventDefault()
                            execCommand('underline')
                        }
                    }
                }}
                className={cn(
                    className,
                    "outline-none transition-all rounded decoration-clone min-h-[1em]",
                    isFocused ? "bg-primary/5 ring-2 ring-primary/20 ring-offset-2" : "hover:bg-primary/5 hover:ring-1 hover:ring-primary/30 cursor-text",
                    !value && "min-w-[50px] bg-muted/20"
                )}
                style={{ minWidth: !value ? '100px' : undefined }}
                {...props}
                dangerouslySetInnerHTML={{ __html: value || "" }}
            />
        </>
    )
}
