"use client"

import { useState, useEffect, useTransition } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Building2, Globe, MapPin, Phone, Mail } from "lucide-react"
import FileUpload from "@/components/common/file-upload"

interface SchoolDetailsFormProps {
    tenantId: string
    initialData: {
        name: string
        subdomain: string
        domain?: string | null
        logo?: string | null
        tagline?: string | null
        plan: string
    }
}

export default function SchoolDetailsForm({ tenantId, initialData }: SchoolDetailsFormProps) {
    const [name, setName] = useState(initialData.name || "")
    const [tagline, setTagline] = useState(initialData.tagline || "")
    const [logo, setLogo] = useState(initialData.logo || "")
    const [loading, setLoading] = useState(false)
    const { toast } = useToast()

    const handleSave = async () => {
        if (!name.trim()) {
            toast({ title: "School name is required", variant: "destructive" })
            return
        }
        setLoading(true)
        try {
            const res = await fetch("/api/tenant/details", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, tagline, logo }),
            })
            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || "Failed to save")
            }
            toast({ title: "School details updated", description: "Your school information has been saved." })
        } catch (err: any) {
            toast({ title: "Error", description: err.message || "Failed to save school details.", variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-8">
            <div className="grid gap-8 md:grid-cols-2">
                {/* School Name */}
                <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">School Name</Label>
                    <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter school name"
                        className="rounded-xl h-11 border-muted-foreground/10"
                    />
                </div>

                {/* Subdomain (read-only) */}
                <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">Subdomain</Label>
                    <div className="flex items-center gap-2">
                        <Input
                            value={initialData.subdomain}
                            disabled
                            className="rounded-xl h-11 border-muted-foreground/10 bg-muted/30 font-mono text-sm"
                        />
                        <span className="text-xs text-muted-foreground whitespace-nowrap">.yourdomain.com</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground/50">Contact support to change your subdomain</p>
                </div>
            </div>

            {/* Tagline */}
            <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">Tagline / Motto</Label>
                <Input
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    placeholder="Excellence in Education"
                    className="rounded-xl h-11 border-muted-foreground/10"
                />
                <p className="text-[11px] text-muted-foreground/50">A short description or motto for your school</p>
            </div>

            {/* Logo */}
            <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">School Logo</Label>
                <FileUpload
                    value={logo}
                    onChange={setLogo}
                    folder="branding"
                    accept="image/*"
                    label="Upload school logo"
                    preview="image"
                    maxSizeMB={5}
                />
            </div>

            {/* Info box */}
            <div className="p-5 rounded-2xl bg-muted/30 border border-border/30 space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground/50">Account Details</p>
                <div className="grid gap-3 sm:grid-cols-2">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <Building2 className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                            <p className="text-[11px] text-muted-foreground/60">Tenant ID</p>
                            <p className="text-xs font-mono font-medium truncate max-w-[180px]">{tenantId}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <Globe className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                            <p className="text-[11px] text-muted-foreground/60">Plan</p>
                            <p className="text-xs font-bold uppercase">{initialData.plan}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-2">
                <Button onClick={handleSave} disabled={loading} className="rounded-xl h-11 px-8 font-bold shadow-lg shadow-primary/20">
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {loading ? "Saving..." : "Save School Details"}
                </Button>
            </div>
        </div>
    )
}
