import { Payslip } from '@/types';

const mockPayslips: Payslip[] = [
  {
    id: '1',
    userId: '2',
    month: 'December',
    year: 2024,
    baseSalary: 75000,
    allowances: 5000,
    deductions: 2000,
    netSalary: 78000,
    generatedAt: '2024-12-01T00:00:00Z',
  },
  {
    id: '2',
    userId: '2',
    month: 'November',
    year: 2024,
    baseSalary: 75000,
    allowances: 5000,
    deductions: 2000,
    netSalary: 78000,
    generatedAt: '2024-11-01T00:00:00Z',
  },
];

export const mockPayslipsApi = {
  getMyPayslips: async (): Promise<Payslip[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockPayslips.filter(p => p.userId === '2');
  },
  getPayslipById: async (id: string): Promise<Payslip> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const payslip = mockPayslips.find(p => p.id === id);
    if (!payslip) throw new Error('Payslip not found');
    return payslip;
  },
  downloadPayslip: async (id: string): Promise<Blob> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    // Return a mock PDF blob
    const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj
2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj
3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj
4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
100 700 Td
(Payslip ${id}) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000206 00000 n
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
300
%%EOF`;
    return new Blob([pdfContent], { type: 'application/pdf' });
  },
};

