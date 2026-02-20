"use client"

import { useState, useTransition } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Building2, Plus, Loader2, Trash2, MapPin, Phone, Mail } from "lucide-react"
import { createCampus, deleteCampus } from "@/lib/actions/campus"
import { useToast } from "@/components/ui/use-toast"

interface CampusData {
  id: string
  name: string
  code: string
  address: string | null
  city: string | null
  state: string | null
  country: string | null
  phone: string | null
  email: string | null
  logo: string | null
  primaryColor: string | null
  tagline: string | null
  headUserId: string | null
  isActive: boolean
}

export function CampusClient({ campuses }: { campuses: CampusData[] }) {
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()
  const [showCreate, setShowCreate] = useState(false)
  const [name, setName] = useState("")
  const [code, setCode] = useState("")
  const [address, setAddress] = useState("")
  const [city, setCity] = useState("")
  const [state, setState] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [logo, setLogo] = useState("")
  const [color, setColor] = useState("")
  const [tagline, setTagline] = useState("")

  const handleCreate = () => {
    if (!name || !code) return
    startTransition(async () => {
      try {
        await createCampus({
          name, code,
          address: address || undefined, city: city || undefined,
          state: state || undefined, phone: phone || undefined,
          email: email || undefined, logo: logo || undefined,
          primaryColor: color || undefined, tagline: tagline || undefined,
        })
        toast({ title: "Campus Created", description: `${name} has been added.` })
        setShowCreate(false)
        setName(""); setCode(""); setAddress(""); setCity(""); setState("")
        setPhone(""); setEmail(""); setLogo(""); setColor(""); setTagline("")
      } catch (e: any) {
        toast({ title: "Error", description: e.message, variant: "destructive" })
      }
    })
  }

  const handleDelete = (id: string, campusName: string) => {
    if (!confirm(`Delete campus "${campusName}"?`)) return
    startTransition(async () => {
      try {
        await deleteCampus(id)
        toast({ title: "Deleted" })
      } catch (e: any) {
        toast({ title: "Error", description: e.message, variant: "destructive" })
      }
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4 mr-2" /> Add Campus
        </Button>
      </div>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Add Campus / Branch</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Name *</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Main Campus" /></div>
              <div><Label>Code *</Label><Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="MAIN" /></div>
            </div>
            <div><Label>Address</Label><Input value={address} onChange={(e) => setAddress(e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>City</Label><Input value={city} onChange={(e) => setCity(e.target.value)} /></div>
              <div><Label>State</Label><Input value={state} onChange={(e) => setState(e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Phone</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
              <div><Label>Email</Label><Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" /></div>
            </div>
            <div><Label>Logo URL (override)</Label><Input value={logo} onChange={(e) => setLogo(e.target.value)} placeholder="https://..." /></div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Primary Color (override)</Label>
                <div className="flex gap-2">
                  <Input type="color" value={color || "#3b82f6"} onChange={(e) => setColor(e.target.value)} className="w-12 h-9 p-1" />
                  <Input value={color} onChange={(e) => setColor(e.target.value)} placeholder="#3b82f6" className="flex-1" />
                </div>
              </div>
              <div><Label>Tagline</Label><Input value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="Excellence in education" /></div>
            </div>
            <Button onClick={handleCreate} disabled={isPending || !name || !code} className="w-full">
              {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Create Campus
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {campuses.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-1">No campuses</h3>
            <p className="text-sm text-muted-foreground">Add your first campus or branch to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {campuses.map((c) => (
            <Card key={c.id} className={!c.isActive ? "opacity-60" : ""}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {c.logo ? (
                      <img src={c.logo} alt={c.name} className="h-10 w-10 rounded object-contain" />
                    ) : (
                      <div className="h-10 w-10 rounded flex items-center justify-center text-white font-bold" style={{ backgroundColor: c.primaryColor || "#3b82f6" }}>
                        {c.code.substring(0, 2)}
                      </div>
                    )}
                    <div>
                      <CardTitle className="text-base">{c.name}</CardTitle>
                      <CardDescription className="font-mono text-xs">{c.code}</CardDescription>
                    </div>
                  </div>
                  <Badge variant={c.isActive ? "success" : "secondary"} className="text-[10px]">
                    {c.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {c.tagline && <p className="text-sm text-muted-foreground italic">{c.tagline}</p>}
                {(c.address || c.city) && (
                  <div className="flex items-start gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                    <span>{[c.address, c.city, c.state].filter(Boolean).join(", ")}</span>
                  </div>
                )}
                {c.phone && (
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Phone className="h-3.5 w-3.5" /><span>{c.phone}</span>
                  </div>
                )}
                {c.email && (
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Mail className="h-3.5 w-3.5" /><span>{c.email}</span>
                  </div>
                )}
                <div className="pt-2">
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive" onClick={() => handleDelete(c.id, c.name)}>
                    <Trash2 className="h-3.5 w-3.5 mr-1" /> Remove
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
