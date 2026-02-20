"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  ArrowLeft,
  Search,
  Layout,
  Eye,
  Download,
  Sparkles,
  Monitor,
  LogIn,
  AlertTriangle,
} from "lucide-react"
import { applyTemplate, applyTemplateMerge, applyTemplateThemeOnly } from "@/lib/actions/website-builder"
import { WBRenderer } from "@/lib/website-builder/renderer"
import type { WBNode, WBThemeTokens } from "@/lib/website-builder/types"

interface TemplateData {
  id: string
  name: string
  slug: string
  description: string | null
  category: string
  thumbnail: string | null
  mode: string
  isDefault: boolean
  pages: any
  theme: any
}

// ── Mini Preview of template content ──────────────────
function TemplatePreview({ template }: { template: TemplateData }) {
  const pages = typeof template.pages === "string" ? JSON.parse(template.pages) : template.pages
  const themeRaw = typeof template.theme === "string" ? JSON.parse(template.theme) : template.theme
  const theme: WBThemeTokens | null = themeRaw ? {
    primaryColor: themeRaw.primaryColor || "#2563eb",
    secondaryColor: themeRaw.secondaryColor || "#7c3aed",
    accentColor: themeRaw.accentColor || "#f59e0b",
    backgroundColor: themeRaw.backgroundColor || "#ffffff",
    surfaceColor: themeRaw.surfaceColor || "#f8fafc",
    textColor: themeRaw.textColor || "#0f172a",
    mutedColor: themeRaw.mutedColor || "#64748b",
    headingFont: themeRaw.headingFont || "Inter",
    bodyFont: themeRaw.bodyFont || "Inter",
    borderRadius: themeRaw.borderRadius || "0.5rem",
    buttonRadius: themeRaw.buttonRadius || "0.375rem",
    cardRadius: themeRaw.cardRadius || "0.75rem",
    buttonStyle: themeRaw.buttonStyle || "filled",
    shadowStyle: themeRaw.shadowStyle || "md",
    containerWidth: themeRaw.containerWidth || "1280px",
  } : null

  // Get the first page's content nodes
  const firstPage = Array.isArray(pages) ? pages[0] : null
  const nodes: WBNode[] = firstPage?.content
    ? (typeof firstPage.content === "string" ? JSON.parse(firstPage.content) : firstPage.content)
    : []

  if (nodes.length === 0) return null

  return (
    <div className="w-full h-full overflow-hidden relative">
      <div
        className="origin-top-left pointer-events-none select-none"
        style={{
          width: "1280px",
          transform: "scale(0.28)",
          transformOrigin: "top left",
        }}
      >
        <WBRenderer nodes={nodes} theme={theme} />
      </div>
    </div>
  )
}

interface Props {
  templates: TemplateData[]
  hasSite: boolean
  siteMode: string | null
}

const CATEGORIES = [
  { value: "all", label: "All" },
  { value: "montessori", label: "Montessori / Early Years" },
  { value: "primary", label: "Primary School" },
  { value: "secondary", label: "Secondary School" },
  { value: "international", label: "International / Premium" },
  { value: "community", label: "Community / Budget" },
  { value: "faith", label: "Faith-Based" },
  { value: "portal", label: "Portal Only" },
]

export default function TemplatesClient({ templates, hasSite, siteMode }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("all")
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewTemplate, setPreviewTemplate] = useState<TemplateData | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateData | null>(null)
  const [applyMode, setApplyMode] = useState<"replace" | "merge" | "theme">("merge")
  const [error, setError] = useState("")

  const filtered = templates.filter((t) => {
    if (category !== "all" && t.category !== category) return false
    if (search) {
      const q = search.toLowerCase()
      if (!t.name.toLowerCase().includes(q) && !(t.description || "").toLowerCase().includes(q)) return false
    }
    return true
  })

  function handleApply(template: TemplateData) {
    setSelectedTemplate(template)
    setApplyMode("merge")
    setError("")
    setConfirmOpen(true)
  }

  function handlePreview(template: TemplateData) {
    setPreviewTemplate(template)
    setPreviewOpen(true)
  }

  async function confirmApply() {
    if (!selectedTemplate) return
    setError("")
    startTransition(async () => {
      try {
        if (applyMode === "theme") {
          await applyTemplateThemeOnly(selectedTemplate.id)
        } else if (applyMode === "merge") {
          await applyTemplateMerge(selectedTemplate.id)
        } else {
          await applyTemplate(selectedTemplate.id)
        }
        setConfirmOpen(false)
        router.push("/dashboard/website-builder")
        router.refresh()
      } catch (e: any) {
        setError(e.message || "Failed to apply template")
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Layout className="h-6 w-6 text-primary" />
            Templates
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Choose a template to jumpstart your school website
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/website-builder">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((cat) => (
            <Button
              key={cat.value}
              variant={category === cat.value ? "secondary" : "ghost"}
              size="sm"
              className="text-xs h-8"
              onClick={() => setCategory(cat.value)}
            >
              {cat.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Template Grid */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Layout className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">
              {templates.length === 0
                ? "No templates available yet. Templates will be added by the platform administrator."
                : "No templates match your search criteria."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((template) => (
            <Card key={template.id} className="overflow-hidden hover:shadow-lg transition-all group">
              <div className="aspect-video bg-gradient-to-br from-primary/5 to-primary/20 relative overflow-hidden">
                {template.thumbnail ? (
                  <img src={template.thumbnail} alt={template.name} className="w-full h-full object-cover" />
                ) : template.pages ? (
                  <TemplatePreview template={template} />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      {template.mode === "PORTAL_ONLY" ? (
                        <LogIn className="h-10 w-10 mx-auto text-primary/30" />
                      ) : (
                        <Monitor className="h-10 w-10 mx-auto text-primary/30" />
                      )}
                      <p className="text-xs text-muted-foreground mt-2">{template.category}</p>
                    </div>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex gap-2">
                    <Button size="sm" variant="secondary" className="gap-1" onClick={() => handlePreview(template)}>
                      <Eye className="h-3.5 w-3.5" /> Preview
                    </Button>
                    <Button size="sm" className="gap-1" onClick={() => handleApply(template)} disabled={!hasSite}>
                      <Download className="h-3.5 w-3.5" /> Use
                    </Button>
                  </div>
                </div>
              </div>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-sm">{template.name}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{template.description}</p>
                  </div>
                  <Badge variant="outline" className="text-[10px] shrink-0">
                    {template.mode === "PORTAL_ONLY" ? "Portal" : "Full Site"}
                  </Badge>
                </div>
                {template.isDefault && (
                  <Badge className="mt-2 text-[10px] gap-1 bg-amber-500/10 text-amber-700 border-amber-200" variant="outline">
                    <Sparkles className="h-3 w-3" /> Recommended
                  </Badge>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Full Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="sm:max-w-5xl">
          <DialogHeader>
            <DialogTitle>{previewTemplate?.name || "Template Preview"}</DialogTitle>
            <DialogDescription>{previewTemplate?.description || ""}</DialogDescription>
          </DialogHeader>
          <div className="border rounded-lg overflow-hidden bg-muted/20">
            <div className="aspect-[16/9] w-full overflow-auto">
              {previewTemplate ? <TemplatePreview template={previewTemplate} /> : null}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewOpen(false)}>Close</Button>
            <Button
              onClick={() => {
                if (!previewTemplate) return
                setPreviewOpen(false)
                handleApply(previewTemplate)
              }}
              disabled={!hasSite}
            >
              Use This Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Apply Dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Apply Template
            </DialogTitle>
            <DialogDescription>
              Choose how to apply <strong>{selectedTemplate?.name}</strong>. Use Merge to keep existing content and add only missing pages.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Apply Mode</p>
            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                className={`text-left rounded-lg border px-3 py-2 text-xs transition-colors ${applyMode === "merge" ? "border-primary bg-primary/5" : "hover:bg-muted/50"}`}
                onClick={() => setApplyMode("merge")}
              >
                <div className="font-semibold">Merge (Recommended)</div>
                <div className="text-muted-foreground">Apply theme and create only missing pages. Existing content is preserved.</div>
              </button>
              <button
                type="button"
                className={`text-left rounded-lg border px-3 py-2 text-xs transition-colors ${applyMode === "theme" ? "border-primary bg-primary/5" : "hover:bg-muted/50"}`}
                onClick={() => setApplyMode("theme")}
              >
                <div className="font-semibold">Theme Only</div>
                <div className="text-muted-foreground">Apply colors, typography, and tokens without touching page content.</div>
              </button>
              <button
                type="button"
                className={`text-left rounded-lg border px-3 py-2 text-xs transition-colors ${applyMode === "replace" ? "border-destructive bg-destructive/5" : "hover:bg-muted/50"}`}
                onClick={() => setApplyMode("replace")}
              >
                <div className="font-semibold text-destructive">Replace (Destructive)</div>
                <div className="text-muted-foreground">Replace all non-locked pages with template pages.</div>
              </button>
            </div>
          </div>
          {error && <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>Cancel</Button>
            <Button onClick={confirmApply} disabled={isPending}>
              {isPending ? "Applying..." : "Apply Template"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
