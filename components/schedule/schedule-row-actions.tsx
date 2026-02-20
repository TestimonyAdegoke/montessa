"use client"

import { useRouter } from "next/navigation"
import { useTransition } from "react"
import ConfirmDeleteButton from "@/components/common/confirm-delete-button"

export default function ScheduleRowActions({ id }: { id: string }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  return (
    <div className="flex items-center gap-2">
      <ConfirmDeleteButton
        resourceName="schedule"
        onConfirm={async () => {
          const res = await fetch(`/api/schedule/${id}`, { method: "DELETE" })
          if (!res.ok) throw new Error("Failed to delete schedule")
          startTransition(() => router.refresh())
        }}
        variant="ghost"
        size="sm"
      />
    </div>
  )
}
