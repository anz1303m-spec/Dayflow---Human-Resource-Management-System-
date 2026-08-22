import React from 'react';
import { useNotifications } from '../../context/NotificationContext';
import { Modal } from '../ui/Modal';
import { Mail, Clock, CheckCircle2, AlertCircle, FileText, Lock, ChevronRight } from 'lucide-react';
import { formatDate } from '../../utils/formatters';

export const EmailSimulatorModal: React.FC = () => {
  const { 
    emails, 
    isEmailModalOpen, 
    setIsEmailModalOpen, 
    selectedEmail, 
    setSelectedEmail, 
    markEmailAsRead 
  } = useNotifications();

  const handleSelectEmail = (email: typeof emails[0]) => {
    setSelectedEmail(email);
    markEmailAsRead(email.id);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'verification':
        return <Lock className="h-4 w-4 text-purple-500" />;
      case 'leave':
        return <Clock className="h-4 w-4 text-amber-500" />;
      case 'payroll':
        return <FileText className="h-4 w-4 text-emerald-500" />;
      default:
        return <Mail className="h-4 w-4 text-brand-500" />;
    }
  };

  return (
    <Modal
      isOpen={isEmailModalOpen}
      onClose={() => setIsEmailModalOpen(false)}
      title={
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400">
            <Mail className="h-5 w-5" />
          </div>
          <div>
            <span className="text-base font-bold text-slate-900 dark:text-white">Dayflow Simulated Email Inbox</span>
            <span className="ml-2 text-xs bg-brand-100 dark:bg-brand-900/60 text-brand-700 dark:text-brand-300 font-semibold px-2 py-0.5 rounded-full">
              {emails.length} Messages
            </span>
          </div>
        </div>
      }
      description="Live corporate email triggers dispatched for verification OTPs, leave approval decisions, and salary slips."
      maxWidth="4xl"
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 min-h-[420px]">
        {/* Email List Sidebar */}
        <div className="md:col-span-5 border-r border-slate-200 dark:border-slate-800 pr-3 max-h-[460px] overflow-y-auto space-y-2">
          {emails.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No simulated emails dispatched yet.
            </div>
          ) : (
            emails.map((email) => {
              const isSelected = selectedEmail?.id === email.id;
              return (
                <div
                  key={email.id}
                  onClick={() => handleSelectEmail(email)}
                  className={`p-3 rounded-xl cursor-pointer transition-all border text-left ${
                    isSelected
                      ? 'bg-brand-50/80 dark:bg-brand-950/60 border-brand-300 dark:border-brand-800 shadow-sm'
                      : email.read
                      ? 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      : 'bg-brand-50/30 dark:bg-slate-800/60 border-brand-200 dark:border-slate-700 font-semibold'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium truncate">
                      {getCategoryIcon(email.category)}
                      <span className="truncate">{email.to}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap">
                      {formatDate(email.sentAt)}
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                    {email.subject}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                    {email.preview}
                  </p>
                </div>
              );
            })
          )}
        </div>

        {/* Email Detail View */}
        <div className="md:col-span-7 flex flex-col justify-between pl-2">
          {selectedEmail ? (
            <div className="space-y-4">
              {/* Header */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-medium uppercase tracking-wider text-brand-600 dark:text-brand-400">
                      Dayflow Automated Notification
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                      {selectedEmail.subject}
                    </h3>
                  </div>
                  <span className="text-xs text-slate-400 bg-white dark:bg-slate-900 px-2 py-1 rounded border border-slate-200 dark:border-slate-800">
                    {new Date(selectedEmail.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-200/80 dark:border-slate-700/80 text-xs text-slate-600 dark:text-slate-300 space-y-1">
                  <div><strong>To:</strong> {selectedEmail.to}</div>
                  <div><strong>From:</strong> Dayflow Cloud Delivery &lt;notifications@dayflow.corp&gt;</div>
                </div>
              </div>

              {/* Body */}
              <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-inner">
                {selectedEmail.verificationCode && (
                  <div className="mb-4 p-4 rounded-xl bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800 text-center">
                    <span className="text-xs text-purple-700 dark:text-purple-300 uppercase font-semibold">One-Time Verification Passcode</span>
                    <div className="text-3xl font-mono font-black text-purple-900 dark:text-purple-200 tracking-widest my-1">
                      {selectedEmail.verificationCode}
                    </div>
                    <span className="text-[10px] text-purple-600 dark:text-purple-400">Valid for 15 minutes</span>
                  </div>
                )}

                <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed font-sans">
                  {selectedEmail.body}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-10 text-center text-slate-400">
              <Mail className="h-12 w-12 stroke-[1.2] mb-3 text-slate-300 dark:text-slate-600" />
              <p className="text-sm font-medium">Select an email from the left to read full contents</p>
              <p className="text-xs mt-1 text-slate-400">Any leave applications, payroll disbursals, or account OTPs will appear here in real time.</p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
