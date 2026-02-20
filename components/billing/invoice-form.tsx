"use client"

import { useState, useTransition, useEffect } from "react"
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
import { Loader2, Save, Plus, Trash2 } from "lucide-react"
import { useForm, useFieldArray } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

const itemSchema = z.object({
  description: z.string().min(1, "Description is required"),
  quantity: z.coerce.number().min(1, "Min 1"),
  unitPrice: z.coerce.number().min(0, "Min 0"),
})

const schema = z.object({
  studentId: z.string().min(1, "Student is required"),
  dueDate: z.string().min(1, "Due date is required"),
  description: z.string().optional(),
  items: z.array(itemSchema).min(1, "At least one item"),
})

type FormValues = z.infer<typeof schema>

interface InvoiceFormProps {
  invoiceData?: any
  students: Array<{
    id: string
    legalName: string
    user: { name: string | null; email: string | null }
    currentClass: { name: string } | null
  }>
  mode: "create" | "edit"
}

export default function InvoiceForm({ invoiceData, students, mode }: InvoiceFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      studentId: invoiceData?.studentId || "",
      dueDate: invoiceData?.dueDate ? new Date(invoiceData.dueDate).toISOString().split("T")[0] : "",
      description: invoiceData?.description || "",
      items: invoiceData?.items || [{ description: "", quantity: 1, unitPrice: 0 }],
    },
  })

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "items" })

  const total = form.watch("items").reduce((sum, i) => sum + (Number(i.quantity) || 0) * (Number(i.unitPrice) || 0), 0)

  const handleSubmit = (values: FormValues) => {
    startTransition(async () => {
      try {
        const url = mode === "edit" ? `/api/invoices/${invoiceData.id}` : "/api/invoices"
        const method = mode === "edit" ? "PATCH" : "POST"
        const response = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            studentId: values.studentId,
            dueDate: values.dueDate,
            description: values.description,
            items: values.items,
            subtotal: total,
            taxAmount: 0,
            discount: 0,
            totalAmount: total,
            status: mode === "edit" ? invoiceData.status : "PENDING",
          }),
        })

        if (response.ok) {
          toast({ title: `Invoice ${mode === "edit" ? "updated" : "created"}` })
          router.push("/dashboard/billing")
          router.refresh()
        } else {
          throw new Error("Failed to save invoice")
        }
      } catch (error) {
        toast({ title: "Error", description: `Failed to ${mode === "edit" ? "update" : "create"} invoice`, variant: "destructive" })
      }
    })
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)}>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Invoice Details</CardTitle>
            <CardDescription>Basic invoice information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="studentId">Student *</Label>
                <Select name="studentId" value={form.watch("studentId")} onValueChange={(v) => form.setValue("studentId", v, { shouldValidate: true })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.legalName} ({student.currentClass?.name || "No class"})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.studentId && (<p className="text-sm text-red-500">{form.formState.errors.studentId.message}</p>)}
              </div>

              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date *</Label>
                <Input id="dueDate" type="date" {...form.register("dueDate")} />
                {form.formState.errors.dueDate && (<p className="text-sm text-red-500">{form.formState.errors.dueDate.message}</p>)}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" placeholder="Invoice description or notes" rows={2} {...form.register("description")} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Line Items</CardTitle>
                <CardDescription>Add items to this invoice</CardDescription>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={() => append({ description: "", quantity: 1, unitPrice: 0 })}>
                <Plus className="mr-2 h-4 w-4" />
                Add Item
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={index} className="flex gap-4 items-start">
                  <div className="flex-1 grid md:grid-cols-3 gap-4">
                    <div className="md:col-span-1 space-y-2">
                      <Label>Description</Label>
                      <Input placeholder="Item description" {...form.register(`items.${index}.description` as const)} />
                      {form.formState.errors.items?.[index]?.description && (
                        <p className="text-sm text-red-500">{form.formState.errors.items[index]?.description?.message as string}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Quantity</Label>
                      <Input type="number" min="1" {...form.register(`items.${index}.quantity` as const, { valueAsNumber: true })} />
                      {form.formState.errors.items?.[index]?.quantity && (
                        <p className="text-sm text-red-500">{form.formState.errors.items[index]?.quantity?.message as string}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Unit Price</Label>
                      <Input type="number" step="0.01" min="0" {...form.register(`items.${index}.unitPrice` as const, { valueAsNumber: true })} />
                      {form.formState.errors.items?.[index]?.unitPrice && (
                        <p className="text-sm text-red-500">{form.formState.errors.items[index]?.unitPrice?.message as string}</p>
                      )}
                    </div>
                  </div>
                  <div className="pt-8">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(index)}
                      disabled={fields.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}

              <div className="pt-4 border-t">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total Amount:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end gap-4 mt-6">
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={isPending}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <Save className="mr-2 h-4 w-4" />
          {mode === "create" ? "Create Invoice" : "Save Changes"}
        </Button>
      </div>
    </form>
  )
}
