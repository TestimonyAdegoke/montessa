"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  userId: z.string().min(1, "User is required"),
  employeeId: z.string().min(1, "Employee ID is required"),
  department: z.string().optional(),
  specialization: z.string().optional(),
  qualification: z.string().optional(),
  experience: z.coerce.number().min(0, "Min 0").optional(),
  officePhone: z.string().optional(),
  emergencyContact: z.string().optional(),
  status: z.string().optional(),
  hireDate: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface TeacherFormProps {
  users: Array<{ id: string; name: string | null; email: string | null }>
  teacherData?: any
  mode?: "create" | "edit"
}

export default function TeacherForm({ users, teacherData, mode = "create" }: TeacherFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      userId: teacherData?.userId || "",
      employeeId: teacherData?.employeeId || "",
      department: teacherData?.department || "",
      specialization: teacherData?.specialization || "",
      qualification: teacherData?.qualification || "",
      experience: teacherData?.experience ?? undefined,
      officePhone: teacherData?.officePhone || "",
      emergencyContact: teacherData?.emergencyContact || "",
      status: teacherData?.status || "ACTIVE",
      hireDate: teacherData?.hireDate ? new Date(teacherData.hireDate).toISOString().split("T")[0] : "",
    },
  })

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      try {
        const url = mode === "edit" ? `/api/teachers/${teacherData.id}` : "/api/teachers"
        const method = mode === "edit" ? "PATCH" : "POST"
        const payload = {
          ...values,
          // In edit mode, userId is not changed; server ignores if not allowed
        }
        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
        if (!res.ok) throw new Error("Failed to save teacher")
        toast({ title: `Teacher ${mode === "edit" ? "updated" : "created"}` })
        router.push("/dashboard/teachers")
        router.refresh()
      } catch (err) {
        toast({ title: "Error", description: `Could not ${mode === "edit" ? "update" : "create"} teacher`, variant: "destructive" })
      }
    })
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle>Teacher Profile</CardTitle>
          <CardDescription>Link to an existing user and add professional info</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Existing User *</Label>
              <Select
                name="userId"
                value={form.watch("userId")}
                onValueChange={(v) => form.setValue("userId", v, { shouldValidate: true })}
                disabled={mode === "edit"}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select user" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name || u.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.userId && (<p className="text-sm text-red-500">{form.formState.errors.userId.message}</p>)}
            </div>
            <div className="space-y-2">
              <Label htmlFor="employeeId">Employee ID *</Label>
              <Input id="employeeId" {...form.register("employeeId")} />
              {form.formState.errors.employeeId && (<p className="text-sm text-red-500">{form.formState.errors.employeeId.message}</p>)}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input id="department" placeholder="e.g., Mathematics" {...form.register("department")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="specialization">Specialization</Label>
              <Input id="specialization" placeholder="e.g., Early Childhood" {...form.register("specialization")} />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="qualification">Qualification</Label>
              <Input id="qualification" placeholder="e.g., B.Ed, Montessori Diploma" {...form.register("qualification")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="experience">Experience (years)</Label>
              <Input id="experience" type="number" min="0" {...form.register("experience", { valueAsNumber: true })} />
              {form.formState.errors.experience && (<p className="text-sm text-red-500">{form.formState.errors.experience.message}</p>)}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="officePhone">Office Phone</Label>
              <Input id="officePhone" {...form.register("officePhone")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergencyContact">Emergency Contact</Label>
              <Input id="emergencyContact" {...form.register("emergencyContact")} />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hireDate">Hire Date</Label>
              <Input id="hireDate" type="date" {...form.register("hireDate")} />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select name="status" value={form.watch("status") || ""} onValueChange={(v) => form.setValue("status", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="ON_LEAVE">On Leave</SelectItem>
                  <SelectItem value="SUSPENDED">Suspended</SelectItem>
                  <SelectItem value="TERMINATED">Terminated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4 mt-6">
        <Button type="button" variant="outline" onClick={() => history.back()} disabled={isPending}>Cancel</Button>
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <Save className="mr-2 h-4 w-4" />
          {mode === "edit" ? "Save Changes" : "Create Teacher"}
        </Button>
      </div>
    </form>
  )
}
