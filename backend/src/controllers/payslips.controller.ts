import { Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma.js';
import PDFDocument from 'pdfkit';
import { createError } from '../middleware/errorHandler.js';
import { AuthRequest } from '../middleware/auth.middleware.js';


export async function getMyPayslips(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.userId) {
      throw createError('Unauthorized', 401);
    }

    const payslips = await prisma.payslip.findMany({
      where: { userId: req.userId },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });

    res.json(payslips);
  } catch (error) {
    next(error);
  }
}

export async function getPayslipById(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.userId) {
      throw createError('Unauthorized', 401);
    }

    const { id } = req.params;

    const payslip = await prisma.payslip.findUnique({
      where: { id },
    });

    if (!payslip) {
      throw createError('Payslip not found', 404);
    }

    // Check if user has access (own payslip or admin/hr)
    if (payslip.userId !== req.userId && req.userRole !== 'admin' && req.userRole !== 'hr') {
      throw createError('Forbidden: Access denied', 403);
    }

    res.json(payslip);
  } catch (error) {
    next(error);
  }
}

export async function downloadPayslip(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.userId) {
      throw createError('Unauthorized', 401);
    }

    const { id } = req.params;

    const payslip = await prisma.payslip.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            department: true,
            position: true,
          },
        },
      },
    });

    if (!payslip) {
      throw createError('Payslip not found', 404);
    }

    // Check if user has access
    if (payslip.userId !== req.userId && req.userRole !== 'admin' && req.userRole !== 'hr') {
      throw createError('Forbidden: Access denied', 403);
    }

    // Generate PDF
    const doc = new PDFDocument({ margin: 50 });
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=payslip-${id}.pdf`);

    // Pipe PDF to response
    doc.pipe(res);

    // PDF Content
    doc.fontSize(20).text('Dayflow HRMS - Payslip', { align: 'center' });
    doc.moveDown();

    doc.fontSize(14).text(`${payslip.month} ${payslip.year}`, { align: 'center' });
    doc.moveDown(2);

    // Employee Information
    doc.fontSize(12);
    doc.text(`Employee: ${payslip.user.firstName} ${payslip.user.lastName}`);
    doc.text(`Email: ${payslip.user.email}`);
    if (payslip.user.department) doc.text(`Department: ${payslip.user.department}`);
    if (payslip.user.position) doc.text(`Position: ${payslip.user.position}`);
    doc.moveDown(2);

    // Salary Details
    doc.fontSize(14).text('Salary Details', { underline: true });
    doc.moveDown();
    doc.fontSize(12);
    doc.text(`Base Salary: $${Number(payslip.baseSalary).toLocaleString()}`, { continued: true, align: 'right' });
    doc.moveDown();
    doc.text(`Allowances: $${Number(payslip.allowances).toLocaleString()}`, { continued: true, align: 'right' });
    doc.moveDown();
    doc.text(`Deductions: $${Number(payslip.deductions).toLocaleString()}`, { continued: true, align: 'right' });
    doc.moveDown();
    doc.fontSize(14).text(`Net Salary: $${Number(payslip.netSalary).toLocaleString()}`, { align: 'right', underline: true });
    doc.moveDown(3);

    // Footer
    doc.fontSize(10).text(`Generated on: ${new Date(payslip.generatedAt).toLocaleDateString()}`, { align: 'center' });
    doc.text('Dayflow HRMS - Every workday, perfectly aligned', { align: 'center' });

    // Finalize PDF
    doc.end();
  } catch (error) {
    next(error);
  }
}

