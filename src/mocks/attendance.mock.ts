import { Attendance } from '@/types';
import dayjs from 'dayjs';

const today = dayjs().format('YYYY-MM-DD');
const yesterday = dayjs().subtract(1, 'day').format('YYYY-MM-DD');

let attendanceRecords: Attendance[] = [
  {
    id: '1',
    userId: '2',
    date: today,
    checkIn: dayjs().hour(9).minute(0).format('HH:mm'),
    checkOut: dayjs().hour(17).minute(30).format('HH:mm'),
    status: 'present',
    totalHours: 8.5,
  },
  {
    id: '2',
    userId: '2',
    date: yesterday,
    checkIn: dayjs().subtract(1, 'day').hour(9).minute(15).format('HH:mm'),
    checkOut: dayjs().subtract(1, 'day').hour(17).minute(0).format('HH:mm'),
    status: 'present',
    totalHours: 7.75,
  },
];

export const mockAttendanceApi = {
  getMyAttendance: async (): Promise<Attendance[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return attendanceRecords.filter(a => a.userId === '2');
  },
  getAllAttendance: async (): Promise<Attendance[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...attendanceRecords];
  },
  checkIn: async (): Promise<Attendance> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const todayRecord = attendanceRecords.find(
      a => a.date === today && a.userId === '2'
    );
    
    if (todayRecord) {
      todayRecord.checkIn = dayjs().format('HH:mm');
      todayRecord.status = 'present';
      return todayRecord;
    }
    
    const newRecord: Attendance = {
      id: String(attendanceRecords.length + 1),
      userId: '2',
      date: today,
      checkIn: dayjs().format('HH:mm'),
      status: 'present',
    };
    attendanceRecords.push(newRecord);
    return newRecord;
  },
  checkOut: async (): Promise<Attendance> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const todayRecord = attendanceRecords.find(
      a => a.date === today && a.userId === '2'
    );
    
    if (!todayRecord) {
      throw new Error('No check-in record found for today');
    }
    
    todayRecord.checkOut = dayjs().format('HH:mm');
    if (todayRecord.checkIn) {
      const checkIn = dayjs(todayRecord.checkIn, 'HH:mm');
      const checkOut = dayjs(todayRecord.checkOut, 'HH:mm');
      todayRecord.totalHours = checkOut.diff(checkIn, 'hour', true);
    }
    
    return todayRecord;
  },
  getTodayAttendance: async (): Promise<Attendance | null> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return attendanceRecords.find(
      a => a.date === today && a.userId === '2'
    ) || null;
  },
};

