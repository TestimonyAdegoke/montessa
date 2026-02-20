"use client"

import { useState, useTransition } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Bus, MapPin, Plus, Trash2, Phone, Users, Clock } from "lucide-react"
import { createTransportRoute, deleteTransportRoute, addTransportStop } from "@/lib/actions/transport"
import { useToast } from "@/components/ui/use-toast"

interface StopData {
  id: string
  name: string
  address: string | null
  pickupTime: string | null
  dropoffTime: string | null
  sortOrder: number
}

interface RouteData {
  id: string
  name: string
  code: string
  description: string | null
  driverName: string | null
  driverPhone: string | null
  vehicleNumber: string | null
  capacity: number | null
  isActive: boolean
  stops: StopData[]
}

export function TransportClient({ routes: initialRoutes }: { routes: RouteData[] }) {
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()
  const [routes, setRoutes] = useState(initialRoutes)
  const [showAdd, setShowAdd] = useState(false)
  const [selectedRoute, setSelectedRoute] = useState<RouteData | null>(null)

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      try {
        await createTransportRoute({
          name: fd.get("name") as string,
          code: fd.get("code") as string,
          description: fd.get("description") as string || undefined,
          driverName: fd.get("driverName") as string || undefined,
          driverPhone: fd.get("driverPhone") as string || undefined,
          vehicleNumber: fd.get("vehicleNumber") as string || undefined,
          capacity: fd.get("capacity") ? Number(fd.get("capacity")) : undefined,
        })
        setShowAdd(false)
        toast({ title: "Route Created" })
        window.location.reload()
      } catch (err: any) {
        toast({ title: "Error", description: err.message, variant: "destructive" })
      }
    })
  }

  const handleDelete = (id: string) => {
    if (!confirm("Delete this route and all its stops?")) return
    startTransition(async () => {
      try {
        await deleteTransportRoute(id)
        setRoutes((prev) => prev.filter((r) => r.id !== id))
        toast({ title: "Route Deleted" })
      } catch (err: any) {
        toast({ title: "Error", description: err.message, variant: "destructive" })
      }
    })
  }

  const handleAddStop = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedRoute) return
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      try {
        await addTransportStop({
          routeId: selectedRoute.id,
          name: fd.get("stopName") as string,
          address: fd.get("stopAddress") as string || undefined,
          pickupTime: fd.get("pickupTime") as string || undefined,
          dropoffTime: fd.get("dropoffTime") as string || undefined,
        })
        toast({ title: "Stop Added" })
        window.location.reload()
      } catch (err: any) {
        toast({ title: "Error", description: err.message, variant: "destructive" })
      }
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={showAdd} onOpenChange={setShowAdd}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> Add Route</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Transport Route</DialogTitle>
              <DialogDescription>Create a new bus route for student transportation.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Route Name</Label><Input name="name" required /></div>
                <div><Label>Code</Label><Input name="code" required placeholder="e.g. RT-01" /></div>
              </div>
              <div><Label>Description</Label><Input name="description" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Driver Name</Label><Input name="driverName" /></div>
                <div><Label>Driver Phone</Label><Input name="driverPhone" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Vehicle Number</Label><Input name="vehicleNumber" /></div>
                <div><Label>Capacity</Label><Input name="capacity" type="number" /></div>
              </div>
              <Button type="submit" disabled={isPending} className="w-full">Create Route</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {routes.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Bus className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-1">No transport routes</h3>
            <p className="text-sm text-muted-foreground">Add your first bus route to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {routes.map((route) => (
            <Card key={route.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Bus className="h-5 w-5" /> {route.name}
                      <Badge variant="outline" className="text-xs">{route.code}</Badge>
                      {!route.isActive && <Badge variant="secondary">Inactive</Badge>}
                    </CardTitle>
                    {route.description && <CardDescription>{route.description}</CardDescription>}
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(route.id)} disabled={isPending}>
                    <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                  </Button>
                </div>
                <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                  {route.driverName && <span className="flex items-center gap-1"><Users className="h-3 w-3" />{route.driverName}</span>}
                  {route.driverPhone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{route.driverPhone}</span>}
                  {route.vehicleNumber && <span>Vehicle: {route.vehicleNumber}</span>}
                  {route.capacity && <span>Capacity: {route.capacity}</span>}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> Stops ({route.stops.length})</h4>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => setSelectedRoute(route)}>
                        <Plus className="h-3 w-3 mr-1" /> Add Stop
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Stop to {route.name}</DialogTitle>
                        <DialogDescription>Add a pickup/dropoff point to this route.</DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleAddStop} className="space-y-3">
                        <div><Label>Stop Name</Label><Input name="stopName" required /></div>
                        <div><Label>Address</Label><Input name="stopAddress" /></div>
                        <div className="grid grid-cols-2 gap-3">
                          <div><Label>Pickup Time</Label><Input name="pickupTime" placeholder="07:15" /></div>
                          <div><Label>Dropoff Time</Label><Input name="dropoffTime" placeholder="15:30" /></div>
                        </div>
                        <Button type="submit" disabled={isPending} className="w-full">Add Stop</Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
                {route.stops.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No stops added yet.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>#</TableHead>
                        <TableHead>Stop</TableHead>
                        <TableHead>Address</TableHead>
                        <TableHead>Pickup</TableHead>
                        <TableHead>Dropoff</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {route.stops.map((stop, i) => (
                        <TableRow key={stop.id}>
                          <TableCell className="font-mono text-xs">{i + 1}</TableCell>
                          <TableCell className="font-medium">{stop.name}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{stop.address || "—"}</TableCell>
                          <TableCell className="text-sm flex items-center gap-1">
                            {stop.pickupTime ? <><Clock className="h-3 w-3" />{stop.pickupTime}</> : "—"}
                          </TableCell>
                          <TableCell className="text-sm">{stop.dropoffTime || "—"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
