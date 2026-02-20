import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatDate } from "@/lib/utils"
import { DoorOpen, Plus, Calendar, Users } from "lucide-react"
import Link from "next/link"

export default async function RoomsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/login")

  const [rawRooms, rawBookings] = await Promise.all([
    prisma.room.findMany({
      include: { _count: { select: { RoomBooking: true, Schedule: true } } },
      orderBy: { name: "asc" },
    }),
    prisma.roomBooking.findMany({
      where: { startTime: { gte: new Date() } },
      include: { Room: { select: { name: true, building: true } } },
      orderBy: { startTime: "asc" },
      take: 50,
    }),
  ])
  const rooms = rawRooms.map(({ _count, ...rest }) => ({
    ...rest,
    _count: { bookings: _count.RoomBooking, schedules: _count.Schedule },
  }))
  const bookings = rawBookings.map(({ Room, ...rest }) => ({
    ...rest,
    room: Room,
  }))

  const canManage = ["SUPER_ADMIN", "TENANT_ADMIN"].includes(session.user.role)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Rooms & Resources</h1>
          <p className="text-muted-foreground">Manage rooms and resource bookings</p>
        </div>
        {canManage && (
          <Link href="/dashboard/rooms/new">
            <Button><Plus className="mr-2 h-4 w-4" />Add Room</Button>
          </Link>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rooms</CardTitle>
            <DoorOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{rooms.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rooms.filter((r: any) => r.isAvailable).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{bookings.length}</div></CardContent>
        </Card>
      </div>

      <Tabs defaultValue="rooms" className="space-y-4">
        <TabsList>
          <TabsTrigger value="rooms">Rooms ({rooms.length})</TabsTrigger>
          <TabsTrigger value="bookings">Bookings ({bookings.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="rooms">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Building</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Facilities</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rooms.map((room: any) => (
                    <TableRow key={room.id}>
                      <TableCell className="font-medium">{room.name}</TableCell>
                      <TableCell><Badge variant="outline">{room.type}</Badge></TableCell>
                      <TableCell>{room.building || "—"}{room.floor ? `, Floor ${room.floor}` : ""}</TableCell>
                      <TableCell>{room.capacity}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {room.facilities.slice(0, 3).map((f: string) => (
                            <Badge key={f} variant="secondary" className="text-xs">{f}</Badge>
                          ))}
                          {room.facilities.length > 3 && <Badge variant="secondary" className="text-xs">+{room.facilities.length - 3}</Badge>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={room.isAvailable ? "success" : "destructive"}>
                          {room.isAvailable ? "Available" : "Unavailable"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {rooms.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No rooms configured yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bookings">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Room</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Start</TableHead>
                    <TableHead>End</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((booking: any) => (
                    <TableRow key={booking.id}>
                      <TableCell className="font-medium">{booking.room.name}</TableCell>
                      <TableCell>{booking.title}</TableCell>
                      <TableCell>{formatDate(booking.startTime)}</TableCell>
                      <TableCell>{formatDate(booking.endTime)}</TableCell>
                      <TableCell>
                        <Badge variant={booking.status === "APPROVED" ? "success" : booking.status === "REJECTED" ? "destructive" : "outline"}>
                          {booking.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {bookings.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No upcoming bookings.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
