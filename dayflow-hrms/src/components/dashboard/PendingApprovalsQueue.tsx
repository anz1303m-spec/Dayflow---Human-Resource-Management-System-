import React, { useState } from 'react';
import { useHRMS } from '../../context/HRMSContext';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { CheckCircle2, XCircle, Clock, MessageSquare, ArrowRight } from 'lucide-react';
import { formatDate } from '../../utils/formatters';
import { Link } from 'react-router-dom';

export const PendingApprovalsQueue: React.FC = () => {
  const { leaveRequests, reviewLeaveRequest } = useHRMS();
  const pending = leaveRequests.filter(l => l.status === 'pending');

  const [selectedRequest, setSelectedRequest] = useState<typeof leaveRequests[0] | null>(null);
  const [decision, setDecision] = useState<'approved' | 'rejected'>('approved');
  const [comment, setComment] = useState<string>('');

  const handleOpenReview = (req: typeof leaveRequests[0], action: 'approved' | 'rejected') => {
    setSelectedRequest(req);
    setDecision(action);
    setComment(action === 'approved' ? 'Approved by HR Operations.' : 'Request could not be accommodated due to schedule constraints.');
  };

  const handleSubmitReview = () => {
    if (!selectedRequest) return;
    reviewLeaveRequest(selectedRequest.id, decision, comment);
    setSelectedRequest(null);
    setComment('');
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-amber-500" />
          <div>
            <CardTitle className="text-base">Pending Leave Approvals</CardTitle>
            <p className="text-xs text-slate-500">Fast 1-click HR review queue</p>
          </div>
        </div>
        <Link to="/leaves" className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1">
          <span>Full Inbox</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </CardHeader>

      <CardContent>
        {pending.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
            <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-2 opacity-80" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">All clear!</p>
            <p className="text-xs text-slate-400 mt-0.5">No pending employee leave requests right now.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {pending.map((req) => (
              <div key={req.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img src={req.employeeAvatar} alt="" className="h-9 w-9 rounded-full object-cover ring-1 ring-slate-200" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{req.employeeName}</span>
                      <span className="text-xs text-slate-400">&bull; {req.department}</span>
                      <Badge variant="purple" size="sm">{req.leaveType} leave</Badge>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      <strong>{formatDate(req.startDate)}</strong> to <strong>{formatDate(req.endDate)}</strong> ({req.totalDays} days) &bull; <em>"{req.reason}"</em>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => handleOpenReview(req, 'approved')}
                    leftIcon={<CheckCircle2 className="h-3.5 w-3.5" />}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleOpenReview(req, 'rejected')}
                    leftIcon={<XCircle className="h-3.5 w-3.5" />}
                  >
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Review Modal with Comment Box */}
      <Modal
        isOpen={!!selectedRequest}
        onClose={() => setSelectedRequest(null)}
        title={decision === 'approved' ? 'Approve Leave Request' : 'Reject Leave Request'}
        description="Provide optional comments to record in employee log and include in the simulated decision email."
      >
        {selectedRequest && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
              <div><strong>Employee:</strong> {selectedRequest.employeeName} ({selectedRequest.department})</div>
              <div><strong>Dates:</strong> {formatDate(selectedRequest.startDate)} to {formatDate(selectedRequest.endDate)} ({selectedRequest.totalDays} days)</div>
              <div><strong>Type:</strong> {selectedRequest.leaveType.toUpperCase()}</div>
              <div><strong>Reason:</strong> {selectedRequest.reason}</div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1.5">
                Approver Comments &amp; Notes
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                placeholder="Enter feedback for employee..."
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <Button variant="outline" size="sm" onClick={() => setSelectedRequest(null)}>
                Cancel
              </Button>
              <Button
                variant={decision === 'approved' ? 'success' : 'danger'}
                size="sm"
                onClick={handleSubmitReview}
              >
                Confirm {decision === 'approved' ? 'Approval' : 'Rejection'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </Card>
  );
};
