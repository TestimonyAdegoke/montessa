"use client"

import { cn } from "@/lib/utils"

interface SparklineProps {
  data: number[]
  width?: number
  height?: number
  color?: string
  fillColor?: string
  className?: string
  showDot?: boolean
  label?: string
  trend?: "up" | "down" | "flat"
}

export function Sparkline({
  data,
  width = 120,
  height = 32,
  color = "currentColor",
  fillColor,
  className,
  showDot = true,
  label,
  trend,
}: SparklineProps) {
  if (!data || data.length < 2) return null

  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const padding = 2

  const points = data.map((val, i) => {
    const x = padding + (i / (data.length - 1)) * (width - padding * 2)
    const y = height - padding - ((val - min) / range) * (height - padding * 2)
    return `${x},${y}`
  })

  const pathD = `M ${points.join(" L ")}`
  const lastPoint = points[points.length - 1].split(",")

  const fillPoints = [...points, `${width - padding},${height - padding}`, `${padding},${height - padding}`]
  const fillD = `M ${fillPoints.join(" L ")} Z`

  return (
    <div className={cn("inline-flex flex-col items-end gap-0.5", className)}>
      {label && <span className="text-[10px] text-muted-foreground">{label}</span>}
      <svg width={width} height={height} className="overflow-visible">
        {fillColor && (
          <path d={fillD} fill={fillColor} opacity={0.15} />
        )}
        <path d={pathD} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
        {showDot && (
          <circle cx={lastPoint[0]} cy={lastPoint[1]} r={2.5} fill={color} />
        )}
      </svg>
      {trend && (
        <span className={cn(
          "text-[10px] font-medium",
          trend === "up" && "text-green-600",
          trend === "down" && "text-red-500",
          trend === "flat" && "text-muted-foreground"
        )}>
          {trend === "up" ? "↑" : trend === "down" ? "↓" : "→"}
        </span>
      )}
    </div>
  )
}

interface KPICardProps {
  title: string
  value: string | number
  change?: number
  sparkData?: number[]
  icon?: React.ReactNode
  className?: string
}

export function KPICard({ title, value, change, sparkData, icon, className }: KPICardProps) {
  const trend = change !== undefined ? (change > 0 ? "up" : change < 0 ? "down" : "flat") : undefined
  const trendColor = trend === "up" ? "#16a34a" : trend === "down" ? "#ef4444" : "#6b7280"

  return (
    <div className={cn("rounded-lg border bg-card p-4 space-y-2", className)}>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{title}</p>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </div>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-2xl font-bold">{value}</p>
          {change !== undefined && (
            <p className={cn(
              "text-xs font-medium",
              change > 0 && "text-green-600",
              change < 0 && "text-red-500",
              change === 0 && "text-muted-foreground"
            )}>
              {change > 0 ? "+" : ""}{change}% vs last period
            </p>
          )}
        </div>
        {sparkData && sparkData.length > 1 && (
          <Sparkline data={sparkData} color={trendColor} fillColor={trendColor} trend={trend} />
        )}
      </div>
    </div>
  )
}
