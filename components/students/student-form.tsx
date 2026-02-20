"use client"

import { useState, useTransition } from "react"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { createStudent, updateStudent } from "@/lib/actions/students"
import { Loader2, Save, X } from "lucide-react"

interface StudentFormProps {
  student?: any
  classes: { id: string; name: string; grade: string | null }[]
  mode: "create" | "edit"
}

export default function StudentForm({ student, classes, mode }: StudentFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()
  const [allergies, setAllergies] = useState<string[]>(student?.allergies || [])
  const [medicalConditions, setMedicalConditions] = useState<string[]>(student?.medicalConditions || [])
  const [medications, setMedications] = useState<string[]>(student?.medications || [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    const formData = new FormData(e.currentTarget)
    formData.set("allergies", JSON.stringify(allergies))
    formData.set("medicalConditions", JSON.stringify(medicalConditions))
    formData.set("medications", JSON.stringify(medications))

    startTransition(async () => {
      const result = mode === "create"
        ? await createStudent(formData)
        : await updateStudent(student.id, formData)

      if (result.success) {
        toast({
          title: "Success",
          description: `Student ${mode === "create" ? "created" : "updated"} successfully`,
        })
        router.push("/dashboard/students")
        router.refresh()
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      }
    })
  }

  const addItem = (items: string[], setItems: (items: string[]) => void, value: string) => {
    if (value.trim()) {
      setItems([...items, value.trim()])
    }
  }

  const removeItem = (items: string[], setItems: (items: string[]) => void, index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">
            {mode === "create" ? "Add New Student" : "Edit Student"}
          </h1>
          <p className="text-muted-foreground">
            {mode === "create" ? "Create a new student profile" : "Update student information"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isPending}
          >
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Student
              </>
            )}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList>
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="contact">Contact & Address</TabsTrigger>
          <TabsTrigger value="medical">Medical Info</TabsTrigger>
          <TabsTrigger value="academic">Academic</TabsTrigger>
        </TabsList>

        <TabsContent value="basic">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Essential student details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="legalName">Legal Name *</Label>
                  <Input
                    id="legalName"
                    name="legalName"
                    defaultValue={student?.legalName}
                    required
                    placeholder="John Doe"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="preferredName">Preferred Name</Label>
                  <Input
                    id="preferredName"
                    name="preferredName"
                    defaultValue={student?.preferredName || ""}
                    placeholder="Johnny"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                  <Input
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    defaultValue={student?.dateOfBirth ? new Date(student.dateOfBirth).toISOString().split('T')[0] : ""}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Gender *</Label>
                  <Select name="gender" defaultValue={student?.gender} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MALE">Male</SelectItem>
                      <SelectItem value="FEMALE">Female</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                      <SelectItem value="PREFER_NOT_TO_SAY">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admissionNumber">Admission Number *</Label>
                  <Input
                    id="admissionNumber"
                    name="admissionNumber"
                    defaultValue={student?.admissionNumber || `ADM${new Date().getFullYear()}${String(Math.floor(Math.random() * 10000)).padStart(4, "0")}`}
                    required
                    placeholder="ADM20250001"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    defaultValue={student?.user?.email || ""}
                    placeholder="student@school.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    defaultValue={student?.user?.phone || ""}
                    placeholder="+1234567890"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact">
          <Card>
            <CardHeader>
              <CardTitle>Contact & Address</CardTitle>
              <CardDescription>Student and emergency contact information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address">Street Address</Label>
                <Input
                  id="address"
                  name="address"
                  defaultValue={student?.address || ""}
                  placeholder="123 Main Street"
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    name="city"
                    defaultValue={student?.city || ""}
                    placeholder="New York"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    name="state"
                    defaultValue={student?.state || ""}
                    placeholder="NY"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="zipCode">ZIP Code</Label>
                  <Input
                    id="zipCode"
                    name="zipCode"
                    defaultValue={student?.zipCode || ""}
                    placeholder="10001"
                  />
                </div>
              </div>

              <div className="border-t pt-4 mt-4">
                <h3 className="font-semibold mb-4">Emergency Contact</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="emergencyContact">Contact Name</Label>
                    <Input
                      id="emergencyContact"
                      name="emergencyContact"
                      defaultValue={student?.emergencyContact || ""}
                      placeholder="Jane Doe"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emergencyPhone">Contact Phone</Label>
                    <Input
                      id="emergencyPhone"
                      name="emergencyPhone"
                      type="tel"
                      defaultValue={student?.emergencyPhone || ""}
                      placeholder="+1234567890"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="medical">
          <Card>
            <CardHeader>
              <CardTitle>Medical Information</CardTitle>
              <CardDescription>Health records and medical details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bloodGroup">Blood Group</Label>
                  <Select name="bloodGroup" defaultValue={student?.bloodGroup}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select blood group" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A+">A+</SelectItem>
                      <SelectItem value="A-">A-</SelectItem>
                      <SelectItem value="B+">B+</SelectItem>
                      <SelectItem value="B-">B-</SelectItem>
                      <SelectItem value="AB+">AB+</SelectItem>
                      <SelectItem value="AB-">AB-</SelectItem>
                      <SelectItem value="O+">O+</SelectItem>
                      <SelectItem value="O-">O-</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Allergies</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    id="allergyInput"
                    placeholder="Add allergy and press Enter"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        addItem(allergies, setAllergies, e.currentTarget.value)
                        e.currentTarget.value = ""
                      }
                    }}
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {allergies.map((allergy, index) => (
                    <div key={index} className="bg-orange-100 dark:bg-orange-900/20 px-3 py-1 rounded-full flex items-center gap-2">
                      <span className="text-sm">{allergy}</span>
                      <button
                        type="button"
                        onClick={() => removeItem(allergies, setAllergies, index)}
                        className="text-orange-600 hover:text-orange-800"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Medical Conditions</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    id="conditionInput"
                    placeholder="Add condition and press Enter"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        addItem(medicalConditions, setMedicalConditions, e.currentTarget.value)
                        e.currentTarget.value = ""
                      }
                    }}
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {medicalConditions.map((condition, index) => (
                    <div key={index} className="bg-red-100 dark:bg-red-900/20 px-3 py-1 rounded-full flex items-center gap-2">
                      <span className="text-sm">{condition}</span>
                      <button
                        type="button"
                        onClick={() => removeItem(medicalConditions, setMedicalConditions, index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Current Medications</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    id="medicationInput"
                    placeholder="Add medication and press Enter"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        addItem(medications, setMedications, e.currentTarget.value)
                        e.currentTarget.value = ""
                      }
                    }}
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {medications.map((medication, index) => (
                    <div key={index} className="bg-blue-100 dark:bg-blue-900/20 px-3 py-1 rounded-full flex items-center gap-2">
                      <span className="text-sm">{medication}</span>
                      <button
                        type="button"
                        onClick={() => removeItem(medications, setMedications, index)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4 mt-4">
                <h3 className="font-semibold mb-4">Doctor Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="doctorName">Doctor&apos;s Name</Label>
                    <Input
                      id="doctorName"
                      name="doctorName"
                      defaultValue={student?.doctorName || ""}
                      placeholder="Dr. Smith"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="doctorPhone">Doctor&apos;s Phone</Label>
                    <Input
                      id="doctorPhone"
                      name="doctorPhone"
                      type="tel"
                      defaultValue={student?.doctorPhone || ""}
                      placeholder="+1234567890"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="academic">
          <Card>
            <CardHeader>
              <CardTitle>Academic Information</CardTitle>
              <CardDescription>Class assignment and notes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentClassId">Assign to Class</Label>
                <Select name="currentClassId" defaultValue={student?.currentClassId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name} {cls.grade && `(Grade ${cls.grade})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  defaultValue={student?.notes || ""}
                  placeholder="Any additional information about the student..."
                  rows={6}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </form>
  )
}
