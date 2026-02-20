"use client"

import { useState } from "react"
import Link from "next/link"
import { formatDate, calculateAge, cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
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
import { Eye, Search, LayoutGrid, List, Phone, Mail, GraduationCap } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export interface StudentTableRow {
  id: string
  legalName: string
  preferredName: string | null
  dateOfBirth: Date
  gender: string
  admissionNumber: string
  studentStatus: string
  profilePhoto: string | null
  user: {
    name: string | null
    email: string | null
  }
  currentClass: {
    name: string
    grade: string | null
  } | null
  guardians: Array<{
    relationship: string
    guardian: {
      user: {
        name: string | null
        email: string | null
        phone: string | null
      }
    }
  }>
}

interface StudentsTableProps {
  students: StudentTableRow[]
}

export default function StudentsTable({ students }: StudentsTableProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"list" | "grid">("grid")

  const filteredStudents = students.filter((student) => {
    const query = searchQuery.toLowerCase()
    return (
      student.legalName.toLowerCase().includes(query) ||
      student.admissionNumber.toLowerCase().includes(query) ||
      student.user.email?.toLowerCase().includes(query) ||
      student.currentClass?.name.toLowerCase().includes(query)
    )
  })

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "success" | "warning" | "destructive"> = {
      ACTIVE: "success",
      INACTIVE: "warning",
      GRADUATED: "default",
      TRANSFERRED: "warning",
      EXPELLED: "destructive",
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
          <Input
            placeholder="Search students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-background/50 backdrop-blur-sm border-primary/10 rounded-xl"
          />
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
                <TableHead className="font-bold">Student</TableHead>
                <TableHead className="font-bold">Admission #</TableHead>
                <TableHead className="font-bold">Class</TableHead>
                <TableHead className="font-bold">Age</TableHead>
                <TableHead className="font-bold">Guardian</TableHead>
                <TableHead className="font-bold">Status</TableHead>
                <TableHead className="text-right font-bold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                    No students found matching your search.
                  </TableCell>
                </TableRow>
              ) : (
                filteredStudents.map((student) => {
                  const primaryGuardian = student.guardians.find((g) => g.relationship === "MOTHER")
                    || student.guardians.find((g) => g.relationship === "FATHER")
                    || student.guardians[0]

                  return (
                    <TableRow key={student.id} className="hover:bg-primary/5 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 border-2 border-primary/10 shadow-sm">
                            <AvatarImage src={student.profilePhoto || ""} alt={student.legalName} />
                            <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">
                              {student.legalName.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-bold text-foreground">{student.legalName}</div>
                            <div className="text-xs text-muted-foreground">
                              {student.user.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs font-bold text-primary">
                        {student.admissionNumber}
                      </TableCell>
                      <TableCell>
                        {student.currentClass ? (
                          <div className="flex flex-col">
                            <span className="font-medium text-sm">{student.currentClass.name}</span>
                            <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Grade {student.currentClass.grade}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-xs italic">Not assigned</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">{calculateAge(student.dateOfBirth)} yrs</TableCell>
                      <TableCell>
                        {primaryGuardian ? (
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">{primaryGuardian.guardian.user.name}</span>
                            <span className="text-[10px] text-muted-foreground uppercase">{primaryGuardian.relationship}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-xs italic">No guardian</span>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(student.studentStatus)}</TableCell>
                      <TableCell className="text-right">
                        <Link href={`/dashboard/students/${student.id}`}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full hover:bg-primary/10 hover:text-primary transition-all">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredStudents.length === 0 ? (
            <div className="col-span-full h-64 flex flex-col items-center justify-center text-muted-foreground">
              <GraduationCap className="h-12 w-12 mb-4 opacity-10" />
              <p>No students found matching your search.</p>
            </div>
          ) : (
            filteredStudents.map((student) => {
              const primaryGuardian = student.guardians.find((g) => g.relationship === "MOTHER")
                || student.guardians.find((g) => g.relationship === "FATHER")
                || student.guardians[0]

              return (
                <Card key={student.id} className="premium-card group hover:scale-[1.02] transition-all duration-300 border-primary/5">
                  <CardContent className="p-0">
                    <div className="relative h-24 bg-gradient-to-br from-primary/20 via-indigo-500/10 to-transparent">
                      <div className="absolute top-3 right-3">
                        {getStatusBadge(student.studentStatus)}
                      </div>
                    </div>
                    <div className="px-5 pb-6">
                      <div className="relative -mt-10 mb-4 flex justify-center">
                        <Avatar className="h-20 w-20 border-4 border-background shadow-xl scale-100 group-hover:scale-105 transition-transform duration-500">
                          <AvatarImage src={student.profilePhoto || ""} alt={student.legalName} className="object-cover" />
                          <AvatarFallback className="bg-primary text-primary-foreground text-xl font-black">
                            {student.legalName.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </div>

                      <div className="text-center space-y-1 mb-6">
                        <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors line-clamp-1">{student.legalName}</h3>
                        <p className="text-xs font-mono text-primary/60 font-medium">{student.admissionNumber}</p>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/40 border border-primary/5">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <GraduationCap className="h-3.5 w-3.5" />
                            <span className="text-[10px] uppercase font-bold tracking-wider">Class</span>
                          </div>
                          <span className="text-xs font-bold">{student.currentClass?.name || "N/A"}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <span className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-wider">Gender</span>
                            <p className="text-xs font-semibold capitalize">{student.gender.toLowerCase()}</p>
                          </div>
                          <div className="space-y-1 text-right">
                            <span className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-wider">Age</span>
                            <p className="text-xs font-semibold">{calculateAge(student.dateOfBirth)} years</p>
                          </div>
                        </div>

                        <Separator className="bg-primary/5" />

                        {primaryGuardian && (
                          <div className="flex items-center justify-between gap-2 overflow-hidden">
                            <div className="flex flex-col min-w-0">
                              <span className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-wider">Guardian</span>
                              <span className="text-xs font-bold truncate">{primaryGuardian.guardian.user.name}</span>
                            </div>
                            <div className="flex gap-1 shrink-0">
                              {primaryGuardian.guardian.user.phone && (
                                <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg hover:bg-primary/10 hover:text-primary transition-all">
                                  <Phone className="h-3.5 w-3.5" />
                                </Button>
                              )}
                              <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg hover:bg-primary/10 hover:text-primary transition-all">
                                <Mail className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>

                      <Link href={`/dashboard/students/${student.id}`} className="mt-6 block">
                        <Button className="w-full rounded-xl bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground font-bold text-sm transition-all shadow-none hover:shadow-lg hover:shadow-primary/20">
                          View Profile
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      )}

      <div className="flex items-center justify-between text-xs font-medium text-muted-foreground pt-4 border-t border-primary/5">
        <div>
          Showing <span className="text-foreground font-bold">{filteredStudents.length}</span> of <span className="text-foreground font-bold">{students.length}</span> students
        </div>
      </div>
    </div>
  )
}
