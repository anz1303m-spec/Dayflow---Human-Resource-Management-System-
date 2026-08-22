import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useHRMS } from '../../context/HRMSContext';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { LeaveType } from '../../types/hrms';

interface ApplyLeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApplyLeaveModal: React.FC<ApplyLeaveModalProps> = ({ isOpen, onClose }) => {
  const { effectiveUser } = useAuth();
  const { applyForLeave, getEmployeeBalance } = useHRMS();

  const [leaveType, setLeaveType] = useState<LeaveType>('paid');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [attachmentName, setAttachmentName] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!effectiveUser) return null;
  const balance = getEmployeeBalance(effectiveUser.id);

  const calculateDays = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end < start) return 0;

    let count = 0;
    const cur = new Date(start);
    while (cur <= end) {
      const day = cur.getDay();
      if (day !== 0 && day !== 6) count++;
      cur.setDate(cur.getDate() + 1);
    }
    return Math.max(1, count);
  };

  const totalDays = calculateDays();


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate || !reason.trim()) {
      alert('Please fill out all required fields.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      applyForLeave({
        employeeId: effectiveUser.id,
        employeeName: effectiveUser.fullName,
        employeeAvatar: effectiveUser.avatar,
        department: effectiveUser.department,
        leaveType,
        startDate,
        endDate,
        totalDays,
        reason,
        attachmentName: attachmentName || undefined,
      });

      setIsSubmitting(false);
      onClose();
      setStartDate('');
      setEndDate('');
      setReason('');
      setAttachmentName('');
    }, 500);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Apply for Time-Off / Leave"
      description="Submit a leave application for HR approval. Records sync automatically upon decision."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1.5">
            Leave Type
          </label>
          <select
            value={leaveType}
            onChange={(e) => setLeaveType(e.target.value as LeaveType)}
            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 py-2.5 px-3 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 focus:outline-none"
          >
            <option value="paid">Annual Paid Leave ({balance.paid.remaining} days remaining)</option>
            <option value="sick">Sick Leave ({balance.sick.remaining} days remaining)</option>
            <option value="casual">Casual Leave ({balance.casual.remaining} days remaining)</option>
            <option value="unpaid">Unpaid Leave</option>
            <option value="maternity">Maternity / Paternity Leave</option>
          </select>
        </div>


        <div className='grid grid-cols-2 gap-4'>
          <div>
            <label className="block font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1.5">
              Start Date
            </label>
            <input
              type="date"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 py-2 px-3 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1.5">
              End Date
            </label>
            <input
              type="date"
              required
              value={endDate}
              min={startDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 py-2 px-3 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>
        </div>


        {totalDays > 0 && (
          <div className="p-3 rounded-xl bg-brand-50 dark:bg-brand-950/50 border border-brand-200 dark:border-brand-800 flex items-center justify-between">
            <span className="font-semibold text-brand-800 dark:text-brand-300">Total Working Days Requested:</span>
            <span className="text-sm font-black text-brand-600 dark:text-brand-400 font-mono">{totalDays} Day{totalDays > 1 ? 's' : ''}</span>
          </div>
        )}


        <div>
          <label className="block font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1.5">
            Reason / Remarks
          </label>
          <textarea
            required
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Please detail the reason for your time-off request..."
            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 focus:outline-none"
          />
        </div>


        <Input
          label="Supporting Document / Doctor Note (Optional)"
          placeholder="e.g. Doctor_Prescription.pdf"
          value={attachmentName}
          onChange={(e) => setAttachmentName(e.target.value)}
        />

        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
            Submit Leave Request
          </Button>
        </div>
      </form>
    </Modal>
  );
};
