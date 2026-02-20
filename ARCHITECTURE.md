# OnebitMS Architecture Documentation

## System Overview

OnebitMS is a modern, multi-tenant SaaS platform built using a monolithic architecture with clear separation of concerns.

## Technology Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Library**: shadcn/ui (Radix UI primitives)
- **Icons**: Lucide React
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod validation
- **Data Fetching**: React Server Components + Server Actions

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Next.js API Routes & Server Actions
- **Database**: PostgreSQL 14+
- **ORM**: Prisma
- **Authentication**: NextAuth.js v4
- **File Upload**: UploadThing
- **Payments**: Stripe

### Infrastructure
- **Hosting**: Vercel (recommended) or any Node.js host
- **Database**: Vercel Postgres, Supabase, or Neon
- **Storage**: S3-compatible or UploadThing
- **CDN**: Vercel Edge Network

## Multi-Tenancy Architecture

### Tenant Isolation Strategy

OnebitMS uses **Row-Level Security (RLS)** for tenant isolation:

1. **Database Level**: Every tenant-specific table has a `tenantId` column
2. **Application Level**: All queries are filtered by `tenantId`
3. **Session Level**: User's `tenantId` is stored in JWT session
4. **Middleware**: Automatic tenant context injection

### Data Model

```
Tenant (1) ──→ (N) Users
           ──→ (N) Students
           ──→ (N) Classes
           ──→ (N) Guardians
           ──→ (N) Invoices
           ──→ (N) Messages
```

### Subdomain Routing

Each tenant gets a unique subdomain:
- `lincoln.onebitms.com` → Lincoln Elementary
- `demo.onebitms.com` → Demo School

Alternatively, custom domains are supported:
- `sms.lincolnschool.edu` → Lincoln Elementary

## Security Architecture

### Authentication Flow

```
1. User enters credentials
2. NextAuth validates against database
3. Password hashed with bcrypt (10 rounds)
4. JWT token generated with user + tenant info
5. Token stored in secure HTTP-only cookie
6. All requests authenticated via middleware
```

### Authorization (RBAC)

**Role Hierarchy:**
```
SUPER_ADMIN (Platform operator)
    ↓
TENANT_ADMIN (School administrator)
    ↓
TEACHER (Educator)
    ↓
GUARDIAN (Parent)
    ↓
STUDENT (Learner)
```

**Permission Matrix:**

| Resource | Super Admin | Tenant Admin | Teacher | Guardian | Student |
|----------|-------------|--------------|---------|----------|---------|
| Tenants  | CRUD | Read | - | - | - |
| Users | CRUD | CRUD (own) | Read (class) | Read (children) | Read (self) |
| Students | CRUD | CRUD | CRUD | Read (children) | Read (self) |
| Classes | CRUD | CRUD | Read/Update | Read | Read |
| Assessments | CRUD | CRUD | CRUD | Read | Read (own) |
| Billing | CRUD | CRUD | - | Read/Pay | - |

### Data Encryption

- **At Rest**: AES-256 (database level)
- **In Transit**: TLS 1.3
- **Passwords**: bcrypt with salt
- **Sensitive Fields**: Additional app-level encryption
- **API Keys**: Stored in environment variables

### Audit Logging

All critical operations are logged:
```typescript
{
  tenantId: string
  userId: string
  action: "CREATE" | "UPDATE" | "DELETE" | "LOGIN"
  entity: string // Model name
  entityId: string
  oldValues: JSON
  newValues: JSON
  timestamp: Date
  ipAddress: string
  userAgent: string
}
```

## Database Schema

### Core Models

```
┌─────────────┐
│   Tenant    │ ← Multi-tenant root
└─────────────┘
      ↓
┌─────────────┐
│    User     │ ← Authentication
└─────────────┘
      ↓ (role-based)
┌─────────────────────────────────┐
│ Teacher | Guardian | Student    │ ← Role-specific profiles
└─────────────────────────────────┘
```

### Key Relationships

- **One Tenant** → Many Users, Students, Classes
- **One Student** → Many Guardians (M:N via StudentGuardian)
- **One Student** → Many Learning Plans
- **One Class** → Many Students, Teachers
- **One Assessment** → Many Results

### Indexing Strategy

Performance-critical indexes:
```sql
CREATE INDEX idx_student_tenant ON students(tenant_id);
CREATE INDEX idx_student_class ON students(current_class_id);
CREATE INDEX idx_attendance_date ON attendance_records(date);
CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_tenant_subdomain ON tenants(subdomain);
```

## API Architecture

### Server Actions

OnebitMS uses Next.js Server Actions for data mutations:

```typescript
// app/actions/students.ts
"use server"

export async function createStudent(data: StudentInput) {
  const session = await getServerSession()
  // Validate permissions
  // Create student
  // Return result
}
```

### API Routes

RESTful API routes for external integrations:

```
POST /api/tenants/create      - Create new tenant
POST /api/auth/[...nextauth]  - Authentication
GET  /api/students/:id         - Get student
POST /api/attendance/mark     - Mark attendance
```

## Component Architecture

### Folder Structure

```
app/
├── (auth)/              # Auth pages (login, signup)
├── (dashboard)/         # Dashboard layout
│   └── dashboard/       # Dashboard pages
├── api/                 # API routes
└── globals.css          # Global styles

components/
├── ui/                  # shadcn/ui components
├── dashboard/           # Dashboard-specific
├── students/            # Student management
└── providers/           # Context providers

lib/
├── actions/             # Server actions
├── hooks/               # React hooks
├── validations/         # Zod schemas
├── utils.ts             # Utilities
├── prisma.ts            # Prisma client
└── auth.ts              # Auth config

prisma/
├── schema.prisma        # Database schema
└── seed.ts              # Seed data
```

### Component Patterns

**Server Components (Default):**
```typescript
// Fetch data directly
async function StudentsPage() {
  const students = await getStudents()
  return <StudentsTable students={students} />
}
```

**Client Components:**
```typescript
"use client"

// Interactive features
export function StudentForm() {
  const [isLoading, setIsLoading] = useState(false)
  // Form logic
}
```

## Performance Optimization

### Caching Strategy

1. **Static Pages**: Landing page, docs (ISG)
2. **Dynamic Pages**: Dashboard (SSR with cache)
3. **API Routes**: Redis caching for expensive queries
4. **Images**: Next.js Image optimization

### Database Optimization

- Connection pooling (Prisma)
- Query optimization with indexes
- Pagination for large datasets
- Lazy loading for related data

### Frontend Optimization

- Code splitting (automatic with Next.js)
- Lazy loading components
- Image optimization
- Font optimization (next/font)

## Monitoring & Observability

### Metrics to Track

- **Performance**: Page load time, API response time
- **Errors**: Error rate, error types
- **Business**: Active tenants, user signups, attendance rate
- **Database**: Query performance, connection pool

### Recommended Tools

- **Logging**: Vercel Logs, Logtail
- **Errors**: Sentry
- **Analytics**: Vercel Analytics, Google Analytics
- **Uptime**: Uptime Robot, Pingdom

## Scalability Considerations

### Horizontal Scaling

- Stateless architecture (JWT auth)
- Database connection pooling
- CDN for static assets
- Load balancing (Vercel Edge)

### Vertical Scaling

- Database read replicas
- Caching layer (Redis)
- Background job processing
- Queue system for heavy operations

## Development Workflow

### Local Development

```bash
1. npm install
2. npm run db:push
3. npm run db:seed
4. npm run dev
```

### CI/CD Pipeline

```
1. Push to GitHub
2. Vercel auto-deploys
3. Run migrations
4. Health checks
5. Go live
```

## Future Enhancements

### Planned Features

1. **Real-time Features**: WebSocket for live updates
2. **Mobile Apps**: React Native
3. **AI/ML**: Predictive analytics
4. **Integrations**: Google Classroom, Microsoft Teams
5. **Advanced Reporting**: PDF generation
6. **Multilingual**: i18n support

### Technical Improvements

1. Microservices for heavy modules
2. GraphQL API
3. Event-driven architecture
4. Serverless functions for background jobs
5. Advanced caching strategies

---

**Version**: 1.0.0  
**Last Updated**: 2025-01-18
