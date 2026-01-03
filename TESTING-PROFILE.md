# Profile Feature Testing Guide

## Changes Made

### 1. Created Real API Service (`src/services/api.js`)
- Created axios instance configured for `http://localhost:5000/api`
- Enabled credentials (cookies) for authentication
- Implemented all API endpoints (employees, attendance, leaves, payroll, notifications)
- Added automatic redirect to login on 401 errors

### 2. Updated Profile Component (`src/pages/profile/Profile.jsx`)
- **Changed API import**: Now uses real backend API instead of mock API
- **Fixed ID references**: Changed `user.id` to `user._id` (MongoDB uses `_id`)
- **Fixed Employee ID display**: Changed `employee.id` to `employee.employeeId`
- **Fixed data access**: Now uses `response.data.data` to match backend response structure
- **Fixed salary structure**: Now reads from `salaryStructure.allowances` and `salaryStructure.deductions`
- **Fixed field mapping**: `allowances.transport` from backend maps to `conveyanceAllowance` in frontend

## How to Test

### Prerequisites
1. **Backend must be running** on port 5000
   ```powershell
   cd backend
   npm start
   ```

2. **MongoDB must be running** and connected

3. **Frontend must be running** on port 5173 or 5174
   ```powershell
   npm run dev
   ```

### Test Steps

#### 1. Login with an Existing Account
- If you don't have an account, sign up first
- The backend will create a user with salary structure based on role:
  - **Admin**: ₹95,000 base salary
  - **HR**: ₹85,000 base salary  
  - **Employee**: ₹50,000 base salary

#### 2. View Profile Data
- After login, navigate to **Profile** page
- You should now see:
  - ✅ Employee ID (format: EMP001, EMP002, etc.)
  - ✅ Name and avatar
  - ✅ Role badge (admin/hr/employee)
  - ✅ Status badge (active/inactive)
  - ✅ Personal information fields
  - ✅ **Salary structure with real data from backend**:
    - Base Salary
    - House Rent Allowance
    - Medical Allowance
    - Conveyance Allowance
    - Special Allowance
    - Provident Fund
    - Professional Tax
    - Income Tax
    - Other Deductions
  - ✅ Calculated Gross Salary
  - ✅ Calculated Total Deductions
  - ✅ Calculated Net Salary

#### 3. Edit Profile (If Allowed)
- Click **Edit Profile** button
- Modify any editable fields
- Click **Save Changes**
- Should see success toast message
- Data should persist after page refresh

### Expected Backend Data Structure

The backend Employee model has this salary structure:
```javascript
{
  _id: "...",
  employeeId: "EMP001",
  name: "John Doe",
  email: "john@example.com",
  role: "employee",
  salary: 50000,
  salaryStructure: {
    baseSalary: 50000,
    allowances: {
      houseRent: 10000,
      medical: 5000,
      transport: 3000,  // Maps to 'conveyanceAllowance' in frontend
      special: 2000
    },
    deductions: {
      providentFund: 6000,
      professionalTax: 200,
      incomeTax: 5000,
      other: 0
    }
  },
  leaveBalance: {
    paid: 12,
    sick: 7,
    unpaid: 5,
    total: 24,
    used: 0,
    remaining: 24
  },
  status: "active",
  // ... other fields
}
```

## Troubleshooting

### Issue: "Failed to load employee data"
- **Check**: Backend is running on port 5000
- **Check**: MongoDB is connected
- **Check**: User is logged in (check localStorage for 'auth-storage')
- **Check**: Browser console for error messages

### Issue: Profile shows "N/A" or empty data
- **Check**: Backend returned valid employee data (check Network tab)
- **Check**: User object in localStorage has `_id` field
- **Check**: Backend response structure: `{ success: true, data: { ... } }`

### Issue: CORS errors
- **Check**: Backend CORS allows your frontend port (5173 or 5174)
- **Check**: `withCredentials: true` is set in API calls
- **Check**: Cookies are being sent with requests

### Issue: Salary fields show 0
- **Check**: Backend employee record has `salaryStructure` populated
- **Check**: Run seed script if needed: `npm run seed` in backend folder
- **Check**: New signups should auto-populate salary structure based on role

## Next Steps

Other components still using mock API that need to be updated:
1. `src/pages/attendance/Attendance.jsx` - Update to use `attendanceAPI`
2. `src/pages/leaves/Leaves.jsx` - Update to use `leaveAPI`
3. `src/pages/payroll/Payroll.jsx` - Update to use `payrollAPI`
4. `src/pages/dashboard/AdminDashboard.jsx` - Update to use real API
5. `src/pages/dashboard/EmployeeDashboard.jsx` - Update to use real API

## API Endpoints Available

All endpoints are available in `src/services/api.js`:
- **Auth**: login, signup, logout, getCurrentUser
- **Employees**: getAll, getById, create, update, delete, search
- **Attendance**: getAll, getById, create, update, delete, checkIn, checkOut
- **Leaves**: getAll, getById, create, update, delete, approve, reject
- **Payroll**: getAll, getById, create, update, delete, generatePayslip
- **Notifications**: getAll, getById, create, markAsRead, markAllAsRead, delete
