"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Eye, Search, Mail, Phone, MapPin, Briefcase, GraduationCap, LayoutGrid, List } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import ConfirmDeleteButton from "@/components/common/confirm-delete-button"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

interface Teacher {
  id: string
  employeeId: string
  department: string | null
  qualification: string | null
  experience: number | null
  status: string
  user: {
    name: string | null
    email: string | null
    phone: string | null
    isActive: boolean
    image?: string | null
  }
  classes: Array<{
    class: {
      name: string
      grade: string | null
    }
  }>
}

interface TeachersTableProps {
  teachers: Teacher[]
}

export default function TeachersTable({ teachers }: TeachersTableProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [viewMode, setViewMode] = useState<"list" | "grid">("grid")
  const schema = z.object({ query: z.string().max(100).optional().transform((v) => (v ?? "").trim()) })
  const { register, watch } = useForm<{ query?: string }>({ resolver: zodResolver(schema), defaultValues: { query: "" } })
  const searchQuery = watch("query") || ""

  const filteredTeachers = teachers.filter((teacher) => {
    const query = searchQuery.toLowerCase()
    return (
      teacher.user.name?.toLowerCase().includes(query) ||
      teacher.employeeId.toLowerCase().includes(query) ||
      teacher.user.email?.toLowerCase().includes(query) ||
      teacher.department?.toLowerCase().includes(query)
    )
  })

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "success" | "destructive"> = {
      ACTIVE: "success",
      INACTIVE: "destructive",
      ON_LEAVE: "default",
    }

    return (
      <Badge variant={variants[status] || "default"} className="rounded-full px-2 shadow-sm">
        {status}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search teachers..." className="pl-9 bg-background/50 backdrop-blur-sm border-primary/10 rounded-xl" {...register("query")} />
        </div>
        <div className="flex items-center bg-muted/50 p-1 rounded-xl border border-primary/10">
          <Button
            variant={viewMode === "list" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("list")}
            className={cn("rounded-lg h-8 w-8 p-0", viewMode === "list" && "shadow-sm bg-background")}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("grid")}
            className={cn("rounded-lg h-8 w-8 p-0", viewMode === "grid" && "shadow-sm bg-background")}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {viewMode === "list" ? (
        <div className="rounded-2xl border border-primary/10 bg-background/50 backdrop-blur-sm overflow-hidden shadow-xl">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="font-bold">Teacher</TableHead>
                <TableHead className="font-bold">Employee ID</TableHead>
                <TableHead className="font-bold">Department</TableHead>
                <TableHead className="font-bold">Qualification</TableHead>
                <TableHead className="font-bold">Experience</TableHead>
                <TableHead className="font-bold">Classes</TableHead>
                <TableHead className="font-bold">Status</TableHead>
                <TableHead className="text-right font-bold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTeachers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                    No teachers found matching your search.
                  </TableCell>
                </TableRow>
              ) : (
                filteredTeachers.map((teacher) => (
                  <TableRow key={teacher.id} className="hover:bg-primary/5 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border-2 border-primary/10 shadow-sm">
                          {teacher.user.image && <AvatarImage src={teacher.user.image} alt={teacher.user.name || ""} />}
                          <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">
                            {teacher.user.name?.substring(0, 2).toUpperCase() || "T"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-bold text-foreground">{teacher.user.name}</div>
                          <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                            {teacher.user.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs font-bold text-primary">
                      {teacher.employeeId}
                    </TableCell>
                    <TableCell className="text-sm font-medium">
                      {teacher.department || <span className="text-muted-foreground italic text-xs">Not specified</span>}
                    </TableCell>
                    <TableCell className="text-xs">{teacher.qualification}</TableCell>
                    <TableCell className="text-xs font-semibold">{teacher.experience} yrs</TableCell>
                    <TableCell>
                      {teacher.classes.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {teacher.classes.slice(0, 2).map((tc, idx) => (
                            <Badge key={idx} variant="outline" className="text-[10px] bg-primary/5 border-primary/10">
                              {tc.class.name}
                            </Badge>
                          ))}
                          {teacher.classes.length > 2 && (
                            <Badge variant="outline" className="text-[10px]">
                              +{teacher.classes.length - 2}
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-[10px] italic">No classes</span>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(teacher.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Link href={`/dashboard/teachers/${teacher.id}`}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full hover:bg-primary/10 hover:text-primary transition-all">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <ConfirmDeleteButton
                          resourceName="teacher"
                          onConfirm={async () => {
                            const res = await fetch(`/api/teachers/${teacher.id}`, { method: "DELETE" })
                            if (!res.ok) throw new Error("Failed to delete teacher")
                            startTransition(() => router.refresh())
                          }}
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 rounded-full hover:bg-destructive/10 hover:text-destructive transition-all"
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTeachers.length === 0 ? (
            <div className="col-span-full h-64 flex flex-col items-center justify-center text-muted-foreground">
              <Briefcase className="h-12 w-12 mb-4 opacity-10" />
              <p>No teachers found matching your search.</p>
            </div>
          ) : (
            filteredTeachers.map((teacher) => (
              <Card key={teacher.id} className="premium-card group hover:scale-[1.02] transition-all duration-300 border-primary/5">
                <CardContent className="p-0">
                  <div className="relative h-24 bg-gradient-to-br from-indigo-500/20 via-primary/10 to-transparent">
                    <div className="absolute top-3 right-3">
                      {getStatusBadge(teacher.status)}
                    </div>
                  </div>
                  <div className="px-5 pb-6">
                    <div className="relative -mt-10 mb-4 flex justify-center">
                      <Avatar className="h-20 w-20 border-4 border-background shadow-xl scale-100 group-hover:scale-105 transition-transform duration-500">
                        {teacher.user.image && <AvatarImage src={teacher.user.image} alt={teacher.user.name || ""} className="object-cover" />}
                        <AvatarFallback className="bg-primary text-primary-foreground text-xl font-black">
                          {teacher.user.name?.substring(0, 2).toUpperCase() || "T"}
                        </AvatarFallback>
                      </Avatar>
                    </div>

                    <div className="text-center space-y-1 mb-6">
                      <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors line-clamp-1">{teacher.user.name}</h3>
                      <p className="text-xs font-mono text-primary/60 font-medium">{teacher.employeeId}</p>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/40 border border-primary/5">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Briefcase className="h-3.5 w-3.5" />
                          <span className="text-[10px] uppercase font-bold tracking-wider">Dept</span>
                        </div>
                        <span className="text-xs font-bold truncate max-w-[100px]">{teacher.department || "N/A"}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-wider">Experience</span>
                          <p className="text-xs font-semibold">{teacher.experience} years</p>
                        </div>
                        <div className="space-y-1 text-right">
                          <span className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-wider">Classes</span>
                          <p className="text-xs font-semibold text-primary">{teacher.classes.length}</p>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground overflow-hidden">
                          <Mail className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{teacher.user.email}</span>
                        </div>
                        {teacher.user.phone && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Phone className="h-3.5 w-3.5 shrink-0" />
                            <span>{teacher.user.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <Link href={`/dashboard/teachers/${teacher.id}`} className="mt-6 block">
                      <Button className="w-full rounded-xl bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground font-bold text-sm transition-all shadow-none hover:shadow-lg hover:shadow-primary/20">
                        View Profile
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      <div className="flex items-center justify-between text-xs font-medium text-muted-foreground pt-4 border-t border-primary/5">
        <div>
          Showing <span className="text-foreground font-bold">{filteredTeachers.length}</span> of <span className="text-foreground font-bold">{teachers.length}</span> teachers
        </div>
      </div>
    </div>
  )
}
