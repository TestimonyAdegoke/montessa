// ─────────────────────────────────────────────────────────
// Form Builder — Seed 25+ Templates
// ─────────────────────────────────────────────────────────

import { prisma } from "../prisma"

interface TemplateInput {
  name: string
  slug: string
  description: string
  category: string
  subcategory?: string
  icon?: string
  tags: string[]
  formSchema: {
    fields: any[]
    logicRules?: any[]
    settings: any
  }
}

const TEMPLATES: TemplateInput[] = [
  // ── Admissions ────────────────────────────────────────
  {
    name: "Student Application Form",
    slug: "student-application",
    description: "Comprehensive student enrollment application with personal info, academic history, and parent details",
    category: "admissions",
    subcategory: "enrollment",
    icon: "GraduationCap",
    tags: ["enrollment", "application", "student"],
    formSchema: {
      fields: [
        { name: "heading_personal", label: "Personal Information", type: "HEADING", step: 1, sortOrder: 0 },
        { name: "first_name", label: "First Name", type: "SHORT_TEXT", isRequired: true, width: "half", step: 1, sortOrder: 1, placeholder: "Enter first name" },
        { name: "last_name", label: "Last Name", type: "SHORT_TEXT", isRequired: true, width: "half", step: 1, sortOrder: 2, placeholder: "Enter last name" },
        { name: "date_of_birth", label: "Date of Birth", type: "DATE", isRequired: true, width: "half", step: 1, sortOrder: 3 },
        { name: "gender", label: "Gender", type: "RADIO", isRequired: true, width: "half", step: 1, sortOrder: 4, options: [{ label: "Male", value: "male" }, { label: "Female", value: "female" }] },
        { name: "address", label: "Home Address", type: "ADDRESS", isRequired: true, step: 1, sortOrder: 5 },
        { name: "heading_academic", label: "Academic Information", type: "HEADING", step: 2, sortOrder: 0 },
        { name: "previous_school", label: "Previous School", type: "SHORT_TEXT", step: 2, sortOrder: 1, placeholder: "Name of previous school" },
        { name: "grade_applying", label: "Grade Applying For", type: "DROPDOWN", isRequired: true, step: 2, sortOrder: 2, options: [{ label: "Kindergarten", value: "K" }, { label: "Grade 1", value: "1" }, { label: "Grade 2", value: "2" }, { label: "Grade 3", value: "3" }, { label: "Grade 4", value: "4" }, { label: "Grade 5", value: "5" }, { label: "Grade 6", value: "6" }] },
        { name: "special_needs", label: "Special Learning Needs", type: "LONG_TEXT", step: 2, sortOrder: 3, placeholder: "Describe any special needs or accommodations" },
        { name: "heading_parent", label: "Parent/Guardian Information", type: "HEADING", step: 3, sortOrder: 0 },
        { name: "parent_name", label: "Parent/Guardian Name", type: "SHORT_TEXT", isRequired: true, step: 3, sortOrder: 1 },
        { name: "parent_email", label: "Email", type: "EMAIL", isRequired: true, width: "half", step: 3, sortOrder: 2 },
        { name: "parent_phone", label: "Phone", type: "PHONE", isRequired: true, width: "half", step: 3, sortOrder: 3 },
        { name: "emergency_contact", label: "Emergency Contact", type: "EMERGENCY_CONTACT", isRequired: true, step: 3, sortOrder: 4 },
        { name: "consent", label: "Data Processing Consent", type: "CONSENT_AGREEMENT", isRequired: true, step: 3, sortOrder: 5, options: { consentText: "I consent to the processing of my child's personal data for enrollment purposes." } },
      ],
      settings: { isMultiStep: true, stepLabels: ["Personal Info", "Academic Info", "Parent Info"], submissionMode: "PUBLIC_LINK", requiresApproval: true, approvalChain: [{ step: 1, role: "TENANT_ADMIN", label: "Admissions Office" }], successMessage: "Thank you! Your application has been received. We will contact you within 5 business days.", category: "admissions" },
    },
  },
  {
    name: "Entrance Screening Form",
    slug: "entrance-screening",
    description: "Assessment form for entrance screening and evaluation",
    category: "admissions",
    subcategory: "screening",
    icon: "ClipboardCheck",
    tags: ["screening", "assessment", "entrance"],
    formSchema: {
      fields: [
        { name: "student_name", label: "Student Name", type: "SHORT_TEXT", isRequired: true, sortOrder: 0 },
        { name: "assessment_date", label: "Assessment Date", type: "DATE", isRequired: true, width: "half", sortOrder: 1 },
        { name: "assessor", label: "Assessor", type: "STAFF_SELECTOR", isRequired: true, width: "half", sortOrder: 2 },
        { name: "rubric", label: "Assessment Rubric", type: "ASSESSMENT_RUBRIC", isRequired: true, sortOrder: 3, options: { criteria: [{ name: "Reading Readiness", levels: ["Advanced", "Proficient", "Developing", "Beginning"] }, { name: "Math Readiness", levels: ["Advanced", "Proficient", "Developing", "Beginning"] }, { name: "Social Skills", levels: ["Advanced", "Proficient", "Developing", "Beginning"] }] } },
        { name: "observations", label: "Observations", type: "LONG_TEXT", sortOrder: 4, placeholder: "Additional observations..." },
        { name: "recommendation", label: "Recommendation", type: "RADIO", isRequired: true, sortOrder: 5, options: [{ label: "Accept", value: "accept" }, { label: "Waitlist", value: "waitlist" }, { label: "Decline", value: "decline" }] },
      ],
      settings: { submissionMode: "AUTHENTICATED", requiresApproval: true, approvalChain: [{ step: 1, role: "TENANT_ADMIN", label: "Head of Admissions" }], category: "admissions" },
    },
  },
  {
    name: "Parent Interview Form",
    slug: "parent-interview",
    description: "Structured interview form for parent meetings during admissions",
    category: "admissions",
    subcategory: "interview",
    tags: ["interview", "parent", "admissions"],
    formSchema: {
      fields: [
        { name: "parent_name", label: "Parent Name", type: "SHORT_TEXT", isRequired: true, width: "half", sortOrder: 0 },
        { name: "child_name", label: "Child Name", type: "SHORT_TEXT", isRequired: true, width: "half", sortOrder: 1 },
        { name: "interview_date", label: "Interview Date", type: "DATE_TIME", isRequired: true, sortOrder: 2 },
        { name: "motivation", label: "Why did you choose our school?", type: "LONG_TEXT", isRequired: true, sortOrder: 3 },
        { name: "expectations", label: "What are your expectations?", type: "LONG_TEXT", sortOrder: 4 },
        { name: "involvement", label: "How do you plan to be involved?", type: "LONG_TEXT", sortOrder: 5 },
        { name: "rating", label: "Overall Impression", type: "RATING", sortOrder: 6 },
        { name: "notes", label: "Interviewer Notes", type: "LONG_TEXT", sortOrder: 7 },
      ],
      settings: { submissionMode: "AUTHENTICATED", category: "admissions" },
    },
  },
  {
    name: "Enrollment Confirmation",
    slug: "enrollment-confirmation",
    description: "Final enrollment confirmation with fee agreement and document checklist",
    category: "admissions",
    subcategory: "enrollment",
    tags: ["enrollment", "confirmation", "fee"],
    formSchema: {
      fields: [
        { name: "student_selector", label: "Select Student", type: "STUDENT_SELECTOR", isRequired: true, sortOrder: 0 },
        { name: "class_selector", label: "Assigned Class", type: "CLASS_SELECTOR", isRequired: true, sortOrder: 1 },
        { name: "documents_submitted", label: "Documents Submitted", type: "CHECKBOX", isRequired: true, sortOrder: 2, options: [{ label: "Birth Certificate", value: "birth_cert" }, { label: "Previous School Records", value: "school_records" }, { label: "Medical Records", value: "medical" }, { label: "Passport Photos", value: "photos" }, { label: "Proof of Address", value: "address_proof" }] },
        { name: "fee_agreement", label: "Fee Agreement", type: "CONSENT_AGREEMENT", isRequired: true, sortOrder: 3, options: { consentText: "I agree to the school's fee structure and payment terms as outlined in the enrollment package." } },
        { name: "signature", label: "Parent Signature", type: "SIGNATURE", isRequired: true, sortOrder: 4 },
      ],
      settings: { submissionMode: "AUTHENTICATED", requiresApproval: true, approvalChain: [{ step: 1, role: "FINANCE", label: "Finance Office" }], category: "admissions" },
    },
  },

  // ── Academics ─────────────────────────────────────────
  {
    name: "Continuous Assessment",
    slug: "continuous-assessment",
    description: "Teacher assessment form for ongoing student evaluation",
    category: "academics",
    subcategory: "assessment",
    tags: ["assessment", "grading", "teacher"],
    formSchema: {
      fields: [
        { name: "student", label: "Student", type: "STUDENT_SELECTOR", isRequired: true, width: "half", sortOrder: 0 },
        { name: "class", label: "Class", type: "CLASS_SELECTOR", isRequired: true, width: "half", sortOrder: 1 },
        { name: "subject", label: "Subject", type: "SHORT_TEXT", isRequired: true, width: "half", sortOrder: 2 },
        { name: "assessment_date", label: "Date", type: "DATE", isRequired: true, width: "half", sortOrder: 3 },
        { name: "score", label: "Score (%)", type: "SLIDER", isRequired: true, sortOrder: 4, options: { min: 0, max: 100, step: 1 } },
        { name: "rubric", label: "Rubric Assessment", type: "ASSESSMENT_RUBRIC", sortOrder: 5, options: { criteria: [{ name: "Knowledge", levels: ["Excellent", "Good", "Satisfactory", "Needs Improvement"] }, { name: "Application", levels: ["Excellent", "Good", "Satisfactory", "Needs Improvement"] }, { name: "Effort", levels: ["Excellent", "Good", "Satisfactory", "Needs Improvement"] }] } },
        { name: "comments", label: "Teacher Comments", type: "LONG_TEXT", sortOrder: 6 },
      ],
      settings: { submissionMode: "AUTHENTICATED", category: "academics" },
    },
  },
  {
    name: "Lesson Feedback",
    slug: "lesson-feedback",
    description: "Student feedback form for lesson quality and engagement",
    category: "academics",
    subcategory: "feedback",
    tags: ["feedback", "lesson", "student"],
    formSchema: {
      fields: [
        { name: "class", label: "Class", type: "CLASS_SELECTOR", isRequired: true, width: "half", sortOrder: 0 },
        { name: "subject", label: "Subject", type: "SHORT_TEXT", isRequired: true, width: "half", sortOrder: 1 },
        { name: "understanding", label: "How well did you understand the lesson?", type: "RATING", isRequired: true, sortOrder: 2 },
        { name: "engagement", label: "How engaging was the lesson?", type: "RATING", isRequired: true, sortOrder: 3 },
        { name: "pace", label: "Was the pace appropriate?", type: "RADIO", sortOrder: 4, options: [{ label: "Too fast", value: "fast" }, { label: "Just right", value: "right" }, { label: "Too slow", value: "slow" }] },
        { name: "best_part", label: "What was the best part?", type: "LONG_TEXT", sortOrder: 5 },
        { name: "improvement", label: "What could be improved?", type: "LONG_TEXT", sortOrder: 6 },
      ],
      settings: { submissionMode: "AUTHENTICATED", category: "academics" },
    },
  },
  {
    name: "Homework Submission",
    slug: "homework-submission",
    description: "Digital homework submission form with file upload",
    category: "academics",
    subcategory: "homework",
    tags: ["homework", "submission", "student"],
    formSchema: {
      fields: [
        { name: "student", label: "Student", type: "STUDENT_SELECTOR", isRequired: true, sortOrder: 0 },
        { name: "subject", label: "Subject", type: "SHORT_TEXT", isRequired: true, width: "half", sortOrder: 1 },
        { name: "assignment_title", label: "Assignment Title", type: "SHORT_TEXT", isRequired: true, width: "half", sortOrder: 2 },
        { name: "description", label: "Description", type: "LONG_TEXT", sortOrder: 3 },
        { name: "file", label: "Upload Homework", type: "FILE_UPLOAD", isRequired: true, sortOrder: 4, options: { accept: ".pdf,.doc,.docx,.jpg,.png", maxSize: 10485760, multiple: true } },
        { name: "notes", label: "Additional Notes", type: "LONG_TEXT", sortOrder: 5 },
      ],
      settings: { submissionMode: "AUTHENTICATED", category: "academics" },
    },
  },

  // ── Administration ────────────────────────────────────
  {
    name: "Incident Report",
    slug: "incident-report",
    description: "Report safety incidents, accidents, or behavioral issues",
    category: "administration",
    subcategory: "safety",
    tags: ["incident", "safety", "report"],
    formSchema: {
      fields: [
        { name: "incident_date", label: "Date & Time", type: "DATE_TIME", isRequired: true, width: "half", sortOrder: 0 },
        { name: "location", label: "Location", type: "SHORT_TEXT", isRequired: true, width: "half", sortOrder: 1 },
        { name: "type", label: "Incident Type", type: "DROPDOWN", isRequired: true, sortOrder: 2, options: [{ label: "Accident/Injury", value: "accident" }, { label: "Behavioral", value: "behavioral" }, { label: "Bullying", value: "bullying" }, { label: "Property Damage", value: "property" }, { label: "Medical Emergency", value: "medical" }, { label: "Other", value: "other" }] },
        { name: "severity", label: "Severity", type: "RADIO", isRequired: true, sortOrder: 3, options: [{ label: "Low", value: "low" }, { label: "Medium", value: "medium" }, { label: "High", value: "high" }, { label: "Critical", value: "critical" }] },
        { name: "students_involved", label: "Students Involved", type: "LONG_TEXT", isRequired: true, sortOrder: 4 },
        { name: "description", label: "Description", type: "LONG_TEXT", isRequired: true, sortOrder: 5 },
        { name: "action_taken", label: "Action Taken", type: "LONG_TEXT", isRequired: true, sortOrder: 6 },
        { name: "witnesses", label: "Witnesses", type: "LONG_TEXT", sortOrder: 7 },
        { name: "follow_up", label: "Follow-up Required", type: "TOGGLE", sortOrder: 8 },
        { name: "photos", label: "Photos/Evidence", type: "FILE_UPLOAD", sortOrder: 9, options: { accept: ".jpg,.jpeg,.png,.pdf", maxSize: 5242880, multiple: true } },
      ],
      settings: { submissionMode: "AUTHENTICATED", requiresApproval: true, approvalChain: [{ step: 1, role: "TENANT_ADMIN", label: "Principal" }], category: "administration" },
    },
  },
  {
    name: "Leave Request",
    slug: "leave-request",
    description: "Staff leave request form with approval workflow",
    category: "administration",
    subcategory: "hr",
    tags: ["leave", "hr", "staff"],
    formSchema: {
      fields: [
        { name: "leave_type", label: "Leave Type", type: "DROPDOWN", isRequired: true, sortOrder: 0, options: [{ label: "Annual Leave", value: "annual" }, { label: "Sick Leave", value: "sick" }, { label: "Personal Leave", value: "personal" }, { label: "Maternity/Paternity", value: "parental" }, { label: "Bereavement", value: "bereavement" }, { label: "Professional Development", value: "pd" }] },
        { name: "start_date", label: "Start Date", type: "DATE", isRequired: true, width: "half", sortOrder: 1 },
        { name: "end_date", label: "End Date", type: "DATE", isRequired: true, width: "half", sortOrder: 2 },
        { name: "reason", label: "Reason", type: "LONG_TEXT", isRequired: true, sortOrder: 3 },
        { name: "coverage", label: "Coverage Arrangement", type: "LONG_TEXT", sortOrder: 4, helpText: "Who will cover your duties?" },
        { name: "attachment", label: "Supporting Document", type: "FILE_UPLOAD", sortOrder: 5, options: { accept: ".pdf,.doc,.jpg,.png", maxSize: 5242880 } },
      ],
      settings: { submissionMode: "AUTHENTICATED", requiresApproval: true, approvalChain: [{ step: 1, role: "HOD", label: "Department Head" }, { step: 2, role: "TENANT_ADMIN", label: "Principal" }], category: "administration" },
    },
  },
  {
    name: "Staff Onboarding",
    slug: "staff-onboarding",
    description: "New staff onboarding checklist and information collection",
    category: "administration",
    subcategory: "hr",
    tags: ["onboarding", "staff", "hr"],
    formSchema: {
      fields: [
        { name: "full_name", label: "Full Name", type: "SHORT_TEXT", isRequired: true, sortOrder: 0 },
        { name: "email", label: "Email", type: "EMAIL", isRequired: true, width: "half", sortOrder: 1 },
        { name: "phone", label: "Phone", type: "PHONE", isRequired: true, width: "half", sortOrder: 2 },
        { name: "address", label: "Address", type: "ADDRESS", isRequired: true, sortOrder: 3 },
        { name: "emergency_contact", label: "Emergency Contact", type: "EMERGENCY_CONTACT", isRequired: true, sortOrder: 4 },
        { name: "start_date", label: "Start Date", type: "DATE", isRequired: true, sortOrder: 5 },
        { name: "department", label: "Department", type: "SHORT_TEXT", isRequired: true, sortOrder: 6 },
        { name: "id_upload", label: "ID Document", type: "FILE_UPLOAD", isRequired: true, sortOrder: 7, options: { accept: ".pdf,.jpg,.png", maxSize: 5242880 } },
        { name: "qualifications", label: "Qualifications Upload", type: "FILE_UPLOAD", sortOrder: 8, options: { accept: ".pdf,.doc,.docx", maxSize: 10485760, multiple: true } },
        { name: "consent", label: "Background Check Consent", type: "CONSENT_AGREEMENT", isRequired: true, sortOrder: 9, options: { consentText: "I consent to a background check as part of the hiring process." } },
      ],
      settings: { submissionMode: "AUTHENTICATED", requiresApproval: true, approvalChain: [{ step: 1, role: "HR", label: "HR Department" }], category: "administration" },
    },
  },
  {
    name: "Asset Issuance Form",
    slug: "asset-issuance",
    description: "Track issuance of school assets to staff",
    category: "administration",
    subcategory: "assets",
    tags: ["assets", "equipment", "issuance"],
    formSchema: {
      fields: [
        { name: "staff", label: "Staff Member", type: "STAFF_SELECTOR", isRequired: true, sortOrder: 0 },
        { name: "asset_type", label: "Asset Type", type: "DROPDOWN", isRequired: true, sortOrder: 1, options: [{ label: "Laptop", value: "laptop" }, { label: "Tablet", value: "tablet" }, { label: "Projector", value: "projector" }, { label: "Keys", value: "keys" }, { label: "Books", value: "books" }, { label: "Other", value: "other" }] },
        { name: "asset_id", label: "Asset ID/Serial", type: "SHORT_TEXT", isRequired: true, sortOrder: 2 },
        { name: "description", label: "Description", type: "LONG_TEXT", sortOrder: 3 },
        { name: "issue_date", label: "Issue Date", type: "DATE", isRequired: true, sortOrder: 4 },
        { name: "condition", label: "Condition", type: "RADIO", isRequired: true, sortOrder: 5, options: [{ label: "New", value: "new" }, { label: "Good", value: "good" }, { label: "Fair", value: "fair" }] },
        { name: "signature", label: "Recipient Signature", type: "SIGNATURE", isRequired: true, sortOrder: 6 },
      ],
      settings: { submissionMode: "AUTHENTICATED", category: "administration" },
    },
  },

  // ── Finance ───────────────────────────────────────────
  {
    name: "Fee Agreement",
    slug: "fee-agreement",
    description: "Fee payment agreement form with terms acceptance",
    category: "finance",
    tags: ["fee", "payment", "agreement"],
    formSchema: {
      fields: [
        { name: "student", label: "Student", type: "STUDENT_SELECTOR", isRequired: true, sortOrder: 0 },
        { name: "guardian", label: "Guardian", type: "GUARDIAN_SELECTOR", isRequired: true, sortOrder: 1 },
        { name: "session", label: "Academic Session", type: "SESSION_SELECTOR", isRequired: true, sortOrder: 2 },
        { name: "payment_plan", label: "Payment Plan", type: "RADIO", isRequired: true, sortOrder: 3, options: [{ label: "Full Payment", value: "full" }, { label: "Termly", value: "termly" }, { label: "Monthly", value: "monthly" }] },
        { name: "consent", label: "Fee Agreement", type: "CONSENT_AGREEMENT", isRequired: true, sortOrder: 4, options: { consentText: "I agree to the school's fee structure and understand that fees are non-refundable once the term has commenced." } },
        { name: "signature", label: "Signature", type: "SIGNATURE", isRequired: true, sortOrder: 5 },
      ],
      settings: { submissionMode: "AUTHENTICATED", category: "finance" },
    },
  },
  {
    name: "Scholarship Application",
    slug: "scholarship-application",
    description: "Student scholarship application with supporting documents",
    category: "finance",
    tags: ["scholarship", "financial-aid", "application"],
    formSchema: {
      fields: [
        { name: "student", label: "Student", type: "STUDENT_SELECTOR", isRequired: true, sortOrder: 0 },
        { name: "scholarship_type", label: "Scholarship Type", type: "DROPDOWN", isRequired: true, sortOrder: 1, options: [{ label: "Academic Merit", value: "academic" }, { label: "Financial Need", value: "financial" }, { label: "Sports", value: "sports" }, { label: "Arts", value: "arts" }, { label: "Community Service", value: "community" }] },
        { name: "gpa", label: "Current GPA", type: "NUMBER", width: "half", sortOrder: 2 },
        { name: "household_income", label: "Annual Household Income", type: "NUMBER", width: "half", sortOrder: 3 },
        { name: "essay", label: "Why do you deserve this scholarship?", type: "LONG_TEXT", isRequired: true, sortOrder: 4, validations: { minLength: 100 } },
        { name: "achievements", label: "Key Achievements", type: "LONG_TEXT", sortOrder: 5 },
        { name: "recommendation", label: "Recommendation Letter", type: "FILE_UPLOAD", sortOrder: 6, options: { accept: ".pdf,.doc,.docx", maxSize: 5242880 } },
        { name: "supporting_docs", label: "Supporting Documents", type: "FILE_UPLOAD", sortOrder: 7, options: { accept: ".pdf,.doc,.jpg,.png", maxSize: 10485760, multiple: true } },
      ],
      settings: { submissionMode: "AUTHENTICATED", requiresApproval: true, approvalChain: [{ step: 1, role: "TENANT_ADMIN", label: "Scholarship Committee" }, { step: 2, role: "FINANCE", label: "Finance Office" }], category: "finance" },
    },
  },
  {
    name: "Refund Request",
    slug: "refund-request",
    description: "Fee refund request form",
    category: "finance",
    tags: ["refund", "fee", "finance"],
    formSchema: {
      fields: [
        { name: "student", label: "Student", type: "STUDENT_SELECTOR", isRequired: true, sortOrder: 0 },
        { name: "amount", label: "Refund Amount", type: "NUMBER", isRequired: true, width: "half", sortOrder: 1 },
        { name: "reason", label: "Reason for Refund", type: "DROPDOWN", isRequired: true, width: "half", sortOrder: 2, options: [{ label: "Withdrawal", value: "withdrawal" }, { label: "Overpayment", value: "overpayment" }, { label: "Scholarship Awarded", value: "scholarship" }, { label: "Other", value: "other" }] },
        { name: "details", label: "Details", type: "LONG_TEXT", isRequired: true, sortOrder: 3 },
        { name: "bank_name", label: "Bank Name", type: "SHORT_TEXT", isRequired: true, width: "half", sortOrder: 4 },
        { name: "account_number", label: "Account Number", type: "SHORT_TEXT", isRequired: true, width: "half", sortOrder: 5 },
        { name: "receipt", label: "Payment Receipt", type: "FILE_UPLOAD", sortOrder: 6, options: { accept: ".pdf,.jpg,.png", maxSize: 5242880 } },
      ],
      settings: { submissionMode: "AUTHENTICATED", requiresApproval: true, approvalChain: [{ step: 1, role: "FINANCE", label: "Finance" }, { step: 2, role: "TENANT_ADMIN", label: "Principal" }], category: "finance" },
    },
  },

  // ── Compliance ────────────────────────────────────────
  {
    name: "Medical Consent Form",
    slug: "medical-consent",
    description: "Parental consent for medical treatment and information sharing",
    category: "compliance",
    tags: ["medical", "consent", "health"],
    formSchema: {
      fields: [
        { name: "student", label: "Student", type: "STUDENT_SELECTOR", isRequired: true, sortOrder: 0 },
        { name: "medical_info", label: "Medical Information", type: "MEDICAL_INFO", isRequired: true, sortOrder: 1 },
        { name: "consent_treatment", label: "Emergency Treatment Consent", type: "CONSENT_AGREEMENT", isRequired: true, sortOrder: 2, options: { consentText: "I authorize the school to seek emergency medical treatment for my child if I cannot be reached." } },
        { name: "consent_medication", label: "Medication Administration Consent", type: "CONSENT_AGREEMENT", isRequired: true, sortOrder: 3, options: { consentText: "I authorize the school nurse to administer prescribed medication to my child." } },
        { name: "signature", label: "Parent Signature", type: "SIGNATURE", isRequired: true, sortOrder: 4 },
      ],
      settings: { submissionMode: "AUTHENTICATED", category: "compliance" },
    },
  },
  {
    name: "Photo/Video Consent",
    slug: "photo-video-consent",
    description: "Consent for use of student photos and videos",
    category: "compliance",
    tags: ["photo", "video", "consent", "media"],
    formSchema: {
      fields: [
        { name: "student", label: "Student", type: "STUDENT_SELECTOR", isRequired: true, sortOrder: 0 },
        { name: "consent_website", label: "School Website", type: "TOGGLE", sortOrder: 1 },
        { name: "consent_social", label: "Social Media", type: "TOGGLE", sortOrder: 2 },
        { name: "consent_newsletter", label: "Newsletter", type: "TOGGLE", sortOrder: 3 },
        { name: "consent_yearbook", label: "Yearbook", type: "TOGGLE", sortOrder: 4 },
        { name: "consent_media", label: "Local Media", type: "TOGGLE", sortOrder: 5 },
        { name: "restrictions", label: "Any Restrictions?", type: "LONG_TEXT", sortOrder: 6 },
        { name: "consent", label: "Consent Agreement", type: "CONSENT_AGREEMENT", isRequired: true, sortOrder: 7, options: { consentText: "I understand that images may be used for the purposes selected above." } },
        { name: "signature", label: "Parent Signature", type: "SIGNATURE", isRequired: true, sortOrder: 8 },
      ],
      settings: { submissionMode: "AUTHENTICATED", category: "compliance" },
    },
  },
  {
    name: "Data Privacy Consent",
    slug: "data-privacy-consent",
    description: "GDPR/data privacy consent form",
    category: "compliance",
    tags: ["privacy", "gdpr", "data", "consent"],
    formSchema: {
      fields: [
        { name: "parent_name", label: "Parent/Guardian Name", type: "SHORT_TEXT", isRequired: true, sortOrder: 0 },
        { name: "student", label: "Student", type: "STUDENT_SELECTOR", isRequired: true, sortOrder: 1 },
        { name: "consent_processing", label: "Data Processing", type: "CONSENT_AGREEMENT", isRequired: true, sortOrder: 2, options: { consentText: "I consent to the school processing my child's personal data for educational and administrative purposes." } },
        { name: "consent_sharing", label: "Data Sharing", type: "CONSENT_AGREEMENT", isRequired: true, sortOrder: 3, options: { consentText: "I consent to sharing necessary data with educational authorities and healthcare providers when required." } },
        { name: "consent_analytics", label: "Analytics", type: "CONSENT_AGREEMENT", sortOrder: 4, options: { consentText: "I consent to anonymized data being used for school improvement analytics." } },
        { name: "signature", label: "Signature", type: "SIGNATURE", isRequired: true, sortOrder: 5 },
      ],
      settings: { submissionMode: "AUTHENTICATED", category: "compliance" },
    },
  },

  // ── Health ────────────────────────────────────────────
  {
    name: "Health Screening Form",
    slug: "health-screening",
    description: "Annual student health screening record",
    category: "health",
    tags: ["health", "screening", "medical"],
    formSchema: {
      fields: [
        { name: "student", label: "Student", type: "STUDENT_SELECTOR", isRequired: true, sortOrder: 0 },
        { name: "screening_date", label: "Screening Date", type: "DATE", isRequired: true, sortOrder: 1 },
        { name: "medical_info", label: "Medical Information", type: "MEDICAL_INFO", isRequired: true, sortOrder: 2 },
        { name: "height", label: "Height (cm)", type: "NUMBER", width: "third", sortOrder: 3 },
        { name: "weight", label: "Weight (kg)", type: "NUMBER", width: "third", sortOrder: 4 },
        { name: "vision", label: "Vision", type: "RADIO", width: "third", sortOrder: 5, options: [{ label: "Normal", value: "normal" }, { label: "Needs Attention", value: "attention" }] },
        { name: "notes", label: "Nurse Notes", type: "LONG_TEXT", sortOrder: 6 },
        { name: "follow_up", label: "Follow-up Required", type: "TOGGLE", sortOrder: 7 },
      ],
      settings: { submissionMode: "AUTHENTICATED", category: "health" },
    },
  },

  // ── Behavioral ────────────────────────────────────────
  {
    name: "Behavioral Observation",
    slug: "behavioral-observation",
    description: "Structured behavioral observation form for teachers",
    category: "behavioral",
    tags: ["behavior", "observation", "teacher"],
    formSchema: {
      fields: [
        { name: "student", label: "Student", type: "STUDENT_SELECTOR", isRequired: true, sortOrder: 0 },
        { name: "observation_date", label: "Date", type: "DATE_TIME", isRequired: true, sortOrder: 1 },
        { name: "observation", label: "Behavioral Observation", type: "BEHAVIORAL_OBSERVATION", isRequired: true, sortOrder: 2 },
        { name: "parent_notified", label: "Parent Notified", type: "TOGGLE", sortOrder: 3 },
        { name: "follow_up_date", label: "Follow-up Date", type: "DATE", sortOrder: 4 },
      ],
      settings: { submissionMode: "AUTHENTICATED", requiresApproval: true, approvalChain: [{ step: 1, role: "HOD", label: "Department Head" }], category: "behavioral" },
    },
  },

  // ── Events ────────────────────────────────────────────
  {
    name: "Event Registration",
    slug: "event-registration",
    description: "General event registration form",
    category: "events",
    tags: ["event", "registration", "rsvp"],
    formSchema: {
      fields: [
        { name: "name", label: "Full Name", type: "SHORT_TEXT", isRequired: true, sortOrder: 0 },
        { name: "email", label: "Email", type: "EMAIL", isRequired: true, width: "half", sortOrder: 1 },
        { name: "phone", label: "Phone", type: "PHONE", width: "half", sortOrder: 2 },
        { name: "role", label: "I am a", type: "RADIO", isRequired: true, sortOrder: 3, options: [{ label: "Parent", value: "parent" }, { label: "Student", value: "student" }, { label: "Staff", value: "staff" }, { label: "Guest", value: "guest" }] },
        { name: "attendees", label: "Number of Attendees", type: "NUMBER", isRequired: true, sortOrder: 4, validations: { min: 1, max: 10 } },
        { name: "dietary", label: "Dietary Requirements", type: "CHECKBOX", sortOrder: 5, options: [{ label: "Vegetarian", value: "vegetarian" }, { label: "Vegan", value: "vegan" }, { label: "Halal", value: "halal" }, { label: "Gluten-free", value: "gluten_free" }, { label: "None", value: "none" }] },
        { name: "notes", label: "Special Requirements", type: "LONG_TEXT", sortOrder: 6 },
      ],
      settings: { submissionMode: "PUBLIC_LINK", category: "events" },
    },
  },
  {
    name: "Field Trip Permission",
    slug: "field-trip-permission",
    description: "Parent permission slip for school field trips",
    category: "events",
    tags: ["field-trip", "permission", "parent"],
    formSchema: {
      fields: [
        { name: "student", label: "Student", type: "STUDENT_SELECTOR", isRequired: true, sortOrder: 0 },
        { name: "trip_name", label: "Trip Name", type: "SHORT_TEXT", isRequired: true, sortOrder: 1 },
        { name: "trip_date", label: "Trip Date", type: "DATE", isRequired: true, sortOrder: 2 },
        { name: "medical_info", label: "Medical Information", type: "MEDICAL_INFO", sortOrder: 3 },
        { name: "emergency_contact", label: "Emergency Contact", type: "EMERGENCY_CONTACT", isRequired: true, sortOrder: 4 },
        { name: "consent", label: "Permission", type: "CONSENT_AGREEMENT", isRequired: true, sortOrder: 5, options: { consentText: "I give permission for my child to participate in this field trip and understand the associated risks." } },
        { name: "signature", label: "Parent Signature", type: "SIGNATURE", isRequired: true, sortOrder: 6 },
      ],
      settings: { submissionMode: "AUTHENTICATED", category: "events" },
    },
  },
  {
    name: "Attendance Justification",
    slug: "attendance-justification",
    description: "Parent form to justify student absence or lateness",
    category: "administration",
    subcategory: "attendance",
    tags: ["attendance", "absence", "justification"],
    formSchema: {
      fields: [
        { name: "student", label: "Student", type: "STUDENT_SELECTOR", isRequired: true, sortOrder: 0 },
        { name: "justification", label: "Attendance Justification", type: "ATTENDANCE_JUSTIFICATION", isRequired: true, sortOrder: 1 },
        { name: "supporting_doc", label: "Supporting Document", type: "FILE_UPLOAD", sortOrder: 2, options: { accept: ".pdf,.jpg,.png,.doc", maxSize: 5242880 } },
        { name: "signature", label: "Parent Signature", type: "SIGNATURE", isRequired: true, sortOrder: 3 },
      ],
      settings: { submissionMode: "AUTHENTICATED", requiresApproval: true, approvalChain: [{ step: 1, role: "TEACHER", label: "Class Teacher" }], category: "administration" },
    },
  },
  {
    name: "Parent Feedback Survey",
    slug: "parent-feedback-survey",
    description: "Annual parent satisfaction survey",
    category: "administration",
    subcategory: "feedback",
    tags: ["survey", "feedback", "parent"],
    formSchema: {
      fields: [
        { name: "overall", label: "Overall Satisfaction", type: "RATING", isRequired: true, sortOrder: 0 },
        { name: "teaching", label: "Quality of Teaching", type: "RATING", isRequired: true, sortOrder: 1 },
        { name: "communication", label: "School Communication", type: "RATING", isRequired: true, sortOrder: 2 },
        { name: "facilities", label: "Facilities", type: "RATING", isRequired: true, sortOrder: 3 },
        { name: "safety", label: "Safety & Security", type: "RATING", isRequired: true, sortOrder: 4 },
        { name: "recommend", label: "Would you recommend our school?", type: "RADIO", isRequired: true, sortOrder: 5, options: [{ label: "Definitely", value: "definitely" }, { label: "Probably", value: "probably" }, { label: "Not sure", value: "unsure" }, { label: "Probably not", value: "probably_not" }] },
        { name: "best_thing", label: "What do you like most?", type: "LONG_TEXT", sortOrder: 6 },
        { name: "improvement", label: "What could we improve?", type: "LONG_TEXT", sortOrder: 7 },
      ],
      settings: { submissionMode: "AUTHENTICATED", category: "administration", successMessage: "Thank you for your feedback! Your responses help us improve." },
    },
  },
  {
    name: "Teacher Self-Evaluation",
    slug: "teacher-self-evaluation",
    description: "Annual teacher self-evaluation form",
    category: "academics",
    subcategory: "evaluation",
    tags: ["evaluation", "teacher", "self-assessment"],
    formSchema: {
      fields: [
        { name: "session", label: "Academic Session", type: "SESSION_SELECTOR", isRequired: true, sortOrder: 0 },
        { name: "goals_met", label: "Goals Met This Year", type: "LONG_TEXT", isRequired: true, sortOrder: 1 },
        { name: "challenges", label: "Challenges Faced", type: "LONG_TEXT", isRequired: true, sortOrder: 2 },
        { name: "rubric", label: "Self-Assessment", type: "ASSESSMENT_RUBRIC", isRequired: true, sortOrder: 3, options: { criteria: [{ name: "Lesson Planning", levels: ["Excellent", "Good", "Satisfactory", "Needs Improvement"] }, { name: "Student Engagement", levels: ["Excellent", "Good", "Satisfactory", "Needs Improvement"] }, { name: "Assessment & Feedback", levels: ["Excellent", "Good", "Satisfactory", "Needs Improvement"] }, { name: "Professional Development", levels: ["Excellent", "Good", "Satisfactory", "Needs Improvement"] }] } },
        { name: "pd_completed", label: "Professional Development Completed", type: "LONG_TEXT", sortOrder: 4 },
        { name: "goals_next", label: "Goals for Next Year", type: "LONG_TEXT", isRequired: true, sortOrder: 5 },
        { name: "support_needed", label: "Support Needed", type: "LONG_TEXT", sortOrder: 6 },
      ],
      settings: { submissionMode: "AUTHENTICATED", requiresApproval: true, approvalChain: [{ step: 1, role: "HOD", label: "Department Head" }], category: "academics" },
    },
  },
]

async function seedFormTemplates() {
  console.log("Seeding form builder templates...")

  for (const tpl of TEMPLATES) {
    await (prisma as any).fBFormTemplate.upsert({
      where: { slug: tpl.slug },
      update: {
        name: tpl.name,
        description: tpl.description,
        category: tpl.category,
        subcategory: tpl.subcategory || null,
        icon: tpl.icon || null,
        formSchema: JSON.stringify(tpl.formSchema),
        defaultBranding: "{}",
        isSystem: true,
        isPublished: true,
        tags: JSON.stringify(tpl.tags),
      },
      create: {
        name: tpl.name,
        slug: tpl.slug,
        description: tpl.description,
        category: tpl.category,
        subcategory: tpl.subcategory || null,
        icon: tpl.icon || null,
        formSchema: JSON.stringify(tpl.formSchema),
        defaultBranding: "{}",
        isSystem: true,
        isPublished: true,
        tags: JSON.stringify(tpl.tags),
      },
    })
    console.log(`  ✓ ${tpl.name}`)
  }

  console.log(`\nSeeded ${TEMPLATES.length} form templates.`)
}

seedFormTemplates()
  .then(() => process.exit(0))
  .catch((e) => { console.error(e); process.exit(1) })
