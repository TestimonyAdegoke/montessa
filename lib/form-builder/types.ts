// ─────────────────────────────────────────────────────────
// Integrated Form Builder — Type System
// ─────────────────────────────────────────────────────────

// ── Field Types ─────────────────────────────────────────

export type FBFieldType =
  // Basic
  | "SHORT_TEXT"
  | "LONG_TEXT"
  | "RICH_TEXT"
  | "EMAIL"
  | "PHONE"
  | "NUMBER"
  | "DATE"
  | "TIME"
  | "DATE_TIME"
  | "DROPDOWN"
  | "RADIO"
  | "CHECKBOX"
  | "TOGGLE"
  // Advanced
  | "FILE_UPLOAD"
  | "SIGNATURE"
  | "RATING"
  | "SLIDER"
  | "ADDRESS"
  // Linked selectors
  | "GUARDIAN_SELECTOR"
  | "STUDENT_SELECTOR"
  | "STAFF_SELECTOR"
  | "CLASS_SELECTOR"
  | "SESSION_SELECTOR"
  // Special school blocks
  | "MEDICAL_INFO"
  | "BEHAVIORAL_OBSERVATION"
  | "ASSESSMENT_RUBRIC"
  | "ATTENDANCE_JUSTIFICATION"
  | "EMERGENCY_CONTACT"
  | "CONSENT_AGREEMENT"
  // Layout
  | "SECTION_BREAK"
  | "PAGE_BREAK"
  | "HEADING"
  | "PARAGRAPH"
  | "DIVIDER"
  | "HIDDEN"

export type FBFieldCategory =
  | "basic"
  | "advanced"
  | "school"
  | "layout"

export type FBFieldWidth = "full" | "half" | "third" | "two-thirds"

// ── Field Option ────────────────────────────────────────

export interface FBFieldOption {
  label: string
  value: string
  icon?: string
  color?: string
  isDefault?: boolean
}

// ── Validation ──────────────────────────────────────────

export interface FBValidation {
  minLength?: number
  maxLength?: number
  min?: number
  max?: number
  pattern?: string
  patternMessage?: string
  customMessage?: string
  fileTypes?: string[]
  maxFileSize?: number // bytes
  maxFiles?: number
}

// ── Label / Input Styling ───────────────────────────────

export interface FBLabelStyle {
  fontFamily?: string
  fontSize?: string
  fontWeight?: string
  color?: string
  align?: "left" | "center" | "right"
  lineHeight?: string
  textTransform?: "none" | "uppercase" | "lowercase" | "capitalize"
}

export interface FBInputStyle {
  fontFamily?: string
  fontSize?: string
  borderColor?: string
  borderRadius?: string
  backgroundColor?: string
  padding?: string
}

// ── Field Definition (runtime) ──────────────────────────

export interface FBField {
  id: string
  formId: string
  name: string
  label: string
  type: FBFieldType
  description?: string
  placeholder?: string
  defaultValue?: string
  options?: FBFieldOption[] | Record<string, any>
  isRequired: boolean
  validations: FBValidation
  width: FBFieldWidth
  labelStyle: FBLabelStyle
  inputStyle: FBInputStyle
  step: number
  sortOrder: number
  groupId?: string
  isHidden: boolean
  conditionalOn?: FBConditionRef
  linkedModel?: string
  linkedField?: string
  linkedFilter?: Record<string, any>
  helpText?: string
  tooltip?: string
  isReadOnly: boolean
  isLocked: boolean
}

// ── Conditional Logic ───────────────────────────────────

export type FBLogicOperator =
  | "equals"
  | "not_equals"
  | "contains"
  | "not_contains"
  | "starts_with"
  | "ends_with"
  | "gt"
  | "gte"
  | "lt"
  | "lte"
  | "in"
  | "not_in"
  | "is_empty"
  | "is_not_empty"
  | "is_checked"
  | "is_not_checked"

export interface FBCondition {
  fieldId: string
  operator: FBLogicOperator
  value: any
}

export interface FBConditionRef {
  fieldId: string
  operator: FBLogicOperator
  value: any
}

export type FBLogicType =
  | "visibility"
  | "validation"
  | "calculation"
  | "jump"
  | "prefill"
  | "notification"

export type FBLogicActionType =
  | "show"
  | "hide"
  | "require"
  | "disable"
  | "set_value"
  | "go_to_step"
  | "prefill"
  | "send_email"
  | "send_notification"

export interface FBLogicAction {
  action: FBLogicActionType
  targetFieldId?: string
  value?: any
  formula?: string
  step?: number
  message?: string
  to?: string
  template?: string
}

export interface FBLogicRule {
  id: string
  formId: string
  name?: string
  type: FBLogicType
  conditions: FBCondition[]
  conditionLogic: "AND" | "OR"
  actions: FBLogicAction[]
  isActive: boolean
  sortOrder: number
}

// ── Submission Mode ─────────────────────────────────────

export type FBSubmissionMode =
  | "PUBLIC_LINK"
  | "AUTHENTICATED"
  | "ROLE_RESTRICTED"
  | "ONE_TIME"
  | "RECURRING"

// ── Submission Status ───────────────────────────────────

export type FBSubmissionStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "ARCHIVED"

// ── Approval ────────────────────────────────────────────

export type FBApprovalStatus = "PENDING" | "APPROVED" | "REJECTED" | "ESCALATED"

export interface FBApprovalChainStep {
  step: number
  role?: string
  userId?: string
  label: string
  isParallel?: boolean
}

export interface FBEscalationRule {
  afterHours: number
  escalateTo: string // role or userId
  notifyOriginal: boolean
}

// ── Domain Mapping ──────────────────────────────────────

export interface FBDomainMapping {
  targetModel: string
  // "Student" | "Guardian" | "Application" | "HealthIncident" | "StaffAttendance" etc.
  fieldMap: Record<string, string>
  // { "form_field_name": "model_field_name" }
  createOnSubmit: boolean
  updateOnApproval: boolean
}

// ── Branding ────────────────────────────────────────────

export interface FBBrandingConfig {
  primaryColor?: string
  secondaryColor?: string
  backgroundColor?: string
  textColor?: string
  logo?: string
  headerImage?: string
  font?: string
  borderRadius?: string
  showProgressBar?: boolean
  showStepLabels?: boolean
  customCSS?: string
}

// ── Form (runtime) ──────────────────────────────────────

export interface FBFormData {
  id: string
  tenantId: string
  name: string
  slug: string
  description?: string
  category: string
  icon?: string
  submissionMode: FBSubmissionMode
  allowedRoles: string[]
  maxSubmissions?: number
  submissionLimit?: number
  isMultiStep: boolean
  stepLabels: string[]
  successMessage?: string
  successRedirectUrl?: string
  sendConfirmation: boolean
  confirmationEmail?: string
  notifyEmails: string[]
  notifyOnSubmit: boolean
  notifyOnApproval: boolean
  webhookUrl?: string
  requiresPayment: boolean
  paymentAmount?: number
  paymentCurrency: string
  requiresApproval: boolean
  approvalChain: FBApprovalChainStep[]
  escalationRules: FBEscalationRule | Record<string, any>
  domainMapping?: FBDomainMapping
  brandingConfig: FBBrandingConfig
  isActive: boolean
  isArchived: boolean
  isTemplate: boolean
  version: number
  publishedAt?: string
  closesAt?: string
  opensAt?: string
  createdById?: string
  createdAt: string
  updatedAt: string
  fields: FBField[]
  logicRules: FBLogicRule[]
  _count?: {
    submissions: number
  }
}

// ── Submission (runtime) ────────────────────────────────

export interface FBSubmissionData {
  id: string
  formId: string
  submittedById?: string
  submitterName?: string
  submitterEmail?: string
  submitterRole?: string
  data: Record<string, any>
  normalizedData?: Record<string, any>
  status: FBSubmissionStatus
  statusHistory: { status: string; at: string; by?: string }[]
  currentApprover?: string
  approvalStep: number
  ipAddress?: string
  userAgent?: string
  completionTime?: number
  stepReached: number
  isComplete: boolean
  linkedRecordId?: string
  linkedModel?: string
  internalNotes?: string
  createdAt: string
  updatedAt: string
  form?: { name: string; slug: string; category: string }
  approvals?: FBApprovalData[]
  attachments?: FBAttachmentData[]
}

export interface FBApprovalData {
  id: string
  submissionId: string
  step: number
  approverId?: string
  approverRole?: string
  approverName?: string
  status: FBApprovalStatus
  comments?: string
  decidedAt?: string
  escalatedTo?: string
  escalatedAt?: string
}

export interface FBAttachmentData {
  id: string
  submissionId: string
  fieldName: string
  filename: string
  url: string
  mimeType: string
  size: number
  isEncrypted: boolean
}

// ── Template (runtime) ──────────────────────────────────

export interface FBTemplateData {
  id: string
  name: string
  slug: string
  description?: string
  category: string
  subcategory?: string
  icon?: string
  thumbnail?: string
  previewUrl?: string
  formSchema: FBTemplateSchema
  defaultBranding: FBBrandingConfig
  isSystem: boolean
  isPublished: boolean
  popularity: number
  sortOrder: number
  tags: string[]
}

export interface FBTemplateSchema {
  fields: Omit<FBField, "id" | "formId">[]
  logicRules?: Omit<FBLogicRule, "id" | "formId">[]
  settings: {
    isMultiStep?: boolean
    stepLabels?: string[]
    submissionMode?: FBSubmissionMode
    requiresApproval?: boolean
    approvalChain?: FBApprovalChainStep[]
    successMessage?: string
    category?: string
  }
}

// ── Analytics (runtime) ─────────────────────────────────

export interface FBAnalyticsData {
  id: string
  formId: string
  totalViews: number
  totalStarts: number
  totalSubmissions: number
  totalApproved: number
  totalRejected: number
  avgCompletionTime?: number
  completionRate?: number
  dropOffByStep: Record<string, number>
  lastSubmissionAt?: string
}

// ── Field Definition (registry) ─────────────────────────

export interface FBFieldDef {
  type: FBFieldType
  label: string
  icon: string
  category: FBFieldCategory
  description: string
  defaultProps: Partial<FBField>
  propSchema: FBPropField[]
  isLayout: boolean
  hasOptions: boolean
  hasLinkedData: boolean
  supportsValidation: boolean
  supportsConditional: boolean
}

export interface FBPropField {
  key: string
  label: string
  type: "text" | "number" | "boolean" | "select" | "color" | "textarea" | "json" | "options-editor"
  options?: { label: string; value: string }[]
  defaultValue?: any
  group?: string
}

// ── Editor State ────────────────────────────────────────

export interface FBEditorState {
  // Form
  form: FBFormData | null
  isDirty: boolean
  isSaving: boolean

  // Selection
  selectedFieldId: string | null
  hoveredFieldId: string | null
  draggedFieldType: FBFieldType | null
  dragOverIndex: number | null

  // Panels
  leftPanel: "fields" | "pages" | "logic"
  rightPanel: "properties" | "validation" | "logic" | "style"
  showPreview: boolean

  // History
  history: FBFormData[]
  historyIndex: number

  // Viewport
  viewMode: "edit" | "preview" | "mobile"
  currentStep: number
  zoom: number
}
