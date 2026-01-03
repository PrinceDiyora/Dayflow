/**
 * Login ID Generator
 * Format: LOI (first two letters of first and last name) (year of joining) (serial number)
 * Example: OIJODO20220001
 * 
 * OI -> Company prefix (Odoo India)
 * JODO -> First two letters of first name (JO) + first two letters of last name (DO)
 * 2022 -> Year of joining
 * 0001 -> Serial number of joining for that year
 */

import { prisma } from './prisma.js';

export interface LoginIdParts {
  companyPrefix: string;
  namePrefix: string;
  year: number;
  serialNumber: number;
}

/**
 * Generate Login ID for a new employee
 */
export async function generateLoginId(
  firstName: string,
  lastName: string,
  companyName?: string
): Promise<string> {
  // Get company prefix (first two letters, uppercase)
  const companyPrefix = getCompanyPrefix(companyName || 'OI'); // Default to 'OI' for Odoo India

  // Get name prefix (first two letters of first name + first two letters of last name)
  const namePrefix = getNamePrefix(firstName, lastName);

  // Get current year
  const year = new Date().getFullYear();

  // Get next serial number for this year
  const serialNumber = await getNextSerialNumber(year);

  // Format: COMPANY + NAME + YEAR + SERIAL (padded to 4 digits)
  return `${companyPrefix}${namePrefix}${year}${serialNumber.toString().padStart(4, '0')}`;
}

/**
 * Extract company prefix (first two letters, uppercase)
 */
function getCompanyPrefix(companyName: string): string {
  const cleaned = companyName.replace(/\s+/g, '').toUpperCase();
  return cleaned.substring(0, 2).padEnd(2, 'X'); // Pad if less than 2 chars
}

/**
 * Extract name prefix (first 2 letters of first name + first 2 letters of last name)
 */
function getNamePrefix(firstName: string, lastName: string): string {
  const first = (firstName || '').substring(0, 2).toUpperCase().padEnd(2, 'X');
  const last = (lastName || '').substring(0, 2).toUpperCase().padEnd(2, 'X');
  return first + last;
}

/**
 * Get next serial number for a given year
 */
async function getNextSerialNumber(year: number): Promise<number> {
  // Find all users created in this year
  const startOfYear = new Date(year, 0, 1);
  const endOfYear = new Date(year, 11, 31, 23, 59, 59);

  const usersThisYear = await prisma.user.findMany({
    where: {
      createdAt: {
        gte: startOfYear,
        lte: endOfYear,
      },
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  // Return count + 1 (next serial number)
  return usersThisYear.length + 1;
}

/**
 * Parse Login ID to extract parts
 */
export function parseLoginId(loginId: string): LoginIdParts | null {
  // Format: COMPANY(2) + NAME(4) + YEAR(4) + SERIAL(4) = 14 characters
  if (loginId.length < 14) {
    return null;
  }

  try {
    const companyPrefix = loginId.substring(0, 2);
    const namePrefix = loginId.substring(2, 6);
    const year = parseInt(loginId.substring(6, 10));
    const serialNumber = parseInt(loginId.substring(10, 14));

    return {
      companyPrefix,
      namePrefix,
      year,
      serialNumber,
    };
  } catch {
    return null;
  }
}

