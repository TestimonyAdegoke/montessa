"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { createApplication } from "@/lib/actions/admissions"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function NewApplicationPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const result = await createApplication(formData)

    if (result.success) {
      toast({ title: "Application created successfully" })
      router.push("/dashboard/admissions")
    } else {
      toast({ title: "Error", description: result.error, variant: "destructive" })
    }
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/admissions">
          <Button variant="outline" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">New Application</h1>
      </div>

      <Card>
        <CardHeader><CardTitle>Application Details</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-semibold">Student Information</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="studentName">Student Name *</Label>
                  <Input id="studentName" name="studentName" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                  <Input id="dateOfBirth" name="dateOfBirth" type="date" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender *</Label>
                  <Select name="gender" required>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MALE">Male</SelectItem>
                      <SelectItem value="FEMALE">Female</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="desiredGrade">Desired Grade</Label>
                  <Input id="desiredGrade" name="desiredGrade" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="previousSchool">Previous School</Label>
                <Input id="previousSchool" name="previousSchool" />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Guardian Information</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="guardianName">Name *</Label>
                  <Input id="guardianName" name="guardianName" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="relationship">Relationship *</Label>
                  <Select name="relationship" required>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MOTHER">Mother</SelectItem>
                      <SelectItem value="FATHER">Father</SelectItem>
                      <SelectItem value="GUARDIAN">Guardian</SelectItem>
                      <SelectItem value="GRANDPARENT">Grandparent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="guardianEmail">Email *</Label>
                  <Input id="guardianEmail" name="guardianEmail" type="email" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="guardianPhone">Phone *</Label>
                  <Input id="guardianPhone" name="guardianPhone" type="tel" required />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Address</h3>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea id="address" name="address" rows={2} />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" name="city" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input id="state" name="state" />
                </div>
              </div>
            </div>

            <Input type="hidden" name="academicYear" value={new Date().getFullYear().toString()} />

            <div className="flex justify-end gap-3">
              <Link href="/dashboard/admissions"><Button variant="outline">Cancel</Button></Link>
              <Button type="submit" disabled={loading}>{loading ? "Creating..." : "Create Application"}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
