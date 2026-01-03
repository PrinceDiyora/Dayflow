import { Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma.js';
import { createError } from '../middleware/errorHandler.js';
import { AuthRequest } from '../middleware/auth.middleware.js';


// Helper to calculate hours between two times
function calculateHours(checkIn: string, checkOut: string): number {
  const [inHour, inMin] = checkIn.split(':').map(Number);
  const [outHour, outMin] = checkOut.split(':').map(Number);
  const inMinutes = inHour * 60 + inMin;
  const outMinutes = outHour * 60 + outMin;
  return (outMinutes - inMinutes) / 60;
}

// Helper to get current time in HH:mm format
function getCurrentTime(): string {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

export async function getMyAttendance(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.userId) {
      throw createError('Unauthorized', 401);
    }

    const attendance = await prisma.attendance.findMany({
      where: { userId: req.userId },
      orderBy: { date: 'desc' },
    });

    res.json(attendance);
  } catch (error) {
    next(error);
  }
}

export async function getAllAttendance(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const attendance = await prisma.attendance.findMany({
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { date: 'desc' },
    });

    res.json(attendance);
  } catch (error) {
    next(error);
  }
}

export async function checkIn(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.userId) {
      throw createError('Unauthorized', 401);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if already checked in today
    const existing = await prisma.attendance.findUnique({
      where: {
        userId_date: {
          userId: req.userId,
          date: today,
        },
      },
    });

    const checkInTime = getCurrentTime();

    if (existing) {
      // Update existing record
      const updated = await prisma.attendance.update({
        where: { id: existing.id },
        data: {
          checkIn: checkInTime,
          status: 'present',
        },
      });
      return res.json(updated);
    }

    // Create new record
    const attendance = await prisma.attendance.create({
      data: {
        userId: req.userId,
        date: today,
        checkIn: checkInTime,
        status: 'present',
      },
    });

    res.status(201).json(attendance);
  } catch (error) {
    next(error);
  }
}

export async function checkOut(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.userId) {
      throw createError('Unauthorized', 401);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await prisma.attendance.findUnique({
      where: {
        userId_date: {
          userId: req.userId,
          date: today,
        },
      },
    });

    if (!attendance) {
      throw createError('No check-in record found for today', 400);
    }

    if (!attendance.checkIn) {
      throw createError('Check-in not recorded', 400);
    }

    if (attendance.checkOut) {
      throw createError('Already checked out for today', 400);
    }

    const checkOutTime = getCurrentTime();
    const totalHours = calculateHours(attendance.checkIn, checkOutTime);

    const updated = await prisma.attendance.update({
      where: { id: attendance.id },
      data: {
        checkOut: checkOutTime,
        totalHours: totalHours,
      },
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
}

export async function getTodayAttendance(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.userId) {
      throw createError('Unauthorized', 401);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await prisma.attendance.findUnique({
      where: {
        userId_date: {
          userId: req.userId,
          date: today,
        },
      },
    });

    res.json(attendance || null);
  } catch (error) {
    next(error);
  }
}

