# Dayflow – Human Resource Management System (HRMS)

![Dayflow HRMS](https://img.shields.io/badge/HRMS-Dayflow-blue)
![React](https://img.shields.io/badge/React-18.2.0-61dafb)
![Vite](https://img.shields.io/badge/Vite-5.0.8-646cff)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.3.6-38bdf8)

## 📋 Project Overview

Dayflow is a comprehensive Human Resource Management System designed to digitize and simplify daily HR operations within an organization. It provides a centralized platform for managing employees, attendance, leave, and payroll with secure authentication and role-based access control.

The system improves efficiency, transparency, and accuracy in HR workflows for both employees and administrators.

---

## 🎯 Purpose

Dayflow streamlines core HR processes including:

- ✅ Employee onboarding and profile management
- ✅ Daily and weekly attendance tracking
- ✅ Leave and time-off management with approval workflows
- ✅ Payroll visibility and salary structure management
- ✅ Role-based access control (Admin/HR vs Employee)
- ✅ Real-time notifications and alerts

---

## 🚀 Features

### 🔐 Authentication & Authorization

- **Sign Up**: Register with Employee ID (EMP001 format), email, and strong password
- **Sign In**: Secure login with email and password
- **Strong Password Policy**: 8+ characters with uppercase, lowercase, numbers, and special characters
- **Email Verification**: Flag for verified accounts
- **Role-Based Access**: Employee, HR Officer, and Admin roles

### 📊 Dashboard

#### Employee Dashboard
- Quick-access cards for Profile, Attendance, Leave Requests
- Recent activity and alerts
- Leave balance overview
- Attendance summary

#### Admin/HR Dashboard
- Employee list with real-time status
- Attendance records overview
- Leave approval requests
- Key statistics and analytics

### 👤 Employee Profile Management

- **Personal Details**: Name, email, phone, address, date of birth, gender, marital status
- **Job Details**: Department, position, joining date
- **Salary Structure**: Base salary, allowances, deductions breakdown
- **Documents**: Upload and manage ID proofs, resumes, certificates
- **Emergency Contact**: Store emergency contact information
- **Edit Restrictions**: Employees can edit limited fields; Admin/HR can edit all fields

### ⏰ Attendance Management

- **Daily Tracking**: Check-in and check-out functionality
- **Weekly Calendar View**: Visual attendance calendar
- **Attendance Status**: Present, Absent, Half-day, Leave
- **Hours Calculation**: Automatic working hours calculation
- **History**: Complete attendance history with filtering

### 🏖️ Leave & Time-Off Management

#### For Employees
- Apply for leave with date range and reason
- Leave types: Paid Leave, Sick Leave, Unpaid Leave
- View leave balance (total, used, remaining)
- Track leave request status (Pending, Approved, Rejected)
- Leave history

#### For Admin/HR
- View all leave requests
- Approve or reject with comments
- See employee leave balances
- Immediate reflection of status changes

### 💰 Payroll / Salary Management

#### For Employees
- View salary structure breakdown
- Monthly payroll history
- Download payslips (upcoming feature)
- Read-only access to payroll details

#### For Admin/HR
- View payroll for all employees
- Update salary structures
- Manage allowances and deductions:
  - House Rent Allowance
  - Medical Allowance
  - Transport Allowance
  - Special Allowance
  - Provident Fund
  - Professional Tax
  - Income Tax
- Process monthly payroll

### 🔔 Notifications

- Real-time notification bell with unread count
- Notification types:
  - Leave approval/rejection
  - Attendance reminders
  - Payroll processing
  - System alerts
- Mark as read/unread functionality
- Notification history

---

## 🛠️ Tech Stack

### Frontend
- **React 18.2.0** - UI library
- **Vite 5.0.8** - Build tool and dev server
- **React Router DOM 6.20.0** - Routing
- **TailwindCSS 3.3.6** - Styling
- **Radix UI** - Accessible UI components

### State Management
- **Zustand 4.4.7** - Global state management
- Stores: Auth, Notifications

### Form Handling & Validation
- **React Hook Form 7.48.2** - Form management
- **Zod 3.22.4** - Schema validation
- **@hookform/resolvers 3.3.2** - Form validation integration

### UI Components & Icons
- **Lucide React 0.294.0** - Icon library
- **Sonner 1.2.0** - Toast notifications
- **date-fns 2.30.0** - Date formatting

### HTTP Client
- **Axios 1.6.2** - API requests (mock implementation included)

---

## 📁 Project Structure

```
dayflow-hrms/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── MainLayout.jsx
│   │   │   ├── Navbar.jsx (with NotificationBell)
│   │   │   └── Sidebar.jsx
│   │   ├── ui/
│   │   │   ├── avatar.jsx
│   │   │   ├── badge.jsx
│   │   │   ├── button.jsx
│   │   │   ├── card.jsx
│   │   │   ├── dialog.jsx
│   │   │   ├── dropdown-menu.jsx
│   │   │   ├── input.jsx
│   │   │   ├── label.jsx
│   │   │   ├── select.jsx
│   │   │   ├── table.jsx
│   │   │   ├── tabs.jsx
│   │   │   ├── textarea.jsx
│   │   │   └── toast.jsx
│   │   ├── NotificationBell.jsx
│   │   └── ProtectedRoute.jsx
│   ├── lib/
│   │   └── utils.js
│   ├── mocks/
│   │   ├── api.js (Mock API with comprehensive data)
│   │   └── data.js (Enhanced mock data)
│   ├── pages/
│   │   ├── attendance/
│   │   │   └── Attendance.jsx
│   │   ├── auth/
│   │   │   ├── Login.jsx
│   │   │   └── Signup.jsx (Enhanced with Employee ID)
│   │   ├── dashboard/
│   │   │   ├── AdminDashboard.jsx
│   │   │   └── EmployeeDashboard.jsx
│   │   ├── leaves/
│   │   │   └── Leaves.jsx
│   │   ├── payroll/
│   │   │   └── Payroll.jsx
│   │   └── profile/
│   │       └── Profile.jsx
│   ├── store/
│   │   ├── authStore.js
│   │   └── notificationStore.js
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── vite.config.js
└── README.md
```

---

## 🏁 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd "ODOO X GCET"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:5173
   ```

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

---

## 👥 Test Credentials

### Admin Account
- **Employee ID**: EMP003
- **Email**: bob.johnson@company.com
- **Password**: Use any password (mock authentication)
- **Role**: Admin

### HR Account
- **Employee ID**: EMP002
- **Email**: jane.smith@company.com
- **Password**: Use any password
- **Role**: HR Officer

### Employee Account
- **Employee ID**: EMP001
- **Email**: john.doe@company.com
- **Password**: Use any password
- **Role**: Employee

**Note**: The current implementation uses mock authentication. For production, integrate with a real backend API.

---

## 🔑 Key Features Implementation Status

| Feature | Status | Notes |
|---------|--------|-------|
| Authentication (Sign Up/Sign In) | ✅ Complete | Employee ID format enforced |
| Strong Password Policy | ✅ Complete | 8+ chars with complexity |
| Role-Based Access Control | ✅ Complete | Employee/HR/Admin |
| Employee Dashboard | ✅ Complete | Quick access cards |
| Admin Dashboard | ✅ Complete | Statistics & analytics |
| Profile Management | ✅ Complete | Comprehensive fields |
| Attendance Tracking | ✅ Complete | Daily check-in/out |
| Leave Management | ✅ Complete | Apply, approve, track |
| Leave Balance Tracking | ✅ Complete | Per employee |
| Payroll Viewing | ✅ Complete | Detailed breakdown |
| Salary Structure Management | ✅ Complete | Admin controls |
| Notifications System | ✅ Complete | Real-time alerts |
| Email Verification Flag | ✅ Complete | Ready for backend |
| Document Management | ✅ Complete | Upload placeholders |

---

## 📱 User Roles & Permissions

### 👤 Employee
- View and edit personal profile (limited fields)
- Track own attendance
- Apply for leave
- View leave balance and history
- View salary and payroll (read-only)
- Receive notifications

### 👔 HR Officer
- All Employee permissions
- View all employee profiles
- View all attendance records
- Approve/reject leave requests
- View all leave balances
- View all payroll records
- Update employee details
- Send notifications

### 🔑 Admin
- All HR Officer permissions
- Manage all employee data
- Update salary structures
- Full system access
- System configuration

---

## 🎨 Design System

### Color Scheme
- **Primary**: Blue tones for professionalism
- **Success**: Green for approvals and positive actions
- **Warning**: Orange for pending states
- **Error**: Red for rejections and errors
- **Info**: Purple for informational elements

### Typography
- **Font Family**: System fonts with Inter fallback
- **Headings**: Bold weights for hierarchy
- **Body**: Regular weight for readability

### Components
- Built with Radix UI for accessibility
- Consistent spacing and sizing
- Responsive design patterns
- Dark mode support (configurable)

---

## 🔄 Mock Data Structure

### Employee Data
- Basic info: ID, name, email, role, department, position
- Contact: Phone, address, emergency contact
- Personal: DOB, gender, marital status
- Salary: Base salary with allowances/deductions breakdown
- Leave: Balance tracking (paid, sick, unpaid)
- Documents: Uploaded files metadata
- Status: Active/Inactive, email verified

### Attendance Data
- Date-wise records
- Check-in/check-out times
- Status: Present, Absent, Half-day, Leave
- Working hours calculation

### Leave Data
- Leave type, date range, days count
- Reason and status
- Approval workflow: Applied date, approved by, comments

### Payroll Data
- Monthly records
- Salary breakdown: Base + allowances - deductions
- Gross and net salary
- Payment status and date

---

## 🔮 Future Enhancements

### Planned Features
- [ ] Advanced analytics and reporting dashboard
- [ ] Export functionality (PDF/Excel)
- [ ] Email notifications integration
- [ ] Performance management module
- [ ] Asset management
- [ ] Training & development tracking
- [ ] Recruitment module
- [ ] Employee self-service portal enhancements
- [ ] Mobile app (React Native)
- [ ] Integration with third-party systems (Slack, Teams, etc.)
- [ ] Biometric attendance integration
- [ ] Shift management
- [ ] Overtime tracking
- [ ] Holiday calendar management

### Backend Integration
- REST API or GraphQL backend
- Database: PostgreSQL/MySQL/MongoDB
- Authentication: JWT or OAuth2
- File storage: AWS S3 or similar
- Email service: SendGrid, AWS SES
- Real-time updates: WebSockets

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is part of an academic/training program. All rights reserved.

---

## 📞 Support

For support or queries:
- Create an issue in the repository
- Contact the development team

---

## 🎓 Design Reference

Excalidraw Design: [View Design](https://link.excalidraw.com/l/65VNwvy7c4X/58RLEJ4oOwh)

---

## 📝 Notes

- This is a frontend-only implementation with mock data
- All API calls simulate network delays for realistic UX
- Ready for backend integration with minimal changes
- Follows React best practices and modern patterns
- Fully responsive design for desktop and mobile
- Accessibility-first approach with Radix UI

---

**Built with ❤️ for ODOO X GCET**
