"use client"

import { useState, useTransition } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

interface ProfileFormProps {
  initialName: string | null | undefined
  initialEmail: string | null | undefined
  initialPhone?: string | null
}

export default function ProfileForm({ initialName, initialEmail, initialPhone }: ProfileFormProps) {
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()
  const [name, setName] = useState(initialName || "")
  const [phone, setPhone] = useState(initialPhone || "")

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    startTransition(async () => {
      try {
        const res = await fetch("/api/profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, phone }),
        })
        if (!res.ok) throw new Error("Failed")
        toast({ title: "Profile updated" })
      } catch (e) {
        toast({ title: "Update failed", variant: "destructive" })
      }
    })
  }

  return (
    <form onSubmit={onSubmit}>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={initialEmail || ""} disabled />
        </div>
      </div>
      <div className="space-y-2 mt-4">
        <Label htmlFor="phone">Phone Number</Label>
        <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
      </div>
      <div className="flex justify-end mt-4">
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </div>
    </form>
  )
}
