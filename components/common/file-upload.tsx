"use client"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { Upload, X, Loader2, ImageIcon, FileIcon, CheckCircle2 } from "lucide-react"

interface FileUploadProps {
    value?: string
    onChange: (url: string) => void
    folder?: string
    accept?: string
    label?: string
    preview?: "image" | "icon" | "none"
    className?: string
    maxSizeMB?: number
}

export default function FileUpload({
    value,
    onChange,
    folder = "general",
    accept = "image/*",
    label = "Upload file",
    preview = "image",
    className,
    maxSizeMB = 10,
}: FileUploadProps) {
    const [uploading, setUploading] = useState(false)
    const [dragActive, setDragActive] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    const handleUpload = useCallback(
        async (file: File) => {
            setError(null)

            if (file.size > maxSizeMB * 1024 * 1024) {
                setError(`File too large. Max ${maxSizeMB}MB.`)
                return
            }

            setUploading(true)
            try {
                const formData = new FormData()
                formData.append("file", file)
                formData.append("folder", folder)

                const res = await fetch("/api/upload", {
                    method: "POST",
                    body: formData,
                })

                if (!res.ok) {
                    const data = await res.json()
                    throw new Error(data.error || "Upload failed")
                }

                const data = await res.json()
                onChange(data.url)
            } catch (err: any) {
                setError(err.message || "Upload failed")
            } finally {
                setUploading(false)
            }
        },
        [folder, onChange, maxSizeMB]
    )

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) handleUpload(file)
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(true)
    }

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)
        const file = e.dataTransfer.files?.[0]
        if (file) handleUpload(file)
    }

    const handleRemove = () => {
        onChange("")
        if (inputRef.current) inputRef.current.value = ""
    }

    return (
        <div className={cn("space-y-3", className)}>
            {/* Upload zone */}
            <div
                className={cn(
                    "relative group border-2 border-dashed rounded-2xl p-6 text-center transition-all duration-300 cursor-pointer",
                    dragActive
                        ? "border-primary bg-primary/5 scale-[1.01]"
                        : value
                            ? "border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20"
                            : "border-muted-foreground/20 hover:border-primary/40 hover:bg-muted/30",
                    uploading && "pointer-events-none opacity-70"
                )}
                onClick={() => inputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept={accept}
                    className="sr-only"
                    onChange={handleFileChange}
                    disabled={uploading}
                />

                {uploading ? (
                    <div className="flex flex-col items-center gap-3 py-2">
                        <div className="relative">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                <Loader2 className="h-6 w-6 text-primary animate-spin" />
                            </div>
                        </div>
                        <p className="text-sm font-medium text-muted-foreground">Uploading...</p>
                    </div>
                ) : value ? (
                    <div className="flex flex-col items-center gap-3">
                        {preview === "image" && (
                            <div className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-background shadow-lg">
                                <img
                                    src={value}
                                    alt="Uploaded"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}
                        {preview === "icon" && (
                            <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                            </div>
                        )}
                        <div className="space-y-1">
                            <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 justify-center">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                File uploaded
                            </p>
                            <p className="text-[11px] text-muted-foreground/70 truncate max-w-[200px]">
                                {value.split("/").pop()}
                            </p>
                        </div>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg"
                            onClick={(e) => {
                                e.stopPropagation()
                                handleRemove()
                            }}
                        >
                            <X className="h-3 w-3 mr-1" />
                            Remove
                        </Button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-3 py-2">
                        <div className="w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center group-hover:bg-primary/10 group-hover:scale-110 transition-all duration-300">
                            <Upload className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-semibold">{label}</p>
                            <p className="text-[11px] text-muted-foreground">
                                Drag & drop or click to browse · Max {maxSizeMB}MB
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Manual URL input */}
            <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold text-muted-foreground/50 tracking-wider whitespace-nowrap">
                    or paste URL
                </span>
                <Input
                    value={value || ""}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="https://example.com/image.png"
                    className="text-xs h-8 rounded-lg border-muted-foreground/15"
                />
            </div>

            {error && (
                <p className="text-xs text-red-500 font-medium">{error}</p>
            )}
        </div>
    )
}
