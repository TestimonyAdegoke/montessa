"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Send } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

interface MessageFormProps {
  users: Array<{
    id: string
    name: string | null
    email: string
    role: string
  }>
}

const schema = z.object({
  recipientId: z.string().min(1, "Recipient is required"),
  subject: z.string().min(1, "Subject is required"),
  content: z.string().min(1, "Message is required"),
})

type FormValues = z.infer<typeof schema>

export default function MessageForm({ users }: MessageFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { recipientId: "", subject: "", content: "" },
  })

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      try {
        const response = await fetch("/api/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        })

        if (response.ok) {
          toast({ title: "Message sent" })
          router.push("/dashboard/messages")
          router.refresh()
        } else {
          throw new Error("Failed to send message")
        }
      } catch (error) {
        toast({ title: "Error", description: "Failed to send message", variant: "destructive" })
      }
    })
  }

  const getRoleBadgeVariant = (role: string) => {
    const variants: Record<string, any> = {
      SUPER_ADMIN: "destructive",
      TENANT_ADMIN: "default",
      TEACHER: "secondary",
      GUARDIAN: "outline",
      STUDENT: "outline",
    }
    return variants[role] || "outline"
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle>Message Details</CardTitle>
          <CardDescription>Compose your message</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="recipientId">Recipient *</Label>
            <Select name="recipientId" value={form.watch("recipientId")} onValueChange={(v) => form.setValue("recipientId", v, { shouldValidate: true })}>
              <SelectTrigger>
                <SelectValue placeholder="Select recipient" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    <div className="flex items-center gap-2">
                      <span>{user.name || user.email}</span>
                      <Badge variant={getRoleBadgeVariant(user.role)} className="ml-2 text-xs">
                        {user.role.replace("_", " ")}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.recipientId && (<p className="text-sm text-red-500">{form.formState.errors.recipientId.message}</p>)}
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject *</Label>
            <Input id="subject" placeholder="Message subject" {...form.register("subject")} />
            {form.formState.errors.subject && (<p className="text-sm text-red-500">{form.formState.errors.subject.message}</p>)}
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Message *</Label>
            <Textarea id="content" placeholder="Type your message here..." rows={8} {...form.register("content")} />
            {form.formState.errors.content && (<p className="text-sm text-red-500">{form.formState.errors.content.message}</p>)}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4 mt-6">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <Send className="mr-2 h-4 w-4" />
          Send Message
        </Button>
      </div>
    </form>
  )
}
