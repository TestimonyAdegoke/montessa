"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface EnrollmentChartProps {
  data: Array<{
    name: string
    students: number
  }>
}

export default function EnrollmentChart({ data }: EnrollmentChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Class Enrollment</CardTitle>
        <CardDescription>Number of students per class</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="students" fill="#6366f1" name="Students" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
