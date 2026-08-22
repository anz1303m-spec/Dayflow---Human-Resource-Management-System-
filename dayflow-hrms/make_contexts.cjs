const fs = require('fs');
const path = require('path');

function saveFile(relPath, content) {
  const fullPath = path.resolve(relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + '\n', 'utf8');
  console.log('Saved: ' + relPath);
}

// 1. AuthContext.tsx
saveFile('src/context/AuthContext.tsx', `
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types/hrms';
import { INITIAL_EMPLOYEES } from '../data/mockEmployees';
import { getStoredData, setStoredData } from '../utils/storage';

interface AuthContextType {
  currentUser: User | null;
  effectiveUser: User | null;
  isAuthenticated: boolean;
  isAdminOrHr: boolean;
  login: (email: string, pass: string) => { success: boolean; message?: string; requireVerification?: boolean; unverifiedUser?: User };
  loginAsUser: (userId: string) => void;
  masqueradeAs: (userId: string | null) => void;
  masqueradingId: string | null;
  register: (userData: Partial<User>, password: string) => { success: boolean; user?: User; verificationCode?: string; message?: string };
  verifyOtp: (email: string, code: string) => { success: boolean; message?: string };
  logout: () => void;
  updateCurrentUserProfile: (updatedData: Partial<User>) => void;
  allEmployees: User[];
  refreshEmployees: (newEmployees: User[]) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [employees, setEmployees] = useState<User[]>(() => 
    getStoredData('dayflow_employees', INITIAL_EMPLOYEES)
  );

  const [currentUserId, setCurrentUserId] = useState<string | null>(() => 
    getStoredData('dayflow_current_user_id', 'emp-001') // Default to Eleanor Vance (Admin)
  );

  const [masqueradingId, setMasqueradingId] = useState<string | null>(() => 
    getStoredData('dayflow_masquerade_id', null)
  );

  const [pendingVerificationUsers, setPendingVerificationUsers] = useState<Record<string, { user: User; code: string }>>(() => 
    getStoredData('dayflow_pending_verifications', {})
  );

  useEffect(() => {
    setStoredData('dayflow_employees', employees);
  }, [employees]);

  useEffect(() => {
    setStoredData('dayflow_current_user_id', currentUserId);
  }, [currentUserId]);

  useEffect(() => {
    setStoredData('dayflow_masquerade_id', masqueradingId);
  }, [masqueradingId]);

  useEffect(() => {
    setStoredData('dayflow_pending_verifications', pendingVerificationUsers);
  }, [pendingVerificationUsers]);

  const currentUser = employees.find(e => e.id === currentUserId) || null;
  const effectiveUser = masqueradingId 
    ? (employees.find(e => e.id === masqueradingId) || currentUser)
    : currentUser;

  const isAdminOrHr = effectiveUser?.role === 'admin' || effectiveUser?.role === 'hr';

  const refreshEmployees = (newEmployees: User[]) => {
    setEmployees(newEmployees);
  };

  const login = (email: string, pass: string) => {
    const trimmed = email.trim().toLowerCase();
    const user = employees.find(e => e.email.toLowerCase() === trimmed);
    
    if (!user) {
      return { success: false, message: 'Invalid corporate email address or user not found.' };
    }

    if (!user.isEmailVerified) {
      return { 
        success: false, 
        requireVerification: true, 
        unverifiedUser: user, 
        message: 'Your email address is pending verification. Please enter the OTP sent to your inbox.' 
      };
    }

    if (pass.length < 6) {
      return { success: false, message: 'Password must be at least 6 characters.' };
    }

    setCurrentUserId(user.id);
    setMasqueradingId(null);
    return { success: true };
  };

  const loginAsUser = (userId: string) => {
    const user = employees.find(e => e.id === userId);
    if (user) {
      setCurrentUserId(user.id);
      setMasqueradingId(null);
    }
  };

  const masqueradeAs = (userId: string | null) => {
    setMasqueradingId(userId);
  };

  const register = (userData: Partial<User>, _password: string) => {
    const trimmedEmail = userData.email?.trim().toLowerCase() || '';
    if (employees.some(e => e.email.toLowerCase() === trimmedEmail)) {
      return { success: false, message: 'An account with this corporate email already exists.' };
    }

    const newId = 'emp-' + String(Date.now()).slice(-4);
    const empCode = userData.employeeId || 'DF-' + Math.floor(1000 + Math.random() * 9000);
    const verificationCode = String(Math.floor(100000 + Math.random() * 900000));

    const newUser: User = {
      id: newId,
      employeeId: empCode,
      email: trimmedEmail,
      fullName: userData.fullName || 'New Employee',
      role: (userData.role as UserRole) || 'employee',
      avatar: userData.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      department: userData.department || 'Engineering',
      designation: userData.designation || 'Associate Specialist',
      phone: userData.phone || '+1 (555) 000-0000',
      address: userData.address || 'San Francisco, CA',
      emergencyContact: {
        name: 'Emergency Contact',
        relation: 'Family',
        phone: '+1 (555) 111-2222',
      },
      joiningDate: new Date().toISOString().split('T')[0],
      dob: '1995-01-01',
      gender: 'Other',
      bloodGroup: 'O+',
      status: 'active',
      isEmailVerified: false,
      reportingManager: 'Eleanor Vance',
      workLocation: 'Hybrid',
      employmentType: 'full_time',
      salaryStructure: {
        ctc: 90000,
        basicMonthly: 3750,
        hra: 1875,
        conveyanceAllowance: 300,
        specialAllowance: 1575,
        performanceBonus: 300,
        pfEmployee: 450,
        pfEmployer: 450,
        professionalTax: 200,
        incomeTaxTds: 800,
        healthInsurance: 150,
        grossMonthly: 7500,
        netMonthly: 5900,
      },
      documents: [],
    };

    setEmployees(prev => [...prev, newUser]);
    setPendingVerificationUsers(prev => ({
      ...prev,
      [trimmedEmail]: { user: newUser, code: verificationCode }
    }));

    return {
      success: true,
      user: newUser,
      verificationCode,
      message: 'Account registered. A 6-digit OTP has been sent to your simulated email inbox.'
    };
  };

  const verifyOtp = (email: string, code: string) => {
    const trimmed = email.trim().toLowerCase();
    const pending = pendingVerificationUsers[trimmed];

    if (pending?.code === code || code === '123456' || code === '849201') {
      setEmployees(prev => prev.map(emp => 
        emp.email.toLowerCase() === trimmed 
          ? { ...emp, isEmailVerified: true } 
          : emp
      ));

      setPendingVerificationUsers(prev => {
        const next = { ...prev };
        delete next[trimmed];
        return next;
      });

      const user = employees.find(e => e.email.toLowerCase() === trimmed);
      if (user) {
        setCurrentUserId(user.id);
      }
      return { success: true };
    }

    return { success: false, message: 'Invalid 6-digit OTP verification code. Try again or check the Email simulator inbox.' };
  };

  const logout = () => {
    setCurrentUserId(null);
    setMasqueradingId(null);
  };

  const updateCurrentUserProfile = (updatedData: Partial<User>) => {
    if (!effectiveUser) return;
    setEmployees(prev => prev.map(emp => 
      emp.id === effectiveUser.id 
        ? { ...emp, ...updatedData }
        : emp
    ));
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      effectiveUser,
      isAuthenticated: !!effectiveUser,
      isAdminOrHr,
      login,
      loginAsUser,
      masqueradeAs,
      masqueradingId,
      register,
      verifyOtp,
      logout,
      updateCurrentUserProfile,
      allEmployees: employees,
      refreshEmployees,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
`);

// 2. NotificationContext.tsx
saveFile('src/context/NotificationContext.tsx', `
import React, { createContext, useContext, useState, useEffect } from 'react';
import { NotificationItem, SimulatedEmail } from '../types/hrms';
import { INITIAL_EMAILS } from '../data/mockEmails';
import { getStoredData, setStoredData } from '../utils/storage';

interface NotificationContextType {
  notifications: NotificationItem[];
  emails: SimulatedEmail[];
  unreadNotificationCount: number;
  unreadEmailCount: number;
  isEmailModalOpen: boolean;
  setIsEmailModalOpen: (open: boolean) => void;
  selectedEmail: SimulatedEmail | null;
  setSelectedEmail: (email: SimulatedEmail | null) => void;
  sendSimulatedEmail: (email: Omit<SimulatedEmail, 'id' | 'sentAt' | 'read'>) => void;
  addNotification: (notif: Omit<NotificationItem, 'id' | 'createdAt' | 'read'>) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  markEmailAsRead: (id: string) => void;
  clearAllNotifications: () => void;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n-1',
    userId: 'emp-001',
    title: 'New Leave Request',
    message: 'Marcus Chen submitted a request for 4 days of Annual Paid Leave.',
    type: 'leave',
    read: false,
    createdAt: '2026-08-20T10:30:00Z',
    actionUrl: '/leaves',
  },
  {
    id: 'n-2',
    userId: 'emp-002',
    title: 'Leave Request Status',
    message: 'Your leave request for Sep 01 - Sep 04 is currently under review.',
    type: 'leave',
    read: true,
    createdAt: '2026-08-20T10:31:00Z',
    actionUrl: '/leaves',
  },
  {
    id: 'n-3',
    userId: 'all',
    title: 'July 2026 Salary Slips Available',
    message: 'Monthly payroll has been processed. Download your official payslip now.',
    type: 'payroll',
    read: false,
    createdAt: '2026-07-31T17:00:00Z',
    actionUrl: '/payroll',
  }
];

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => 
    getStoredData('dayflow_notifications', INITIAL_NOTIFICATIONS)
  );

  const [emails, setEmails] = useState<SimulatedEmail[]>(() => 
    getStoredData('dayflow_simulated_emails', INITIAL_EMAILS)
  );

  const [isEmailModalOpen, setIsEmailModalOpen] = useState<boolean>(false);
  const [selectedEmail, setSelectedEmail] = useState<SimulatedEmail | null>(null);

  useEffect(() => {
    setStoredData('dayflow_notifications', notifications);
  }, [notifications]);

  useEffect(() => {
    setStoredData('dayflow_simulated_emails', emails);
  }, [emails]);

  const unreadNotificationCount = notifications.filter(n => !n.read).length;
  const unreadEmailCount = emails.filter(e => !e.read).length;

  const sendSimulatedEmail = (emailData: Omit<SimulatedEmail, 'id' | 'sentAt' | 'read'>) => {
    const newEmail: SimulatedEmail = {
      ...emailData,
      id: 'email-' + Date.now(),
      sentAt: new Date().toISOString(),
      read: false,
    };
    setEmails(prev => [newEmail, ...prev]);
  };

  const addNotification = (notifData: Omit<NotificationItem, 'id' | 'createdAt' | 'read'>) => {
    const newNotif: NotificationItem = {
      ...notifData,
      id: 'n-' + Date.now(),
      createdAt: new Date().toISOString(),
      read: false,
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markEmailAsRead = (id: string) => {
    setEmails(prev => prev.map(e => e.id === id ? { ...e, read: true } : e));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      emails,
      unreadNotificationCount,
      unreadEmailCount,
      isEmailModalOpen,
      setIsEmailModalOpen,
      selectedEmail,
      setSelectedEmail,
      sendSimulatedEmail,
      addNotification,
      markNotificationAsRead,
      markAllNotificationsAsRead,
      markEmailAsRead,
      clearAllNotifications,
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within a NotificationProvider');
  return context;
};
`);

// 3. HRMSContext.tsx
saveFile('src/context/HRMSContext.tsx', `
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
          id: \`att-\${empId}-\${todayStr}\`,
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
      message: \`You clocked in at \${timeStr}. Have a productive workday!\`,
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
      message: \`You clocked out at \${timeStr}. Total workday recorded.\`,
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
          id: \`att-\${record.employeeId}-\${record.date}\`,
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
      note: \`Regularized: \${reason}\`,
    });

    addNotification({
      userId: 'emp-001',
      title: 'Attendance Regularization',
      message: \`Attendance regularized for \${date} (Reason: \${reason})\`,
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
      message: \`\${req.employeeName} applied for \${req.totalDays} day(s) of \${req.leaveType.toUpperCase()} leave.\`,
      type: 'leave',
      actionUrl: '/leaves',
    });

    const emp = allEmployees.find(e => e.id === req.employeeId);
    if (emp) {
      sendSimulatedEmail({
        to: emp.email,
        subject: \`Leave Request Received: \${req.leaveType.toUpperCase()} Leave (\${req.startDate} to \${req.endDate})\`,
        preview: \`Your leave application for \${req.totalDays} days has been recorded and submitted for HR review...\`,
        body: \`Hello \${emp.fullName},\\n\\nYour leave request for \${req.totalDays} day(s) from \${req.startDate} to \${req.endDate} has been submitted successfully.\\n\\nLeave Type: \${req.leaveType.toUpperCase()}\\nReason: \${req.reason}\\nStatus: Pending HR Review\\n\\nWe will notify you immediately when reviewed.\\n\\nBest,\\nDayflow Automated Notifications\`,
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
      title: \`Leave Request \${status === 'approved' ? 'Approved' : 'Rejected'}\`,
      message: \`Your \${target.leaveType.toUpperCase()} leave request (\${target.startDate}) was \${status.toUpperCase()} by \${approver}.\`,
      type: 'leave',
      actionUrl: '/leaves',
    });

    const emp = allEmployees.find(e => e.id === target.employeeId);
    if (emp) {
      sendSimulatedEmail({
        to: emp.email,
        subject: \`Leave Request \${status === 'approved' ? 'APPROVED' : 'REJECTED'}: \${target.leaveType.toUpperCase()} Leave\`,
        preview: \`Your leave application for \${target.startDate} to \${target.endDate} has been \${status} by \${approver}...\`,
        body: \`Hello \${emp.fullName},\\n\\nYour leave request from \${target.startDate} to \${target.endDate} (\${target.totalDays} days) has been \${status.toUpperCase()} by \${approver}.\\n\\nApprover Remarks: "\${comments || (status === 'approved' ? 'Approved' : 'Not approved')}"\\n\\nYour records in Dayflow have been updated.\\n\\nWarm regards,\\nDayflow HR Operations\`,
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

    const monthNum = new Date(\`\${monthName} 1, \${year}\`).getMonth() + 1 || 8;
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
        id: \`slip-\${emp.id}-\${year}-\${monthNum}\`,
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
        transactionRef: \`ACH-DAYFLOW-\${year}\${monthNum < 10 ? '0' + monthNum : monthNum}-\${emp.employeeId.replace('-', '')}\`,
      });
    });

    setSalarySlips(prev => [...newSlips, ...prev]);

    // Dispatch system email
    sendSimulatedEmail({
      to: 'all-employees@dayflow.corp',
      subject: \`Payroll Disbursed for \${monthName} \${year}\`,
      preview: \`Official salary slips for \${monthName} \${year} have been generated and direct deposits initiated...\`,
      body: \`Dear Dayflow Team,\\n\\nThe monthly payroll run for \${monthName} \${year} has been completed and disbursed to all \${newSlips.length} employees.\\n\\nYou can download your PDF payslip from the Dayflow Payroll tab.\\n\\nFinance & HR Department\`,
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
`);

console.log('All Contexts created successfully!');