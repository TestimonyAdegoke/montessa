"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { 
  Globe, Plus, Layout, Settings, Rocket, 
  FileText, LogIn, ChevronRight, MoreHorizontal,
  Pencil, Trash2, Eye, ChevronDown, Paintbrush,
  Database, ClipboardList, Workflow, Inbox, Menu
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createSite, publishSite, createPage, deletePage } from "@/lib/actions/website-builder"
import { useToast } from "@/components/ui/use-toast"

interface SitePage {
  id: string
  title: string
  slug: string
  status: string
  isHomepage: boolean
  isPortalLogin: boolean
  isLocked: boolean
  updatedAt: string
}

interface SiteData {
  id: string
  tenantId: string
  name: string
  mode: "PORTAL_ONLY" | "FULL_WEBSITE"
  isPublished: boolean
  pages: SitePage[]
}

interface Props {
  site: SiteData | null
  tenantId: string
  userId: string
}

export default function WebsiteBuilderDashboard({ site, tenantId, userId }: Props) {
  const router = useRouter()
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()
  
  // Create Site State
  const [isCreating, setIsCreating] = useState(false)
  const [siteName, setSiteName] = useState("")
  
  // Create Page State
  const [isPageDialogOpen, setIsPageDialogOpen] = useState(false)
  const [pageTitle, setPageTitle] = useState("")
  const [pageSlug, setPageSlug] = useState("")

  const handleCreateSite = () => {
    if (!siteName.trim()) return
    startTransition(async () => {
      try {
        await createSite({ name: siteName, mode: "FULL_WEBSITE" })
        router.refresh()
        setIsCreating(false)
        toast({ title: "Success", description: "Site created successfully" })
      } catch (error) {
        toast({ title: "Error", description: "Failed to create site", variant: "destructive" })
      }
    })
  }

  const handleCreatePage = () => {
    if (!pageTitle.trim() || !pageSlug.trim()) return
    startTransition(async () => {
      try {
        await createPage({ title: pageTitle, slug: pageSlug })
        router.refresh()
        setIsPageDialogOpen(false)
        setPageTitle("")
        setPageSlug("")
        toast({ title: "Success", description: "Page created successfully" })
      } catch (error) {
        toast({ title: "Error", description: "Failed to create page", variant: "destructive" })
      }
    })
  }

  const handleDeletePage = (pageId: string) => {
    if (!confirm("Are you sure you want to delete this page?")) return
    startTransition(async () => {
      try {
        await deletePage(pageId)
        router.refresh()
        toast({ title: "Success", description: "Page deleted" })
      } catch (error) {
        toast({ title: "Error", description: "Failed to delete page", variant: "destructive" })
      }
    })
  }

  const handlePublish = () => {
    startTransition(async () => {
      try {
        await publishSite()
        router.refresh()
        toast({ title: "Success", description: "Site published successfully" })
      } catch (error) {
        toast({ title: "Error", description: "Failed to publish site", variant: "destructive" })
      }
    })
  }

  if (!site) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
          <Globe className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold">Welcome to Website Builder</h1>
        <p className="text-muted-foreground max-w-md">
          Create a beautiful, professional website for your school. customized with your branding and content.
        </p>
        <div className="flex gap-4 mt-8">
          {isCreating ? (
            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
              <Input 
                placeholder="Enter site name..." 
                value={siteName} 
                onChange={(e) => setSiteName(e.target.value)}
                className="w-64"
              />
              <Button onClick={handleCreateSite} disabled={isPending || !siteName}>
                Create
              </Button>
              <Button variant="ghost" onClick={() => setIsCreating(false)}>Cancel</Button>
            </div>
          ) : (
            <Button size="lg" onClick={() => setIsCreating(true)}>
              Get Started
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            {site.name}
            {site.isPublished ? (
              <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100">Published</Badge>
            ) : (
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">Draft</Badge>
            )}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your school website pages and settings</p>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Tools <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                <Link href="/dashboard/website-builder/templates" className="cursor-pointer">
                  <Layout className="mr-2 h-4 w-4" /> Templates
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/website-builder/theme" className="cursor-pointer">
                  <Paintbrush className="mr-2 h-4 w-4" /> Design System
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/website-builder/menus" className="cursor-pointer">
                  <Menu className="mr-2 h-4 w-4" /> Menus
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/website-builder/cms" className="cursor-pointer">
                  <Database className="mr-2 h-4 w-4" /> CMS Collections
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/website-builder/forms" className="cursor-pointer">
                  <ClipboardList className="mr-2 h-4 w-4" /> Forms
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/website-builder/funnels" className="cursor-pointer">
                  <Workflow className="mr-2 h-4 w-4" /> Funnels
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/website-builder/submissions" className="cursor-pointer">
                  <Inbox className="mr-2 h-4 w-4" /> Submissions
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/website-builder/settings" className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" /> Settings
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button onClick={handlePublish} disabled={isPending}>
            <Rocket className="w-4 h-4 mr-2" />
            {isPending ? "Publishing..." : "Publish Site"}
          </Button>
        </div>
      </div>

      {/* Pages Grid */}
      <div className="grid gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Pages</h2>
          <Button onClick={() => setIsPageDialogOpen(true)} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Page
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {site.pages.map((page) => (
            <Card key={page.id} className="group hover:shadow-md transition-all">
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${page.isHomepage ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                    {page.isPortalLogin ? <LogIn className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                  </div>
                  <div>
                    <CardTitle className="text-base font-medium">{page.title}</CardTitle>
                    <CardDescription className="text-xs">/{page.slug}</CardDescription>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/website-builder/editor/${page.id}`}>
                        <Pencil className="w-4 h-4 mr-2" />
                        Edit
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/site/${site.id}/${page.slug}`} target="_blank">
                        <Eye className="w-4 h-4 mr-2" />
                        Preview
                      </Link>
                    </DropdownMenuItem>
                    {!page.isLocked && !page.isHomepage && (
                      <>
                        <DropdownMenuItem 
                          className="text-destructive focus:text-destructive"
                          onClick={() => handleDeletePage(page.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mt-2">
                  {page.isHomepage && <Badge variant="outline">Homepage</Badge>}
                  {page.isPortalLogin && <Badge variant="outline">Portal</Badge>}
                  {page.status === 'PUBLISHED' ? (
                    <span className="text-xs text-green-600 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-600" />
                      Published
                    </span>
                  ) : (
                    <span className="text-xs text-yellow-600 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-yellow-600" />
                      Draft
                    </span>
                  )}
                </div>
                <Button className="w-full mt-4" variant="secondary" asChild>
                  <Link href={`/dashboard/website-builder/editor/${page.id}`}>
                    Edit Page <ChevronRight className="w-4 h-4 ml-auto" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Access Tools */}
      <div className="grid gap-6">
        <h2 className="text-lg font-semibold">Tools & Settings</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { href: "/dashboard/website-builder/templates", icon: Layout, label: "Templates", desc: "Browse & apply themes" },
            { href: "/dashboard/website-builder/theme", icon: Paintbrush, label: "Design System", desc: "Colors, fonts & tokens" },
            { href: "/dashboard/website-builder/menus", icon: Menu, label: "Menus", desc: "Header & footer nav" },
            { href: "/dashboard/website-builder/cms", icon: Database, label: "CMS", desc: "Content collections" },
            { href: "/dashboard/website-builder/forms", icon: ClipboardList, label: "Forms", desc: "Contact & lead forms" },
            { href: "/dashboard/website-builder/funnels", icon: Workflow, label: "Funnels", desc: "Multi-step flows" },
            { href: "/dashboard/website-builder/submissions", icon: Inbox, label: "Submissions", desc: "Form responses" },
            { href: "/dashboard/website-builder/settings", icon: Settings, label: "Settings", desc: "Domain, SEO & more" },
          ].map((tool) => (
            <Link key={tool.href} href={tool.href}>
              <Card className="hover:shadow-md hover:border-primary/30 transition-all cursor-pointer h-full">
                <CardContent className="p-4 flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-muted shrink-0">
                    <tool.icon className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{tool.label}</p>
                    <p className="text-xs text-muted-foreground truncate">{tool.desc}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* New Page Dialog */}
      <Dialog open={isPageDialogOpen} onOpenChange={setIsPageDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Page</DialogTitle>
            <DialogDescription>
              Add a new page to your website.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Page Title</Label>
              <Input 
                placeholder="e.g., About Us" 
                value={pageTitle}
                onChange={(e) => {
                  setPageTitle(e.target.value)
                  setPageSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""))
                }}
              />
            </div>
            <div className="space-y-2">
              <Label>URL Slug</Label>
              <Input 
                placeholder="e.g., about-us" 
                value={pageSlug}
                onChange={(e) => setPageSlug(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPageDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreatePage} disabled={isPending || !pageTitle || !pageSlug}>
              {isPending ? "Creating..." : "Create Page"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
