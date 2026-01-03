import { Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma.js';
import { createError } from '../middleware/errorHandler.js';
import { AuthRequest } from '../middleware/auth.middleware.js';


// Helper to calculate days between two dates
function calculateDays(startDate: Date, endDate: Date): number {
  const timeDiff = endDate.getTime() - startDate.getTime();
  const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
  return daysDiff + 1; // Inclusive of both start and end dates
}

export async function getMyLeaves(
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

    const leaves = await prisma.leave.findMany({
      where: { userId: req.userId },
      orderBy: { appliedAt: 'desc' },
    });

    // Add employeeName to each leave
    const leavesWithName = leaves.map((leave) => ({
      ...leave,
      employeeName: user ? `${user.firstName} ${user.lastName}` : 'Unknown',
    }));

    res.json(leavesWithName);
  } catch (error) {
    next(error);
  }
}

export async function getAllLeaves(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const leaves = await prisma.leave.findMany({
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { appliedAt: 'desc' },
    });

    const leavesWithName = leaves.map((leave) => ({
      ...leave,
      employeeName: `${leave.user.firstName} ${leave.user.lastName}`,
      user: undefined, // Remove user object
    }));

    res.json(leavesWithName);
  } catch (error) {
    next(error);
  }
}

export async function applyLeave(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.userId) {
      throw createError('Unauthorized', 401);
    }

    const { type, startDate, endDate, reason } = req.body;

    if (!type || !startDate || !endDate || !reason) {
      throw createError('Missing required fields', 400);
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      throw createError('Start date must be before end date', 400);
    }

    const days = calculateDays(start, end);

    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { firstName: true, lastName: true },
    });

    const leave = await prisma.leave.create({
      data: {
        userId: req.userId,
        type: type as any,
        startDate: start,
        endDate: end,
        days,
        reason,
        status: 'pending',
      },
    });

    const leaveWithName = {
      ...leave,
      employeeName: user ? `${user.firstName} ${user.lastName}` : 'Unknown',
    };

    res.status(201).json(leaveWithName);
  } catch (error) {
    next(error);
  }
}

export async function approveLeave(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.userId) {
      throw createError('Unauthorized', 401);
    }

    const { id } = req.params;
    const { comments } = req.body;

    const leave = await prisma.leave.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!leave) {
      throw createError('Leave request not found', 404);
    }

    if (leave.status !== 'pending') {
      throw createError('Leave request is not pending', 400);
    }

    const reviewer = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { firstName: true, lastName: true },
    });

    const updated = await prisma.leave.update({
      where: { id },
      data: {
        status: 'approved',
        reviewedBy: reviewer ? `${reviewer.firstName} ${reviewer.lastName}` : 'Admin',
        reviewedAt: new Date(),
        comments: comments || undefined,
      },
    });

    const leaveWithName = {
      ...updated,
      employeeName: `${leave.user.firstName} ${leave.user.lastName}`,
    };

    res.json(leaveWithName);
  } catch (error) {
    next(error);
  }
}

export async function rejectLeave(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.userId) {
      throw createError('Unauthorized', 401);
    }

    const { id } = req.params;
    const { comments } = req.body;

    const leave = await prisma.leave.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!leave) {
      throw createError('Leave request not found', 404);
    }

    if (leave.status !== 'pending') {
      throw createError('Leave request is not pending', 400);
    }

    const reviewer = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { firstName: true, lastName: true },
    });

    const updated = await prisma.leave.update({
      where: { id },
      data: {
        status: 'rejected',
        reviewedBy: reviewer ? `${reviewer.firstName} ${reviewer.lastName}` : 'Admin',
        reviewedAt: new Date(),
        comments: comments || undefined,
      },
    });

    const leaveWithName = {
      ...updated,
      employeeName: `${leave.user.firstName} ${leave.user.lastName}`,
    };

    res.json(leaveWithName);
  } catch (error) {
    next(error);
  }
}

