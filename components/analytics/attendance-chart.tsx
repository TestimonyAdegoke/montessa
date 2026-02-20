"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface AttendanceChartProps {
  data: Array<{
    date: Date
    status: string
    _count: number
  }>
}

export default function AttendanceChart({ data }: AttendanceChartProps) {
  // Transform data for chart
  const chartData = data.reduce((acc: any[], record) => {
    const dateStr = new Date(record.date).toLocaleDateString()
    const existing = acc.find(item => item.date === dateStr)
    
    if (existing) {
      existing[record.status.toLowerCase()] = record._count
    } else {
      acc.push({
        date: dateStr,
        [record.status.toLowerCase()]: record._count,
      })
    }
    
    return acc
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Attendance Trend</CardTitle>
        <CardDescription>Daily attendance over the last 30 days</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="present" stroke="#10b981" name="Present" />
            <Line type="monotone" dataKey="absent" stroke="#ef4444" name="Absent" />
            <Line type="monotone" dataKey="late" stroke="#f59e0b" name="Late" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
