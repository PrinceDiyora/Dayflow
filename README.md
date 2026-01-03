# Dayflow / WorkZen - HRMS Frontend

A production-grade, frontend-only Human Resource Management System (HRMS) built with React, Vite, and Tailwind CSS.

## Features

- 🔐 Authentication (Login/Signup with role selection)
- 📊 Dashboard (Employee & Admin/HR views)
- 👤 Employee Profile Management
- ⏰ Attendance Tracking (Check-in/Check-out)
- 📅 Leave & Time-Off Management
- 💰 Payroll & Salary Management
- 🎨 Modern, responsive UI with shadcn/ui components

## Tech Stack

- **React 18** with Vite
- **Tailwind CSS** for styling
- **shadcn/ui** components
- **React Router v6** for routing
- **Zustand** for state management
- **react-hook-form + zod** for form validation
- **Sonner** for toast notifications
- **Lucide React** for icons
- **Axios** (mocked) for API calls

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

## Project Structure

```
src/
├── components/
│   ├── layout/          # Sidebar, Navbar, MainLayout
│   ├── ui/             # shadcn/ui components
│   └── ProtectedRoute.jsx
├── pages/
│   ├── auth/           # Login, Signup
│   ├── dashboard/      # Employee & Admin dashboards
│   ├── profile/        # Employee profile
│   ├── attendance/     # Attendance management
│   ├── leaves/         # Leave management
│   └── payroll/        # Payroll management
├── store/              # Zustand stores
├── mocks/              # Mock API and data
├── lib/                # Utilities
└── App.jsx             # Main app component
```

## Mock Data

The application uses mock data stored in `src/mocks/data.js`. You can modify this file to test different scenarios.

### Test Credentials

Use any email from the mock employees list:
- `john.doe@company.com` (Employee)
- `jane.smith@company.com` (HR)
- `bob.johnson@company.com` (Admin)

Password: Any password (validation is mocked)

## Features by Role

### Employee
- View own profile
- Check in/out for attendance
- Apply for leaves
- View own payroll

### HR Officer
- View all employees
- Approve/reject leave requests
- View attendance records
- Manage employee profiles

### Admin
- All HR features
- Edit salary structures
- Full access to all modules

## Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## TODO: Backend Integration

All API calls are currently mocked. To integrate with a real backend:

1. Update `src/mocks/api.js` to use actual API endpoints
2. Replace mock data with real API calls
3. Update authentication flow to use real tokens
4. Add proper error handling and loading states

## License

MIT

