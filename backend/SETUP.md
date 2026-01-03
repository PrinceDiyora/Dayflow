# Dayflow HRMS Backend - Setup Guide

## Prerequisites

1. **PostgreSQL** (14 or higher)
   - Install from: https://www.postgresql.org/download/
   - Or use Docker: `docker run --name dayflow-postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=dayflow_hrms -p 5432:5432 -d postgres:14`

2. **Node.js** (18 or higher)
   - Install from: https://nodejs.org/

## Quick Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment

Create a `.env` file in the `backend` folder:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/dayflow_hrms?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-in-production-min-32-chars"
JWT_EXPIRES_IN="7d"
PORT=5000
NODE_ENV=development
FRONTEND_URL="http://localhost:5173"
```

**Important:** Replace `postgres:password` with your PostgreSQL credentials.

### 3. Set Up Database

```bash
# Generate Prisma Client
npm run prisma:generate

# Create database (if it doesn't exist)
# In PostgreSQL:
# CREATE DATABASE dayflow_hrms;

# Run migrations to create tables
npm run prisma:migrate

# Seed database with sample data
npm run prisma:seed
```

### 4. Start Development Server

```bash
npm run dev
```

The API will be running at `http://localhost:5000`

### 5. Test the API

```bash
# Health check
curl http://localhost:5000/health

# Login (get token)
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@dayflow.com","password":"password"}'
```

## Database Management

### View Database in Prisma Studio

```bash
npm run prisma:studio
```

Opens a GUI at `http://localhost:5555` to view and edit data.

### Reset Database

```bash
npm run db:reset
```

This will:
- Drop all tables
- Run migrations
- Seed with sample data

### Create New Migration

```bash
npm run prisma:migrate
```

## Default Test Users

After seeding, you can login with:

**Admin:**
- Email: `admin@dayflow.com`
- Password: `password`

**Employee:**
- Email: `employee@dayflow.com`
- Password: `password`

## Connecting Frontend

Update your frontend `.env` file:

```env
VITE_API_URL=http://localhost:5000
VITE_USE_MOCK=false
```

## Troubleshooting

### Database Connection Error

- Check PostgreSQL is running: `pg_isready`
- Verify DATABASE_URL in `.env` is correct
- Ensure database exists: `psql -U postgres -l`

### Port Already in Use

Change PORT in `.env` or kill the process:
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:5000 | xargs kill
```

### Prisma Client Not Generated

```bash
npm run prisma:generate
```

### Migration Issues

```bash
# Reset and re-run migrations
npm run db:reset
```

## Production Deployment

1. Set `NODE_ENV=production` in `.env`
2. Use a strong `JWT_SECRET` (32+ characters)
3. Update `DATABASE_URL` to production database
4. Build: `npm run build`
5. Start: `npm run start`

## API Documentation

See `README.md` for complete API endpoint documentation.

