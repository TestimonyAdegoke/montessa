"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Globe,
  Paintbrush,
  FileText,
  Layout,
  Eye,
  Rocket,
  Plus,
  Settings,
  Monitor,
  LogIn,
  ArrowRight,
  CheckCircle2,
  Clock,
  Pencil,
  Trash2,
  ExternalLink,
  ChevronUp,
  ChevronDown,
  Menu,
  Target,
  Inbox,
  Database,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { createSite, publishSite, createPage, deletePage, updatePage } from "@/lib/actions/website-builder"

interface SitePage {
  id: string
  title: string
  slug: string
  status: string
  isHomepage: boolean
  isPortalLogin: boolean
  isLocked: boolean
  sortOrder: number
  updatedAt: string
}

interface SiteData {
  id: string
  tenantId: string
  mode: "PORTAL_ONLY" | "FULL_WEBSITE"
  name: string
  isPublished: boolean
  publishedAt: string | null
  subdomain: string | null
  customDomain: string | null
  pages: SitePage[]
  theme: any
  menus: any[]
}

interface Props {
  site: SiteData | null
  tenantId: string
  userId: string
}

export default function WebsiteBuilderDashboard({ site, tenantId, userId }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState("")

  // Onboarding state
  const [onboardingStep, setOnboardingStep] = useState(0)
  const [siteName, setSiteName] = useState("")
  const [siteMode, setSiteMode] = useState<"PORTAL_ONLY" | "FULL_WEBSITE">("FULL_WEBSITE")

  // New page dialog
  const [newPageOpen, setNewPageOpen] = useState(false)
  const [newPageTitle, setNewPageTitle] = useState("")
  const [newPageSlug, setNewPageSlug] = useState("")

  function handleReorderPage(pageId: string, pageSortOrder: number, swapId: string | undefined, swapSortOrder: number | undefined) {
    if (!swapId || swapSortOrder === undefined) return
    startTransition(async () => {
      try {
        await updatePage(pageId, { sortOrder: swapSortOrder })
        await updatePage(swapId, { sortOrder: pageSortOrder })
        router.refresh()
      } catch (e: any) {
        setError(e.message)
      }
    })
  }

  // ── Onboarding ────────────────────────────────────
  if (!site) {
    return (
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <Globe className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Website Builder</h1>
          <p className="text-muted-foreground mt-2">Create and manage your school&apos;s web presence</p>
        </div>

        {onboardingStep === 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card
              className={`cursor-pointer transition-all hover:shadow-lg ${siteMode === "PORTAL_ONLY" ? "ring-2 ring-primary shadow-md" : ""}`}
              onClick={() => setSiteMode("PORTAL_ONLY")}
            >
              <CardContent className="pt-8 pb-6 text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-blue-500/10 mb-4">
                  <LogIn className="h-7 w-7 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold mb-2">Portal Only</h3>
                <p className="text-sm text-muted-foreground">
                  Customize your login portal with branded design, role-based entry points, and announcements.
                  Perfect if you already have a website.
                </p>
                <ul className="mt-4 text-xs text-left space-y-1.5 text-muted-foreground">
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> Custom login page</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> Branded colors & logo</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> Role-based login buttons</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> Subdomain publishing</li>
                </ul>
              </CardContent>
            </Card>

            <Card
              className={`cursor-pointer transition-all hover:shadow-lg ${siteMode === "FULL_WEBSITE" ? "ring-2 ring-primary shadow-md" : ""}`}
              onClick={() => setSiteMode("FULL_WEBSITE")}
            >
              <CardContent className="pt-8 pb-6 text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-purple-500/10 mb-4">
                  <Globe className="h-7 w-7 text-purple-600" />
                </div>
                <h3 className="text-lg font-bold mb-2">Full Website</h3>
                <p className="text-sm text-muted-foreground">
                  Build a complete school website with pages, admissions funnels, forms, blog, and more.
                  Includes the portal login page.
                </p>
                <ul className="mt-4 text-xs text-left space-y-1.5 text-muted-foreground">
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> Full marketing website</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> Drag & drop page builder</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> Admissions funnels & forms</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> Custom domain support</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> SEO & analytics</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> Templates library</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        )}

        {onboardingStep === 0 && (
          <div className="text-center">
            <Button size="lg" className="gap-2" onClick={() => setOnboardingStep(1)}>
              Continue <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {onboardingStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Name Your Site</CardTitle>
              <CardDescription>
                {siteMode === "PORTAL_ONLY"
                  ? "Give your login portal a name"
                  : "Give your school website a name"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p>}
              <div className="space-y-2">
                <Label>Site Name</Label>
                <Input
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  placeholder="My School Website"
                />
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setOnboardingStep(0)}>Back</Button>
                <Button
                  className="gap-2"
                  disabled={isPending || !siteName.trim()}
                  onClick={() => {
                    setError("")
                    startTransition(async () => {
                      try {
                        await createSite({ name: siteName.trim(), mode: siteMode })
                        router.refresh()
                      } catch (e: any) {
                        setError(e.message || "Failed to create site")
                      }
                    })
                  }}
                >
                  <Rocket className="h-4 w-4" />
                  {isPending ? "Creating..." : "Create Site"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  // ── Site Dashboard ────────────────────────────────
  const draftPages = site.pages.filter((p) => p.status === "DRAFT")
  const publishedPages = site.pages.filter((p) => p.status === "PUBLISHED")

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Globe className="h-6 w-6 text-primary" />
            {site.name}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className={site.mode === "FULL_WEBSITE" ? "bg-purple-500/10 text-purple-700 border-purple-200" : "bg-blue-500/10 text-blue-700 border-blue-200"}>
              {site.mode === "FULL_WEBSITE" ? "Full Website" : "Portal Only"}
            </Badge>
            {site.isPublished ? (
              <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-200 gap-1">
                <CheckCircle2 className="h-3 w-3" /> Published
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-amber-500/10 text-amber-700 border-amber-200 gap-1">
                <Clock className="h-3 w-3" /> Draft
              </Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/website-builder/templates">
              <Layout className="h-4 w-4 mr-1" /> Templates
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={isPending}
            onClick={() => {
              startTransition(async () => {
                try {
                  await publishSite()
                  router.refresh()
                } catch (e: any) {
                  setError(e.message)
                }
              })
            }}
          >
            <Rocket className="h-4 w-4 mr-1" />
            {isPending ? "Publishing..." : "Publish All"}
          </Button>
        </div>
      </div>

      {error && <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p>}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{site.pages.length}</p>
                <p className="text-xs text-muted-foreground">Total Pages</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-green-500/10">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{publishedPages.length}</p>
                <p className="text-xs text-muted-foreground">Published</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-amber-500/10">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{draftPages.length}</p>
                <p className="text-xs text-muted-foreground">Drafts</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-indigo-500/10">
                <Paintbrush className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{site.theme ? "Active" : "Default"}</p>
                <p className="text-xs text-muted-foreground">Theme</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pages List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Pages</CardTitle>
            <CardDescription>Manage your website pages</CardDescription>
          </div>
          <Button size="sm" className="gap-1" onClick={() => { setNewPageTitle(""); setNewPageSlug(""); setNewPageOpen(true) }}>
            <Plus className="h-4 w-4" /> Add Page
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {site.pages.map((page, idx) => (
              <div key={page.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-muted">
                    {page.isPortalLogin ? <LogIn className="h-4 w-4 text-muted-foreground" /> : <FileText className="h-4 w-4 text-muted-foreground" />}
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium text-sm truncate flex items-center gap-2">
                      <span className="truncate">{page.title}</span>
                      {page.isHomepage && <Badge variant="outline" className="text-[10px] py-0 px-1.5">Home</Badge>}
                      {page.isPortalLogin && <Badge variant="outline" className="text-[10px] py-0 px-1.5">Portal</Badge>}
                      {page.isLocked && <Badge variant="outline" className="text-[10px] py-0 px-1.5 bg-red-500/10 text-red-600 border-red-200">Locked</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground">/{page.slug}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex flex-col gap-0.5 mr-1">
                    <button
                      className="p-0.5 rounded hover:bg-muted disabled:opacity-20"
                      disabled={isPending || idx === 0}
                      onClick={() => handleReorderPage(page.id, page.sortOrder, site.pages[idx - 1]?.id, site.pages[idx - 1]?.sortOrder)}
                    >
                      <ChevronUp className="h-3 w-3 text-muted-foreground" />
                    </button>
                    <button
                      className="p-0.5 rounded hover:bg-muted disabled:opacity-20"
                      disabled={isPending || idx === site.pages.length - 1}
                      onClick={() => handleReorderPage(page.id, page.sortOrder, site.pages[idx + 1]?.id, site.pages[idx + 1]?.sortOrder)}
                    >
                      <ChevronDown className="h-3 w-3 text-muted-foreground" />
                    </button>
                  </div>
                  <Badge variant="outline" className={`text-xs ${page.status === "PUBLISHED" ? "bg-green-500/10 text-green-700 border-green-200" : "bg-amber-500/10 text-amber-700 border-amber-200"}`}>
                    {page.status === "PUBLISHED" ? "Published" : "Draft"}
                  </Badge>
                  <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                    <Link href={`/dashboard/website-builder/editor/${page.id}`}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                  {!page.isLocked && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => {
                        if (!confirm(`Delete "${page.title}"?`)) return
                        startTransition(async () => {
                          try {
                            await deletePage(page.id)
                            router.refresh()
                          } catch (e: any) {
                            setError(e.message)
                          }
                        })
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
            {site.pages.length === 0 && (
              <p className="text-center py-8 text-muted-foreground text-sm">No pages yet. Create your first page to get started.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <Card className="hover:shadow-md transition-all cursor-pointer" onClick={() => router.push("/dashboard/website-builder/theme")}>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-primary/10">
              <Paintbrush className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-semibold">Design System</p>
              <p className="text-xs text-muted-foreground">Colors, fonts, spacing</p>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-all cursor-pointer" onClick={() => router.push("/dashboard/website-builder/cms")}>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-cyan-500/10">
              <Database className="h-6 w-6 text-cyan-600" />
            </div>
            <div>
              <p className="font-semibold">CMS</p>
              <p className="text-xs text-muted-foreground">Content collections</p>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-all cursor-pointer" onClick={() => router.push("/dashboard/website-builder/forms")}>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-purple-500/10">
              <Layout className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="font-semibold">Forms</p>
              <p className="text-xs text-muted-foreground">Build & manage forms</p>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-all cursor-pointer" onClick={() => router.push("/dashboard/website-builder/funnels")}>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-amber-500/10">
              <Eye className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="font-semibold">Funnels</p>
              <p className="text-xs text-muted-foreground">Conversion flows</p>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-all cursor-pointer" onClick={() => router.push("/dashboard/website-builder/submissions")}>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-blue-500/10">
              <Plus className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="font-semibold">Submissions</p>
              <p className="text-xs text-muted-foreground">CRM pipeline</p>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-all cursor-pointer" onClick={() => router.push("/dashboard/website-builder/menus")}>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-teal-500/10">
              <Layout className="h-6 w-6 text-teal-600" />
            </div>
            <div>
              <p className="font-semibold">Menus</p>
              <p className="text-xs text-muted-foreground">Header & footer nav</p>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-all cursor-pointer" onClick={() => router.push("/dashboard/website-builder/settings")}>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-emerald-500/10">
              <Settings className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <p className="font-semibold">Site Settings</p>
              <p className="text-xs text-muted-foreground">Domain, SEO, analytics</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* New Page Dialog */}
      <Dialog open={newPageOpen} onOpenChange={setNewPageOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Plus className="h-5 w-5 text-primary" /> New Page</DialogTitle>
            <DialogDescription>Create a new page for your website</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Page Title</Label>
              <Input
                value={newPageTitle}
                onChange={(e) => {
                  setNewPageTitle(e.target.value)
                  setNewPageSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, ""))
                }}
                placeholder="e.g. Gallery, News, Events"
              />
            </div>
            <div className="space-y-2">
              <Label>URL Slug</Label>
              <Input value={newPageSlug} onChange={(e) => setNewPageSlug(e.target.value)} placeholder="gallery" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewPageOpen(false)}>Cancel</Button>
            <Button
              disabled={isPending || !newPageTitle.trim() || !newPageSlug.trim()}
              onClick={() => {
                startTransition(async () => {
                  try {
                    const page = await createPage({ title: newPageTitle.trim(), slug: newPageSlug.trim() })
                    setNewPageOpen(false)
                    router.push(`/dashboard/website-builder/editor/${page.id}`)
                  } catch (e: any) {
                    setError(e.message)
                  }
                })
              }}
            >
              {isPending ? "Creating..." : "Create & Edit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
