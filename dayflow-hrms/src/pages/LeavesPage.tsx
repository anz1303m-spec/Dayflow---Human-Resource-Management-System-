import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useHRMS } from '../context/HRMSContext';
import { LeaveBalanceCard } from '../components/dashboard/LeaveBalanceCard';
import { LeaveRequestsTable } from '../components/leaves/LeaveRequestsTable';
import { ApplyLeaveModal } from '../components/leaves/ApplyLeaveModal';
import { PendingApprovalsQueue } from '../components/dashboard/PendingApprovalsQueue';
import { Button } from '../components/ui/Button';
import { CalendarClock, Plus } from 'lucide-react';

export const LeavesPage: React.FC = () => {
  const { effectiveUser, isAdminOrHr } = useAuth();
  const { getEmployeeLeaves, leaveRequests } = useHRMS();

  const [applyModalOpen, setApplyModalOpen] = useState<boolean>(false);

  if (!effectiveUser) return null;
  const myLeaves = getEmployeeLeaves(effectiveUser.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <CalendarClock className="h-6 w-6 text-brand-600" />
            <span>Leave &amp; Time-Off Management</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Request time-off, check available quotas, and track HR approval decisions.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setApplyModalOpen(true)}
          leftIcon={<Plus className="h-4 w-4" />}
        >
          Apply for Leave
        </Button>
      </div>

      <LeaveBalanceCard />

      {isAdminOrHr && (
        <div className="space-y-6">
          <PendingApprovalsQueue />
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-3">All Employee Leave Requests</h2>
            <LeaveRequestsTable requests={leaveRequests} canCancel={false} />
          </div>
        </div>
      )}

      {!isAdminOrHr && (
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white mb-3">My Leave History</h2>
          <LeaveRequestsTable requests={myLeaves} canCancel={true} />
        </div>
      )}

      <ApplyLeaveModal
        isOpen={applyModalOpen}
        onClose={() => setApplyModalOpen(false)}
      />
    </div>
  );
};
