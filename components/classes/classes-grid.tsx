"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Users, UserCheck, BookOpen, Eye, Search } from "lucide-react"

interface Class {
  id: string
  name: string
  grade: string | null
  section: string | null
  capacity: number
  roomNumber: string | null
  status: string
  _count: {
    students: number
    enrollments: number
  }
  teachers: Array<{
    isPrimary: boolean
    teacher: {
      user: {
        name: string | null
      }
    }
  }>
}

interface ClassesGridProps {
  classes: Class[]
}

export default function ClassesGrid({ classes }: ClassesGridProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredClasses = classes.filter((cls) => {
    const query = searchQuery.toLowerCase()
    return (
      cls.name.toLowerCase().includes(query) ||
      cls.grade?.toLowerCase().includes(query) ||
      cls.roomNumber?.toLowerCase().includes(query)
    )
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-500"
      case "INACTIVE":
        return "bg-gray-500"
      case "ARCHIVED":
        return "bg-yellow-500"
      default:
        return "bg-blue-500"
    }
  }

  const getCapacityColor = (current: number, max: number) => {
    const percentage = (current / max) * 100
    if (percentage >= 90) return "text-red-600"
    if (percentage >= 75) return "text-orange-600"
    return "text-green-600"
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search classes by name, grade, or room..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Classes Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredClasses.map((cls) => {
          const primaryTeacher = cls.teachers.find((t) => t.isPrimary)?.teacher.user.name || 
                                cls.teachers[0]?.teacher.user.name
          const capacityPercentage = (cls._count.students / cls.capacity) * 100

          return (
            <Card key={cls.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {cls.name}
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(cls.status)}`} />
                    </CardTitle>
                    <CardDescription>
                      {cls.grade && `Grade ${cls.grade}`}
                      {cls.section && ` • Section ${cls.section}`}
                      {cls.roomNumber && ` • Room ${cls.roomNumber}`}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <Users className="h-4 w-4" />
                      Students
                    </div>
                    <div className={`text-2xl font-bold ${getCapacityColor(cls._count.students, cls.capacity)}`}>
                      {cls._count.students}
                      <span className="text-sm font-normal text-muted-foreground">
                        /{cls.capacity}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <UserCheck className="h-4 w-4" />
                      Teachers
                    </div>
                    <div className="text-2xl font-bold">
                      {cls.teachers.length}
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Capacity</span>
                    <span>{Math.round(capacityPercentage)}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        capacityPercentage >= 90
                          ? "bg-red-500"
                          : capacityPercentage >= 75
                          ? "bg-orange-500"
                          : "bg-green-500"
                      }`}
                      style={{ width: `${Math.min(capacityPercentage, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Primary Teacher */}
                {primaryTeacher && (
                  <div className="flex items-center gap-2 text-sm">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Teacher:</span>
                    <span className="font-medium">{primaryTeacher}</span>
                  </div>
                )}

                {/* Status Badge */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <Badge variant={cls.status === "ACTIVE" ? "success" : "default"}>
                    {cls.status}
                  </Badge>
                  <Link href={`/dashboard/classes/${cls.id}`}>
                    <Button variant="ghost" size="sm">
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredClasses.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No classes found</h3>
            <p className="text-muted-foreground text-center">
              {searchQuery
                ? "Try adjusting your search criteria"
                : "Create your first class to get started"}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Summary */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div>
          Showing {filteredClasses.length} of {classes.length} classes
        </div>
        <div>
          Total Students: {classes.reduce((sum, cls) => sum + cls._count.students, 0)}
        </div>
      </div>
    </div>
  )
}
