import { PageHeaderSkeleton, TableSkeleton } from "@/components/ui/dashboard-skeleton"

export default function StudentsLoading() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton />
      <TableSkeleton rows={8} cols={5} />
    </div>
  )
}
