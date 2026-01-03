# Dayflow HRMS - Backend API

Backend API for Dayflow HRMS built with Node.js, Express, PostgreSQL, and Prisma.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and configure:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `PORT` - Server port (default: 5000)
- `FRONTEND_URL` - Frontend URL for CORS

3. Set up database:
```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed database with sample data
npm run prisma:seed
```

4. Start development server:
```bash
npm run dev
```

The API will be available at `http://localhost:5000`

## 📦 Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio (database GUI)
- `npm run prisma:seed` - Seed database with sample data
- `npm run db:push` - Push schema changes to database (dev only)
- `npm run db:reset` - Reset database and run migrations

## 🏗️ Project Structure

```
backend/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── migrations/            # Database migrations
├── src/
│   ├── controllers/          # Request handlers
│   ├── middleware/            # Express middleware
│   ├── routes/                # API routes
│   ├── utils/                 # Utility functions
│   ├── prisma/                # Prisma seed script
│   └── server.ts              # Express server
├── .env                       # Environment variables
├── package.json
└── tsconfig.json
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Employees (Admin/HR only)
- `GET /api/employees` - Get all employees
- `GET /api/employees/:id` - Get employee by ID
- `POST /api/employees` - Create employee
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee (soft delete)

### Attendance
- `GET /api/attendance/me` - Get my attendance
- `GET /api/attendance` - Get all attendance (Admin/HR)
- `GET /api/attendance/today` - Get today's attendance
- `POST /api/attendance/check-in` - Check in
- `POST /api/attendance/check-out` - Check out

### Leaves
- `GET /api/leaves/me` - Get my leaves
- `GET /api/leaves` - Get all leaves (Admin/HR)
- `POST /api/leaves` - Apply for leave
- `POST /api/leaves/:id/approve` - Approve leave (Admin/HR)
- `POST /api/leaves/:id/reject` - Reject leave (Admin/HR)

### Payroll
- `GET /api/payroll/me` - Get my payroll
- `GET /api/payroll` - Get all payroll (Admin/HR)
- `PUT /api/payroll/:userId/salary` - Update salary (Admin/HR)
- `POST /api/payroll/process` - Process payroll (Admin/HR)

### Payslips
- `GET /api/payslips/me` - Get my payslips
- `GET /api/payslips/:id` - Get payslip by ID
- `GET /api/payslips/:id/download` - Download payslip PDF

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <token>
```

## 🗄️ Database Schema

The database schema is defined in `prisma/schema.prisma`. Key models:

- **User** - User accounts with roles (employee, admin, hr)
- **Employee** - Employee-specific data (salary, hire date)
- **Attendance** - Daily attendance records
- **Leave** - Leave requests and approvals
- **Payroll** - Monthly payroll records
- **Payslip** - Generated payslips

## 🧪 Testing

Default test credentials (from seed):

**Admin:**
- Email: `admin@dayflow.com`
- Password: `password`

**Employee:**
- Email: `employee@dayflow.com`
- Password: `password`

## 📝 Environment Variables

```env
DATABASE_URL="postgresql://user:password@localhost:5432/dayflow_hrms"
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="7d"
PORT=5000
NODE_ENV=development
FRONTEND_URL="http://localhost:5173"
```

## 🚀 Deployment

1. Build the project:
```bash
npm run build
```

2. Set production environment variables

3. Run migrations:
```bash
npm run prisma:migrate
```

4. Start server:
```bash
npm run start
```

## 📄 License

ISC

