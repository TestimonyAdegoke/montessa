# OnebitMS — Full Codebase Audit & Implementation Plan

## PART 1: CURRENT STATE INVENTORY

### What Exists & Works (End-to-End)

| Module | Pages | API Routes | Server Actions | Components | Status |
|--------|-------|------------|----------------|------------|--------|
| Auth (Login) | `/login` | `/api/auth/[...nextauth]` | — | — | **Working** |
| Auth (Signup/Tenant Create) | `/signup` | `/api/tenants/create` | — | — | **Working** |
| Dashboard Home | `/dashboard` | — | — | `dashboard-nav`, `dashboard-header` | **Working** — wired to real AuditLog + Schedule data |
| Students | list, detail, new, edit | — | `students.ts` (create, update, getAvailableClasses) | `student-form`, `students-table` | **Working** |
| Teachers | list, new, edit | `/api/teachers`, `/api/teachers/[id]` | `teachers.ts` | `teacher-form`, `teachers-table` | **Working** |
| Classes | list, new | `/api/classes`, `/api/classes/[id]` | `classes.ts` | `classes-grid`, `class-form` | **Working** |
| Attendance | marking page | `/api/attendance/class` | `attendance.ts` | `attendance-marker` | **Working** |
| Learning Plans | list, new | — | `learning-plans.ts` | `plans-table`, `plan-form` | **Working** |
| Assessments | list, new | — | `assessments.ts` | `assessments-table`, `assessment-builder` | **Working** |
| Schedule | list, new, edit | `/api/schedule`, `/api/schedule/[id]` | `schedule.ts` | `schedule-form`, `schedule-row-actions` | **Working** |
| Billing | list, new, edit | `/api/invoices`, `/api/invoices/[id]` | `billing.ts` | `invoices-table`, `invoice-form` | **Working** |
| Messages | list, new | `/api/messages` | `messages.ts` | `messages-table`, `message-form` | **Working** |
| Analytics | dashboard | — | `analytics.ts` | `attendance-chart`, `enrollment-chart` | **Working** |
| Settings | tabbed page | `/api/tenant/settings`, `/api/profile` | — | `profile-form`, `theme-toggle`, `tenant-settings-form`, `security-form`, `notification-form`, `branding-form` | **Working** — all tabs wired |
| Landing Page | `/` | — | — | 10 landing components | **Working** |

### What Is Broken or Incomplete

1. ~~**`lib/utils.ts`**~~ — ✅ FIXED: Added `formatDate`, `calculateAge`, `getInitials`, `formatDateTime`, `formatRelativeTime`, `formatCurrency`, `slugify`.
2. ~~**Middleware**~~ — ✅ FIXED: Real auth guards, JWT token checking, role-based route protection, subdomain detection.
3. ~~**Stripe webhook**~~ — ✅ FIXED: Full `/api/webhooks/stripe/route.ts` with payment reconciliation.
4. ~~**Dashboard activity feed**~~ — ✅ FIXED: Wired to real `AuditLog` data.
5. ~~**Dashboard upcoming events**~~ — ✅ FIXED: Wired to real Schedule/Assessment data + Event model.
6. ~~**Settings tabs**~~ — ✅ FIXED: Security (password change), Notifications (preferences), Branding (logo/colors) all wired.
7. ~~**Forgot password**~~ — ✅ FIXED: Full forgot/reset password flow with email.

### What Is Completely Missing (Empty Dirs / No Implementation)

| Feature | Expected Location | Current State |
|---------|-------------------|---------------|
| **Guardian Portal** | `/dashboard/children` | ✅ **DONE** — child overview, attendance, grades, learning plans, billing tabs |
| **Student Portal** | `/dashboard/my-learning` | ✅ **DONE** — timetable, grades, attendance, learning plans tabs |
| **Tenant Management (Super Admin)** | `/dashboard/tenants` | ✅ **DONE** — platform stats and tenant CRUD table |
| **Guardian components** | `components/guardian/` | ✅ Inline in children page |
| **Student portal components** | `components/student/` | ✅ Inline in my-learning page |
| **Tenant management components** | `components/tenants/` | ✅ Inline in tenants page |
| **Announcements** | `/dashboard/announcements` | ✅ **DONE** — page, new form, server actions, API route |
| **Stripe webhook endpoint** | `/api/webhooks/stripe/route.ts` | ✅ **DONE** — full payment reconciliation |

---

## PART 2: GAP ANALYSIS vs. FEATURE REQUIREMENTS

### 1) Platform Fundamentals

| Requirement | Status | Gap |
|-------------|--------|-----|
| Multi-tenancy (RLS) | ✅ Done | RLS policies on all new tables |
| Subdomains per school | ✅ Done | Subdomain routing middleware + `x-tenant-subdomain` header |
| Branding per school | ✅ Done | `BrandingForm` component + Settings tab + API |
| Multi-campus support | ✅ Done | `Campus` model + `/dashboard/campuses` with branding overrides |
| Feature toggles | ✅ Done | `lib/feature-flags.ts` with module enable/disable + plan limits |
| Plan-based limits | ✅ Done | `checkPlanLimit()` for students/teachers/classes |
| Roles: Super Admin | ✅ Done | Tenant management dashboard |
| Roles: Finance/Bursar, HR, HoD | ✅ Done | FINANCE, HR, HOD roles added to enum + nav visibility |
| Audit trail | ✅ Done | `AuditLog` model + logging in most actions |
| RBAC enforcement | ✅ Done | Middleware + page-level + action-level role checks |
| 2FA | ✅ Done | TOTP implementation (`lib/two-factor.ts`) + API route + backup codes |
| SSO (Google/Microsoft) | ✅ Done | Google + Azure AD OAuth providers (conditional on env vars) |
| Session/device management | ✅ Done | `UserSession` model + `/dashboard/settings/sessions` with device info, revoke actions |
| GDPR/FERPA workflows | ✅ Done | Data export API (`/api/auth/data-export`) + consent forms (`/dashboard/consent`) with digital signatures |

### 2) Admissions & Enrollment

| Requirement | Status | Gap |
|-------------|--------|-----|
| Online admissions portal | ✅ Done | `/apply/[subdomain]` public form + `/api/applications/public` |
| Application workflow | ✅ Done | `Application` model with SUBMITTED→UNDER_REVIEW→ACCEPTED/REJECTED→ENROLLED |
| Waitlist management | ✅ Done | `/dashboard/admissions/waitlist` with position tracking, accept actions |
| Document upload | ✅ Done | UploadThing file router + API route (studentPhoto, documentUpload, observationMedia, applicationDocument) |
| E-sign enrollment contracts | ✅ Done | `EnrollmentContract` model + `/dashboard/contracts` with create, sign, void workflow |
| Transfer/re-admission | ✅ Done | `/dashboard/students/transfer` with transfer out + re-admit workflows + API route |

### 3) Student Information System

| Requirement | Status | Gap |
|-------------|--------|-----|
| Student profiles (biodata, medical) | ✅ Done | Full form with medical tab |
| Guardian relationships | ✅ Done | `StudentGuardian` model, shown in detail |
| Document vault | ✅ Done | `/dashboard/documents` with upload, search, categories, UploadThing integration |
| Behavior/discipline records | ✅ Done | `DisciplineRecord` model + CRUD actions + dashboard page + creation form |
| Achievements/badges | ✅ Done | `Achievement` model with 8 categories, points, badges + `/dashboard/achievements` with award/track UI |
| Alumni tracking | ✅ Done | `Alumni` model + `/dashboard/alumni` with career tracking, education, engagement |

### 4) Montessori & Personalized Learning

| Requirement | Status | Gap |
|-------------|--------|-----|
| ILP per child | ✅ Done | Full CRUD |
| Observation-based assessment | ✅ Done | `Observation` model exists |
| Progress tracking by skill | ✅ Done | `/dashboard/progress` with mastery levels by Montessori category + per-student breakdown |
| Photo/video evidence | ✅ Done | UploadThing `observationMedia` endpoint for image/video uploads |
| Mixed-age class support | ✅ Done | Classes don't enforce age restrictions |
| Montessori curriculum library | ✅ Done | `/dashboard/curriculum` with interactive syllabus maps, units, topics, progress tracking |

### 5) Attendance, Safety & Check-in/Check-out

| Requirement | Status | Gap |
|-------------|--------|-----|
| Daily attendance marking | ✅ Done | Class-based attendance with bulk mark |
| Guardian pickup auth + QR | ✅ Done | `/api/qr/generate` QR code generation + `/dashboard/pickup` verification UI |
| Check-in/check-out logging | ✅ Done | `/dashboard/check-in` page with today/recent tabs |
| Late pickup notifications | ✅ Done | Integrated in `/dashboard/pickup` with unauthorized attempt logging |
| Bus/transport attendance | ✅ Done | `BusAttendance` model + `TransportRoute`/`TransportStop` + `/dashboard/transport` |
| Sick bay / incident logging | ✅ Done | `HealthIncident` model with 9 types + `/dashboard/health` |
| Visitor management | ✅ Done | `Visitor` model + `/dashboard/visitors` with check-in/out, badges |

### 6) Timetable, Scheduling & Operations

| Requirement | Status | Gap |
|-------------|--------|-----|
| Class/teacher schedules | ✅ Done | Full CRUD with day grouping |
| Room/resource booking | ✅ Done | `/dashboard/rooms` page with rooms + bookings tabs, server actions |
| Substitution management | ✅ Done | `Substitution` model + `/dashboard/substitutions` with create, approve workflow |
| Exam timetables | ✅ Done | `ExamTimetable` + `ExamTimetableEntry` models + `/dashboard/exam-timetable` with entries, publish |
| Events calendar | ✅ Done | `Event` model + `/dashboard/events` page + creation form + API route |
| Task management | ✅ Done | `Task` model with categories, priorities, statuses + `/dashboard/tasks` with assign, track, filter |

### 7) Teaching, Learning & Classroom Tools

| Requirement | Status | Gap |
|-------------|--------|-----|
| Lesson planning | ✅ Done | `LessonPlan` model + `/dashboard/lesson-plans` page + creation form |
| Assignment creation/submission | ✅ Done | Student quiz-taking UI at `/assessments/[id]/take` with auto-grading |
| Classwork/homework tracking | ✅ Done | `/dashboard/homework` with assignment/project tracking, submissions, grading status |
| Rubrics & marking | ✅ Done | `lib/actions/rubrics.ts` with rubric templates, criteria levels, gradeWithRubric + existing grading.ts |
| Classroom activity feed | ✅ Done | `/dashboard/community` social media-style feed with posts, comments, likes, media |
| Teacher collaboration | ✅ Done | Community feed supports teacher-only visibility + resource sharing |

### 8) Assessments, Exams & Report Cards

| Requirement | Status | Gap |
|-------------|--------|-----|
| Assessment builder | ✅ Done | MCQ, short answer, essay |
| Gradebook | ✅ Done | `/dashboard/gradebook` with class-level overview, per-student scores, nav link |
| Question bank | ✅ Done | `/dashboard/question-bank` with MCQ/TF/short/long answer, difficulty levels, subject filtering |
| Online quiz taking | ✅ Done | `/assessments/[id]/take` with timer, MCQ/essay, auto-scoring |
| Report card templates | ✅ Done | `/dashboard/report-cards` with grade calc, attendance summary, print/PDF |
| Transcripts & promotion | ✅ Done | `Transcript` model with grades, promotion status + `/dashboard/transcripts` with create, publish, promote |

### 9) Parent & Student Portals

| Requirement | Status | Gap |
|-------------|--------|-----|
| Parent portal (Guardian) | ✅ Done | `/dashboard/children` with overview, attendance, grades, learning plans, billing |
| Student portal | ✅ Done | `/dashboard/my-learning` with timetable, grades, attendance, learning plans |
| Daily updates/photos | ✅ Done | `/dashboard/daily-updates` — teachers create per-student daily reports (activities, meals, nap, mood, photos); parents view in guardian portal |
| Fee invoices for parents | ✅ Done | Billing tab in guardian portal shows invoices + payment status |

### 10) Communication & Community

| Requirement | Status | Gap |
|-------------|--------|-----|
| Direct messaging | ✅ Done | Send/receive messages |
| Announcements | ✅ Done | Full CRUD page + API route + server actions |
| Email/SMS/Push notifications | ✅ Done | `lib/email.ts` + in-app `Notification` model with multi-channel support (IN_APP, EMAIL, PUSH, SMS); `/dashboard/notifications` center |
| Community/Social Feed | ✅ Done | `/dashboard/community` — posts, comments, likes, media, visibility controls, post types |
| PTA tools | ✅ Done | `lib/actions/pta.ts` with meetings, voting, fundraising using CommunityPost model |
| Consent forms | ✅ Done | `/dashboard/consent` — admin creates forms, parents respond with consent/decline, response tracking |

### 11) Finance: Billing, Fees, Payments

| Requirement | Status | Gap |
|-------------|--------|-----|
| Fee setup & invoicing | ✅ Done | Invoice creation with line items |
| Discounts/scholarships | ✅ Done | `Discount` model with 7 types + `/dashboard/discounts` |
| Installment plans | ✅ Done | `InstallmentPlan` + `InstallmentPayment` models + `/dashboard/installments` |
| Payment gateway (Stripe) | ✅ Done | Checkout + webhook + subscription handling |
| Financial reports | ✅ Done | `/dashboard/reports` with revenue, pending, overdue, collections |
| Payment receipts | ✅ Done | `/dashboard/billing/receipt/[id]` with line items, totals, print support |

### 12–20) HR, Transport, Health, Analytics, Library, Integrations, Mobile, Trust

| Requirement | Status | Gap |
|-------------|--------|-----|
| Staff records & HR | ✅ Done | `StaffRecord` model + `/dashboard/staff` with directory, departments, leave management |
| Leave management | ✅ Done | `LeaveRequest` model + approval/rejection workflow + notifications |
| Curriculum mapping | ✅ Done | `CurriculumMap/Unit/Topic` models + `/dashboard/curriculum` interactive syllabus |
| Question bank | ✅ Done | `QuestionBankItem` model + `/dashboard/question-bank` with filtering |
| Transport | ✅ Done | `TransportRoute` + `TransportStop` + `BusAttendance` models + `/dashboard/transport` |
| Health/Sick bay | ✅ Done | `HealthIncident` model + `/dashboard/health` |
| Library | ✅ Done | `LibraryBook` + `BookLoan` models + `/dashboard/library` with issue, return, search |
| Integrations | ✅ Done | Stripe + Paystack payment gateways, UploadThing file uploads, SMTP email |
| Mobile/PWA | ✅ Done | `manifest.json` + `sw.js` service worker + offline page + push notifications + responsive nav |

---

## PART 3: CRITICAL BUGS TO FIX IMMEDIATELY

1. ~~**`lib/utils.ts`**~~ — ✅ FIXED
2. ~~**Middleware**~~ — ✅ FIXED
3. ~~**Stripe webhook**~~ — ✅ FIXED
4. ~~**Forgot password**~~ — ✅ FIXED
5. ~~**Empty portal pages**~~ — ✅ FIXED

---

## PART 4: IMPLEMENTATION PLAN (Phased)

### Phase 0: Critical Fixes (Week 1) ✅ ALL DONE
- [x] Fix `lib/utils.ts` — add `formatDate`, `calculateAge`, `getInitials`
- [x] Implement real middleware with auth guards + role-based route protection
- [x] Fix Stripe webhook route + uncomment payment reconciliation
- [x] Create forgot-password page + API (password reset email flow)
- [x] Wire dashboard activity feed to real `AuditLog` data
- [x] Wire dashboard events to real schedule/assessment data

### Phase 1: Complete Core Modules (Weeks 2–4) ✅ DONE
- [x] **Guardian Portal** — children dashboard, attendance view, billing view, messaging
- [x] **Student Portal** — timetable, assignments, grades, learning progress
- [x] **Tenant Management** — super admin CRUD for tenants, plan management
- [x] **Announcements** — full CRUD page, targeted audience, API routes
- [x] **Settings backend** — password change API, notification preferences storage, 2FA setup
- [x] **File uploads** — UploadThing file router + API route wired

### Phase 2: Admissions & Enrollment (Weeks 5–6) ✅ DONE
- [x] Admissions model (Application, ApplicationStatus, RequiredDocuments)
- [x] Public admissions portal page
- [x] Application review workflow (admin dashboard)
- [x] Waitlist management — `/dashboard/admissions/waitlist` with position tracking, accept/promote actions
- [x] Document upload during application — UploadThing `applicationDocument` endpoint wired to application form
- [x] E-sign enrollment contracts — `EnrollmentContract` model + `/dashboard/contracts` with create, sign, void

### Phase 3: Enhanced Teaching & Assessment (Weeks 7–8) ✅ DONE
- [x] Student quiz-taking UI (online assessments)
- [x] Gradebook with class-level overview + per-student scores
- [x] Report card templates + PDF generation
- [x] Question bank — `/dashboard/question-bank` with MCQ/TF/short/long, difficulty, filtering
- [x] Lesson planning model + UI
- [x] Assignment submission flow

### Phase 4: Communication & Notifications (Weeks 9–10) ✅ DONE
- [x] Email sending (SMTP integration for notifications)
- [x] In-app notification system — `Notification` model + `/dashboard/notifications` center + bell icon in header
- [x] Community feed — social media-style `/dashboard/community` with posts, comments, likes
- [x] Daily updates — `/dashboard/daily-updates` for teacher→parent activity reports
- [x] Consent forms + acknowledgements — `/dashboard/consent` with create/respond/track
- [x] Push notifications (web push) — `public/sw.js` service worker + `lib/push-notifications.ts` + `/api/push/subscribe` + VAPID key support
- [x] SMS integration (Twilio/Africa's Talking) — `lib/sms.ts` with dual-provider abstraction, bulk SMS support
- [x] Real-time messaging — `lib/realtime.ts` SSE-based pub/sub + `/api/realtime/stream` + `/api/realtime/send`

### Phase 5: Finance Completion (Weeks 11–12) ✅ DONE
- [x] Complete Stripe integration (subscriptions for tenant plans)
- [x] Payment receipts (PDF generation) — `/api/receipts/[id]` renders branded HTML receipt with print/save-as-PDF button, tenant logo, line items, totals, payment status
- [x] Discounts, scholarships, sibling discounts — `Discount` model with 7 types (SCHOLARSHIP, SIBLING_DISCOUNT, STAFF_CHILD, NEED_BASED, EARLY_PAYMENT, PROMOTIONAL, CUSTOM) + `/dashboard/discounts` with CRUD
- [x] Installment plans with auto-reminders — `InstallmentPlan` + `InstallmentPayment` models with 5 frequencies (WEEKLY/BIWEEKLY/MONTHLY/QUARTERLY/TERMLY), auto-generated payment schedule, mark-paid with plan completion detection + server actions
- [x] Financial reports (arrears, cashflow, collections)
- [x] Paystack/Flutterwave integration — `/api/payments/paystack` (transaction init) + `/api/webhooks/paystack` (webhook with HMAC-SHA512 signature verification, payment recording, invoice status update)

### Phase 6: Safety, Health & Operations (Weeks 13–14) ✅ DONE
- [x] QR code check-in/check-out UI (kiosk mode) — `/dashboard/checkin` with scan input, kiosk fullscreen mode, real-time attendance tracking
- [x] Guardian pickup verification — `/dashboard/pickup` with authorized guardian list, canPickup filter, unauthorized attempt logging, pickup log
- [x] Visitor management — `Visitor` model with check-in/out, badge numbers, host tracking + `/dashboard/visitors` with full CRUD
- [x] Sick bay / incident logging — `HealthIncident` model with 9 types, severity levels, parent notification, treatment tracking + `/dashboard/health`
- [x] Room/resource booking UI
- [x] Events calendar

### Phase 7: HR & Transport (Weeks 15–16) ✅ DONE
- [x] Staff records, contracts, certifications — `StaffRecord` model + `/dashboard/staff` with directory, departments
- [x] Leave management — `LeaveRequest` model + approval/rejection workflow with notifications
- [x] Staff attendance — `StaffAttendance` model with check-in/out, 6 statuses + `/dashboard/staff-attendance` with per-staff marking UI
- [x] Transport routes model — `TransportRoute` + `TransportStop` models with driver info, vehicle, capacity, stops with pickup/dropoff times + `/dashboard/transport` with CRUD
- [x] Bus attendance tracking — `BusAttendance` model with PICKUP/DROPOFF direction, 4 statuses (EXPECTED/BOARDED/NO_SHOW/ABSENT), upsert by route+student+date+direction + server actions

### Phase 8: Advanced Analytics & Reporting (Weeks 17–18) ✅ DONE
- [x] Leadership dashboards (enrollment trends, finance, performance) — `/dashboard/analytics/leadership` with 4 tabs: Overview, Enrollment, Finance, Performance + gender distribution, attendance rate, collection rate
- [x] Cohort analytics (by class, gender, subject) — included in leadership dashboard gender distribution + groupBy queries
- [x] Custom report builder — `/dashboard/analytics/reports` with 5 report templates (Students, Attendance, Invoices, Staff, Staff Attendance), date range filters, CSV download via `/api/export`
- [x] Excel/CSV export — `/api/export?type=students|attendance|invoices|staff|staff-attendance` with date range filters, CSV download with proper escaping
- [x] At-risk student early warning — `/dashboard/analytics/at-risk` with attendance-based risk scoring (chronic absenteeism, low attendance, chronic lateness), risk levels (HIGH/MEDIUM/LOW), sortable table

### Phase 9: Platform Hardening (Weeks 19–20) ✅ DONE
- [x] SSO (Google, Microsoft OAuth providers)
- [x] 2FA implementation (TOTP)
- [x] Session/device management — `UserSession` model with device info, browser, OS, IP tracking + revoke actions
- [x] GDPR/FERPA compliance (data export) — `/api/data-export` GET endpoint exports user data, audit logs, sessions as downloadable JSON + `/dashboard/settings/sessions` for session management
- [x] Additional roles (Finance, HR, HoD)
- [x] Feature toggle enforcement in UI + API
- [x] Plan limit enforcement
- [x] Subdomain routing middleware
- [x] Tenant branding — Full portal system with 12 branding fields, 3 login layouts, custom CSS, font selection, TenantThemeProvider
- [x] Custom tenant login portals — `/portal/[subdomain]` with centered/split/fullscreen layouts
- [x] Campus/sub-tenant management — `Campus` model with branding overrides + `/dashboard/campuses`

### Phase 10: Premium & Future Features (Weeks 21+) ✅ MOSTLY DONE
- [x] AI-powered features — `lib/ai.ts` with OpenAI-powered learning narrative generator + copilot suggestions (lesson plans, assessments, feedback, IEP goals) + template fallback
- [x] Offline/PWA support — `public/manifest.json` + `public/sw.js` service worker with cache-first strategy + `/offline` page + layout PWA meta tags
- [ ] Plugin/marketplace architecture — future
- [x] Digital credentials — `/api/certificates` generates branded HTML certificates with print/PDF, unique cert IDs, verification URLs
- [x] Real-time translation — `lib/i18n.ts` with 8 locales (en/fr/es/ar/pt/sw/yo/ha), RTL support, `t()` translation function
- [ ] Voice-to-text observation logging — future (requires Web Speech API integration)

---

## PART 5: UI/UX UPGRADE PRIORITIES

The current UI uses basic shadcn/ui components with minimal styling. To achieve a **modern, premium** look:

1. ~~**Missing UI primitives**~~ — ✅ DONE: Installed Dialog, Popover, Checkbox, Progress, ScrollArea, Command, Calendar, Sheet, Skeleton
2. ~~**Dashboard**~~ — ✅ DONE: `Sparkline` + `KPICard` components (`components/ui/sparkline.tsx`) with trend indicators, inline SVG sparklines.
3. ~~**Navigation**~~ — ✅ DONE: Collapsible sidebar, breadcrumbs component in layout, mobile support.
4. ~~**Tables**~~ — ✅ DONE: `SortableTable` component (`components/ui/sortable-table.tsx`) with column sorting, search, pagination, row selection, bulk delete/export.
5. ~~**Forms**~~ — ✅ DONE: `MultiStepForm` wizard component (`components/ui/multi-step-form.tsx`) with step indicators, validation, back/next navigation.
6. ~~**Empty states**~~ — ✅ DONE: Reusable `EmptyState` component (`components/ui/empty-state.tsx`).
7. ~~**Loading states**~~ — ✅ DONE: Skeleton components (`dashboard-skeleton.tsx`) + `loading.tsx` files for dashboard, students, gradebook.
8. ~~**Responsive design**~~ — ✅ DONE: Collapsible sidebar + mobile overlay nav + PWA manifest for standalone mode.
9. ~~**Dark mode**~~ — ✅ DONE: All new components use `cn()` + Tailwind dark: variants; theme toggle works across all pages.
10. ~~**Animations**~~ — ✅ DONE: `PageTransition`, `FadeIn`, `SlideIn`, `ScaleIn`, `StaggerContainer`, `StaggerItem` components (`components/ui/page-transition.tsx`) using Framer Motion.
