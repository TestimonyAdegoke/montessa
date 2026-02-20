"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Database,
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  ArrowLeft,
  FileText,
  Layers,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import type { WBCmsCollectionData } from "@/lib/website-builder/types"
import {
  createCmsCollection,
  updateCmsCollection,
  deleteCmsCollection,
} from "@/lib/actions/website-builder-cms"

export function CmsCollectionsClient({
  collections: initialCollections,
}: {
  collections: WBCmsCollectionData[]
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [collections] = useState(initialCollections)
  const [search, setSearch] = useState("")
  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selectedCollection, setSelectedCollection] = useState<WBCmsCollectionData | null>(null)
  const [formName, setFormName] = useState("")
  const [formSlug, setFormSlug] = useState("")
  const [formDesc, setFormDesc] = useState("")
  const [error, setError] = useState("")

  const filtered = collections.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.slug.toLowerCase().includes(search.toLowerCase())
  )

  function resetForm() {
    setFormName("")
    setFormSlug("")
    setFormDesc("")
    setError("")
  }

  function handleCreate() {
    if (!formName.trim()) {
      setError("Name is required")
      return
    }
    setError("")
    startTransition(async () => {
      try {
        await createCmsCollection({
          name: formName,
          slug: formSlug || undefined,
          description: formDesc || undefined,
        })
        setCreateOpen(false)
        resetForm()
        router.refresh()
      } catch (e: any) {
        setError(e.message || "Failed to create collection")
      }
    })
  }

  function handleEdit() {
    if (!selectedCollection || !formName.trim()) {
      setError("Name is required")
      return
    }
    setError("")
    startTransition(async () => {
      try {
        await updateCmsCollection(selectedCollection!.id, {
          name: formName,
          slug: formSlug || undefined,
          description: formDesc || undefined,
        })
        setEditOpen(false)
        resetForm()
        router.refresh()
      } catch (e: any) {
        setError(e.message || "Failed to update collection")
      }
    })
  }

  function handleDelete() {
    if (!selectedCollection) return
    startTransition(async () => {
      try {
        await deleteCmsCollection(selectedCollection!.id)
        setDeleteOpen(false)
        setSelectedCollection(null)
        router.refresh()
      } catch (e: any) {
        setError(e.message || "Failed to delete collection")
      }
    })
  }

  function openEdit(c: WBCmsCollectionData) {
    setSelectedCollection(c)
    setFormName(c.name)
    setFormSlug(c.slug)
    setFormDesc(c.description || "")
    setError("")
    setEditOpen(true)
  }

  function openDelete(c: WBCmsCollectionData) {
    setSelectedCollection(c)
    setDeleteOpen(true)
  }

  return (
    <div className="container mx-auto max-w-5xl py-8 px-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard/website-builder">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Database className="h-6 w-6 text-primary" />
            CMS Collections
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Create and manage structured content collections for your website.
          </p>
        </div>
        <Button onClick={() => { resetForm(); setCreateOpen(true) }} className="gap-1.5">
          <Plus className="h-4 w-4" />
          New Collection
        </Button>
      </div>

      {/* Search */}
      <Input
        placeholder="Search collections..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />

      {/* Collections grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Database className="h-12 w-12 text-muted-foreground/40 mb-4" />
          <h3 className="text-lg font-semibold">No collections yet</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            Collections let you store structured content like blog posts, team members, or products.
          </p>
          <Button
            className="mt-4 gap-1.5"
            onClick={() => { resetForm(); setCreateOpen(true) }}
          >
            <Plus className="h-4 w-4" />
            Create your first collection
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c) => (
            <div
              key={c.id}
              className="group relative rounded-xl border bg-card p-5 hover:shadow-md transition-shadow cursor-pointer"
            >
              <Link
                href={`/dashboard/website-builder/cms/${c.id}`}
                className="absolute inset-0 z-0"
              />
              <div className="relative z-10 pointer-events-none">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Layers className="h-4.5 w-4.5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">{c.name}</h3>
                      <p className="text-xs text-muted-foreground">/{c.slug}</p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 pointer-events-auto opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEdit(c)}>
                        <Pencil className="h-3.5 w-3.5 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => openDelete(c)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                {c.description && (
                  <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                    {c.description}
                  </p>
                )}
                <div className="flex items-center gap-3 mt-3">
                  <Badge variant="secondary" className="text-[10px] gap-1">
                    <FileText className="h-3 w-3" />
                    {c.fields.length} fields
                  </Badge>
                  <Badge variant="outline" className="text-[10px] gap-1">
                    <Database className="h-3 w-3" />
                    {c.items.length} items
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Collection</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs">Name *</Label>
              <Input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. Blog Posts"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Slug</Label>
              <Input
                value={formSlug}
                onChange={(e) => setFormSlug(e.target.value)}
                placeholder="Auto-generated from name"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Description</Label>
              <Textarea
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                placeholder="Optional description"
                rows={2}
              />
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={isPending}>
              {isPending ? "Creating..." : "Create Collection"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Collection</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs">Name *</Label>
              <Input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Slug</Label>
              <Input
                value={formSlug}
                onChange={(e) => setFormSlug(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Description</Label>
              <Textarea
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                rows={2}
              />
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEdit} disabled={isPending}>
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Collection</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &quot;{selectedCollection?.name}&quot; and all its fields
              and items. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
