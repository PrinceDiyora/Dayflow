# Backend Setup - Quick Guide

## Step 1: Install MongoDB

### Windows
1. Download MongoDB from https://www.mongodb.com/try/download/community
2. Install MongoDB Community Edition
3. MongoDB should start automatically as a service

### Or use MongoDB Atlas (Cloud)
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create cluster
4. Get connection string
5. Use it in .env file

## Step 2: Install Dependencies

```powershell
cd backend
npm install
```

## Step 3: Start MongoDB (if using local)

MongoDB should be running as a Windows service. Check with:
```powershell
# Check if MongoDB service is running
Get-Service -Name MongoDB

# Or start MongoDB manually
mongod
```

## Step 4: Configure Environment

The `.env` file is already created. If using MongoDB Atlas, update the connection string:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dayflow-hrms
```

## Step 5: Seed Database

```powershell
npm run seed
```

This will create:
- 4 test employees
- Attendance records
- Payroll records

## Step 6: Start Server

```powershell
# Development mode (auto-reload)
npm run dev

# Or production mode
npm start
```

Server will start on: http://localhost:5000

## Step 7: Test the API

### Method 1: Browser
Visit: http://localhost:5000

### Method 2: PowerShell
```powershell
# Test health check
Invoke-RestMethod -Uri http://localhost:5000 -Method Get

# Test login
$body = @{
    email = "john.doe@company.com"
    password = "Password@123"
} | ConvertTo-Json

Invoke-RestMethod -Uri http://localhost:5000/api/auth/login -Method Post -Body $body -ContentType "application/json"
```

## Test Credentials

After seeding:
- **Employee**: john.doe@company.com / Password@123
- **HR**: jane.smith@company.com / Password@123  
- **Admin**: bob.johnson@company.com / Password@123

## Common Issues

### MongoDB not running
```powershell
# Start MongoDB service
Start-Service MongoDB

# Or run mongod
mongod --dbpath C:\data\db
```

### Port 5000 already in use
Change PORT in .env file:
```env
PORT=5001
```

### Connection errors
- Check MongoDB is running
- Verify MONGODB_URI in .env
- Check firewall settings

## Next Steps

Once backend is running:
1. Keep this terminal open
2. Open new terminal for frontend
3. Connect frontend to backend by updating API base URL

## API Documentation

See `backend/README.md` for complete API documentation.

---

**Ready to go! 🚀**
