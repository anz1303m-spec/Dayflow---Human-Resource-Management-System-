import { AttendanceRecord } from '../types/hrms';

// Generate dynamic realistic attendance data for the last 30 days
export const generateInitialAttendance = (): AttendanceRecord[] => {
  const records: AttendanceRecord[] = [];
  const employeeIds = ['emp-001', 'emp-002', 'emp-003', 'emp-004', 'emp-005', 'emp-006', 'emp-007'];

  const today = new Date();

  for (let d = 25; d >= 0; d--) {
    const curr = new Date(today);
    curr.setDate(today.getDate() - d);
    const dayOfWeek = curr.getDay();

    // Skip weekends
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;

    const dateStr = curr.toISOString().split('T')[0];

    employeeIds.forEach((empId) => {
      let status: 'present' | 'absent' | 'half_day' | 'leave' | 'late' = 'present';
      let checkIn: string | null = '09:02 AM';
      let checkOut: string | null = '06:05 PM';
      let totalHours = 8.5;

      if (empId === 'emp-006' && d < 3) {
        status = 'leave';
        checkIn = null;
        checkOut = null;
        totalHours = 0;
      } else if ((d === 3 || d === 12) && empId === 'emp-003') {
        status = 'late';
        checkIn = '10:15 AM';
        checkOut = '06:45 PM';
        totalHours = 8.0;
      } else if (d === 7 && empId === 'emp-005') {
        status = 'half_day';
        checkIn = '09:00 AM';
        checkOut = '01:30 PM';
        totalHours = 4.5;
      } else if (d === 14 && empId === 'emp-002') {
        status = 'leave';
        checkIn = null;
        checkOut = null;
        totalHours = 0;
      } else if (d === 0) {
        if (empId === 'emp-001') {
          checkIn = '08:50 AM';
          checkOut = null;
          totalHours = 4.2;
        } else if (empId === 'emp-002') {
          checkIn = '09:12 AM';
          checkOut = null;
          totalHours = 3.8;
        } else if (empId === 'emp-006') {
          status = 'leave';
          checkIn = null;
          checkOut = null;
          totalHours = 0;
        }
      }

      records.push({
        id: `att-${empId}-${dateStr}`,
        employeeId: empId,
        date: dateStr,
        checkIn,
        checkOut,
        totalHours,
        status,
        breakMinutes: status === 'present' || status === 'late' ? 45 : 0,
        note: status === 'late' ? 'Traffic on Bay Bridge' : (status === 'leave' ? 'Approved Annual Leave' : undefined),
      });
    });
  }

  return records;
};

export const INITIAL_ATTENDANCE = generateInitialAttendance();
