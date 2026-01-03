import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma.js';
import { hashPassword, generateRandomPassword } from '../utils/password.js';
import { createError } from '../middleware/errorHandler.js';
import { generateLoginId } from '../utils/loginIdGenerator.js';


export async function getAllEmployees(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const employees = await prisma.user.findMany({
      where: {
        role: { in: ['employee', 'admin', 'hr'] },
      },
      include: {
        employee: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Remove passwords from response
    const employeesWithoutPasswords = employees.map(({ password, ...rest }) => rest);

    res.json(employeesWithoutPasswords);
  } catch (error) {
    next(error);
  }
}

export async function getEmployeeById(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        employee: true,
      },
    });

    if (!user) {
      throw createError('Employee not found', 404);
    }

    const { password: _, ...userWithoutPassword } = user;

    res.json(userWithoutPassword);
  } catch (error) {
    next(error);
  }
}

export async function createEmployee(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const {
      email,
      firstName,
      lastName,
      department,
      position,
      phone,
      salary,
      role = 'employee',
    } = req.body;

    if (!email || !firstName || !lastName || !department || !position || !phone || !salary) {
      throw createError('Missing required fields', 400);
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      throw createError('Email already exists', 400);
    }

    // Generate auto password and Login ID
    const autoPassword = generateRandomPassword();
    const hashedPassword = await hashPassword(autoPassword);
    const loginId = await generateLoginId(firstName, lastName, department);

    // Create user and employee in transaction
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: email.toLowerCase(),
          loginId: loginId, // Store generated Login ID
          password: hashedPassword,
          firstName,
          lastName,
          department,
          position,
          phone,
          role: role as any,
          status: 'active',
        },
      });

      const employee = await tx.employee.create({
        data: {
          userId: user.id,
          salary: salary,
        },
      });

      return { user, employee };
    });

    const { password: _, ...userWithoutPassword } = result.user;

    res.status(201).json({
      ...userWithoutPassword,
      employee: result.employee,
      loginId, // Return generated Login ID
      autoPassword, // Return auto-generated password (only on creation)
      message: 'Employee created successfully. Login ID and password have been auto-generated.',
    });
  } catch (error) {
    next(error);
  }
}

export async function updateEmployee(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
      include: { employee: true },
    });

    if (!existingUser) {
      throw createError('Employee not found', 404);
    }

    // Update user
    const userUpdateData: any = {};
    if (updateData.email) userUpdateData.email = updateData.email.toLowerCase();
    if (updateData.firstName) userUpdateData.firstName = updateData.firstName;
    if (updateData.lastName) userUpdateData.lastName = updateData.lastName;
    if (updateData.department) userUpdateData.department = updateData.department;
    if (updateData.position) userUpdateData.position = updateData.position;
    if (updateData.phone) userUpdateData.phone = updateData.phone;
    if (updateData.status) userUpdateData.status = updateData.status;

    // Update employee salary if provided
    if (updateData.salary && existingUser.employee) {
      await prisma.employee.update({
        where: { userId: id },
        data: { salary: updateData.salary },
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: userUpdateData,
      include: {
        employee: true,
      },
    });

    const { password: _, ...userWithoutPassword } = updatedUser;

    res.json(userWithoutPassword);
  } catch (error) {
    next(error);
  }
}

export async function deleteEmployee(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw createError('Employee not found', 404);
    }

    // Soft delete (set status to inactive)
    await prisma.user.update({
      where: { id },
      data: { status: 'inactive' },
    });

    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    next(error);
  }
}

