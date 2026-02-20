// Application Constants

export const APP_NAME = "OnebitMS"
export const APP_DESCRIPTION = "Multi-tenant School Management System"

// User Roles
export const USER_ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  TENANT_ADMIN: "TENANT_ADMIN",
  TEACHER: "TEACHER",
  GUARDIAN: "GUARDIAN",
  STUDENT: "STUDENT",
} as const

// Student Status
export const STUDENT_STATUS = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  GRADUATED: "GRADUATED",
  TRANSFERRED: "TRANSFERRED",
  EXPELLED: "EXPELLED",
} as const

// Attendance Status
export const ATTENDANCE_STATUS = {
  PRESENT: "PRESENT",
  ABSENT: "ABSENT",
  LATE: "LATE",
  HALF_DAY: "HALF_DAY",
  EXCUSED: "EXCUSED",
} as const

// Assessment Types
export const ASSESSMENT_TYPES = {
  QUIZ: "QUIZ",
  TEST: "TEST",
  EXAM: "EXAM",
  ASSIGNMENT: "ASSIGNMENT",
  PROJECT: "PROJECT",
  PRACTICAL: "PRACTICAL",
} as const

// Billing Types
export const BILLING_TYPES = {
  TUITION: "TUITION",
  REGISTRATION: "REGISTRATION",
  MATERIALS: "MATERIALS",
  TRANSPORT: "TRANSPORT",
  MEAL: "MEAL",
  EXTRACURRICULAR: "EXTRACURRICULAR",
  LATE_FEE: "LATE_FEE",
  OTHER: "OTHER",
} as const

// Activity Categories (Montessori)
export const ACTIVITY_CATEGORIES = {
  PRACTICAL_LIFE: "PRACTICAL_LIFE",
  SENSORIAL: "SENSORIAL",
  LANGUAGE: "LANGUAGE",
  MATHEMATICS: "MATHEMATICS",
  CULTURAL: "CULTURAL",
  CREATIVE_ARTS: "CREATIVE_ARTS",
  PHYSICAL_EDUCATION: "PHYSICAL_EDUCATION",
} as const

// Sensor Types (Montessori)
export const SENSOR_TYPES = {
  VISUAL: "VISUAL",
  AUDITORY: "AUDITORY",
  TACTILE: "TACTILE",
  KINESTHETIC: "KINESTHETIC",
  OLFACTORY: "OLFACTORY",
  GUSTATORY: "GUSTATORY",
} as const

// Announcement Priorities
export const ANNOUNCEMENT_PRIORITIES = {
  LOW: "LOW",
  NORMAL: "NORMAL",
  HIGH: "HIGH",
  URGENT: "URGENT",
} as const

// Pagination
export const DEFAULT_PAGE_SIZE = 20
export const MAX_PAGE_SIZE = 100

// Date Formats
export const DATE_FORMAT = "MM/DD/YYYY"
export const DATETIME_FORMAT = "MM/DD/YYYY HH:mm"
export const TIME_FORMAT = "HH:mm"

// File Upload Limits
export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"]
export const ALLOWED_DOCUMENT_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]

// Grading Scale
export const GRADING_SCALE = {
  "A+": { min: 90, max: 100 },
  "A": { min: 80, max: 89 },
  "B": { min: 70, max: 79 },
  "C": { min: 60, max: 69 },
  "D": { min: 50, max: 59 },
  "F": { min: 0, max: 49 },
} as const

// Tenant Plans
export const TENANT_PLANS = {
  FREE: {
    name: "Free",
    maxUsers: 50,
    maxStorage: 5 * 1024 * 1024 * 1024, // 5GB
    features: ["Basic student management", "Attendance tracking", "Class management"],
  },
  BASIC: {
    name: "Basic",
    maxUsers: 200,
    maxStorage: 50 * 1024 * 1024 * 1024, // 50GB
    features: [
      "All Free features",
      "Learning plans",
      "Assessments",
      "Billing",
      "Email support",
    ],
  },
  PREMIUM: {
    name: "Premium",
    maxUsers: 500,
    maxStorage: 100 * 1024 * 1024 * 1024, // 100GB
    features: [
      "All Basic features",
      "Analytics dashboard",
      "Custom reports",
      "API access",
      "Priority support",
    ],
  },
  ENTERPRISE: {
    name: "Enterprise",
    maxUsers: -1, // Unlimited
    maxStorage: -1, // Unlimited
    features: [
      "All Premium features",
      "Custom integrations",
      "Dedicated support",
      "SLA guarantee",
      "Custom branding",
    ],
  },
} as const
