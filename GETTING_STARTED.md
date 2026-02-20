# 🚀 Getting Started with OnebitMS

Welcome to **OnebitMS** - Your complete School Management System!

## ⚡ Quick Installation (5 Minutes)

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Configure Environment

```bash
# Copy environment template
cp .env.example .env
```

**Edit `.env` file:**

```env
# Database URL (replace with your PostgreSQL connection string)
DATABASE_URL="postgresql://postgres:password@localhost:5432/onebitms"

# NextAuth (generate secret with: openssl rand -base64 32)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-32-character-secret-here"
```

### Step 3: Initialize Database

```bash
# Create tables
npm run db:push

# Add demo data
npm run db:seed
```

### Step 4: Start Development Server

```bash
npm run dev
```

🎉 **Open http://localhost:3000**

---

## 🔑 Demo Login Credentials

After seeding, use these accounts:

### 👨‍💼 Admin Account
```
Email: admin@demo.com
Password: Admin123!
Access: Full system administration
```

### 👨‍🏫 Teacher Account
```
Email: sarah.johnson@demo.com
Password: Teacher123!
Access: Class management, grading, attendance
```

### 👪 Parent/Guardian Account
```
Email: jennifer.williams@example.com
Password: Guardian123!
Access: View children, grades, payments
```

### 🎓 Student Account
```
Email: emma.williams@demo.com
Password: Student123!
Access: View assignments, grades, schedule
```

---

## 📂 What You Get Out of the Box

After seeding, your database includes:

- ✅ **1 School** (Lincoln Elementary)
- ✅ **4 User Roles** with sample accounts
- ✅ **3 Teachers** 
- ✅ **4 Classes** (K through 3rd grade)
- ✅ **5 Students** with complete profiles
- ✅ **5 Guardians** linked to students
- ✅ **10 Days** of attendance records
- ✅ **Sample Assessments** with results
- ✅ **Sample Invoices** and billing
- ✅ **Announcements** 

---

## 🎯 First Steps After Login

### As Admin:

1. **Dashboard** → View school overview
2. **Students** → Browse all enrolled students
3. **Classes** → View class structure
4. **Analytics** → See attendance rates, performance
5. **Settings** → Configure your school

### As Teacher:

1. **Dashboard** → See your classes
2. **Students** → View students in your classes
3. **Attendance** → Mark daily attendance
4. **Assessments** → Create and grade tests
5. **Messages** → Communicate with parents

### As Guardian:

1. **My Children** → View your kids
2. **Attendance** → Check attendance history
3. **Grades** → See assessment results
4. **Billing** → View and pay invoices
5. **Messages** → Contact teachers

---

## 🛠️ Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# View database
npm run db:studio

# Generate Prisma client
npm run db:generate

# Reset database (⚠️ Deletes all data)
npx prisma migrate reset

# Reseed database
npm run db:seed
```

---

## 📱 Key Features Available

### ✅ Currently Implemented

- [x] Multi-tenant architecture
- [x] User authentication & authorization
- [x] Role-based access control
- [x] Student management
- [x] Guardian relationships
- [x] Dashboard with statistics
- [x] Database with 40+ models
- [x] Responsive UI with Tailwind

### 🚧 Database-Ready (UI Pending)

- [ ] Attendance marking interface
- [ ] Learning plan creation
- [ ] Assessment builder
- [ ] Billing & payment forms
- [ ] Messaging interface
- [ ] Schedule management
- [ ] Analytics charts
- [ ] Reports generation

---

## 🔍 Exploring the Codebase

### Key Directories

```
SMS/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Login, Signup pages
│   ├── (dashboard)/       # Dashboard pages
│   └── api/               # API routes
│
├── components/
│   ├── ui/                # Reusable UI components
│   ├── dashboard/         # Dashboard components
│   └── students/          # Student-specific components
│
├── lib/
│   ├── validations/       # Zod schemas
│   ├── auth.ts           # NextAuth config
│   ├── prisma.ts         # Database client
│   └── utils.ts          # Utilities
│
└── prisma/
    ├── schema.prisma      # Database models
    └── seed.ts           # Demo data
```

---

## 🎨 UI Components Available

Built with **shadcn/ui**:

- Button, Input, Label
- Card, Badge, Avatar
- Table, Tabs
- Dropdown Menu
- Toast Notifications
- Form Components
- And more...

---

## 🔐 Security Features

- ✅ Secure password hashing (bcrypt)
- ✅ JWT session tokens
- ✅ Multi-tenant data isolation
- ✅ Protected routes
- ✅ RBAC authorization
- ✅ SQL injection prevention
- ✅ XSS protection

---

## 📊 Database Models

40+ interconnected models including:

**Core:**
- Tenant, User, Account, Session

**Academic:**
- Student, Teacher, Class
- IndividualLearningPlan
- Assessment, AssessmentResult

**Operations:**
- AttendanceRecord
- Schedule, Room
- Invoice, Payment

**Communication:**
- Message, Announcement
- Observation

---

## 🚨 Troubleshooting

### Database Connection Failed

```bash
# Verify PostgreSQL is running
# Windows: Check services.msc
# Mac: brew services list
# Linux: sudo systemctl status postgresql

# Test connection
npx prisma db pull
```

### Port 3000 Already in Use

```bash
# Windows
npx kill-port 3000

# Or use different port
PORT=3001 npm run dev
```

### Module Not Found

```bash
rm -rf node_modules package-lock.json
npm install
npx prisma generate
```

### Prisma Client Errors

```bash
npx prisma generate
npm run dev
```

---

## 📚 Documentation

- **[QUICKSTART.md](QUICKSTART.md)** - Fast setup guide
- **[SETUP.md](SETUP.md)** - Detailed installation
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System design
- **[PROJECT_STATUS.md](PROJECT_STATUS.md)** - Current state
- **[README.md](README.md)** - Project overview

---

## 🎓 Learning Path

### Day 1: Setup & Explore
- Install and run the project
- Login with different roles
- Explore the dashboard
- Browse students and classes

### Day 2: Understand Structure
- Review database schema
- Explore component structure
- Check API routes
- Read authentication flow

### Day 3: Customize
- Modify theme colors
- Add new fields to models
- Create custom reports
- Add new pages

### Week 2+: Build Features
- Implement attendance UI
- Build assessment forms
- Create analytics charts
- Add payment integration

---

## 🤝 Need Help?

- 📖 Check documentation files
- 🐛 Review error messages carefully
- 🔍 Search in code for examples
- 💬 Open GitHub issue

---

## 🎉 You're Ready!

Your OnebitMS installation is complete and ready for development.

**Next Steps:**
1. Login and explore the dashboard
2. Browse through the demo data
3. Check out the documentation
4. Start building custom features!

**Happy Coding! 🚀**

---

*OnebitMS - Modern School Management Made Simple*
