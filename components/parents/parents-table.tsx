"use client"

import { useState } from "react"
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
import { Eye, Search, Mail, Phone, MapPin, Users, LayoutGrid, List } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface Parent {
    id: string
    occupation: string | null
    workPhone: string | null
    address: string | null
    user: {
        name: string | null
        email: string | null
        phone: string | null
        image?: string | null
    }
    students: Array<{
        student: {
            id: string
            user: {
                name: string | null
            }
        }
    }>
}

interface ParentsTableProps {
    parents: Parent[]
}

export default function ParentsTable({ parents }: ParentsTableProps) {
    const [viewMode, setViewMode] = useState<"list" | "grid">("grid")
    const [searchQuery, setSearchQuery] = useState("")

    const filteredParents = parents.filter((parent) => {
        const query = searchQuery.toLowerCase()
        return (
            parent.user.name?.toLowerCase().includes(query) ||
            parent.user.email?.toLowerCase().includes(query) ||
            parent.occupation?.toLowerCase().includes(query)
        )
    })

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search parents..."
                        className="pl-9 bg-background/50 backdrop-blur-sm border-primary/10 rounded-xl"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
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
                                <TableHead className="font-bold">Parent / Guardian</TableHead>
                                <TableHead className="font-bold">Contact</TableHead>
                                <TableHead className="font-bold">Occupation</TableHead>
                                <TableHead className="font-bold">Students</TableHead>
                                <TableHead className="text-right font-bold">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredParents.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                                        No parents found matching your search.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredParents.map((parent) => (
                                    <TableRow key={parent.id} className="hover:bg-primary/5 transition-colors">
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-10 w-10 border-2 border-primary/10 shadow-sm">
                                                    {parent.user.image && <AvatarImage src={parent.user.image} alt={parent.user.name || ""} />}
                                                    <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">
                                                        {parent.user.name?.substring(0, 2).toUpperCase() || "P"}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="font-bold text-foreground">{parent.user.name}</div>
                                                    <div className="text-[10px] text-muted-foreground line-clamp-1">
                                                        {parent.address || "No address"}
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                <div className="text-xs flex items-center gap-1.5">
                                                    <Mail className="h-3 w-3 text-primary/60" />
                                                    {parent.user.email}
                                                </div>
                                                {parent.user.phone && (
                                                    <div className="text-xs flex items-center gap-1.5">
                                                        <Phone className="h-3 w-3 text-primary/60" />
                                                        {parent.user.phone}
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-sm font-medium">
                                            {parent.occupation || <span className="text-muted-foreground italic text-xs">Not specified</span>}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {parent.students.map((gs, idx) => (
                                                    <Badge key={idx} variant="outline" className="text-[10px] bg-primary/5 border-primary/10">
                                                        {gs.student.user.name}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Link href={`/dashboard/parents/${parent.id}`}>
                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full hover:bg-primary/10 hover:text-primary transition-all">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredParents.length === 0 ? (
                        <div className="col-span-full h-64 flex flex-col items-center justify-center text-muted-foreground">
                            <Users className="h-12 w-12 mb-4 opacity-10" />
                            <p>No parents found matching your search.</p>
                        </div>
                    ) : (
                        filteredParents.map((parent) => (
                            <Card key={parent.id} className="premium-card group hover:scale-[1.02] transition-all duration-300 border-primary/5">
                                <CardContent className="p-0">
                                    <div className="relative h-24 bg-gradient-to-br from-soft-purple/20 via-primary/10 to-transparent">
                                        <div className="absolute top-3 right-3 flex gap-1">
                                            <Badge variant="outline" className="bg-background/80 backdrop-blur-md text-[9px] font-bold">
                                                {parent.students.length} Student{parent.students.length !== 1 ? 's' : ''}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="px-5 pb-6">
                                        <div className="relative -mt-10 mb-4 flex justify-center">
                                            <Avatar className="h-20 w-20 border-4 border-background shadow-xl scale-100 group-hover:scale-105 transition-transform duration-500">
                                                {parent.user.image && <AvatarImage src={parent.user.image} alt={parent.user.name || ""} className="object-cover" />}
                                                <AvatarFallback className="bg-primary text-primary-foreground text-xl font-black">
                                                    {parent.user.name?.substring(0, 2).toUpperCase() || "P"}
                                                </AvatarFallback>
                                            </Avatar>
                                        </div>

                                        <div className="text-center space-y-1 mb-6">
                                            <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors line-clamp-1">{parent.user.name}</h3>
                                            <p className="text-xs font-medium text-muted-foreground">{parent.occupation || "Parent / Guardian"}</p>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex flex-col gap-2 p-3 rounded-xl bg-muted/40 border border-primary/5">
                                                <span className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-wider">Dependents</span>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {parent.students.map((gs, idx) => (
                                                        <Badge key={idx} variant="secondary" className="text-[9px] h-5 bg-background border-primary/5">
                                                            {gs.student.user.name}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-2.5">
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground overflow-hidden">
                                                    <Mail className="h-3.5 w-3.5 shrink-0 text-primary/60" />
                                                    <span className="truncate">{parent.user.email}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <Phone className="h-3.5 w-3.5 shrink-0 text-primary/60" />
                                                    <span>{parent.user.phone || "No phone"}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <MapPin className="h-3.5 w-3.5 shrink-0 text-primary/60" />
                                                    <span className="line-clamp-1">{parent.address || "No address"}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <Link href={`/dashboard/parents/${parent.id}`} className="mt-6 block">
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
        </div>
    )
}
