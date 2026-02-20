# OnebitMS - Quick Start Guide

Get OnebitMS running in **5 minutes**! ⚡

## 🚀 Fastest Setup (Using Local SQLite - for testing only)

If you want to test the app quickly without setting up PostgreSQL:

### 1. Install Dependencies

```bash
npm install
```

### 2. Modify Database for SQLite (Temporary)

Edit `prisma/schema.prisma` and change:

```prisma
datasource db {
  provider = "sqlite"  // Changed from postgresql
  url      = "file:./dev.db"
}
```

Comment out or remove these features not supported by SQLite:
- Remove `previewFeatures = ["multiSchema"]`
- Change `@db.Text` to just `String`

### 3. Setup Database

```bash
npx prisma db push
npm run db:seed
```

### 4. Create .env File

```bash
# Copy example
cp .env.example .env
```

Update `.env`:
```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-minimum-32-characters-long"
```

### 5. Run the App

```bash
npm run dev
```

Visit **http://localhost:3000** and login with:
- Email: `admin@demo.com`
- Password: `Admin123!`

---

## 💪 Recommended Setup (PostgreSQL)

For production-ready setup with PostgreSQL:

### Prerequisites

- Node.js 18+ ([Download](https://nodejs.org/))
- PostgreSQL 14+ ([Download](https://www.postgresql.org/download/))

### Step 1: Create PostgreSQL Database

**Windows:**
```bash
# Using pgAdmin or command line
createdb onebitms
```

**Mac/Linux:**
```bash
psql -U postgres
CREATE DATABASE onebitms;
\q
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/onebitms?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-random-secret-with-command-below"
```

**Generate Secret:**
```bash
# Windows PowerShell
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Mac/Linux
openssl rand -base64 32
```

### Step 4: Setup Database

```bash
npm run db:push
npm run db:seed
```

### Step 5: Start Development Server

```bash
npm run dev
```

Open **http://localhost:3000** 🎉

---

## 🔐 Demo Accounts

After running `npm run db:seed`, use these credentials:

### Admin (Full Access)
```
Email: admin@demo.com
Password: Admin123!
```

### Teacher
```
Email: sarah.johnson@demo.com
Password: Teacher123!
```

### Guardian/Parent
```
Email: jennifer.williams@example.com
Password: Guardian123!
```

### Student
```
Email: emma.williams@demo.com
Password: Student123!
```

---

## 🎯 What's Included After Seeding

- ✅ 1 Demo School Tenant
- ✅ 4 User Roles with Accounts
- ✅ 3 Teachers
- ✅ 4 Classes (K-3rd Grade)
- ✅ 5 Students with Complete Profiles
- ✅ 5 Guardians (Parents)
- ✅ 10 Days of Attendance Records
- ✅ Sample Assessments & Results
- ✅ Sample Invoices
- ✅ Announcements

---

## 📱 Explore the Platform

### As Admin
1. View Dashboard Overview
2. Browse All Students
3. Manage Classes & Teachers
4. View Analytics
5. Configure Settings

### As Teacher
1. View Class Roster
2. Mark Attendance
3. Create Learning Plans
4. Grade Assessments
5. Message Parents

### As Guardian
1. View Your Children
2. Check Attendance
3. See Assessment Results
4. Pay Invoices
5. Message Teachers

---

## 🛠️ Common Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# View database in browser
npm run db:studio

# Reset database (WARNING: Deletes all data)
npx prisma migrate reset

# Reseed database
npm run db:seed
```

---

## 🔍 View & Edit Database

Open Prisma Studio to see your data:

```bash
npm run db:studio
```

Access at **http://localhost:5555**

---

## ⚡ Next Steps

1. **Create your own school** - Sign up at `/signup`
2. **Add real students** - Go to Dashboard → Students → Add
3. **Set up classes** - Dashboard → Classes
4. **Configure attendance** - Dashboard → Attendance
5. **Create assessments** - Dashboard → Assessments

---

## 🚨 Troubleshooting

### Port 3000 Already in Use
```bash
npx kill-port 3000
# Or
PORT=3001 npm run dev
```

### Database Connection Failed
```bash
# Check PostgreSQL is running
# Windows: services.msc
# Mac: brew services list
# Linux: sudo systemctl status postgresql

# Test connection
npx prisma db pull
```

### Cannot Find Module Errors
```bash
rm -rf node_modules package-lock.json
npm install
```

### Prisma Client Errors
```bash
npx prisma generate
npm run dev
```

---

## 📚 Documentation

- **[Full Setup Guide](SETUP.md)** - Detailed installation
- **[Architecture](ARCHITECTURE.md)** - System design
- **[README](README.md)** - Project overview

---

## 🆘 Need Help?

- Check [SETUP.md](SETUP.md) for detailed instructions
- Review [Troubleshooting](#-troubleshooting) section
- Open an issue on GitHub
- Email: support@onebitms.com

---

## 🎉 You're All Set!

Your school management system is ready to use. Start by exploring the dashboard and creating your first student!

**Happy Managing! 📚**
