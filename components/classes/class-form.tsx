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
import { Loader2, Save } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

const schema = z.object({
  name: z.string().min(2, "Class name is required"),
  grade: z.string().optional(),
  section: z.string().optional(),
  academicYear: z.string().regex(/^\d{4}-\d{4}$/i, "Use format YYYY-YYYY"),
  roomNumber: z.string().optional(),
  capacity: z.coerce.number().min(1, "Capacity must be at least 1"),
  teacherId: z.string().optional(),
  description: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface ClassFormProps {
  classData?: any
  teachers: Array<{ id: string; user: { name: string | null } }>
  mode: "create" | "edit"
}

export default function ClassForm({ classData, teachers, mode }: ClassFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: classData?.name || "",
      grade: classData?.grade || "",
      section: classData?.section || "",
      academicYear: classData?.academicYear || "",
      roomNumber: classData?.roomNumber || "",
      capacity: classData?.capacity ?? 30,
      teacherId: classData?.teacherId || "",
      description: classData?.description || "",
    },
  })

  const handleSubmit = (values: FormValues) => {
    startTransition(async () => {
      try {
        const url = mode === "create" ? "/api/classes" : `/api/classes/${classData.id}`
        const method = mode === "create" ? "POST" : "PATCH"

        const response = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...values,
            status: "ACTIVE",
          }),
        })

        if (response.ok) {
          toast({ title: `Class ${mode === "create" ? "created" : "updated"} successfully` })
          router.push("/dashboard/classes")
          router.refresh()
        } else {
          throw new Error("Failed to save class")
        }
      } catch (error) {
        toast({ title: "Error", description: "Failed to save class", variant: "destructive" })
      }
    })
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle>Class Information</CardTitle>
          <CardDescription>Basic details about the class</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Class Name *</Label>
              <Input id="name" placeholder="e.g., Kindergarten A" {...form.register("name")} />
              {form.formState.errors.name && (<p className="text-sm text-red-500">{form.formState.errors.name.message}</p>)}
            </div>

            <div className="space-y-2">
              <Label htmlFor="grade">Grade</Label>
              <Input id="grade" placeholder="e.g., K, 1, 2" {...form.register("grade")} />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="academicYear">Academic Year *</Label>
              <Input id="academicYear" placeholder="e.g., 2024-2025" {...form.register("academicYear")} />
              {form.formState.errors.academicYear && (<p className="text-sm text-red-500">{form.formState.errors.academicYear.message}</p>)}
            </div>

            <div className="space-y-2">
              <Label htmlFor="section">Section</Label>
              <Input id="section" placeholder="e.g., A, B, C" {...form.register("section")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="roomNumber">Room Number</Label>
              <Input id="roomNumber" placeholder="e.g., Room 101" {...form.register("roomNumber")} />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="capacity">Capacity *</Label>
              <Input id="capacity" type="number" min="1" placeholder="Max students" {...form.register("capacity", { valueAsNumber: true })} />
              {form.formState.errors.capacity && (<p className="text-sm text-red-500">{form.formState.errors.capacity.message}</p>)}
            </div>

            <div className="space-y-2">
              <Label htmlFor="teacherId">Assign Teacher</Label>
              <Select name="teacherId" value={form.watch("teacherId") as string} onValueChange={(v) => form.setValue("teacherId", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select teacher" />
                </SelectTrigger>
                <SelectContent>
                  {teachers.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      {teacher.user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" placeholder="Additional notes about this class" rows={3} {...form.register("description")} />
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
          <Save className="mr-2 h-4 w-4" />
          {mode === "create" ? "Create Class" : "Save Changes"}
        </Button>
      </div>
    </form>
  )
}
