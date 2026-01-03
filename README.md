# Dayflow HRMS - Frontend

**Tagline:** Every workday, perfectly aligned.

A complete, production-ready, responsive, and accessible frontend for Dayflow HRMS built with React, TypeScript, and modern frontend best practices.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Modern web browser

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd dayflow-hrms-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
VITE_API_URL=http://localhost:5000
VITE_USE_MOCK=true
```

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:5173`

## 📦 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run validate-spec` - Validate backend integration specification
- `npm run sync-spec` - Sync and regenerate backend-integration.json

## 🏗️ Project Structure

```
src/
├── api/                    # API client and endpoints
│   ├── axios.ts           # Axios configuration with interceptors
│   ├── auth.api.ts        # Authentication API
│   ├── employees.api.ts   # Employees API
│   ├── attendance.api.ts  # Attendance API
│   ├── leaves.api.ts      # Leaves API
│   ├── payroll.api.ts     # Payroll API
│   └── payslips.api.ts    # Payslips API
├── components/
│   ├── layout/            # Layout components
│   │   ├── sidebar.tsx    # Left navigation sidebar
│   │   ├── topbar.tsx     # Top header bar
│   │   └── app-layout.tsx # Main app layout wrapper
│   ├── ui/                # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── dialog.tsx
│   │   ├── sheet.tsx
│   │   ├── table.tsx
│   │   ├── badge.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── toast.tsx
│   │   └── toaster.tsx
│   └── common/            # Reusable components
│       ├── protected-route.tsx
│       └── loading-skeleton.tsx
├── pages/                 # Page components
│   ├── auth/
│   │   └── login.tsx
│   ├── dashboard/
│   │   ├── employee-dashboard.tsx
│   │   └── admin-dashboard.tsx
│   ├── profile/
│   │   └── profile.tsx
│   ├── employees/
│   │   └── employees.tsx
│   ├── attendance/
│   │   └── attendance.tsx
│   ├── leaves/
│   │   └── leaves.tsx
│   ├── payroll/
│   │   └── payroll.tsx
│   ├── payslips/
│   │   └── payslips.tsx
│   ├── settings/
│   │   └── settings.tsx
│   ├── reports/
│   │   └── reports.tsx
│   └── 404.tsx
├── store/                 # State management
│   └── auth.store.ts     # Zustand auth store
├── types/                 # TypeScript types
│   └── index.ts
├── mocks/                 # Mock API services
│   ├── auth.mock.ts
│   ├── employees.mock.ts
│   ├── attendance.mock.ts
│   ├── leaves.mock.ts
│   ├── payroll.mock.ts
│   └── payslips.mock.ts
├── lib/                   # Utility functions
│   └── utils.ts
├── hooks/                 # Custom React hooks
│   └── use-toast.ts
├── routes/                # React Router configuration
│   └── index.tsx
├── styles/                # Global styles
│   └── index.css
├── App.tsx                # Main app component
├── main.tsx               # Entry point
└── backend-integration.json # API contract specification
```

## 🎨 Features

### User Roles

#### Employee
- View and edit profile
- Check-in/Check-out attendance
- View attendance history
- Apply for leave
- View leave status
- View payroll (read-only)
- Download payslips

#### Admin/HR Officer
- All employee features
- Manage employees (CRUD)
- View all attendance records
- Approve/reject leave requests
- Manage payroll & salary structure
- View reports & analytics
- System settings

### Pages & Routes

- `/login` - Authentication page
- `/dashboard/employee` - Employee dashboard
- `/dashboard/admin` - Admin dashboard
- `/profile` - User profile (view/edit)
- `/employees` - Employee management (Admin only)
- `/attendance` - Attendance tracking
- `/leaves` - Leave management
- `/payroll` - Payroll information
- `/payslips` - Payslip viewing and download
- `/settings` - System settings (Admin only)
- `/reports` - Reports & analytics (Admin only)

## 🛠️ Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality component library
- **React Router v6** - Client-side routing
- **Zustand** - State management
- **React Hook Form** - Form handling
- **Zod** - Schema validation
- **Axios** - HTTP client
- **dayjs** - Date manipulation
- **Sonner** - Toast notifications
- **Lucide React** - Icon library

## 🎯 Design System

### Colors
- Primary: Blue (#3B82F6)
- Secondary: Gray
- Success: Green
- Error: Red
- Warning: Yellow

### Typography
- Font family: System fonts
- Scale: Responsive typography scale

### Spacing
- Consistent spacing scale using Tailwind's spacing utilities

### Components
- Rounded corners: `rounded-2xl` (1rem)
- Shadows: `shadow-sm`, `shadow-md`
- Consistent padding and margins

## 📱 Responsive Design

### Breakpoints
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

### Behavior
- **Desktop**: Full sidebar navigation
- **Tablet**: Collapsible sidebar
- **Mobile**: Hamburger menu → Drawer sidebar

## 🔌 Backend Integration

### Mock Mode

By default, the app runs in mock mode (`VITE_USE_MOCK=true`). This uses in-memory mock APIs for development.

### Real Backend

To connect to a real backend:

1. Set `VITE_USE_MOCK=false` in `.env`
2. Update `VITE_API_URL` to your backend URL
3. Ensure your backend implements the API contract specified in `src/backend-integration.json`

### API Contract

The complete API contract is documented in `src/backend-integration.json`. This JSON file specifies:
- All endpoints
- Request/response formats
- Authentication requirements
- Error responses

The backend team should implement exactly this contract.

## 🔄 Backend Integration Workflow

### Integration Tracking System

The project includes a comprehensive backend integration tracking system to ensure perfect synchronization between frontend and backend teams.

#### Key Files

1. **`src/backendIntegration.ts`** - Single source of truth for all API contracts
   - Machine-readable TypeScript specification
   - Domain types and endpoint definitions
   - API client factory
   - Environment configuration

2. **`src/backend-integration.json`** - Machine-readable JSON contract
   - Generated from `backendIntegration.ts`
   - Used by backend developers
   - CI/CD validation
   - API documentation tooling

3. **`src/integration-tracker.md`** - Human-readable integration dashboard
   - ✅ Implemented endpoints
   - ⚠️ Mocked endpoints
   - ❌ Pending endpoints
   - Backend TODOs and open questions

#### Workflow

**For Frontend Developers:**

1. **Development with Mocks:**
   ```bash
   # Set in .env
   VITE_USE_MOCK=true
   ```
   - All API calls use mock handlers
   - Work independently without backend
   - Test all features end-to-end

2. **Adding New API Calls:**
   - Add API function in `src/api/`
   - Update `src/backendIntegration.ts` with endpoint spec
   - Create mock in `src/mocks/`
   - Run `npm run validate-spec` to verify

3. **Switching to Real Backend:**
   ```bash
   # Set in .env
   VITE_USE_MOCK=false
   VITE_API_URL=http://localhost:5000
   ```

**For Backend Developers:**

1. **Review Contract:**
   - Read `src/backend-integration.json` for exact API contract
   - Check `src/integration-tracker.md` for implementation details

2. **Implementation Priority:**
   - Start with Auth endpoints (login, logout, getCurrentUser)
   - Then Employees (CRUD operations)
   - Then Attendance, Leaves, Payroll, Payslips

3. **Update Status:**
   - When endpoint is implemented, update status in `backendIntegration.ts`
   - Change from `'mocked'` to `'implemented'`
   - Run `npm run sync-spec` to regenerate JSON

**For CI/CD:**

1. **Validation:**
   ```bash
   npm run validate-spec
   ```
   - Ensures all frontend API calls exist in spec
   - Fails build on contract violations
   - Prevents frontend/backend mismatch

2. **Sync:**
   ```bash
   npm run sync-spec
   ```
   - Regenerates `backend-integration.json`
   - Bumps version automatically
   - Updates metadata

#### Integration Validation Rules

- ✅ Every axios call → must exist in `backendIntegrationSpec`
- ✅ Every spec endpoint → must have usage or TODO
- ✅ Mismatches → flagged in `integration-tracker.md`
- ✅ CI fails on violations

#### Versioning & Traceability

- Auto-incrementing version (v1.0 → v1.1)
- Timestamp tracking
- Change summaries
- Author attribution

See `src/integration-tracker.md` for complete endpoint documentation and backend TODOs.

## 🔐 Authentication

- JWT-based authentication
- Token stored in localStorage (via Zustand persist)
- Automatic token injection in API requests
- Automatic logout on 401 responses

### Demo Credentials

**Admin:**
- Email: `admin@dayflow.com`
- Password: `password`

**Employee:**
- Email: `employee@dayflow.com`
- Password: `password`

## 🧪 Development

### Adding New Pages

1. Create page component in `src/pages/`
2. Add route in `src/routes/index.tsx`
3. Add navigation item in `src/components/layout/sidebar.tsx` (if needed)

### Adding New API Endpoints

1. Create API function in appropriate file in `src/api/`
2. Create mock implementation in `src/mocks/`
3. Update `src/backend-integration.json` with contract

### Styling

- Use Tailwind CSS utility classes
- Follow existing component patterns
- Maintain consistent spacing and typography

## 📝 Code Quality

- TypeScript strict mode enabled
- ESLint configured
- Consistent code formatting
- Accessible components (ARIA labels, keyboard navigation)
- Form validation with Zod

## 🚢 Deployment

### Build for Production

```bash
npm run build
```

The `dist/` folder will contain the production build.

### Environment Variables

For production, set:
- `VITE_API_URL` - Your production API URL
- `VITE_USE_MOCK=false` - Disable mock mode

## 📄 License

This project is proprietary software.

## 👥 Support

For issues or questions, please contact the development team.

---

**Built with ❤️ for Dayflow HRMS**

