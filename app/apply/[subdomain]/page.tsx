"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { GraduationCap, CheckCircle } from "lucide-react"

export default function PublicApplicationPage({ params }: { params: { subdomain: string } }) {
  const [submitted, setSubmitted] = useState(false)
  const [applicationId, setApplicationId] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      subdomain: params.subdomain,
      studentName: formData.get("studentName") as string,
      dateOfBirth: formData.get("dateOfBirth") as string,
      gender: formData.get("gender") as string,
      guardianName: formData.get("guardianName") as string,
      guardianEmail: formData.get("guardianEmail") as string,
      guardianPhone: formData.get("guardianPhone") as string,
      relationship: formData.get("relationship") as string,
      address: formData.get("address") as string,
      city: formData.get("city") as string,
      state: formData.get("state") as string,
      previousSchool: formData.get("previousSchool") as string,
      desiredGrade: formData.get("desiredGrade") as string,
      academicYear: new Date().getFullYear().toString(),
    }

    try {
      const res = await fetch("/api/applications/public", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result = await res.json()
      if (!res.ok) throw new Error(result.error || "Failed to submit")

      setApplicationId(result.id)
      setSubmitted(true)
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-8 pb-8 space-y-4">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            <h2 className="text-2xl font-bold">Application Submitted!</h2>
            <p className="text-muted-foreground">
              Your application has been received. Your application ID is:
            </p>
            <p className="font-mono text-lg font-bold bg-muted p-3 rounded-md">{applicationId}</p>
            <p className="text-sm text-muted-foreground">
              Please save this ID for your records. You will receive an email confirmation shortly.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <GraduationCap className="h-12 w-12 mx-auto text-primary" />
          <h1 className="text-3xl font-bold">Student Application</h1>
          <p className="text-muted-foreground">Complete the form below to apply for admission</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Application Form</CardTitle>
            <CardDescription>All fields marked with * are required</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Student Information</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="studentName">Full Name *</Label>
                    <Input id="studentName" name="studentName" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                    <Input id="dateOfBirth" name="dateOfBirth" type="date" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender *</Label>
                    <Select name="gender" required>
                      <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MALE">Male</SelectItem>
                        <SelectItem value="FEMALE">Female</SelectItem>
                        <SelectItem value="OTHER">Other</SelectItem>
                        <SelectItem value="PREFER_NOT_TO_SAY">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="desiredGrade">Desired Grade/Class</Label>
                    <Input id="desiredGrade" name="desiredGrade" placeholder="e.g., Grade 1" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="previousSchool">Previous School</Label>
                  <Input id="previousSchool" name="previousSchool" />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Guardian Information</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="guardianName">Guardian Name *</Label>
                    <Input id="guardianName" name="guardianName" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="relationship">Relationship *</Label>
                    <Select name="relationship" required>
                      <SelectTrigger><SelectValue placeholder="Select relationship" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MOTHER">Mother</SelectItem>
                        <SelectItem value="FATHER">Father</SelectItem>
                        <SelectItem value="GUARDIAN">Guardian</SelectItem>
                        <SelectItem value="GRANDPARENT">Grandparent</SelectItem>
                        <SelectItem value="OTHER">Other</SelectItem>
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
                <h3 className="font-semibold text-lg">Address</h3>
                <div className="space-y-2">
                  <Label htmlFor="address">Street Address</Label>
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

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Submitting..." : "Submit Application"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
