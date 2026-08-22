export type UserRole = 'admin' | 'hr' | 'employee';

export type EmploymentStatus = 'active' | 'on_leave' | 'probation' | 'terminated';

export type EmploymentType = 'full_time' | 'contract' | 'intern';

export interface SalaryStructure {
  ctc: number;
  basicMonthly: number;
  hra: number;
  conveyanceAllowance: number;
  specialAllowance: number;
  performanceBonus: number;
  pfEmployee: number;
  pfEmployer: number;
  professionalTax: number;
  incomeTaxTds: number;
  healthInsurance: number;
  grossMonthly: number;
  netMonthly: number;
}

export interface DocumentItem {
  id: string;
  title: string;
  category: 'contract' | 'id_proof' | 'tax' | 'education' | 'certificate';
  fileName: string;
  fileSize: string;
  uploadDate: string;
  fileUrl?: string;
}

export interface User {
  id: string;
  employeeId: string;
  email: string;
  fullName: string;
  role: UserRole;
  avatar: string;
  department: string;
  designation: string;
  phone: string;
  address: string;
  emergencyContact: {
    name: string;
    relation: string;
    phone: string;
  };
  joiningDate: string;
  dob: string;
  gender: 'Male' | 'Female' | 'Other';
  bloodGroup: string;
  status: EmploymentStatus;
  isEmailVerified: boolean;
  reportingManager: string;
  workLocation: string;
  employmentType: EmploymentType;
  salaryStructure: SalaryStructure;
  documents: DocumentItem[];
}

export type AttendanceStatus = 'present' | 'absent' | 'half_day' | 'leave' | 'late';

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  totalHours: number;
  status: AttendanceStatus;
  note?: string;
  isRegularized?: boolean;
  breakMinutes?: number;
}

export type LeaveType = 'paid' | 'sick' | 'unpaid' | 'casual' | 'maternity' | 'paternity';
export type LeaveStatus = 'pending' | 'approved' | 'rejected';

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeAvatar: string;
  department: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: LeaveStatus;
  appliedOn: string;
  approverName?: string;
  approverComments?: string;
  approvedAt?: string;
  attachmentName?: string;
}

export interface LeaveBalance {
  paid: { total: number; used: number; remaining: number };
  sick: { total: number; used: number; remaining: number };
  casual: { total: number; used: number; remaining: number };
  unpaid: { used: number };
}

export interface SalarySlip {
  id: string;
  employeeId: string;
  employeeName: string;
  designation: string;
  department: string;
  month: string;
  year: number;
  monthNumber: number;
  workingDays: number;
  daysPresent: number;
  paidLeaves: number;
  lwpDays: number;
  earnings: {
    basic: number;
    hra: number;
    conveyance: number;
    specialAllowance: number;
    bonus: number;
    totalEarnings: number;
  };
  deductions: {
    providentFund: number;
    professionalTax: number;
    incomeTax: number;
    insurance: number;
    totalDeductions: number;
  };
  netPay: number;
  paymentDate: string;
  paymentStatus: 'paid' | 'pending' | 'processing';
  transactionRef: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'leave' | 'attendance' | 'payroll' | 'system' | 'general';
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}

export interface SimulatedEmail {
  id: string;
  to: string;
  subject: string;
  preview: string;
  body: string;
  category: 'verification' | 'leave' | 'payroll' | 'attendance' | 'welcome';
  sentAt: string;
  read: boolean;
  verificationCode?: string;
}
