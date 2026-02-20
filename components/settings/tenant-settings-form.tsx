"use client"

import { useEffect, useTransition } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

const schema = z.object({
  invoiceTaxRate: z.coerce.number().min(0).max(100),
  workingDays: z.array(z.number().int().min(0).max(6)),
})

type FormValues = z.infer<typeof schema>

const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

export default function TenantSettingsForm() {
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { invoiceTaxRate: 0, workingDays: [1, 2, 3, 4, 5] },
  })

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/tenant/settings")
        if (!res.ok) return
        const data = await res.json()
        form.reset({
          invoiceTaxRate: typeof data.invoiceTaxRate === "number" ? data.invoiceTaxRate : 0,
          workingDays: Array.isArray(data.workingDays) ? data.workingDays : [1, 2, 3, 4, 5],
        })
      } catch {}
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      try {
        const res = await fetch("/api/tenant/settings", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        })
        if (!res.ok) throw new Error("Failed to save settings")
        toast({ title: "Tenant settings saved" })
      } catch (e: any) {
        toast({ title: "Save failed", description: e?.message || "", variant: "destructive" })
      }
    })
  }

  const workingDays = form.watch("workingDays")

  const toggleDay = (dayIdx: number) => {
    const set = new Set(workingDays)
    if (set.has(dayIdx)) set.delete(dayIdx)
    else set.add(dayIdx)
    form.setValue("workingDays", Array.from(set).sort((a, b) => a - b), { shouldValidate: true })
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2 max-w-sm">
        <Label htmlFor="invoiceTaxRate">Default Invoice Tax Rate (%)</Label>
        <Input id="invoiceTaxRate" type="number" min={0} max={100} step={0.1} {...form.register("invoiceTaxRate", { valueAsNumber: true })} />
        {form.formState.errors.invoiceTaxRate && (
          <p className="text-sm text-red-500">{form.formState.errors.invoiceTaxRate.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Working Days</Label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {dayNames.map((name, idx) => (
            <label key={idx} className="flex items-center gap-2 border rounded-md p-2 cursor-pointer">
              <input
                type="checkbox"
                checked={workingDays.includes(idx)}
                onChange={() => toggleDay(idx)}
              />
              <span>{name}</span>
            </label>
          ))}
        </div>
        {form.formState.errors.workingDays && (
          <p className="text-sm text-red-500">Select at least one working day</p>
        )}
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>Save Tenant Settings</Button>
      </div>
    </form>
  )
}
