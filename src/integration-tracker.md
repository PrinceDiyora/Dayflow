# Dayflow HRMS - Backend Integration Tracker

**Last Updated:** 2024-12-19  
**Version:** 1.0.0  
**Status:** 🟡 All endpoints mocked (ready for backend implementation)

---

## 📊 Integration Overview

| Status | Count | Percentage |
|--------|-------|------------|
| ✅ Implemented | 0 | 0% |
| ⚠️ Mocked | 25 | 100% |
| ❌ Pending | 0 | 0% |

**Total Endpoints:** 25

---

## 🔐 Authentication Domain

### ✅ POST `/api/auth/login`
- **Status:** ⚠️ Mocked
- **Auth Required:** No
- **Roles:** None
- **Used By:** `pages/auth/login.tsx`
- **Description:** Authenticate user and receive JWT token

**Request:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "user": {
    "id": "string",
    "email": "string",
    "firstName": "string",
    "lastName": "string",
    "role": "employee | admin | hr",
    "department": "string (optional)",
    "position": "string (optional)",
    "phone": "string (optional)",
    "avatar": "string (optional)",
    "createdAt": "string (ISO 8601)"
  },
  "token": "string (JWT)"
}
```

**Backend TODO:**
- [ ] Implement JWT token generation
- [ ] Add password hashing validation
- [ ] Return user profile with role-based permissions

---

### ✅ POST `/api/auth/logout`
- **Status:** ⚠️ Mocked
- **Auth Required:** Yes
- **Roles:** employee, admin, hr
- **Used By:** `components/layout/topbar.tsx`
- **Description:** Logout current user

**Request:** None (uses Bearer token)

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

**Backend TODO:**
- [ ] Invalidate JWT token (optional - depends on token strategy)
- [ ] Clear session if using sessions

---

### ✅ GET `/api/auth/me`
- **Status:** ⚠️ Mocked
- **Auth Required:** Yes
- **Roles:** employee, admin, hr
- **Used By:** `store/auth.store.ts`
- **Description:** Get current authenticated user

**Request:** None (uses Bearer token)

**Response:**
```json
{
  "id": "string",
  "email": "string",
  "firstName": "string",
  "lastName": "string",
  "role": "employee | admin | hr",
  "department": "string (optional)",
  "position": "string (optional)",
  "phone": "string (optional)",
  "avatar": "string (optional)",
  "createdAt": "string (ISO 8601)"
}
```

**Backend TODO:**
- [ ] Validate JWT token
- [ ] Return user from database based on token

---

## 👥 Employees Domain

### ✅ GET `/api/employees`
- **Status:** ⚠️ Mocked
- **Auth Required:** Yes
- **Roles:** admin, hr
- **Used By:** `pages/employees/employees.tsx`, `pages/dashboard/admin-dashboard.tsx`
- **Description:** Get all employees (Admin/HR only)

**Request:** None (uses Bearer token)

**Response:**
```json
[
  {
    "id": "string",
    "email": "string",
    "firstName": "string",
    "lastName": "string",
    "role": "employee | admin | hr",
    "department": "string",
    "position": "string",
    "phone": "string",
    "hireDate": "string (YYYY-MM-DD)",
    "salary": "number",
    "status": "active | inactive"
  }
]
```

**Backend TODO:**
- [ ] Implement role-based access control
- [ ] Add pagination support (optional)
- [ ] Add filtering/searching (optional)

---

### ✅ GET `/api/employees/:id`
- **Status:** ⚠️ Mocked
- **Auth Required:** Yes
- **Roles:** admin, hr
- **Used By:** `pages/employees/employees.tsx`
- **Description:** Get employee by ID

**Request Params:**
- `id`: string

**Response:**
```json
{
  "id": "string",
  "email": "string",
  "firstName": "string",
  "lastName": "string",
  "role": "employee | admin | hr",
  "department": "string",
  "position": "string",
  "phone": "string",
  "hireDate": "string (YYYY-MM-DD)",
  "salary": "number",
  "status": "active | inactive"
}
```

**Backend TODO:**
- [ ] Validate employee ID exists
- [ ] Return 404 if not found

---

### ✅ POST `/api/employees`
- **Status:** ⚠️ Mocked
- **Auth Required:** Yes
- **Roles:** admin, hr
- **Used By:** `pages/employees/employees.tsx`
- **Description:** Create new employee

**Request Body:**
```json
{
  "email": "string",
  "firstName": "string",
  "lastName": "string",
  "department": "string",
  "position": "string",
  "phone": "string",
  "salary": "number",
  "role": "employee (default)"
}
```

**Response:**
```json
{
  "id": "string",
  "email": "string",
  "firstName": "string",
  "lastName": "string",
  "role": "employee",
  "department": "string",
  "position": "string",
  "phone": "string",
  "hireDate": "string (YYYY-MM-DD)",
  "salary": "number",
  "status": "active"
}
```

**Backend TODO:**
- [ ] Validate email uniqueness
- [ ] Hash password (if creating user account)
- [ ] Set default role to "employee"
- [ ] Set hireDate to current date
- [ ] Set status to "active" by default

---

### ✅ PUT `/api/employees/:id`
- **Status:** ⚠️ Mocked
- **Auth Required:** Yes
- **Roles:** admin, hr
- **Used By:** `pages/employees/employees.tsx`
- **Description:** Update employee

**Request Params:**
- `id`: string

**Request Body (all fields optional):**
```json
{
  "email": "string (optional)",
  "firstName": "string (optional)",
  "lastName": "string (optional)",
  "department": "string (optional)",
  "position": "string (optional)",
  "phone": "string (optional)",
  "salary": "number (optional)",
  "status": "active | inactive (optional)"
}
```

**Response:**
```json
{
  "id": "string",
  "email": "string",
  "firstName": "string",
  "lastName": "string",
  "role": "employee | admin | hr",
  "department": "string",
  "position": "string",
  "phone": "string",
  "hireDate": "string (YYYY-MM-DD)",
  "salary": "number",
  "status": "active | inactive"
}
```

**Backend TODO:**
- [ ] Validate employee ID exists
- [ ] Update only provided fields (partial update)
- [ ] Return updated employee

---

### ✅ DELETE `/api/employees/:id`
- **Status:** ⚠️ Mocked
- **Auth Required:** Yes
- **Roles:** admin, hr
- **Used By:** `pages/employees/employees.tsx`
- **Description:** Delete employee

**Request Params:**
- `id`: string

**Response:**
```json
{
  "message": "Employee deleted successfully"
}
```

**Backend TODO:**
- [ ] Validate employee ID exists
- [ ] Soft delete vs hard delete (decide strategy)
- [ ] Handle cascading deletes (attendance, leaves, payroll records)

---

## ⏰ Attendance Domain

### ✅ GET `/api/attendance/me`
- **Status:** ⚠️ Mocked
- **Auth Required:** Yes
- **Roles:** employee, admin, hr
- **Used By:** `pages/attendance/attendance.tsx`, `pages/dashboard/employee-dashboard.tsx`
- **Description:** Get current user attendance records

**Request:** None (uses Bearer token)

**Response:**
```json
[
  {
    "id": "string",
    "userId": "string",
    "date": "string (YYYY-MM-DD)",
    "checkIn": "string (HH:mm) (optional)",
    "checkOut": "string (HH:mm) (optional)",
    "status": "present | absent | half-day | leave",
    "totalHours": "number (optional)"
  }
]
```

**Backend TODO:**
- [ ] Filter by current user (from JWT token)
- [ ] Add date range filtering (optional)
- [ ] Calculate totalHours if checkIn and checkOut exist

---

### ✅ GET `/api/attendance`
- **Status:** ⚠️ Mocked
- **Auth Required:** Yes
- **Roles:** admin, hr
- **Used By:** `pages/attendance/attendance.tsx`, `pages/dashboard/admin-dashboard.tsx`
- **Description:** Get all employees attendance (Admin/HR only)

**Request:** None (uses Bearer token)

**Response:**
```json
[
  {
    "id": "string",
    "userId": "string",
    "date": "string (YYYY-MM-DD)",
    "checkIn": "string (HH:mm) (optional)",
    "checkOut": "string (HH:mm) (optional)",
    "status": "present | absent | half-day | leave",
    "totalHours": "number (optional)"
  }
]
```

**Backend TODO:**
- [ ] Implement role-based access control
- [ ] Add pagination (optional)
- **Include employee name in response** (join with users table)

---

### ✅ POST `/api/attendance/check-in`
- **Status:** ⚠️ Mocked
- **Auth Required:** Yes
- **Roles:** employee, admin, hr
- **Used By:** `pages/attendance/attendance.tsx`
- **Description:** Check in for today

**Request:** None (uses Bearer token)

**Response:**
```json
{
  "id": "string",
  "userId": "string",
  "date": "string (YYYY-MM-DD)",
  "checkIn": "string (HH:mm)",
  "status": "present"
}
```

**Backend TODO:**
- [ ] Get current user from JWT token
- [ ] Get current date (server time)
- [ ] Check if check-in already exists for today
- [ ] Create or update attendance record
- [ ] Set status to "present"

---

### ✅ POST `/api/attendance/check-out`
- **Status:** ⚠️ Mocked
- **Auth Required:** Yes
- **Roles:** employee, admin, hr
- **Used By:** `pages/attendance/attendance.tsx`
- **Description:** Check out for today

**Request:** None (uses Bearer token)

**Response:**
```json
{
  "id": "string",
  "userId": "string",
  "date": "string (YYYY-MM-DD)",
  "checkIn": "string (HH:mm)",
  "checkOut": "string (HH:mm)",
  "status": "present",
  "totalHours": "number"
}
```

**Backend TODO:**
- [ ] Get current user from JWT token
- [ ] Get current date (server time)
- [ ] Find today's attendance record
- [ ] Validate check-in exists
- [ ] Calculate totalHours (checkOut - checkIn)
- [ ] Update attendance record

---

### ✅ GET `/api/attendance/today`
- **Status:** ⚠️ Mocked
- **Auth Required:** Yes
- **Roles:** employee, admin, hr
- **Used By:** `pages/attendance/attendance.tsx`
- **Description:** Get today attendance record

**Request:** None (uses Bearer token)

**Response:**
```json
{
  "id": "string",
  "userId": "string",
  "date": "string (YYYY-MM-DD)",
  "checkIn": "string (HH:mm) (optional)",
  "checkOut": "string (HH:mm) (optional)",
  "status": "present | absent | half-day | leave",
  "totalHours": "number (optional)"
}
```
or `null` if no record exists

**Backend TODO:**
- [ ] Get current user from JWT token
- [ ] Get current date (server time)
- [ ] Find attendance record for today
- [ ] Return null if not found

---

## 📅 Leaves Domain

### ✅ GET `/api/leaves/me`
- **Status:** ⚠️ Mocked
- **Auth Required:** Yes
- **Roles:** employee, admin, hr
- **Used By:** `pages/leaves/leaves.tsx`, `pages/dashboard/employee-dashboard.tsx`
- **Description:** Get current user leave requests

**Request:** None (uses Bearer token)

**Response:**
```json
[
  {
    "id": "string",
    "userId": "string",
    "employeeName": "string",
    "type": "paid | sick | unpaid",
    "startDate": "string (YYYY-MM-DD)",
    "endDate": "string (YYYY-MM-DD)",
    "days": "number",
    "reason": "string",
    "status": "pending | approved | rejected",
    "appliedAt": "string (ISO 8601)",
    "reviewedBy": "string (optional)",
    "reviewedAt": "string (ISO 8601) (optional)",
    "comments": "string (optional)"
  }
]
```

**Backend TODO:**
- [ ] Filter by current user (from JWT token)
- [ ] Calculate days automatically (endDate - startDate + 1)

---

### ✅ GET `/api/leaves`
- **Status:** ⚠️ Mocked
- **Auth Required:** Yes
- **Roles:** admin, hr
- **Used By:** `pages/leaves/leaves.tsx`, `pages/dashboard/admin-dashboard.tsx`
- **Description:** Get all leave requests (Admin/HR only)

**Request:** None (uses Bearer token)

**Response:**
```json
[
  {
    "id": "string",
    "userId": "string",
    "employeeName": "string",
    "type": "paid | sick | unpaid",
    "startDate": "string (YYYY-MM-DD)",
    "endDate": "string (YYYY-MM-DD)",
    "days": "number",
    "reason": "string",
    "status": "pending | approved | rejected",
    "appliedAt": "string (ISO 8601)",
    "reviewedBy": "string (optional)",
    "reviewedAt": "string (ISO 8601) (optional)",
    "comments": "string (optional)"
  }
]
```

**Backend TODO:**
- [ ] Implement role-based access control
- [ ] Add filtering by status (optional)
- [ ] Include employee name (join with users table)

---

### ✅ POST `/api/leaves`
- **Status:** ⚠️ Mocked
- **Auth Required:** Yes
- **Roles:** employee, admin, hr
- **Used By:** `pages/leaves/leaves.tsx`
- **Description:** Apply for leave

**Request Body:**
```json
{
  "type": "paid | sick | unpaid",
  "startDate": "string (YYYY-MM-DD)",
  "endDate": "string (YYYY-MM-DD)",
  "reason": "string"
}
```

**Response:**
```json
{
  "id": "string",
  "userId": "string",
  "employeeName": "string",
  "type": "paid | sick | unpaid",
  "startDate": "string (YYYY-MM-DD)",
  "endDate": "string (YYYY-MM-DD)",
  "days": "number",
  "reason": "string",
  "status": "pending",
  "appliedAt": "string (ISO 8601)"
}
```

**Backend TODO:**
- [ ] Get current user from JWT token
- [ ] Validate startDate < endDate
- [ ] Calculate days automatically
- [ ] Set status to "pending"
- [ ] Set appliedAt to current timestamp
- [ ] Get employeeName from user profile

---

### ✅ POST `/api/leaves/:id/approve`
- **Status:** ⚠️ Mocked
- **Auth Required:** Yes
- **Roles:** admin, hr
- **Used By:** `pages/leaves/leaves.tsx`
- **Description:** Approve leave request (Admin/HR only)

**Request Params:**
- `id`: string

**Request Body:**
```json
{
  "comments": "string (optional)"
}
```

**Response:**
```json
{
  "id": "string",
  "userId": "string",
  "employeeName": "string",
  "type": "paid | sick | unpaid",
  "startDate": "string (YYYY-MM-DD)",
  "endDate": "string (YYYY-MM-DD)",
  "days": "number",
  "reason": "string",
  "status": "approved",
  "appliedAt": "string (ISO 8601)",
  "reviewedBy": "string",
  "reviewedAt": "string (ISO 8601)",
  "comments": "string (optional)"
}
```

**Backend TODO:**
- [ ] Validate leave request exists
- [ ] Validate status is "pending"
- [ ] Get reviewer from JWT token
- [ ] Set status to "approved"
- [ ] Set reviewedBy to current user
- [ ] Set reviewedAt to current timestamp
- [ ] Update attendance records for leave dates (mark as "leave")

---

### ✅ POST `/api/leaves/:id/reject`
- **Status:** ⚠️ Mocked
- **Auth Required:** Yes
- **Roles:** admin, hr
- **Used By:** `pages/leaves/leaves.tsx`
- **Description:** Reject leave request (Admin/HR only)

**Request Params:**
- `id`: string

**Request Body:**
```json
{
  "comments": "string (optional)"
}
```

**Response:**
```json
{
  "id": "string",
  "userId": "string",
  "employeeName": "string",
  "type": "paid | sick | unpaid",
  "startDate": "string (YYYY-MM-DD)",
  "endDate": "string (YYYY-MM-DD)",
  "days": "number",
  "reason": "string",
  "status": "rejected",
  "appliedAt": "string (ISO 8601)",
  "reviewedBy": "string",
  "reviewedAt": "string (ISO 8601)",
  "comments": "string (optional)"
}
```

**Backend TODO:**
- [ ] Validate leave request exists
- [ ] Validate status is "pending"
- [ ] Get reviewer from JWT token
- [ ] Set status to "rejected"
- [ ] Set reviewedBy to current user
- [ ] Set reviewedAt to current timestamp

---

## 💰 Payroll Domain

### ✅ GET `/api/payroll/me`
- **Status:** ⚠️ Mocked
- **Auth Required:** Yes
- **Roles:** employee, admin, hr
- **Used By:** `pages/payroll/payroll.tsx`, `pages/dashboard/employee-dashboard.tsx`
- **Description:** Get current user payroll records

**Request:** None (uses Bearer token)

**Response:**
```json
[
  {
    "id": "string",
    "userId": "string",
    "employeeName": "string",
    "month": "string",
    "year": "number",
    "baseSalary": "number",
    "allowances": "number",
    "deductions": "number",
    "netSalary": "number",
    "status": "pending | processed | paid"
  }
]
```

**Backend TODO:**
- [ ] Filter by current user (from JWT token)
- [ ] Calculate netSalary = baseSalary + allowances - deductions

---

### ✅ GET `/api/payroll`
- **Status:** ⚠️ Mocked
- **Auth Required:** Yes
- **Roles:** admin, hr
- **Used By:** `pages/payroll/payroll.tsx`, `pages/dashboard/admin-dashboard.tsx`
- **Description:** Get all payroll records (Admin/HR only)

**Request:** None (uses Bearer token)

**Response:**
```json
[
  {
    "id": "string",
    "userId": "string",
    "employeeName": "string",
    "month": "string",
    "year": "number",
    "baseSalary": "number",
    "allowances": "number",
    "deductions": "number",
    "netSalary": "number",
    "status": "pending | processed | paid"
  }
]
```

**Backend TODO:**
- [ ] Implement role-based access control
- [ ] Add filtering by month/year (optional)

---

### ✅ PUT `/api/payroll/:userId/salary`
- **Status:** ⚠️ Mocked
- **Auth Required:** Yes
- **Roles:** admin, hr
- **Used By:** `pages/payroll/payroll.tsx`
- **Description:** Update employee salary (Admin/HR only)

**Request Params:**
- `userId`: string

**Request Body:**
```json
{
  "salary": "number"
}
```

**Response:**
```json
{
  "id": "string",
  "userId": "string",
  "employeeName": "string",
  "month": "string",
  "year": "number",
  "baseSalary": "number",
  "allowances": "number",
  "deductions": "number",
  "netSalary": "number",
  "status": "pending | processed | paid"
}
```

**Backend TODO:**
- [ ] Validate userId exists
- [ ] Update employee salary in database
- [ ] Return updated payroll record

---

### ✅ POST `/api/payroll/process`
- **Status:** ⚠️ Mocked
- **Auth Required:** Yes
- **Roles:** admin, hr
- **Used By:** `pages/payroll/payroll.tsx`
- **Description:** Process payroll for a specific month (Admin/HR only)

**Request Body:**
```json
{
  "month": "string",
  "year": "number"
}
```

**Response:**
```json
[
  {
    "id": "string",
    "userId": "string",
    "employeeName": "string",
    "month": "string",
    "year": "number",
    "baseSalary": "number",
    "allowances": "number",
    "deductions": "number",
    "netSalary": "number",
    "status": "processed"
  }
]
```

**Backend TODO:**
- [ ] Get all active employees
- [ ] Calculate payroll for each employee
- [ ] Create payroll records
- [ ] Set status to "processed"
- [ ] Generate payslips (optional)

---

## 📄 Payslips Domain

### ✅ GET `/api/payslips/me`
- **Status:** ⚠️ Mocked
- **Auth Required:** Yes
- **Roles:** employee, admin, hr
- **Used By:** `pages/payslips/payslips.tsx`
- **Description:** Get current user payslips

**Request:** None (uses Bearer token)

**Response:**
```json
[
  {
    "id": "string",
    "userId": "string",
    "month": "string",
    "year": "number",
    "baseSalary": "number",
    "allowances": "number",
    "deductions": "number",
    "netSalary": "number",
    "pdfUrl": "string (optional)",
    "generatedAt": "string (ISO 8601)"
  }
]
```

**Backend TODO:**
- [ ] Filter by current user (from JWT token)
- [ ] Link to payroll records

---

### ✅ GET `/api/payslips/:id`
- **Status:** ⚠️ Mocked
- **Auth Required:** Yes
- **Roles:** employee, admin, hr
- **Used By:** `pages/payslips/payslips.tsx`
- **Description:** Get payslip by ID

**Request Params:**
- `id`: string

**Response:**
```json
{
  "id": "string",
  "userId": "string",
  "month": "string",
  "year": "number",
  "baseSalary": "number",
  "allowances": "number",
  "deductions": "number",
  "netSalary": "number",
  "pdfUrl": "string (optional)",
  "generatedAt": "string (ISO 8601)"
}
```

**Backend TODO:**
- [ ] Validate payslip ID exists
- [ ] Validate user has access (own payslip or admin/hr)

---

### ✅ GET `/api/payslips/:id/download`
- **Status:** ⚠️ Mocked
- **Auth Required:** Yes
- **Roles:** employee, admin, hr
- **Used By:** `pages/payslips/payslips.tsx`
- **Description:** Download payslip as PDF

**Request Params:**
- `id`: string

**Response:** Blob (PDF file)

**Headers:**
- `Content-Type: application/pdf`
- `Content-Disposition: attachment; filename=payslip-{id}.pdf`

**Backend TODO:**
- [ ] Validate payslip ID exists
- [ ] Generate PDF from payslip data
- [ ] Return PDF as blob
- [ ] Set appropriate headers

---

## 🔄 Integration Workflow

### For Frontend Developers

1. **Development with Mocks:**
   - Set `VITE_USE_MOCK=true` in `.env`
   - All API calls will use mock handlers
   - Work independently without backend

2. **Switching to Real Backend:**
   - Set `VITE_USE_MOCK=false` in `.env`
   - Update `VITE_API_URL` to backend URL
   - Ensure backend implements all endpoints from this tracker

### For Backend Developers

1. **Implementation Checklist:**
   - [ ] Review `backend-integration.json` for exact contract
   - [ ] Implement endpoints in order of priority:
     1. Auth (login, logout, getCurrentUser)
     2. Employees (CRUD)
     3. Attendance (check-in/out, records)
     4. Leaves (application, approval)
     5. Payroll (records, processing)
     6. Payslips (view, download)
   - [ ] Update endpoint status to "implemented" in `backendIntegration.ts`
   - [ ] Run `npm run validate-spec` to ensure contract compliance

2. **Testing:**
   - Test each endpoint matches the contract exactly
   - Verify role-based access control
   - Test error responses (400, 401, 403, 404, 500)

### For CI/CD

1. **Validation:**
   - Run `npm run validate-spec` on every commit
   - Fail build if contract violations found
   - Ensure all frontend API calls exist in spec

2. **Sync:**
   - Run `npm run sync-spec` before releases
   - Regenerate `backend-integration.json`
   - Update version automatically

---

## 📝 Notes & Open Questions

### Authentication
- **Q:** Should we implement refresh tokens?
  - **A:** Future enhancement - not in MVP scope

### Employees
- **Q:** Soft delete vs hard delete?
  - **A:** Recommend soft delete (set status to "inactive")

### Attendance
- **Q:** Should we track location for check-in/out?
  - **A:** Future enhancement - not in MVP scope

### Leaves
- **Q:** Should we validate leave balance?
  - **A:** Future enhancement - not in MVP scope

### Payroll
- **Q:** How to calculate allowances and deductions?
  - **A:** Backend should implement business logic

### Payslips
- **Q:** PDF generation library?
  - **A:** Backend decision (e.g., pdfkit, puppeteer)

---

## 🚀 Next Steps

1. **Backend Team:**
   - Review this tracker
   - Implement endpoints starting with Auth
   - Update status as endpoints are completed

2. **Frontend Team:**
   - Continue development with mocks
   - Test integration when backend endpoints are ready
   - Report any contract mismatches

3. **QA Team:**
   - Test each endpoint against contract
   - Verify role-based access
   - Test error scenarios

---

**Generated from:** `src/backendIntegration.ts`  
**Last Sync:** 2024-12-19

