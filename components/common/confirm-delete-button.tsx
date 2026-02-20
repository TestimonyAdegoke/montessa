"use client"

import { useTransition } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Trash2 } from "lucide-react"

interface ConfirmDeleteButtonProps {
  resourceName: string
  onConfirm: () => Promise<void>
  variant?: "default" | "destructive" | "outline" | "ghost" | "secondary"
  size?: "default" | "sm" | "lg" | "icon"
  children?: React.ReactNode
  className?: string
}

export default function ConfirmDeleteButton({ resourceName, onConfirm, variant = "ghost", size = "sm", children, className }: ConfirmDeleteButtonProps) {
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  const handleClick = () => {
    const ok = window.confirm(`Delete this ${resourceName}? This action cannot be undone.`)
    if (!ok) return
    startTransition(async () => {
      try {
        await onConfirm()
        toast({ title: `${resourceName} deleted` })
      } catch (e: any) {
        toast({ title: "Delete failed", description: e?.message || `Could not delete ${resourceName}`, variant: "destructive" })
      }
    })
  }

  return (
    <Button type="button" variant={variant} size={size} onClick={handleClick} disabled={isPending} className={className}>
      <Trash2 className="mr-2 h-4 w-4" />
      {children || "Delete"}
    </Button>
  )
}
