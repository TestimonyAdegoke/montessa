import * as z from "zod"

export const studentSchema = z.object({
  legalName: z.string().min(2, "Legal name must be at least 2 characters"),
  preferredName: z.string().optional(),
  dateOfBirth: z.date(),
  gender: z.enum(["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"]),
  admissionNumber: z.string().min(1, "Admission number is required"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  emergencyContact: z.string().optional(),
  emergencyPhone: z.string().optional(),
  bloodGroup: z.string().optional(),
  allergies: z.array(z.string()).default([]),
  medicalConditions: z.array(z.string()).default([]),
  medications: z.array(z.string()).default([]),
  doctorName: z.string().optional(),
  doctorPhone: z.string().optional(),
  currentClassId: z.string().optional(),
  notes: z.string().optional(),
})

export const guardianSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  relationship: z.enum(["MOTHER", "FATHER", "GUARDIAN", "GRANDPARENT", "SIBLING", "OTHER"]),
  occupation: z.string().optional(),
  employer: z.string().optional(),
  workPhone: z.string().optional(),
  address: z.string().optional(),
  isPrimary: z.boolean().default(false),
  canPickup: z.boolean().default(true),
})

export const learningPlanSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().optional(),
  startDate: z.date(),
  endDate: z.date().optional(),
  objectives: z.array(z.object({
    title: z.string(),
    description: z.string().optional(),
    targetDate: z.date().optional(),
  })),
})

export const observationSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  activityId: z.string().optional(),
  photos: z.array(z.string()).default([]),
  videos: z.array(z.string()).default([]),
  observedAt: z.date().default(() => new Date()),
})

export type StudentInput = z.infer<typeof studentSchema>
export type GuardianInput = z.infer<typeof guardianSchema>
export type LearningPlanInput = z.infer<typeof learningPlanSchema>
export type ObservationInput = z.infer<typeof observationSchema>
