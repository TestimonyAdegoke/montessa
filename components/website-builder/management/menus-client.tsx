"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
  Menu,
  GripVertical,
  Plus,
  Trash2,
  ExternalLink,
  PanelTop,
  PanelBottom,
  ChevronRight,
  Pencil,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
  Link2,
  FileText,
} from "lucide-react"
import { createMenuItem, updateMenuItem, deleteMenuItem, reorderMenuItems, createMenu } from "@/lib/actions/website-builder"

interface MenuItem {
  id: string
  label: string
  href: string | null
  pageSlug: string | null
  target: string
  sortOrder: number
  isVisible: boolean
  children: MenuItem[]
}

interface MenuData {
  id: string
  location: string
  label: string
  config: any
  items: MenuItem[]
}

interface PageRef {
  id: string
  title: string
  slug: string
}

interface Props {
  menus: MenuData[]
  pages: PageRef[]
  siteId: string
}

export default function MenusClient({ menus, pages, siteId }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState("")

  // Add/Edit dialog
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [dialogMenuId, setDialogMenuId] = useState("")
  const [dialogParentId, setDialogParentId] = useState<string | undefined>(undefined)
  const [formLabel, setFormLabel] = useState("")
  const [formLinkType, setFormLinkType] = useState<"page" | "url">("page")
  const [formPageSlug, setFormPageSlug] = useState("")
  const [formHref, setFormHref] = useState("")
  const [formTarget, setFormTarget] = useState("_self")

  const headerMenu = menus.find((m) => m.location === "header")
  const footerMenu = menus.find((m) => m.location === "footer")

  function openAddDialog(menuId: string, parentId?: string) {
    setEditingItem(null)
    setDialogMenuId(menuId)
    setDialogParentId(parentId)
    setFormLabel("")
    setFormLinkType("page")
    setFormPageSlug("")
    setFormHref("")
    setFormTarget("_self")
    setError("")
    setDialogOpen(true)
  }

  function openEditDialog(menuId: string, item: MenuItem) {
    setEditingItem(item)
    setDialogMenuId(menuId)
    setDialogParentId(undefined)
    setFormLabel(item.label)
    setFormLinkType(item.pageSlug ? "page" : "url")
    setFormPageSlug(item.pageSlug || "")
    setFormHref(item.href || "")
    setFormTarget(item.target)
    setError("")
    setDialogOpen(true)
  }

  function handleSaveItem() {
    if (!formLabel.trim()) return
    setError("")
    startTransition(async () => {
      try {
        if (editingItem) {
          await updateMenuItem(editingItem.id, {
            label: formLabel.trim(),
            pageSlug: formLinkType === "page" ? formPageSlug : "",
            href: formLinkType === "url" ? formHref : "",
            target: formTarget,
          })
        } else {
          await createMenuItem(dialogMenuId, {
            label: formLabel.trim(),
            pageSlug: formLinkType === "page" ? formPageSlug : undefined,
            href: formLinkType === "url" ? formHref : undefined,
            target: formTarget,
            parentId: dialogParentId,
          })
        }
        setDialogOpen(false)
        router.refresh()
      } catch (e: any) {
        setError(e.message || "Failed to save menu item")
      }
    })
  }

  function handleDelete(itemId: string, label: string) {
    if (!confirm(`Delete "${label}"? This will also remove any sub-items.`)) return
    startTransition(async () => {
      try {
        await deleteMenuItem(itemId)
        router.refresh()
      } catch (e: any) {
        setError(e.message || "Failed to delete")
      }
    })
  }

  function handleToggleVisibility(itemId: string, currentlyVisible: boolean) {
    startTransition(async () => {
      try {
        await updateMenuItem(itemId, { isVisible: !currentlyVisible })
        router.refresh()
      } catch {}
    })
  }

  function handleMoveItem(menuId: string, items: MenuItem[], idx: number, direction: "up" | "down") {
    const newIdx = direction === "up" ? idx - 1 : idx + 1
    if (newIdx < 0 || newIdx >= items.length) return
    const ids = items.map((i) => i.id)
    const [moved] = ids.splice(idx, 1)
    ids.splice(newIdx, 0, moved)
    startTransition(async () => {
      try {
        await reorderMenuItems(menuId, ids)
        router.refresh()
      } catch {}
    })
  }

  function handleCreateMenu(location: string) {
    startTransition(async () => {
      try {
        await createMenu(location)
        router.refresh()
      } catch (e: any) {
        setError(e.message || "Failed to create menu")
      }
    })
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Menu className="h-6 w-6 text-primary" />
            Menu Builder
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Configure your website&apos;s header and footer navigation
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/website-builder"><ArrowLeft className="h-4 w-4 mr-1" /> Back</Link>
        </Button>
      </div>

      {error && <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p>}

      {/* Header Menu */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <PanelTop className="h-4 w-4" />
                Header Navigation
              </CardTitle>
              <CardDescription>Main navigation shown at the top of your website</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {headerMenu && (
                <Badge variant="outline" className="text-[10px]">{headerMenu.items.length} items</Badge>
              )}
              {headerMenu && (
                <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => openAddDialog(headerMenu.id)}>
                  <Plus className="h-3 w-3" /> Add
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {headerMenu ? (
            <MenuItemList
              items={headerMenu.items}
              menuId={headerMenu.id}
              pages={pages}
              onEdit={(item) => openEditDialog(headerMenu.id, item)}
              onDelete={handleDelete}
              onToggleVisibility={handleToggleVisibility}
              onMove={(idx, dir) => handleMoveItem(headerMenu.id, headerMenu.items, idx, dir)}
              onAddChild={(parentId) => openAddDialog(headerMenu.id, parentId)}
              isPending={isPending}
            />
          ) : (
            <div className="text-center py-6">
              <p className="text-sm text-muted-foreground mb-3">No header menu configured.</p>
              <Button size="sm" variant="outline" onClick={() => handleCreateMenu("header")} disabled={isPending}>
                <Plus className="h-4 w-4 mr-1" /> Create Header Menu
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Footer Menu */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <PanelBottom className="h-4 w-4" />
                Footer Navigation
              </CardTitle>
              <CardDescription>Links shown in the footer of your website</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {footerMenu && (
                <Badge variant="outline" className="text-[10px]">{footerMenu.items.length} items</Badge>
              )}
              {footerMenu && (
                <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => openAddDialog(footerMenu.id)}>
                  <Plus className="h-3 w-3" /> Add
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {footerMenu ? (
            <MenuItemList
              items={footerMenu.items}
              menuId={footerMenu.id}
              pages={pages}
              onEdit={(item) => openEditDialog(footerMenu.id, item)}
              onDelete={handleDelete}
              onToggleVisibility={handleToggleVisibility}
              onMove={(idx, dir) => handleMoveItem(footerMenu.id, footerMenu.items, idx, dir)}
              onAddChild={(parentId) => openAddDialog(footerMenu.id, parentId)}
              isPending={isPending}
            />
          ) : (
            <div className="text-center py-6">
              <p className="text-sm text-muted-foreground mb-3">No footer menu configured.</p>
              <Button size="sm" variant="outline" onClick={() => handleCreateMenu("footer")} disabled={isPending}>
                <Plus className="h-4 w-4 mr-1" /> Create Footer Menu
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info */}
      <Card className="bg-muted/30 border-dashed">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            <strong>Tip:</strong> Link menu items to your pages by slug or add external URLs.
            Use the arrow buttons to reorder items. Toggle visibility to hide items without deleting them.
          </p>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {editingItem ? <Pencil className="h-5 w-5 text-primary" /> : <Plus className="h-5 w-5 text-primary" />}
              {editingItem ? "Edit Menu Item" : "Add Menu Item"}
            </DialogTitle>
            <DialogDescription>
              {editingItem ? "Update this menu item" : "Add a new navigation link"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {error && <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p>}
            <div className="space-y-2">
              <Label>Label</Label>
              <Input value={formLabel} onChange={(e) => setFormLabel(e.target.value)} placeholder="e.g. About Us" />
            </div>
            <div className="space-y-2">
              <Label>Link Type</Label>
              <div className="flex gap-2">
                <Button variant={formLinkType === "page" ? "secondary" : "outline"} size="sm" className="flex-1 gap-1" onClick={() => setFormLinkType("page")}>
                  <FileText className="h-3.5 w-3.5" /> Page
                </Button>
                <Button variant={formLinkType === "url" ? "secondary" : "outline"} size="sm" className="flex-1 gap-1" onClick={() => setFormLinkType("url")}>
                  <Link2 className="h-3.5 w-3.5" /> URL
                </Button>
              </div>
            </div>
            {formLinkType === "page" ? (
              <div className="space-y-2">
                <Label>Page</Label>
                <Select value={formPageSlug} onValueChange={setFormPageSlug}>
                  <SelectTrigger><SelectValue placeholder="Select a page" /></SelectTrigger>
                  <SelectContent>
                    {pages.map((p) => (
                      <SelectItem key={p.slug} value={p.slug}>{p.title} (/{p.slug})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="space-y-2">
                <Label>URL</Label>
                <Input value={formHref} onChange={(e) => setFormHref(e.target.value)} placeholder="https://..." />
              </div>
            )}
            <div className="space-y-2">
              <Label>Open in</Label>
              <Select value={formTarget} onValueChange={setFormTarget}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="_self">Same tab</SelectItem>
                  <SelectItem value="_blank">New tab</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveItem} disabled={isPending || !formLabel.trim()}>
              {isPending ? "Saving..." : editingItem ? "Update" : "Add Item"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function MenuItemList({ items, menuId, pages, onEdit, onDelete, onToggleVisibility, onMove, onAddChild, isPending }: {
  items: MenuItem[]
  menuId: string
  pages: PageRef[]
  onEdit: (item: MenuItem) => void
  onDelete: (id: string, label: string) => void
  onToggleVisibility: (id: string, visible: boolean) => void
  onMove: (idx: number, direction: "up" | "down") => void
  onAddChild: (parentId: string) => void
  isPending: boolean
}) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-4">No menu items yet</p>
  }

  return (
    <div className="space-y-1">
      {items.map((item, idx) => (
        <div key={item.id}>
          <div className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border transition-colors ${item.isVisible ? "hover:bg-muted/50" : "bg-muted/30 opacity-60"}`}>
            <div className="flex flex-col gap-0.5">
              <button
                className="p-0.5 rounded hover:bg-muted disabled:opacity-30"
                onClick={() => onMove(idx, "up")}
                disabled={idx === 0 || isPending}
              >
                <ChevronUp className="h-3 w-3 text-muted-foreground" />
              </button>
              <button
                className="p-0.5 rounded hover:bg-muted disabled:opacity-30"
                onClick={() => onMove(idx, "down")}
                disabled={idx === items.length - 1 || isPending}
              >
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              </button>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium flex items-center gap-2">
                {item.label}
                {!item.isVisible && (
                  <Badge variant="outline" className="text-[9px] bg-gray-100 text-gray-500">Hidden</Badge>
                )}
                {item.target === "_blank" && (
                  <ExternalLink className="h-3 w-3 text-muted-foreground" />
                )}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {item.pageSlug ? `→ /${item.pageSlug}` : item.href || "No link"}
              </p>
            </div>
            <div className="flex items-center gap-1">
              {item.children && item.children.length > 0 && (
                <Badge variant="outline" className="text-[9px] mr-1">{item.children.length} sub</Badge>
              )}
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onToggleVisibility(item.id, item.isVisible)} title={item.isVisible ? "Hide" : "Show"}>
                {item.isVisible ? <Eye className="h-3.5 w-3.5 text-muted-foreground" /> : <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />}
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onAddChild(item.id)} title="Add sub-item">
                <Plus className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(item)}>
                <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => onDelete(item.id, item.label)}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
          {item.children && item.children.length > 0 && (
            <div className="ml-8 mt-1 space-y-1">
              {item.children.map((child) => (
                <div key={child.id} className={`flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed transition-colors ${child.isVisible ? "hover:bg-muted/50" : "bg-muted/30 opacity-60"}`}>
                  <ChevronRight className="h-3 w-3 text-muted-foreground/40 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium flex items-center gap-1.5">
                      {child.label}
                      {!child.isVisible && <Badge variant="outline" className="text-[8px] bg-gray-100 text-gray-500">Hidden</Badge>}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {child.pageSlug ? `→ /${child.pageSlug}` : child.href || "No link"}
                    </p>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onToggleVisibility(child.id, child.isVisible)}>
                      {child.isVisible ? <Eye className="h-3 w-3 text-muted-foreground" /> : <EyeOff className="h-3 w-3 text-muted-foreground" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onEdit(child)}>
                      <Pencil className="h-3 w-3 text-muted-foreground" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => onDelete(child.id, child.label)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
