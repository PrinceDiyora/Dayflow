import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Employee from '../models/Employee.js';
import Attendance from '../models/Attendance.js';
import Leave from '../models/Leave.js';
import Payroll from '../models/Payroll.js';
import connectDB from '../config/database.js';

dotenv.config();

// Sample data
const employees = [
  {
    employeeId: 'EMP001',
    name: 'John Doe',
    email: 'john.doe@company.com',
    password: 'Password@123',
    role: 'employee',
    phone: '+1 234-567-8900',
    department: 'Engineering',
    position: 'Software Engineer',
    salary: 75000,
    dateOfBirth: new Date('1995-03-20'),
    gender: 'male',
    maritalStatus: 'single',
    emailVerified: true,
  },
  {
    employeeId: 'EMP002',
    name: 'Jane Smith',
    email: 'jane.smith@company.com',
    password: 'Password@123',
    role: 'hr',
    phone: '+1 234-567-8901',
    department: 'Human Resources',
    position: 'HR Manager',
    salary: 85000,
    dateOfBirth: new Date('1988-07-15'),
    gender: 'female',
    maritalStatus: 'married',
    emailVerified: true,
  },
  {
    employeeId: 'EMP003',
    name: 'Bob Johnson',
    email: 'bob.johnson@company.com',
    password: 'Password@123',
    role: 'admin',
    phone: '+1 234-567-8902',
    department: 'Administration',
    position: 'Admin Manager',
    salary: 95000,
    dateOfBirth: new Date('1985-11-30'),
    gender: 'male',
    maritalStatus: 'married',
    emailVerified: true,
  },
  {
    employeeId: 'EMP004',
    name: 'Alice Williams',
    email: 'alice.williams@company.com',
    password: 'Password@123',
    role: 'employee',
    phone: '+1 234-567-8903',
    department: 'Marketing',
    position: 'Marketing Specialist',
    salary: 65000,
    dateOfBirth: new Date('1997-09-10'),
    gender: 'female',
    maritalStatus: 'single',
    emailVerified: true,
  },
];

const seedDatabase = async () => {
  try {
    await connectDB();

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await Employee.deleteMany();
    await Attendance.deleteMany();
    await Leave.deleteMany();
    await Payroll.deleteMany();

    // Insert employees
    console.log('👥 Seeding employees...');
    const createdEmployees = await Employee.insertMany(employees);
    console.log(`✅ ${createdEmployees.length} employees created`);

    // Create some attendance records
    console.log('⏰ Seeding attendance records...');
    const attendanceRecords = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      for (const emp of createdEmployees) {
        const record = {
          employeeId: emp._id,
          date,
          checkIn: '09:00',
          checkOut: '18:00',
          status: 'present',
          hours: 9,
        };
        attendanceRecords.push(record);
      }
    }

    await Attendance.insertMany(attendanceRecords);
    console.log(`✅ ${attendanceRecords.length} attendance records created`);

    // Create payroll for current month
    console.log('💰 Seeding payroll records...');
    const payrollRecords = [];
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const currentYear = new Date().getFullYear();

    for (const emp of createdEmployees) {
      const payroll = {
        employeeId: emp._id,
        month: currentMonth,
        year: currentYear,
        baseSalary: emp.salaryStructure.baseSalary,
        allowances: emp.salaryStructure.allowances,
        deductions: emp.salaryStructure.deductions,
        status: 'pending',
      };
      payrollRecords.push(payroll);
    }

    await Payroll.insertMany(payrollRecords);
    console.log(`✅ ${payrollRecords.length} payroll records created`);

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📝 Test Credentials:');
    console.log('   Email: john.doe@company.com');
    console.log('   Email: jane.smith@company.com (HR)');
    console.log('   Email: bob.johnson@company.com (Admin)');
    console.log('   Password: Password@123\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
