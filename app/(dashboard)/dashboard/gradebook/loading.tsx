import { PageHeaderSkeleton, StatsCardsSkeleton, TableSkeleton } from "@/components/ui/dashboard-skeleton"

export default function GradebookLoading() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton />
      <StatsCardsSkeleton />
      <TableSkeleton rows={6} cols={6} />
    </div>
  )
}
