"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GraduationCap, Plus, Search, Briefcase, MapPin } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { createAlumni } from "@/lib/actions/alumni"
import { useRouter } from "next/navigation"

interface Props { alumni: any[] }

export function AlumniClient({ alumni }: Props) {
  const { toast } = useToast()
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState("")
  const [form, setForm] = useState({ fullName: "", graduationYear: "", graduationClass: "", email: "", phone: "", currentOccupation: "", employer: "", higherEducation: "", degree: "", city: "", country: "" })

  const filtered = alumni.filter((a: any) =>
    a.fullName.toLowerCase().includes(search.toLowerCase()) ||
    a.graduationYear.includes(search) ||
    (a.currentOccupation || "").toLowerCase().includes(search.toLowerCase())
  )

  const handleCreate = async () => {
    if (!form.fullName || !form.graduationYear) return
    try {
      await createAlumni(form)
      toast({ title: "Alumni Added" })
      setShowForm(false)
      setForm({ fullName: "", graduationYear: "", graduationClass: "", email: "", phone: "", currentOccupation: "", employer: "", higherEducation: "", degree: "", city: "", country: "" })
      router.refresh()
    } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }) }
  }

  const years = Array.from(new Set(alumni.map((a: any) => a.graduationYear))).sort().reverse()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input className="pl-9" placeholder="Search alumni..." value={search} onChange={e => setSearch(e.target.value)} /></div>
        <Button onClick={() => setShowForm(!showForm)}><Plus className="h-4 w-4 mr-2" />Add Alumni</Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle className="text-base">Add Alumni Record</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div><Label>Full Name *</Label><Input value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} /></div>
              <div><Label>Graduation Year *</Label><Input value={form.graduationYear} onChange={e => setForm({ ...form, graduationYear: e.target.value })} placeholder="2024" /></div>
              <div><Label>Graduation Class</Label><Input value={form.graduationClass} onChange={e => setForm({ ...form, graduationClass: e.target.value })} /></div>
              <div><Label>Email</Label><Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
              <div><Label>Phone</Label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
              <div><Label>City</Label><Input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} /></div>
              <div><Label>Occupation</Label><Input value={form.currentOccupation} onChange={e => setForm({ ...form, currentOccupation: e.target.value })} /></div>
              <div><Label>Employer</Label><Input value={form.employer} onChange={e => setForm({ ...form, employer: e.target.value })} /></div>
              <div><Label>Higher Education</Label><Input value={form.higherEducation} onChange={e => setForm({ ...form, higherEducation: e.target.value })} /></div>
            </div>
            <div className="flex gap-2"><Button onClick={handleCreate}>Save</Button><Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button></div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader className="pb-2"><CardDescription>Total Alumni</CardDescription><CardTitle className="text-3xl">{alumni.length}</CardTitle></CardHeader></Card>
        <Card><CardHeader className="pb-2"><CardDescription>Graduation Years</CardDescription><CardTitle className="text-3xl">{years.length}</CardTitle></CardHeader></Card>
        <Card><CardHeader className="pb-2"><CardDescription>With Career Info</CardDescription><CardTitle className="text-3xl">{alumni.filter((a: any) => a.currentOccupation).length}</CardTitle></CardHeader></Card>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-muted-foreground">No alumni records found.</CardContent></Card>
        ) : filtered.map((a: any) => (
          <Card key={a.id}>
            <CardContent className="py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center"><GraduationCap className="h-5 w-5 text-primary" /></div>
                <div>
                  <p className="font-semibold">{a.fullName}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Class of {a.graduationYear}</span>
                    {a.currentOccupation && <><span>·</span><Briefcase className="h-3 w-3" /><span>{a.currentOccupation}{a.employer ? ` at ${a.employer}` : ""}</span></>}
                    {a.city && <><span>·</span><MapPin className="h-3 w-3" /><span>{a.city}</span></>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {a.higherEducation && <Badge variant="outline">{a.higherEducation}</Badge>}
                {a.email && <Badge variant="secondary">{a.email}</Badge>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
