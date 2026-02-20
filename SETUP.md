# OnebitMS Setup Guide

Complete setup instructions for the OnebitMS School Management System.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.0.0 or higher ([Download](https://nodejs.org/))
- **PostgreSQL** 14 or higher ([Download](https://www.postgresql.org/download/))
- **Git** ([Download](https://git-scm.com/))
- **npm** or **pnpm** (comes with Node.js)

## Step 1: Database Setup

### Option A: Local PostgreSQL

1. Install PostgreSQL on your machine
2. Create a new database:

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE onebitms;

# Create user (optional)
CREATE USER onebitms_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE onebitms TO onebitms_user;

# Exit
\q
```

### Option B: Cloud Database (Recommended for Production)

Use one of these providers:
- **Vercel Postgres**: [https://vercel.com/docs/storage/vercel-postgres](https://vercel.com/docs/storage/vercel-postgres)
- **Supabase**: [https://supabase.com/](https://supabase.com/)
- **Neon**: [https://neon.tech/](https://neon.tech/)
- **Railway**: [https://railway.app/](https://railway.app/)

## Step 2: Environment Configuration

1. Copy the example environment file:

```bash
cp .env.example .env
```

2. Update `.env` with your configuration:

```env
# Database Connection
DATABASE_URL="postgresql://username:password@localhost:5432/onebitms?schema=public"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-a-random-secret-here"

# Generate secret with:
# openssl rand -base64 32
```

### Generate NEXTAUTH_SECRET

**Windows (PowerShell):**
```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Mac/Linux:**
```bash
openssl rand -base64 32
```

## Step 3: Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Next.js 14
- Prisma
- NextAuth
- Tailwind CSS
- shadcn/ui components
- and more...

## Step 4: Database Migration

Run Prisma migrations to create all database tables:

```bash
# Push the schema to database
npm run db:push

# Generate Prisma Client
npm run db:generate
```

## Step 5: Seed the Database (Optional but Recommended)

Populate the database with demo data for testing:

```bash
npm run db:seed
```

This creates:
- 1 Demo tenant (Lincoln Elementary School)
- 1 Admin user
- 3 Teachers
- 4 Classes
- 5 Students with guardians
- Sample attendance records
- Sample assessments and results
- Sample invoices

### Demo Credentials

After seeding, you can login with:

**Admin Account:**
- Email: `admin@demo.com`
- Password: `Admin123!`

**Teacher Account:**
- Email: `sarah.johnson@demo.com`
- Password: `Teacher123!`

**Guardian Account:**
- Email: `jennifer.williams@example.com`
- Password: `Guardian123!`

**Student Account:**
- Email: `emma.williams@demo.com`
- Password: `Student123!`

## Step 6: Run Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

## Step 7: View Database (Optional)

To view and manage your database with Prisma Studio:

```bash
npm run db:studio
```

This opens a web interface at [http://localhost:5555](http://localhost:5555)

## Optional Services Configuration

### UploadThing (File Uploads)

1. Sign up at [https://uploadthing.com](https://uploadthing.com)
2. Create a new app
3. Add to `.env`:

```env
UPLOADTHING_SECRET="your-secret"
UPLOADTHING_APP_ID="your-app-id"
```

### Stripe (Payments)

1. Sign up at [https://stripe.com](https://stripe.com)
2. Get your API keys from the dashboard
3. Add to `.env`:

```env
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

### Email (SMTP)

For sending emails (optional):

```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
```

## Production Deployment

### Deploy to Vercel (Recommended)

1. Install Vercel CLI:

```bash
npm i -g vercel
```

2. Login and deploy:

```bash
vercel login
vercel
```

3. Add environment variables in Vercel dashboard
4. Connect your PostgreSQL database
5. Deploy!

### Deploy to Other Platforms

OnebitMS can be deployed to:
- **Netlify**
- **AWS Amplify**
- **Railway**
- **Render**
- **DigitalOcean App Platform**

Ensure you:
1. Set all environment variables
2. Use Node.js 18+
3. Run build command: `npm run build`
4. Start command: `npm run start`

## Troubleshooting

### Database Connection Issues

```bash
# Test connection
npx prisma db pull

# Reset database (WARNING: Deletes all data)
npx prisma migrate reset
```

### Clear Next.js Cache

```bash
rm -rf .next
npm run dev
```

### Prisma Issues

```bash
# Regenerate Prisma Client
npx prisma generate

# Reset and reseed
npx prisma migrate reset
npm run db:seed
```

### Port Already in Use

```bash
# Kill process on port 3000 (Windows)
npx kill-port 3000

# Or use a different port
PORT=3001 npm run dev
```

## Development Tips

1. **Hot Reload**: Changes to code automatically refresh the browser
2. **Prisma Studio**: Great for viewing/editing database data
3. **TypeScript**: Use VS Code for best TypeScript experience
4. **Tailwind IntelliSense**: Install Tailwind CSS IntelliSense extension for VS Code

## Next Steps

1. Explore the dashboard at `/dashboard`
2. Create your first student
3. Set up classes and teachers
4. Configure attendance system
5. Customize tenant settings
6. Set up payment gateway
7. Enable real-time features

## Support

For issues or questions:
- Check the [Documentation](README.md)
- Open an issue on GitHub
- Contact support@onebitms.com

## Security Notes

⚠️ **Important for Production:**

1. **Change all default passwords**
2. **Use strong NEXTAUTH_SECRET**
3. **Enable SSL/TLS**
4. **Configure CORS properly**
5. **Set up backup strategy**
6. **Enable audit logging**
7. **Use environment-specific configs**
8. **Never commit `.env` to git**

---

**Happy Building! 🎉**
