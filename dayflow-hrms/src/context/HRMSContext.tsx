import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, 
  AttendanceRecord, 
  LeaveRequest, 
  LeaveBalance, 
  SalarySlip, 
  SalaryStructure 
} from '../types/hrms';
import { INITIAL_ATTENDANCE } from '../data/mockAttendance';
import { INITIAL_LEAVE_BALANCES, INITIAL_LEAVE_REQUESTS } from '../data/mockLeaves';
import { INITIAL_SALARY_SLIPS } from '../data/mockPayroll';
import { getStoredData, setStoredData } from '../utils/storage';
import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationContext';

interface HRMSContextType {
  // Attendance
  attendanceRecords: AttendanceRecord[];
  getEmployeeAttendance: (employeeId: string) => AttendanceRecord[];
  getTodayAttendance: (employeeId: string) => AttendanceRecord | undefined;
  clockIn: (employeeId: string) => void;
  clockOut: (employeeId: string) => void;
  markAttendanceOverride: (record: Partial<AttendanceRecord> & { employeeId: string; date: string }) => void;
  regularizeAttendance: (employeeId: string, date: string, reason: string, checkIn: string, checkOut: string) => void;

  // Leaves
  leaveRequests: LeaveRequest[];
  leaveBalances: Record<string, LeaveBalance>;
  getEmployeeLeaves: (employeeId: string) => LeaveRequest[];
  getEmployeeBalance: (employeeId: string) => LeaveBalance;
  applyForLeave: (request: Omit<LeaveRequest, 'id' | 'status' | 'appliedOn'>) => { success: boolean; message?: string };
  cancelLeaveRequest: (requestId: string) => { success: boolean };
  reviewLeaveRequest: (requestId: string, status: 'approved' | 'rejected', comments: string) => void;

  // Payroll
  salarySlips: SalarySlip[];
  getEmployeeSlips: (employeeId: string) => SalarySlip[];
  updateEmployeeSalaryStructure: (employeeId: string, structure: SalaryStructure) => void;
  processMonthlyPayroll: (monthName: string, year: number) => { success: boolean; count: number };

  // Employees Directory
  addEmployee: (employee: Partial<User>) => void;
  updateEmployee: (id: string, updated: Partial<User>) => void;
  deleteEmployee: (id: string) => void;
}

const HRMSContext = createContext<HRMSContextType | undefined>(undefined);

export const HRMSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { allEmployees, refreshEmployees, effectiveUser } = useAuth();
  const { addNotification, sendSimulatedEmail } = useNotifications();

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => 
    getStoredData('dayflow_attendance', INITIAL_ATTENDANCE)
  );

  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(() => 
    getStoredData('dayflow_leaves', INITIAL_LEAVE_REQUESTS)
  );

  const [leaveBalances, setLeaveBalances] = useState<Record<string, LeaveBalance>>(() => 
    getStoredData('dayflow_leave_balances', INITIAL_LEAVE_BALANCES)
  );

  const [salarySlips, setSalarySlips] = useState<SalarySlip[]>(() => 
    getStoredData('dayflow_salary_slips', INITIAL_SALARY_SLIPS)
  );

  useEffect(() => {
    setStoredData('dayflow_attendance', attendanceRecords);
  }, [attendanceRecords]);

  useEffect(() => {
    setStoredData('dayflow_leaves', leaveRequests);
  }, [leaveRequests]);

  useEffect(() => {
    setStoredData('dayflow_leave_balances', leaveBalances);
  }, [leaveBalances]);

  useEffect(() => {
    setStoredData('dayflow_salary_slips', salarySlips);
  }, [salarySlips]);

  // Attendance helpers
  const getEmployeeAttendance = (empId: string) => {
    return attendanceRecords.filter(r => r.employeeId === empId);
  };

  const getTodayAttendance = (empId: string) => {
    const todayStr = new Date().toISOString().split('T')[0];
    return attendanceRecords.find(r => r.employeeId === empId && r.date === todayStr);
  };

  const clockIn = (empId: string) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    setAttendanceRecords(prev => {
      const existing = prev.find(r => r.employeeId === empId && r.date === todayStr);
      if (existing) {
        return prev.map(r => r.id === existing.id ? { ...r, checkIn: timeStr, status: 'present' } : r);
      } else {
        const newRecord: AttendanceRecord = {
          id: `att-${empId}-${todayStr}`,
          employeeId: empId,
          date: todayStr,
          checkIn: timeStr,
          checkOut: null,
          totalHours: 0,
          status: 'present',
        };
        return [newRecord, ...prev];
      }
    });

    addNotification({
      userId: empId,
      title: 'Clocked In Successfully',
      message: `You clocked in at ${timeStr}. Have a productive workday!`,
      type: 'attendance',
      actionUrl: '/attendance',
    });
  };

  const clockOut = (empId: string) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    setAttendanceRecords(prev => {
      return prev.map(r => {
        if (r.employeeId === empId && r.date === todayStr) {
          return {
            ...r,
            checkOut: timeStr,
            totalHours: 8.5,
          };
        }
        return r;
      });
    });

    addNotification({
      userId: empId,
      title: 'Clocked Out Successfully',
      message: `You clocked out at ${timeStr}. Total workday recorded.`,
      type: 'attendance',
      actionUrl: '/attendance',
    });
  };

  const markAttendanceOverride = (record: Partial<AttendanceRecord> & { employeeId: string; date: string }) => {
    setAttendanceRecords(prev => {
      const existingIdx = prev.findIndex(r => r.employeeId === record.employeeId && r.date === record.date);
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = { ...updated[existingIdx], ...record };
        return updated;
      } else {
        const newRec: AttendanceRecord = {
          id: `att-${record.employeeId}-${record.date}`,
          employeeId: record.employeeId,
          date: record.date,
          checkIn: record.checkIn || '09:00 AM',
          checkOut: record.checkOut || '06:00 PM',
          totalHours: record.totalHours || 8.0,
          status: record.status || 'present',
          note: record.note,
        };
        return [newRec, ...prev];
      }
    });
  };

  const regularizeAttendance = (empId: string, date: string, reason: string, checkIn: string, checkOut: string) => {
    markAttendanceOverride({
      employeeId: empId,
      date,
      checkIn,
      checkOut,
      totalHours: 8.0,
      status: 'present',
      isRegularized: true,
      note: `Regularized: ${reason}`,
    });

    addNotification({
      userId: 'emp-001',
      title: 'Attendance Regularization',
      message: `Attendance regularized for ${date} (Reason: ${reason})`,
      type: 'attendance',
      actionUrl: '/attendance',
    });
  };

  // Leaves
  const getEmployeeLeaves = (empId: string) => {
    return leaveRequests.filter(l => l.employeeId === empId);
  };

  const getEmployeeBalance = (empId: string): LeaveBalance => {
    return leaveBalances[empId] || {
      paid: { total: 18, used: 0, remaining: 18 },
      sick: { total: 10, used: 0, remaining: 10 },
      casual: { total: 7, used: 0, remaining: 7 },
      unpaid: { used: 0 },
    };
  };

  const applyForLeave = (req: Omit<LeaveRequest, 'id' | 'status' | 'appliedOn'>) => {
    const newRequest: LeaveRequest = {
      ...req,
      id: 'lr-' + Date.now(),
      status: 'pending',
      appliedOn: new Date().toISOString().split('T')[0],
    };

    setLeaveRequests(prev => [newRequest, ...prev]);

    // Send notifications & simulated email
    addNotification({
      userId: 'emp-001',
      title: 'New Leave Request Received',
      message: `${req.employeeName} applied for ${req.totalDays} day(s) of ${req.leaveType.toUpperCase()} leave.`,
      type: 'leave',
      actionUrl: '/leaves',
    });

    const emp = allEmployees.find(e => e.id === req.employeeId);
    if (emp) {
      sendSimulatedEmail({
        to: emp.email,
        subject: `Leave Request Received: ${req.leaveType.toUpperCase()} Leave (${req.startDate} to ${req.endDate})`,
        preview: `Your leave application for ${req.totalDays} days has been recorded and submitted for HR review...`,
        body: `Hello ${emp.fullName},\n\nYour leave request for ${req.totalDays} day(s) from ${req.startDate} to ${req.endDate} has been submitted successfully.\n\nLeave Type: ${req.leaveType.toUpperCase()}\nReason: ${req.reason}\nStatus: Pending HR Review\n\nWe will notify you immediately when reviewed.\n\nBest,\nDayflow Automated Notifications`,
        category: 'leave',
      });
    }

    return { success: true, message: 'Leave request submitted successfully!' };
  };

  const cancelLeaveRequest = (requestId: string) => {
    setLeaveRequests(prev => prev.filter(r => r.id !== requestId));
    return { success: true };
  };

  const reviewLeaveRequest = (requestId: string, status: 'approved' | 'rejected', comments: string) => {
    const target = leaveRequests.find(r => r.id === requestId);
    if (!target) return;

    const approver = effectiveUser?.fullName || 'Eleanor Vance (HR)';
    const nowIso = new Date().toISOString();

    setLeaveRequests(prev => prev.map(r => {
      if (r.id === requestId) {
        return {
          ...r,
          status,
          approverName: approver,
          approverComments: comments,
          approvedAt: nowIso,
        };
      }
      return r;
    }));

    // Update leave balance if approved
    if (status === 'approved') {
      setLeaveBalances(prev => {
        const currentBal = prev[target.employeeId] || getEmployeeBalance(target.employeeId);
        const lType = target.leaveType as 'paid' | 'sick' | 'casual' | 'unpaid';
        if (lType in currentBal && lType !== 'unpaid') {
          const typeObj = currentBal[lType as 'paid' | 'sick' | 'casual'];
          const used = typeObj.used + target.totalDays;
          const remaining = Math.max(0, typeObj.total - used);
          return {
            ...prev,
            [target.employeeId]: {
              ...currentBal,
              [lType]: { ...typeObj, used, remaining }
            }
          };
        }
        return prev;
      });
    }

    // Notify employee
    addNotification({
      userId: target.employeeId,
      title: `Leave Request ${status === 'approved' ? 'Approved' : 'Rejected'}`,
      message: `Your ${target.leaveType.toUpperCase()} leave request (${target.startDate}) was ${status.toUpperCase()} by ${approver}.`,
      type: 'leave',
      actionUrl: '/leaves',
    });

    const emp = allEmployees.find(e => e.id === target.employeeId);
    if (emp) {
      sendSimulatedEmail({
        to: emp.email,
        subject: `Leave Request ${status === 'approved' ? 'APPROVED' : 'REJECTED'}: ${target.leaveType.toUpperCase()} Leave`,
        preview: `Your leave application for ${target.startDate} to ${target.endDate} has been ${status} by ${approver}...`,
        body: `Hello ${emp.fullName},\n\nYour leave request from ${target.startDate} to ${target.endDate} (${target.totalDays} days) has been ${status.toUpperCase()} by ${approver}.\n\nApprover Remarks: "${comments || (status === 'approved' ? 'Approved' : 'Not approved')}"\n\nYour records in Dayflow have been updated.\n\nWarm regards,\nDayflow HR Operations`,
        category: 'leave',
      });
    }
  };

  // Payroll
  const getEmployeeSlips = (empId: string) => {
    return salarySlips.filter(s => s.employeeId === empId);
  };

  const updateEmployeeSalaryStructure = (empId: string, structure: SalaryStructure) => {
    const updatedEmployees = allEmployees.map(emp => 
      emp.id === empId 
        ? { ...emp, salaryStructure: structure }
        : emp
    );
    refreshEmployees(updatedEmployees);

    addNotification({
      userId: empId,
      title: 'Salary Structure Updated',
      message: 'Your compensation details and salary structure have been updated by HR.',
      type: 'payroll',
      actionUrl: '/payroll',
    });
  };

  const processMonthlyPayroll = (monthName: string, year: number) => {
    const existing = salarySlips.filter(s => s.month === monthName && s.year === year);
    if (existing.length >= allEmployees.length) {
      return { success: false, count: 0 };
    }

    const monthNum = new Date(`${monthName} 1, ${year}`).getMonth() + 1 || 8;
    const newSlips: SalarySlip[] = [];

    allEmployees.forEach(emp => {
      if (salarySlips.some(s => s.employeeId === emp.id && s.month === monthName && s.year === year)) {
        return;
      }

      const basic = emp.salaryStructure.basicMonthly;
      const hra = emp.salaryStructure.hra;
      const conveyance = emp.salaryStructure.conveyanceAllowance;
      const special = emp.salaryStructure.specialAllowance;
      const bonus = emp.salaryStructure.performanceBonus;
      const totalEarnings = basic + hra + conveyance + special + bonus;

      const pf = emp.salaryStructure.pfEmployee;
      const pt = emp.salaryStructure.professionalTax;
      const tax = emp.salaryStructure.incomeTaxTds;
      const ins = emp.salaryStructure.healthInsurance;
      const totalDeductions = pf + pt + tax + ins;

      const netPay = totalEarnings - totalDeductions;

      newSlips.push({
        id: `slip-${emp.id}-${year}-${monthNum}`,
        employeeId: emp.id,
        employeeName: emp.fullName,
        designation: emp.designation,
        department: emp.department,
        month: monthName,
        year,
        monthNumber: monthNum,
        workingDays: 22,
        daysPresent: 22,
        paidLeaves: 0,
        lwpDays: 0,
        earnings: { basic, hra, conveyance, specialAllowance: special, bonus, totalEarnings },
        deductions: { providentFund: pf, professionalTax: pt, incomeTax: tax, insurance: ins, totalDeductions },
        netPay,
        paymentDate: new Date().toISOString().split('T')[0],
        paymentStatus: 'paid',
        transactionRef: `ACH-DAYFLOW-${year}${monthNum < 10 ? '0' + monthNum : monthNum}-${emp.employeeId.replace('-', '')}`,
      });
    });

    setSalarySlips(prev => [...newSlips, ...prev]);

    // Dispatch system email
    sendSimulatedEmail({
      to: 'all-employees@dayflow.corp',
      subject: `Payroll Disbursed for ${monthName} ${year}`,
      preview: `Official salary slips for ${monthName} ${year} have been generated and direct deposits initiated...`,
      body: `Dear Dayflow Team,\n\nThe monthly payroll run for ${monthName} ${year} has been completed and disbursed to all ${newSlips.length} employees.\n\nYou can download your PDF payslip from the Dayflow Payroll tab.\n\nFinance & HR Department`,
      category: 'payroll',
    });

    return { success: true, count: newSlips.length };
  };

  // Employee Directory CRUD
  const addEmployee = (empData: Partial<User>) => {
    const newId = 'emp-' + String(Date.now()).slice(-4);
    const empCode = empData.employeeId || 'DF-' + Math.floor(1000 + Math.random() * 9000);

    const newEmp: User = {
      id: newId,
      employeeId: empCode,
      email: empData.email || 'employee@dayflow.corp',
      fullName: empData.fullName || 'New Employee',
      role: empData.role || 'employee',
      avatar: empData.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      department: empData.department || 'Engineering',
      designation: empData.designation || 'Specialist',
      phone: empData.phone || '+1 (555) 000-0000',
      address: empData.address || 'San Francisco, CA',
      emergencyContact: empData.emergencyContact || {
        name: 'Contact',
        relation: 'Family',
        phone: '+1 (555) 000-0000',
      },
      joiningDate: empData.joiningDate || new Date().toISOString().split('T')[0],
      dob: empData.dob || '1995-01-01',
      gender: empData.gender || 'Other',
      bloodGroup: empData.bloodGroup || 'O+',
      status: empData.status || 'active',
      isEmailVerified: true,
      reportingManager: empData.reportingManager || 'Eleanor Vance',
      workLocation: empData.workLocation || 'Hybrid',
      employmentType: empData.employmentType || 'full_time',
      salaryStructure: empData.salaryStructure || {
        ctc: 100000,
        basicMonthly: 4166,
        hra: 2083,
        conveyanceAllowance: 350,
        specialAllowance: 1734,
        performanceBonus: 300,
        pfEmployee: 500,
        pfEmployer: 500,
        professionalTax: 200,
        incomeTaxTds: 900,
        healthInsurance: 150,
        grossMonthly: 8333,
        netMonthly: 6583,
      },
      documents: [],
    };

    refreshEmployees([...allEmployees, newEmp]);
  };

  const updateEmployee = (id: string, updated: Partial<User>) => {
    const updatedList = allEmployees.map(e => e.id === id ? { ...e, ...updated } : e);
    refreshEmployees(updatedList);
  };

  const deleteEmployee = (id: string) => {
    const filtered = allEmployees.filter(e => e.id !== id);
    refreshEmployees(filtered);
  };

  return (
    <HRMSContext.Provider value={{
      attendanceRecords,
      getEmployeeAttendance,
      getTodayAttendance,
      clockIn,
      clockOut,
      markAttendanceOverride,
      regularizeAttendance,
      leaveRequests,
      leaveBalances,
      getEmployeeLeaves,
      getEmployeeBalance,
      applyForLeave,
      cancelLeaveRequest,
      reviewLeaveRequest,
      salarySlips,
      getEmployeeSlips,
      updateEmployeeSalaryStructure,
      processMonthlyPayroll,
      addEmployee,
      updateEmployee,
      deleteEmployee,
    }}>
      {children}
    </HRMSContext.Provider>
  );
};

export const useHRMS = () => {
  const context = useContext(HRMSContext);
  if (!context) throw new Error('useHRMS must be used within a HRMSProvider');
  return context;
};
