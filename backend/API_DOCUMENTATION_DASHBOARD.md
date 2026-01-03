# Dashboard API Documentation

## Base URL
```
http://localhost:5000/api/dashboard
```

## Authentication
All endpoints require JWT authentication via cookie or Bearer token.

---

## Employee Dashboard

### Get Employee Dashboard Data
Retrieve comprehensive dashboard data for the logged-in employee.

**Endpoint:** `GET /api/dashboard/employee`

**Access:** Private (Any authenticated employee)

**Headers:**
```
Cookie: token=<jwt_token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "profile": {
      "id": "6581234567890abcdef12345",
      "employeeId": "EMP001",
      "name": "John Doe",
      "email": "john.doe@company.com",
      "phone": "+1234567890",
      "department": "Engineering",
      "position": "Software Engineer",
      "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=EMP001",
      "joinDate": "2024-01-15T00:00:00.000Z",
      "status": "active"
    },
    "attendance": {
      "today": {
        "status": "present",
        "checkIn": "2026-01-03T09:00:00.000Z",
        "checkOut": "2026-01-03T18:00:00.000Z",
        "isLate": false,
        "hoursWorked": "9.00"
      },
      "thisMonth": {
        "totalWorkingDays": 20,
        "presentDays": 18,
        "absentDays": 2,
        "lateDays": 3,
        "totalHours": "162.50",
        "attendanceRate": "90.0"
      }
    },
    "leaves": {
      "balance": {
        "paid": 12,
        "sick": 7,
        "unpaid": 5,
        "total": 24,
        "used": 6,
        "remaining": 18
      },
      "summary": {
        "pending": 1,
        "approved": 5,
        "rejected": 0,
        "usedThisYear": 6
      },
      "recent": [
        {
          "id": "6581234567890abcdef67890",
          "type": "paid",
          "startDate": "2025-12-20T00:00:00.000Z",
          "endDate": "2025-12-22T00:00:00.000Z",
          "status": "approved",
          "reason": "Family vacation",
          "approvedBy": "Jane Smith",
          "appliedDate": "2025-12-01T10:30:00.000Z"
        }
      ],
      "upcoming": [
        {
          "id": "6581234567890abcdef67891",
          "type": "paid",
          "startDate": "2026-02-10T00:00:00.000Z",
          "endDate": "2026-02-12T00:00:00.000Z",
          "reason": "Personal work"
        }
      ]
    },
    "payroll": {
      "current": {
        "month": 1,
        "year": 2026,
        "basicSalary": 50000,
        "allowances": 20000,
        "deductions": 8000,
        "grossSalary": 70000,
        "netSalary": 62000,
        "status": "paid",
        "paymentDate": "2026-01-01T00:00:00.000Z"
      },
      "history": [
        {
          "month": 1,
          "year": 2026,
          "netSalary": 62000,
          "status": "paid"
        },
        {
          "month": 12,
          "year": 2025,
          "netSalary": 62000,
          "status": "paid"
        },
        {
          "month": 11,
          "year": 2025,
          "netSalary": 62000,
          "status": "paid"
        }
      ]
    }
  }
}
```

**Error Responses:**

`401 Unauthorized`
```json
{
  "success": false,
  "message": "Not authorized to access this route"
}
```

`404 Not Found`
```json
{
  "success": false,
  "message": "Employee not found"
}
```

---

## Admin/HR Dashboard

### Get Admin Dashboard Data
Retrieve comprehensive dashboard data for Admin/HR with system-wide statistics.

**Endpoint:** `GET /api/dashboard/admin`

**Access:** Private (Admin/HR only)

**Headers:**
```
Cookie: token=<jwt_token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "employees": {
      "total": 150,
      "active": 145,
      "inactive": 3,
      "suspended": 2,
      "byDepartment": [
        {
          "department": "Engineering",
          "count": 60
        },
        {
          "department": "Sales",
          "count": 40
        },
        {
          "department": "HR",
          "count": 15
        },
        {
          "department": "Finance",
          "count": 20
        },
        {
          "department": "Marketing",
          "count": 15
        }
      ],
      "byRole": [
        {
          "role": "employee",
          "count": 135
        },
        {
          "role": "hr",
          "count": 10
        },
        {
          "role": "admin",
          "count": 5
        }
      ],
      "recentHires": [
        {
          "id": "6581234567890abcdef12345",
          "name": "Alice Johnson",
          "employeeId": "EMP150",
          "department": "Engineering",
          "position": "Frontend Developer",
          "joinDate": "2025-12-15T00:00:00.000Z"
        },
        {
          "id": "6581234567890abcdef12346",
          "name": "Bob Williams",
          "employeeId": "EMP149",
          "department": "Sales",
          "position": "Sales Executive",
          "joinDate": "2025-12-10T00:00:00.000Z"
        }
      ]
    },
    "attendance": {
      "today": {
        "present": 138,
        "absent": 7,
        "late": 12,
        "total": 145,
        "attendanceRate": "95.2"
      },
      "thisMonth": [
        {
          "status": "present",
          "count": 2500
        },
        {
          "status": "absent",
          "count": 120
        },
        {
          "status": "half-day",
          "count": 45
        }
      ],
      "last7Days": [
        {
          "date": "2025-12-28",
          "status": "present",
          "count": 140
        },
        {
          "date": "2025-12-28",
          "status": "absent",
          "count": 5
        },
        {
          "date": "2025-12-29",
          "status": "present",
          "count": 142
        },
        {
          "date": "2025-12-29",
          "status": "absent",
          "count": 3
        }
      ],
      "employeesOnLeave": [
        {
          "id": "6581234567890abcdef12347",
          "name": "Carol Martinez",
          "employeeId": "EMP045",
          "department": "Marketing",
          "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=EMP045",
          "leaveType": "paid",
          "startDate": "2026-01-01T00:00:00.000Z",
          "endDate": "2026-01-05T00:00:00.000Z"
        }
      ]
    },
    "leaves": {
      "pending": 8,
      "approvedThisMonth": 25,
      "rejectedThisMonth": 2,
      "byType": [
        {
          "type": "paid",
          "count": 85
        },
        {
          "type": "sick",
          "count": 42
        },
        {
          "type": "unpaid",
          "count": 15
        }
      ],
      "pendingRequests": [
        {
          "id": "6581234567890abcdef67890",
          "employee": {
            "id": "6581234567890abcdef12348",
            "name": "David Lee",
            "employeeId": "EMP078",
            "department": "Engineering",
            "position": "Backend Developer",
            "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=EMP078"
          },
          "leaveType": "paid",
          "startDate": "2026-01-15T00:00:00.000Z",
          "endDate": "2026-01-20T00:00:00.000Z",
          "duration": 6,
          "reason": "Family emergency",
          "appliedDate": "2026-01-02T14:30:00.000Z"
        },
        {
          "id": "6581234567890abcdef67891",
          "employee": {
            "id": "6581234567890abcdef12349",
            "name": "Emma Wilson",
            "employeeId": "EMP092",
            "department": "Sales",
            "position": "Sales Manager",
            "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=EMP092"
          },
          "leaveType": "sick",
          "startDate": "2026-01-04T00:00:00.000Z",
          "endDate": "2026-01-04T00:00:00.000Z",
          "duration": 1,
          "reason": "Medical appointment",
          "appliedDate": "2026-01-03T08:00:00.000Z"
        }
      ]
    },
    "payroll": {
      "currentMonth": {
        "month": 1,
        "year": 2026,
        "totalAmount": 8750000,
        "processed": 145,
        "pending": 0
      },
      "byStatus": [
        {
          "status": "paid",
          "count": 145,
          "totalAmount": 8750000
        }
      ]
    }
  }
}
```

**Error Responses:**

`401 Unauthorized`
```json
{
  "success": false,
  "message": "Not authorized to access this route"
}
```

`403 Forbidden`
```json
{
  "success": false,
  "message": "Access denied. Admin or HR role required."
}
```

---

## Attendance Overview

### Get Attendance Overview by Date Range
Get detailed attendance statistics for a specific date range.

**Endpoint:** `GET /api/dashboard/attendance-overview`

**Access:** Private (Admin/HR only)

**Query Parameters:**
- `startDate` (optional): Start date in YYYY-MM-DD format (default: first day of current month)
- `endDate` (optional): End date in YYYY-MM-DD format (default: today)

**Example Request:**
```
GET /api/dashboard/attendance-overview?startDate=2026-01-01&endDate=2026-01-31
```

**Headers:**
```
Cookie: token=<jwt_token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "date": "2026-01-01",
      "status": "present",
      "count": 120
    },
    {
      "date": "2026-01-01",
      "status": "absent",
      "count": 25
    },
    {
      "date": "2026-01-02",
      "status": "present",
      "count": 138
    },
    {
      "date": "2026-01-02",
      "status": "absent",
      "count": 7
    },
    {
      "date": "2026-01-02",
      "status": "half-day",
      "count": 5
    }
  ]
}
```

**Error Responses:**

`403 Forbidden`
```json
{
  "success": false,
  "message": "Access denied. Admin or HR role required."
}
```

---

## Leave Statistics

### Get Leave Statistics by Year
Get leave statistics grouped by month and leave type for a specific year.

**Endpoint:** `GET /api/dashboard/leave-stats`

**Access:** Private (Admin/HR only)

**Query Parameters:**
- `year` (optional): Year to get statistics for (default: current year)

**Example Request:**
```
GET /api/dashboard/leave-stats?year=2026
```

**Headers:**
```
Cookie: token=<jwt_token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "month": 1,
      "type": "paid",
      "count": 25
    },
    {
      "month": 1,
      "type": "sick",
      "count": 8
    },
    {
      "month": 1,
      "type": "unpaid",
      "count": 2
    },
    {
      "month": 2,
      "type": "paid",
      "count": 30
    },
    {
      "month": 2,
      "type": "sick",
      "count": 12
    }
  ]
}
```

**Error Responses:**

`403 Forbidden`
```json
{
  "success": false,
  "message": "Access denied. Admin or HR role required."
}
```

---

## Usage Examples

### JavaScript/Axios Example

```javascript
// Employee Dashboard
const getEmployeeDashboard = async () => {
  try {
    const response = await axios.get('http://localhost:5000/api/dashboard/employee', {
      withCredentials: true
    });
    console.log(response.data.data);
  } catch (error) {
    console.error('Error:', error.response.data.message);
  }
};

// Admin Dashboard
const getAdminDashboard = async () => {
  try {
    const response = await axios.get('http://localhost:5000/api/dashboard/admin', {
      withCredentials: true
    });
    console.log(response.data.data);
  } catch (error) {
    console.error('Error:', error.response.data.message);
  }
};

// Attendance Overview
const getAttendanceOverview = async (startDate, endDate) => {
  try {
    const response = await axios.get('http://localhost:5000/api/dashboard/attendance-overview', {
      params: { startDate, endDate },
      withCredentials: true
    });
    console.log(response.data.data);
  } catch (error) {
    console.error('Error:', error.response.data.message);
  }
};
```

### cURL Examples

```bash
# Employee Dashboard
curl -X GET http://localhost:5000/api/dashboard/employee \
  -H "Cookie: token=YOUR_JWT_TOKEN"

# Admin Dashboard
curl -X GET http://localhost:5000/api/dashboard/admin \
  -H "Cookie: token=YOUR_JWT_TOKEN"

# Attendance Overview with date range
curl -X GET "http://localhost:5000/api/dashboard/attendance-overview?startDate=2026-01-01&endDate=2026-01-31" \
  -H "Cookie: token=YOUR_JWT_TOKEN"

# Leave Statistics
curl -X GET "http://localhost:5000/api/dashboard/leave-stats?year=2026" \
  -H "Cookie: token=YOUR_JWT_TOKEN"
```

---

## Frontend Integration

### Add to API Service (src/services/api.js)

```javascript
// Dashboard API
export const dashboardAPI = {
  getEmployeeDashboard: () => api.get('/dashboard/employee'),
  getAdminDashboard: () => api.get('/dashboard/admin'),
  getAttendanceOverview: (startDate, endDate) => 
    api.get('/dashboard/attendance-overview', { params: { startDate, endDate } }),
  getLeaveStats: (year) => 
    api.get('/dashboard/leave-stats', { params: { year } }),
};
```

### Usage in React Component

```javascript
import { dashboardAPI } from '@/services/api';

const EmployeeDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await dashboardAPI.getEmployeeDashboard();
        setDashboardData(response.data.data);
      } catch (error) {
        console.error('Failed to load dashboard:', error);
      }
    };
    fetchDashboard();
  }, []);
  
  return (
    <div>
      <h1>Welcome, {dashboardData?.profile.name}</h1>
      <div>Attendance Rate: {dashboardData?.attendance.thisMonth.attendanceRate}%</div>
      <div>Remaining Leaves: {dashboardData?.leaves.balance.remaining}</div>
    </div>
  );
};
```

---

## Notes

1. **Authentication**: All endpoints require valid JWT token in cookies or Authorization header
2. **Authorization**: Admin/HR endpoints return 403 if accessed by regular employees
3. **Date Formats**: All dates are in ISO 8601 format
4. **Timezone**: All dates are stored and returned in UTC
5. **Performance**: Dashboard endpoints use aggregation pipelines for optimal performance
6. **Caching**: Consider implementing Redis caching for frequently accessed dashboard data
