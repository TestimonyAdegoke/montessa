"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Users, List, LayoutGrid } from "lucide-react"
import { formatDate, cn } from "@/lib/utils"

interface StaffDirectoryProps {
    staffRecords: any[]
    staffBadge: (status: string) => React.ReactNode
}

export default function StaffDirectory({ staffRecords, staffBadge }: StaffDirectoryProps) {
    const [viewMode, setViewMode] = useState<"list" | "grid">("grid")

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
                <div className="flex items-center gap-4">
                    {/* Search could be added here */}
                </div>
                <div className="flex items-center bg-muted/50 p-1 rounded-xl border border-primary/10 self-end">
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
                <Card className="rounded-2xl border-primary/10 overflow-hidden shadow-xl bg-background/50 backdrop-blur-sm">
                    <CardHeader className="bg-muted/30">
                        <CardTitle>Staff Directory</CardTitle>
                        <CardDescription>All staff members and their details</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        {staffRecords.length === 0 ? (
                            <div className="text-center py-12">
                                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                <h3 className="text-lg font-semibold mb-1">No staff records</h3>
                                <p className="text-sm text-muted-foreground">Staff records will appear here once created.</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/20">
                                        <TableHead className="font-bold">Name</TableHead>
                                        <TableHead className="font-bold">Employee #</TableHead>
                                        <TableHead className="font-bold">Department</TableHead>
                                        <TableHead className="font-bold">Designation</TableHead>
                                        <TableHead className="font-bold">Type</TableHead>
                                        <TableHead className="font-bold">Join Date</TableHead>
                                        <TableHead className="font-bold">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {staffRecords.map((staff: any) => (
                                        <TableRow key={staff.id} className="hover:bg-primary/5 transition-colors">
                                            <TableCell className="font-bold">{staff.fullName}</TableCell>
                                            <TableCell className="font-mono text-xs font-bold text-primary">{staff.employeeNumber}</TableCell>
                                            <TableCell className="text-sm font-medium">{staff.department}</TableCell>
                                            <TableCell className="text-sm">{staff.designation}</TableCell>
                                            <TableCell><Badge variant="outline" className="text-[10px] uppercase font-bold tracking-tight">{staff.employmentType.replace(/_/g, " ")}</Badge></TableCell>
                                            <TableCell className="text-sm">{formatDate(staff.joinDate)}</TableCell>
                                            <TableCell>{staffBadge(staff.status)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {staffRecords.length === 0 ? (
                        <div className="col-span-full h-64 flex flex-col items-center justify-center text-muted-foreground">
                            <Users className="h-12 w-12 mb-4 opacity-10" />
                            <p>No staff records found.</p>
                        </div>
                    ) : (
                        staffRecords.map((staff: any) => (
                            <Card key={staff.id} className="premium-card group hover:scale-[1.02] transition-all duration-300 border-primary/5">
                                <CardContent className="p-0">
                                    <div className="relative h-20 bg-gradient-to-br from-primary/10 via-indigo-500/5 to-transparent">
                                        <div className="absolute top-3 right-3">
                                            {staffBadge(staff.status)}
                                        </div>
                                    </div>
                                    <div className="px-5 pb-6 text-center">
                                        <div className="relative -mt-8 mb-4 flex justify-center">
                                            <Avatar className="h-16 w-16 border-4 border-background shadow-lg group-hover:scale-105 transition-transform">
                                                <AvatarFallback className="bg-primary text-primary-foreground text-lg font-black uppercase">
                                                    {staff.fullName.substring(0, 2)}
                                                </AvatarFallback>
                                            </Avatar>
                                        </div>
                                        <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors line-clamp-1">{staff.fullName}</h3>
                                        <p className="text-[10px] font-mono font-bold text-primary/60 mb-4">{staff.employeeNumber}</p>

                                        <div className="space-y-3 pt-2 text-left border-t border-primary/5">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] uppercase font-bold text-muted-foreground/60">Department</span>
                                                <span className="text-xs font-bold">{staff.department}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] uppercase font-bold text-muted-foreground/60">Designation</span>
                                                <span className="text-xs font-medium line-clamp-1">{staff.designation}</span>
                                            </div>
                                            <Separator className="bg-primary/5" />
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-wider">Type</span>
                                                <Badge variant="outline" className="text-[9px] h-5 px-1.5 font-bold uppercase">{staff.employmentType.replace(/_/g, " ")}</Badge>
                                            </div>
                                        </div>

                                        <Button variant="ghost" className="w-full mt-4 rounded-xl text-xs font-bold group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                                            View Details
                                        </Button>
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
