# 📦 OnebitMS Installation Instructions

Complete step-by-step installation guide for Windows, Mac, and Linux.

---

## 🖥️ Windows Installation

### 1. Install Prerequisites

**Node.js:**
- Download from https://nodejs.org/
- Install LTS version (18.x or higher)
- Verify: `node --version` and `npm --version`

**PostgreSQL:**
- Download from https://www.postgresql.org/download/windows/
- Run installer, remember your password
- Verify: Open pgAdmin 4

### 2. Setup PostgreSQL Database

**Option A: Using pgAdmin**
1. Open pgAdmin 4
2. Right-click "Databases" → Create → Database
3. Name: `onebitms`
4. Click Save

**Option B: Using Command Line**
```cmd
psql -U postgres
CREATE DATABASE onebitms;
\q
```

### 3. Clone/Download Project

```cmd
cd C:\Users\YourName\Projects
# Or download and extract ZIP
```

### 4. Install Dependencies

```cmd
cd SMS
npm install
```

### 5. Configure Environment

```cmd
copy .env.example .env
notepad .env
```

Update DATABASE_URL:
```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/onebitms?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-generated-secret"
```

**Generate Secret (PowerShell):**
```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 6. Initialize Database

```cmd
npm run db:push
npm run db:seed
```

### 7. Start Application

```cmd
npm run dev
```

Open: **http://localhost:3000**

---

## 🍎 macOS Installation

### 1. Install Prerequisites

**Homebrew (if not installed):**
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

**Node.js:**
```bash
brew install node
node --version
npm --version
```

**PostgreSQL:**
```bash
brew install postgresql@14
brew services start postgresql@14
```

### 2. Setup Database

```bash
createdb onebitms
# Or
psql postgres
CREATE DATABASE onebitms;
\q
```

### 3. Install Project

```bash
cd ~/Projects
# Clone or download
cd SMS
npm install
```

### 4. Configure Environment

```bash
cp .env.example .env
nano .env
# Or use: code .env
```

Update `.env`:
```env
DATABASE_URL="postgresql://YOUR_USERNAME@localhost:5432/onebitms?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
```

**Generate Secret:**
```bash
openssl rand -base64 32
```

### 5. Initialize & Run

```bash
npm run db:push
npm run db:seed
npm run dev
```

Open: **http://localhost:3000**

---

## 🐧 Linux Installation (Ubuntu/Debian)

### 1. Install Prerequisites

**Node.js:**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
node --version
npm --version
```

**PostgreSQL:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 2. Setup Database

```bash
sudo -u postgres psql
CREATE DATABASE onebitms;
CREATE USER onebitms_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE onebitms TO onebitms_user;
\q
```

### 3. Install Project

```bash
cd ~/projects
# Download/clone project
cd SMS
npm install
```

### 4. Configure Environment

```bash
cp .env.example .env
nano .env
```

Update `.env`:
```env
DATABASE_URL="postgresql://onebitms_user:your_password@localhost:5432/onebitms?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"
```

**Generate Secret:**
```bash
openssl rand -base64 32
```

### 5. Initialize & Run

```bash
npm run db:push
npm run db:seed
npm run dev
```

Open: **http://localhost:3000**

---

## 🐳 Docker Installation (Optional)

### Using Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:14
    environment:
      POSTGRES_DB: onebitms
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: "postgresql://postgres:postgres@postgres:5432/onebitms"
      NEXTAUTH_SECRET: "your-secret-here"
      NEXTAUTH_URL: "http://localhost:3000"
    depends_on:
      - postgres

volumes:
  postgres_data:
```

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npx prisma generate

EXPOSE 3000

CMD ["npm", "run", "dev"]
```

**Run:**
```bash
docker-compose up
```

---

## ☁️ Cloud Database Setup

### Vercel Postgres

1. Sign up at https://vercel.com
2. Create new project
3. Go to Storage → Create Database
4. Select Postgres
5. Copy connection string to `.env`

### Supabase

1. Sign up at https://supabase.com
2. Create new project
3. Go to Settings → Database
4. Copy connection string
5. Update `.env` with direct connection URL

### Railway

1. Sign up at https://railway.app
2. New Project → Provision PostgreSQL
3. Copy DATABASE_URL
4. Update `.env`

---

## 🔧 Troubleshooting

### "Module not found" errors
```bash
rm -rf node_modules package-lock.json
npm install
npx prisma generate
```

### Database connection failed
```bash
# Check PostgreSQL is running
# Windows: services.msc
# Mac: brew services list
# Linux: sudo systemctl status postgresql

# Test connection
npx prisma db pull
```

### Port 3000 already in use
```bash
# Windows
npx kill-port 3000

# Mac/Linux
lsof -ti:3000 | xargs kill

# Or use different port
PORT=3001 npm run dev
```

### Prisma errors
```bash
npx prisma generate
npx prisma db push --force-reset
npm run db:seed
```

### Can't find .env file
```bash
# Make sure it's in root directory
ls -la .env

# If missing
cp .env.example .env
```

---

## ✅ Verify Installation

Run these checks:

```bash
# 1. Dependencies installed
npm list --depth=0

# 2. Prisma client generated
ls node_modules/.prisma

# 3. Database accessible
npm run db:studio

# 4. Server starts
npm run dev
```

Expected output:
```
✓ Ready in 2.1s
○ Local:    http://localhost:3000
```

---

## 🎯 Post-Installation

### 1. Login
- Open http://localhost:3000
- Click "Login"
- Use: admin@demo.com / Admin123!

### 2. Explore Dashboard
- View statistics
- Browse students
- Check attendance
- Explore features

### 3. Create Your School
- Sign up with your email
- Create your school tenant
- Customize settings
- Add real students

---

## 🔐 Security Recommendations

**Before Production:**

1. **Change all passwords**
   ```bash
   # Update in database or re-seed with custom passwords
   ```

2. **Use strong NEXTAUTH_SECRET**
   ```bash
   openssl rand -base64 64
   ```

3. **Enable SSL/HTTPS**
   - Use Let's Encrypt
   - Configure reverse proxy

4. **Set up environment-specific configs**
   - `.env.development`
   - `.env.production`

5. **Configure CORS**
   ```typescript
   // next.config.mjs
   headers: async () => [{
     source: '/api/:path*',
     headers: [/* your CORS headers */]
   }]
   ```

---

## 📊 Database Management

### View Data (Prisma Studio)
```bash
npm run db:studio
# Opens at http://localhost:5555
```

### Reset Database
```bash
# ⚠️ WARNING: Deletes all data
npx prisma migrate reset
npm run db:seed
```

### Backup Database
```bash
# PostgreSQL
pg_dump -U postgres onebitms > backup.sql

# Restore
psql -U postgres onebitms < backup.sql
```

---

## 🚀 Production Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Set environment variables in Vercel dashboard
```

### Other Platforms

**Railway:**
- Connect GitHub repo
- Add PostgreSQL addon
- Set environment variables
- Deploy

**Render:**
- Create Web Service
- Connect repo
- Add PostgreSQL database
- Deploy

**AWS/DigitalOcean:**
- Use Next.js standalone build
- Configure PostgreSQL
- Set up reverse proxy
- Deploy

---

## 🆘 Getting Help

**Common Issues:**
- Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
- Review error messages
- Check PostgreSQL logs
- Verify Node.js version

**Resources:**
- [QUICKSTART.md](QUICKSTART.md)
- [SETUP.md](SETUP.md)
- [GETTING_STARTED.md](GETTING_STARTED.md)

**Support:**
- GitHub Issues
- support@onebitms.com

---

## ✨ Success!

If you can:
- ✅ Login with demo credentials
- ✅ See the dashboard
- ✅ View students list
- ✅ Navigate between pages

**Your installation is complete! 🎉**

Start building your school management system!

---

*OnebitMS v1.0.0*  
*Installation Guide - 2025*
