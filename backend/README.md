# Dayflow HRMS - Backend API

Backend API for Dayflow Human Resource Management System built with Node.js, Express, and MongoDB.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Installation

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   # Copy .env.example to .env
   cp .env.example .env
   ```

4. **Edit .env file with your configuration**
   - Set MongoDB URI
   - Set JWT secret
   - Configure other settings

5. **Start MongoDB**
   ```bash
   # If using local MongoDB
   mongod
   ```

6. **Seed the database (optional)**
   ```bash
   npm run seed
   ```

7. **Start the server**
   ```bash
   # Development mode with nodemon
   npm run dev

   # Production mode
   npm start
   ```

Server will run on `http://localhost:5000`

---

## 📁 Project Structure

```
backend/
├── config/
│   └── database.js          # MongoDB connection
├── controllers/
│   ├── authController.js    # Authentication logic
│   ├── employeeController.js
│   ├── attendanceController.js
│   ├── leaveController.js
│   ├── payrollController.js
│   └── notificationController.js
├── middleware/
│   ├── auth.js              # JWT authentication
│   └── errorHandler.js      # Global error handler
├── models/
│   ├── Employee.js
│   ├── Attendance.js
│   ├── Leave.js
│   ├── Payroll.js
│   └── Notification.js
├── routes/
│   ├── authRoutes.js
│   ├── employeeRoutes.js
│   ├── attendanceRoutes.js
│   ├── leaveRoutes.js
│   ├── payrollRoutes.js
│   └── notificationRoutes.js
├── scripts/
│   └── seedDatabase.js      # Database seeding script
├── .env                     # Environment variables
├── .env.example            # Example environment file
├── package.json
└── server.js               # Express app entry point
```

---

## 🔑 API Endpoints

### Authentication
```
POST   /api/auth/signup          - Register new employee
POST   /api/auth/login           - Login employee
GET    /api/auth/me              - Get current user (Protected)
PUT    /api/auth/updatepassword  - Update password (Protected)
```

### Employees
```
GET    /api/employees            - Get all employees (Admin/HR)
GET    /api/employees/:id        - Get single employee (Protected)
PUT    /api/employees/:id        - Update employee (Protected)
DELETE /api/employees/:id        - Delete employee (Admin)
PUT    /api/employees/:id/status - Update employee status (Admin/HR)
```

### Attendance
```
GET    /api/attendance           - Get attendance records (Protected)
POST   /api/attendance           - Create attendance (Admin/HR)
GET    /api/attendance/:id       - Get single record (Protected)
PUT    /api/attendance/:id       - Update attendance (Admin/HR)
DELETE /api/attendance/:id       - Delete attendance (Admin/HR)
POST   /api/attendance/checkin   - Check in (Protected)
POST   /api/attendance/checkout  - Check out (Protected)
```

### Leaves
```
GET    /api/leaves               - Get all leaves (Protected)
POST   /api/leaves               - Apply for leave (Protected)
GET    /api/leaves/:id           - Get single leave (Protected)
DELETE /api/leaves/:id           - Delete leave (Protected)
PUT    /api/leaves/:id/approve   - Approve leave (Admin/HR)
PUT    /api/leaves/:id/reject    - Reject leave (Admin/HR)
```

### Payroll
```
GET    /api/payroll              - Get payroll records (Protected)
POST   /api/payroll              - Create payroll (Admin/HR)
GET    /api/payroll/:id          - Get single payroll (Protected)
PUT    /api/payroll/:id          - Update payroll (Admin/HR)
DELETE /api/payroll/:id          - Delete payroll (Admin)
PUT    /api/payroll/:id/process  - Process payroll (Admin)
POST   /api/payroll/generate     - Generate for all (Admin)
```

### Notifications
```
GET    /api/notifications        - Get all notifications (Protected)
DELETE /api/notifications        - Clear all (Protected)
PUT    /api/notifications/read-all - Mark all as read (Protected)
PUT    /api/notifications/:id/read - Mark as read (Protected)
DELETE /api/notifications/:id    - Delete notification (Protected)
```

---

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication.

### Login Flow
1. User sends credentials to `/api/auth/login`
2. Server validates and returns JWT token
3. Client stores token
4. Client sends token in Authorization header for protected routes

### Protected Routes
Include JWT token in Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 👥 Test Credentials

After running `npm run seed`, use these credentials:

### Employee Account
- Email: `john.doe@company.com`
- Password: `Password@123`
- Role: Employee

### HR Account
- Email: `jane.smith@company.com`
- Password: `Password@123`
- Role: HR

### Admin Account
- Email: `bob.johnson@company.com`
- Password: `Password@123`
- Role: Admin

---

## 🗄️ Database Models

### Employee
- Authentication (employeeId, email, password, role)
- Personal info (name, DOB, gender, etc.)
- Job details (department, position, salary)
- Salary structure (allowances, deductions)
- Leave balance
- Documents

### Attendance
- Employee reference
- Date, check-in, check-out times
- Status (present, absent, half-day, leave)
- Hours worked

### Leave
- Employee reference
- Type (paid, sick, unpaid)
- Date range, days count
- Reason, status
- Approval details

### Payroll
- Employee reference
- Month, year
- Salary breakdown
- Status, payment date

### Notification
- User reference
- Type, title, message
- Read status, timestamp

---

## 🛠️ Development

### Available Scripts

```bash
# Start development server with auto-reload
npm run dev

# Start production server
npm start

# Seed database with sample data
npm run seed
```

### Environment Variables

Required variables in `.env`:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/dayflow-hrms
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
```

---

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token authentication
- Role-based access control
- Input validation
- Mongoose schema validation
- CORS configuration
- Error handling middleware

---

## 📝 API Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message"
}
```

---

## 🧪 Testing

Use Postman or any API client to test endpoints.

### Example: Login Request
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "john.doe@company.com",
  "password": "Password@123"
}
```

---

## 🚀 Deployment

### Deploy to Heroku, Railway, or any Node.js hosting

1. Set environment variables
2. Ensure MongoDB is accessible
3. Build and deploy

### Important for Production
- Use strong JWT secret
- Use MongoDB Atlas or managed database
- Enable HTTPS
- Set up logging
- Configure CORS properly

---

## 📞 Support

For issues or questions, check the main project documentation or create an issue in the repository.

---

**Built with Node.js, Express, MongoDB, and JWT** 🚀
