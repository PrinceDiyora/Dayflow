# Dayflow HRMS - Quick Setup Guide

## 🚀 Quick Start (5 Minutes)

### Step 1: Install Dependencies
```powershell
npm install
```

### Step 2: Start Development Server
```powershell
npm run dev
```

### Step 3: Open Browser
Navigate to: `http://localhost:5173`

---

## 👤 Login Credentials

### Try these pre-configured accounts:

**Employee Account:**
- Email: `john.doe@company.com`
- Any password works (mock auth)
- Role: Employee

**HR Manager:**
- Email: `jane.smith@company.com`
- Any password
- Role: HR

**Admin:**
- Email: `bob.johnson@company.com`
- Any password
- Role: Admin

---

## 📋 What You'll See

### As Employee (john.doe@company.com):
✅ Personal dashboard with quick access cards
✅ View and edit your profile
✅ Check in/out for attendance
✅ Apply for leave requests
✅ View leave balance
✅ View your payroll details

### As HR/Admin (jane.smith@company.com or bob.johnson@company.com):
✅ All employee features +
✅ View all employees
✅ Approve/reject leave requests
✅ View all attendance records
✅ Manage employee profiles
✅ Update salary structures
✅ View payroll for all employees

---

## 🎯 Features to Explore

### 1. Dashboard
- See statistics and quick access cards
- Check notifications (bell icon in top navbar)

### 2. Profile Management
- View your complete profile
- Edit personal details (employees: limited fields)
- See salary structure breakdown
- View uploaded documents

### 3. Attendance
- Check in/out functionality
- View daily and weekly attendance
- See attendance history
- Track working hours

### 4. Leave Management
**Employees:**
- Apply for leave (paid/sick/unpaid)
- View leave balance
- Track request status

**HR/Admin:**
- Approve or reject leave requests
- Add comments
- View all employee leave balances

### 5. Payroll
- View monthly salary breakdown
- See allowances and deductions
- Track payment status
- View payroll history

### 6. Notifications
- Real-time alerts
- Leave approval notifications
- Attendance reminders
- Payroll updates

---

## 🔧 Development Commands

```powershell
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 📝 Creating a New Account

1. Go to Sign Up page
2. Fill in details:
   - **Employee ID**: Must be in format `EMP001`, `EMP002`, etc.
   - **Email**: Valid email address
   - **Password**: Min 8 chars, must include:
     - Uppercase letter
     - Lowercase letter
     - Number
     - Special character
   - **Role**: Choose Employee, HR, or Admin
3. Submit and you'll be automatically logged in!

---

## 🎨 Tech Stack at a Glance

- **React 18** - Modern UI library
- **Vite** - Lightning-fast build tool
- **TailwindCSS** - Utility-first styling
- **Zustand** - State management
- **React Hook Form + Zod** - Form handling & validation
- **Radix UI** - Accessible components
- **Lucide React** - Beautiful icons

---

## 📂 Key Files to Check

```
src/
├── store/
│   ├── authStore.js          # Authentication state
│   └── notificationStore.js  # Notifications state
├── mocks/
│   ├── data.js              # Mock employee data
│   └── api.js               # Mock API functions
├── pages/
│   ├── auth/Login.jsx       # Login page
│   ├── auth/Signup.jsx      # Sign up page
│   └── dashboard/           # Dashboard pages
└── components/
    ├── NotificationBell.jsx # Notification component
    └── layout/Navbar.jsx    # Top navigation bar
```

---

## 🐛 Troubleshooting

### Port already in use?
```powershell
# Vite will automatically try the next available port
# Or specify a custom port in vite.config.js
```

### Dependencies not installing?
```powershell
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
Remove-Item -Recurse -Force node_modules
npm install
```

### Page not loading?
1. Check if dev server is running
2. Clear browser cache
3. Check console for errors

---

## 💡 Tips

1. **Test Different Roles**: Login as Employee, HR, and Admin to see different permissions
2. **Try Leave Workflow**: Apply for leave as employee, then approve as HR
3. **Check Notifications**: Bell icon shows real-time updates
4. **Explore Payroll**: See detailed salary breakdown
5. **Mock Data**: All data is stored in browser localStorage

---

## 🎓 Learning Resources

- [React Documentation](https://react.dev)
- [Vite Guide](https://vitejs.dev/guide/)
- [TailwindCSS Docs](https://tailwindcss.com/docs)
- [Zustand Guide](https://github.com/pmndrs/zustand)

---

## 📞 Need Help?

- Check the main README.md for detailed documentation
- Review the code comments
- Explore the mock data in `src/mocks/data.js`

---

**Happy Coding! 🎉**
