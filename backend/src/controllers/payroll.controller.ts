import { Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma.js';
import { createError } from '../middleware/errorHandler.js';
import { AuthRequest } from '../middleware/auth.middleware.js';


const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export async function getMyPayroll(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.userId) {
      throw createError('Unauthorized', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { firstName: true, lastName: true },
    });

    const payroll = await prisma.payroll.findMany({
      where: { userId: req.userId },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });

    const payrollWithName = payroll.map((record) => ({
      ...record,
      employeeName: user ? `${user.firstName} ${user.lastName}` : 'Unknown',
    }));

    res.json(payrollWithName);
  } catch (error) {
    next(error);
  }
}

export async function getAllPayroll(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const payroll = await prisma.payroll.findMany({
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });

    const payrollWithName = payroll.map((record) => ({
      ...record,
      employeeName: `${record.user.firstName} ${record.user.lastName}`,
      user: undefined, // Remove user object
    }));

    res.json(payrollWithName);
  } catch (error) {
    next(error);
  }
}

export async function updateSalary(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { userId } = req.params;
    const { salary } = req.body;

    if (!salary || salary <= 0) {
      throw createError('Invalid salary amount', 400);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        employee: true,
      },
    });

    if (!user) {
      throw createError('User not found', 404);
    }

    if (!user.employee) {
      throw createError('Employee record not found', 404);
    }

    // Update employee salary
    await prisma.employee.update({
      where: { userId },
      data: { salary },
    });

    // Get current month/year for payroll record
    const now = new Date();
    const month = MONTHS[now.getMonth()];
    const year = now.getFullYear();

    // Create or update payroll record
    const payroll = await prisma.payroll.upsert({
      where: {
        userId_month_year: {
          userId,
          month,
          year,
        },
      },
      create: {
        userId,
        month,
        year,
        baseSalary: salary,
        allowances: 0,
        deductions: 0,
        netSalary: salary,
        status: 'pending',
      },
      update: {
        baseSalary: salary,
        netSalary: salary,
      },
    });

    const payrollWithName = {
      ...payroll,
      employeeName: `${user.firstName} ${user.lastName}`,
    };

    res.json(payrollWithName);
  } catch (error) {
    next(error);
  }
}

export async function processPayroll(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { month, year } = req.body;

    if (!month || !year) {
      throw createError('Month and year are required', 400);
    }

    // Get all active employees
    const employees = await prisma.user.findMany({
      where: {
        status: 'active',
        role: { in: ['employee', 'admin', 'hr'] },
      },
      include: {
        employee: true,
      },
    });

    const payrollRecords = [];

    for (const employee of employees) {
      if (!employee.employee) continue;

      const baseSalary = Number(employee.employee.salary);
      const allowances = baseSalary * 0.1; // 10% allowances (example)
      const deductions = baseSalary * 0.05; // 5% deductions (example)
      const netSalary = baseSalary + allowances - deductions;

      const payroll = await prisma.payroll.upsert({
        where: {
          userId_month_year: {
            userId: employee.id,
            month,
            year,
          },
        },
        create: {
          userId: employee.id,
          month,
          year,
          baseSalary,
          allowances,
          deductions,
          netSalary,
          status: 'processed',
        },
        update: {
          baseSalary,
          allowances,
          deductions,
          netSalary,
          status: 'processed',
        },
      });

      payrollRecords.push({
        ...payroll,
        employeeName: `${employee.firstName} ${employee.lastName}`,
      });
    }

    res.json(payrollRecords);
  } catch (error) {
    next(error);
  }
}

