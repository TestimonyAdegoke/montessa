"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Save } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

const schema = z.object({
  classId: z.string().min(1, "Class is required"),
  teacherId: z.string().optional().or(z.literal("")),
  subject: z.string().min(1, "Subject is required"),
  dayOfWeek: z.coerce.number().min(0).max(6),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  roomId: z.string().optional().or(z.literal("")),
  effectiveFrom: z.string().optional(),
  effectiveTo: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface ScheduleFormProps {
  classes: Array<{ id: string; name: string }>
  teachers: Array<{ id: string; user: { name: string | null } }>
  rooms: Array<{ id: string; name: string; building: string | null }>
  scheduleData?: any
  mode?: "create" | "edit"
}

const days = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
]

export default function ScheduleForm({ classes, teachers, rooms, scheduleData, mode = "create" }: ScheduleFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      classId: scheduleData?.classId || "",
      teacherId: scheduleData?.teacherId || "",
      subject: scheduleData?.subject || "",
      dayOfWeek: scheduleData?.dayOfWeek ?? undefined,
      startTime: scheduleData?.startTime || "",
      endTime: scheduleData?.endTime || "",
      roomId: scheduleData?.roomId || "",
      effectiveFrom: scheduleData?.effectiveFrom ? new Date(scheduleData.effectiveFrom).toISOString().split("T")[0] : "",
      effectiveTo: scheduleData?.effectiveTo ? new Date(scheduleData.effectiveTo).toISOString().split("T")[0] : "",
    },
  })

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      try {
        const url = mode === "edit" ? `/api/schedule/${scheduleData.id}` : "/api/schedule"
        const method = mode === "edit" ? "PATCH" : "POST"
        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...values,
            teacherId: values.teacherId || undefined,
            roomId: values.roomId || undefined,
            effectiveFrom: values.effectiveFrom || undefined,
            effectiveTo: values.effectiveTo || undefined,
          }),
        })
        if (!res.ok) throw new Error("Failed to save schedule")
        toast({ title: `Schedule ${mode === "edit" ? "updated" : "created"}` })
        router.push("/dashboard/schedule")
        router.refresh()
      } catch (err) {
        toast({ title: "Error", description: `Could not ${mode === "edit" ? "update" : "create"} schedule`, variant: "destructive" })
      }
    })
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle>Schedule Details</CardTitle>
          <CardDescription>Set up time, subject and room</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Class *</Label>
              <Select name="classId" value={form.watch("classId")} onValueChange={(v) => form.setValue("classId", v, { shouldValidate: true })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.classId && (<p className="text-sm text-red-500">{form.formState.errors.classId.message}</p>)}
            </div>
            <div className="space-y-2">
              <Label>Teacher</Label>
              <Select name="teacherId" value={form.watch("teacherId") as string} onValueChange={(v) => form.setValue("teacherId", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Optional" />
                </SelectTrigger>
                <SelectContent>
                  {teachers.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.user.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Subject *</Label>
              <Input {...form.register("subject")} placeholder="e.g., Mathematics" />
              {form.formState.errors.subject && (<p className="text-sm text-red-500">{form.formState.errors.subject.message}</p>)}
            </div>
            <div className="space-y-2">
              <Label>Day of Week *</Label>
              <Select name="dayOfWeek" value={String(form.watch("dayOfWeek") ?? "")} onValueChange={(v) => form.setValue("dayOfWeek", Number(v), { shouldValidate: true })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select day" />
                </SelectTrigger>
                <SelectContent>
                  {days.map((d) => (
                    <SelectItem key={d.value} value={String(d.value)}>{d.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.dayOfWeek && (<p className="text-sm text-red-500">{form.formState.errors.dayOfWeek.message}</p>)}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Time *</Label>
              <Input type="time" {...form.register("startTime")} />
              {form.formState.errors.startTime && (<p className="text-sm text-red-500">{form.formState.errors.startTime.message}</p>)}
            </div>
            <div className="space-y-2">
              <Label>End Time *</Label>
              <Input type="time" {...form.register("endTime")} />
              {form.formState.errors.endTime && (<p className="text-sm text-red-500">{form.formState.errors.endTime.message}</p>)}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Room</Label>
              <Select name="roomId" value={form.watch("roomId") as string} onValueChange={(v) => form.setValue("roomId", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Optional" />
                </SelectTrigger>
                <SelectContent>
                  {rooms.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.name}{r.building ? ` - ${r.building}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Effective From</Label>
                <Input type="date" {...form.register("effectiveFrom")} />
              </div>
              <div className="space-y-2">
                <Label>Effective To</Label>
                <Input type="date" {...form.register("effectiveTo")} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4 mt-6">
        <Button type="button" variant="outline" onClick={() => history.back()} disabled={isPending}>Cancel</Button>
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <Save className="mr-2 h-4 w-4" />
          Save Schedule
        </Button>
      </div>
    </form>
  )
}
