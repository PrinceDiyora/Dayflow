import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create Admin User
  const adminPassword = await bcrypt.hash('password', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@dayflow.com' },
    update: {},
    create: {
      email: 'admin@dayflow.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      department: 'HR',
      position: 'HR Manager',
      phone: '+1234567890',
      status: 'active',
      employee: {
        create: {
          salary: 100000,
        },
      },
    },
  });

  console.log('✅ Created admin user:', admin.email);

  // Create Employee User
  const employeePassword = await bcrypt.hash('password', 10);
  const employee = await prisma.user.upsert({
    where: { email: 'employee@dayflow.com' },
    update: {},
    create: {
      email: 'employee@dayflow.com',
      password: employeePassword,
      firstName: 'John',
      lastName: 'Doe',
      role: 'employee',
      department: 'Engineering',
      position: 'Software Engineer',
      phone: '+1234567891',
      status: 'active',
      employee: {
        create: {
          salary: 75000,
        },
      },
    },
  });

  console.log('✅ Created employee user:', employee.email);

  // Create sample attendance records
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  await prisma.attendance.createMany({
    data: [
      {
        userId: employee.id,
        date: today,
        checkIn: '09:00',
        checkOut: '17:30',
        status: 'present',
        totalHours: 8.5,
      },
      {
        userId: employee.id,
        date: yesterday,
        checkIn: '09:15',
        checkOut: '17:00',
        status: 'present',
        totalHours: 7.75,
      },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Created sample attendance records');

  // Create sample leave request
  const leaveStartDate = new Date(today);
  leaveStartDate.setDate(leaveStartDate.getDate() + 5);

  const leaveEndDate = new Date(leaveStartDate);
  leaveEndDate.setDate(leaveEndDate.getDate() + 2);

  await prisma.leave.create({
    data: {
      userId: employee.id,
      type: 'paid',
      startDate: leaveStartDate,
      endDate: leaveEndDate,
      days: 3,
      reason: 'Family vacation',
      status: 'pending',
    },
  });

  console.log('✅ Created sample leave request');

  // Create sample payroll record
  const currentMonth = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'][today.getMonth()];
  const currentYear = today.getFullYear();

  await prisma.payroll.upsert({
    where: {
      userId_month_year: {
        userId: employee.id,
        month: currentMonth,
        year: currentYear,
      },
    },
    update: {},
    create: {
      userId: employee.id,
      month: currentMonth,
      year: currentYear,
      baseSalary: 75000,
      allowances: 5000,
      deductions: 2000,
      netSalary: 78000,
      status: 'paid',
    },
  });

  console.log('✅ Created sample payroll record');

  // Create sample payslip
  await prisma.payslip.upsert({
    where: {
      userId_month_year: {
        userId: employee.id,
        month: currentMonth,
        year: currentYear,
      },
    },
    update: {},
    create: {
      userId: employee.id,
      month: currentMonth,
      year: currentYear,
      baseSalary: 75000,
      allowances: 5000,
      deductions: 2000,
      netSalary: 78000,
    },
  });

  console.log('✅ Created sample payslip');

  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

