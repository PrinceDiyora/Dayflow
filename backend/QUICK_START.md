# Quick Start Guide - Dayflow HRMS Backend

## Step-by-Step Setup (Windows PowerShell)

### 1. Navigate to Backend Folder

```powershell
cd backend
```

### 2. Install Dependencies

```powershell
npm install
```

**Wait for all packages to install** (this may take a few minutes)

### 3. Create Environment File

Create a file named `.env` in the `backend` folder with this content:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/dayflow_hrms?schema=public"
JWT_SECRET="dayflow-hrms-super-secret-jwt-key-2024-change-in-production"
JWT_EXPIRES_IN="7d"
PORT=5000
NODE_ENV=development
FRONTEND_URL="http://localhost:5173"
```

**Important:** 
- Replace `postgres:password` with your PostgreSQL username and password
- If using Docker PostgreSQL, use: `postgresql://postgres:password@localhost:5432/dayflow_hrms?schema=public`

### 4. Set Up PostgreSQL Database

**Option A: Using Docker (Recommended)**

```powershell
docker run --name dayflow-postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=dayflow_hrms -p 5432:5432 -d postgres:14
```

**Option B: Using Local PostgreSQL**

1. Open PostgreSQL (pgAdmin or psql)
2. Create a new database named `dayflow_hrms`
3. Update `DATABASE_URL` in `.env` with your credentials

### 5. Generate Prisma Client

```powershell
npm run prisma:generate
```

### 6. Create Database Tables (Migration)

```powershell
npm run prisma:migrate
```

When prompted for a migration name, type: `init` and press Enter

### 7. Seed Database with Sample Data

```powershell
npm run prisma:seed
```

You should see:
```
✅ Created admin user: admin@dayflow.com
✅ Created employee user: employee@dayflow.com
✅ Created sample attendance records
✅ Created sample leave request
✅ Created sample payroll record
✅ Created sample payslip
🎉 Seeding completed!
```

### 8. Start the Server

```powershell
npm run dev
```

You should see:
```
🚀 Dayflow HRMS Backend running on http://localhost:5000
📊 Health check: http://localhost:5000/health
```

### 9. Test the API

Open a new PowerShell window and test:

```powershell
# Health check
curl http://localhost:5000/health

# Or use Invoke-WebRequest (PowerShell native)
Invoke-WebRequest -Uri http://localhost:5000/health
```

### 10. Update Frontend to Use Real Backend

In the root folder (not backend), update `.env`:

```env
VITE_API_URL=http://localhost:5000
VITE_USE_MOCK=false
```

## Troubleshooting

### Error: "prisma is not recognized"

**Solution:** Make sure you ran `npm install` first. Then use `npx`:

```powershell
npx prisma generate
```

### Error: "tsx is not recognized"

**Solution:** Install dependencies:

```powershell
npm install
```

### Error: Database Connection Failed

**Check:**
1. PostgreSQL is running
2. Database `dayflow_hrms` exists
3. `DATABASE_URL` in `.env` is correct
4. Username and password are correct

**Test connection:**
```powershell
# If you have psql installed
psql -U postgres -d dayflow_hrms
```

### Error: Port 5000 Already in Use

**Solution:** Change PORT in `.env` to another port (e.g., 5001)

### Reset Everything

If something goes wrong, reset:

```powershell
# Stop the server (Ctrl+C)
# Then:
npm run db:reset
npm run prisma:seed
```

## Default Login Credentials

After seeding:

- **Admin:** `admin@dayflow.com` / `password`
- **Employee:** `employee@dayflow.com` / `password`

## Next Steps

1. ✅ Backend is running
2. ✅ Database is seeded
3. ✅ Update frontend `.env` to use real backend
4. ✅ Start frontend: `npm run dev` (in root folder)
5. ✅ Login and test!

## View Database

To view/edit database in a GUI:

```powershell
npm run prisma:studio
```

Opens at `http://localhost:5555`

