"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BookOpen, Plus, Search, RotateCcw, Trash2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { createBook, issueBook, returnBook, deleteBook } from "@/lib/actions/library"
import { useRouter } from "next/navigation"

interface Props { books: any[]; userRole: string; userId: string; userName: string }

export function LibraryClient({ books, userRole, userId, userName }: Props) {
  const { toast } = useToast()
  const router = useRouter()
  const [showAdd, setShowAdd] = useState(false)
  const [search, setSearch] = useState("")
  const [form, setForm] = useState({ title: "", author: "", isbn: "", publisher: "", category: "", totalCopies: "1", shelfLocation: "" })
  const canManage = ["SUPER_ADMIN", "TENANT_ADMIN", "TEACHER", "HOD"].includes(userRole)

  const filtered = books.filter((b: any) =>
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.author.toLowerCase().includes(search.toLowerCase()) ||
    (b.isbn || "").includes(search)
  )

  const handleAdd = async () => {
    if (!form.title || !form.author) return
    try {
      await createBook({ ...form, totalCopies: parseInt(form.totalCopies) || 1 })
      toast({ title: "Book Added" })
      setShowAdd(false)
      setForm({ title: "", author: "", isbn: "", publisher: "", category: "", totalCopies: "1", shelfLocation: "" })
      router.refresh()
    } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }) }
  }

  const handleIssue = async (bookId: string) => {
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + 14)
    try {
      await issueBook({ bookId, borrowerId: userId, borrowerName: userName, borrowerType: "STAFF", dueDate: dueDate.toISOString() })
      toast({ title: "Book Issued" })
      router.refresh()
    } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }) }
  }

  const handleReturn = async (loanId: string) => {
    try { await returnBook(loanId); toast({ title: "Book Returned" }); router.refresh() }
    catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }) }
  }

  const handleDelete = async (id: string) => {
    try { await deleteBook(id); toast({ title: "Book Deleted" }); router.refresh() }
    catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }) }
  }

  const totalBooks = books.reduce((s: number, b: any) => s + b.totalCopies, 0)
  const available = books.reduce((s: number, b: any) => s + b.availableCopies, 0)
  const onLoan = totalBooks - available

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader className="pb-2"><CardDescription>Total Books</CardDescription><CardTitle className="text-3xl">{totalBooks}</CardTitle></CardHeader></Card>
        <Card><CardHeader className="pb-2"><CardDescription>Available</CardDescription><CardTitle className="text-3xl text-green-600">{available}</CardTitle></CardHeader></Card>
        <Card><CardHeader className="pb-2"><CardDescription>On Loan</CardDescription><CardTitle className="text-3xl text-orange-500">{onLoan}</CardTitle></CardHeader></Card>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input className="pl-9" placeholder="Search books..." value={search} onChange={e => setSearch(e.target.value)} /></div>
        {canManage && <Button onClick={() => setShowAdd(!showAdd)}><Plus className="h-4 w-4 mr-2" />Add Book</Button>}
      </div>

      {showAdd && (
        <Card>
          <CardHeader><CardTitle className="text-base">Add New Book</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div><Label>Title *</Label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
              <div><Label>Author *</Label><Input value={form.author} onChange={e => setForm({ ...form, author: e.target.value })} /></div>
              <div><Label>ISBN</Label><Input value={form.isbn} onChange={e => setForm({ ...form, isbn: e.target.value })} /></div>
              <div><Label>Publisher</Label><Input value={form.publisher} onChange={e => setForm({ ...form, publisher: e.target.value })} /></div>
              <div><Label>Category</Label><Input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="Fiction, Science..." /></div>
              <div><Label>Copies</Label><Input type="number" value={form.totalCopies} onChange={e => setForm({ ...form, totalCopies: e.target.value })} /></div>
              <div><Label>Shelf Location</Label><Input value={form.shelfLocation} onChange={e => setForm({ ...form, shelfLocation: e.target.value })} /></div>
            </div>
            <div className="flex gap-2"><Button onClick={handleAdd}>Save</Button><Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button></div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-muted-foreground"><BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />No books found.</CardContent></Card>
        ) : filtered.map((b: any) => (
          <Card key={b.id}>
            <CardContent className="py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center"><BookOpen className="h-5 w-5 text-primary" /></div>
                <div>
                  <p className="font-semibold">{b.title}</p>
                  <p className="text-sm text-muted-foreground">{b.author}{b.isbn ? ` · ISBN: ${b.isbn}` : ""}{b.shelfLocation ? ` · ${b.shelfLocation}` : ""}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {b.category && <Badge variant="outline">{b.category}</Badge>}
                <Badge variant={b.availableCopies > 0 ? "default" : "destructive"}>{b.availableCopies}/{b.totalCopies} available</Badge>
                {b.availableCopies > 0 && <Button size="sm" variant="outline" onClick={() => handleIssue(b.id)}>Issue</Button>}
                {b.loans?.map((l: any) => (
                  <Button key={l.id} size="sm" variant="ghost" onClick={() => handleReturn(l.id)}><RotateCcw className="h-3 w-3 mr-1" />Return</Button>
                ))}
                {canManage && <Button variant="ghost" size="icon" onClick={() => handleDelete(b.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
