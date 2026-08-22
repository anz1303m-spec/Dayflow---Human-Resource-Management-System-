import { SimulatedEmail } from '../types/hrms';

export const INITIAL_EMAILS: SimulatedEmail[] = [
  {
    id: 'email-1',
    to: 'marcus.chen@dayflow.corp',
    subject: 'Leave Request Received: Annual Paid Leave (Sep 1 - Sep 4)',
    preview: 'Your leave request for 4 days has been submitted and forwarded to Eleanor Vance for approval...',
    body: 'Hi Marcus,\n\nYour leave application for 4 days (September 01, 2026 to September 04, 2026) has been successfully recorded in Dayflow.\n\nReason: Family vacation and attending technical conference keynote in Seattle.\nCurrent Status: Pending HR Review\n\nYou will receive a notification as soon as your manager reviews this request.\n\nBest regards,\nDayflow HR Portal Automation',
    category: 'leave',
    sentAt: '2026-08-20T10:30:00Z',
    read: true,
  },
  {
    id: 'email-2',
    to: 'lucas.santos@dayflow.corp',
    subject: 'Leave Request Approved: Sick Leave (Aug 20 - Aug 23)',
    preview: 'Good news! Your sick leave request has been approved by Eleanor Vance...',
    body: 'Hi Lucas,\n^Your Sick Leave request for 3 days (August 20, 2026 - August 23, 2026) has been APPROVED by Eleanor Vance.\n\nManager Remarks: "Approved. Please rest well and feel better soon!"\n^Your attendance records and leave balance have been automatically adjusted.\n\nWarm regards,\nDayflow HR Team',
    category: 'leave',
    sentAt: '2026-08-19T14:31:00Z',
    read: true,
  },
  {
    id: 'email-3',
    to: 'all-staff@dayflow.corp',
    subject: 'Your July 2026 Salary Slip is now ready for download',
    preview: 'Dear Team Member, your July 2026 payslip has been processed and disbursed...',
    body: 'Dear Dayflow Team,\n\nThe payroll for the month of July 2026 has been successfully processed and disbursed via direct deposit.\n\nYou can now view and download your comprehensive official salary slip in PDF format from the Dayflow Payroll portal.\n\nIf you have any questions regarding tax deductions or allowances, please reach out to the HR Operations team.\n\nBest regards,\nDayflow Finance & Payroll',
    category: 'payroll',
    sentAt: '2026-07-31T17:00:00Z',
    read: false,
  },
  {
    id: 'email-4',
    to: 'marcus.chen@dayflow.corp',
    subject: 'Welcome to Dayflow - Verify your account (OTP: 849201)',
    preview: 'Welcome to Dayflow HRMS! Please use OTP code 849201 to verify your corporate email...',
    body: 'Hello Marcus,\n\nWelcome to Dayflow HRMS - Every workday, perfectly aligned.\n\nTo complete your registration, please verify your email using the one-time verification passcode below:\n\nOTP CODE: 849201\n\nThis code is valid for 15 minutes. Do not share this code with anyone.\n\nWelcome aboard,\nDayflow Security Team',
    category: 'verification',
    sentAt: '2026-08-01T09:00:00Z',
    read: true,
    verificationCode: '849201',
  }
];
