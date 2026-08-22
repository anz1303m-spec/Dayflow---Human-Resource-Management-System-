import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { Button } from '../components/ui/Button';
import { ShieldCheck, ArrowRight, Info } from 'lucide-react';

export const VerifyEmailPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { verifyOtp } = useAuth();
  const { setIsEmailModalOpen } = useNotifications();

  const email = (location.state as any)?.email || 'aarav.mehta@dayflow.corp';
  const codeFromState = (location.state as any)?.code || '849201';

  const [otpCode, setOtpCode] = useState<string>(codeFromState);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      const res = verifyOtp(email, otpCode);
      setIsLoading(false);

      if (res.success) {
        navigate('/dashboard');
      } else {
        setError(res.message || 'Invalid OTP verification code.');
      }
    }, 400);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl text-center">
        
        <div className="h-14 w-14 rounded-2xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 flex items-center justify-center text-purple-600 dark:text-purple-400 mx-auto mb-4">
          <ShieldCheck className="h-7 w-7" />
        </div>

        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Verify your Email</h1>
        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
          We have dispatched a 6-digit verification passcode to <strong>{email}</strong>
        </p>

        {/* Simulated Email Help Banner */}
        <div className="my-5 p-3.5 rounded-xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900 text-left">
          <div className="flex items-start gap-2">
            <Info className="h-4.5 w-4.5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
            <div className="text-[11px] text-purple-900 dark:text-purple-200">
              <span className="font-bold">Testing Environment:</span> The OTP code is pre-filled below, or you can check the <button type="button" onClick={() => setIsEmailModalOpen(true)} className="underline font-bold">Simulated Email Inbox</button>.
            </div>
          </div>
        </div>

        <form onSubmit={handleVerify} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs text-rose-700">
              {error}
            </div>
          )}

          <div>
            <input
              type="text"
              maxLength={6}
              required
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              className="w-full text-center text-3xl font-mono font-black tracking-widest py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
              placeholder="000000"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            className="w-full"
            rightIcon={<ArrowRight className="h-4 w-4" />}
          >
            Verify &amp; Continue
          </Button>
        </form>

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-500">
          <span>Didn't receive the OTP?</span>
          <button
            type="button"
            onClick={() => setIsEmailModalOpen(true)}
            className="font-bold text-brand-600 dark:text-brand-400 hover:underline"
          >
            Open Email Inbox
          </button>
        </div>
      </div>
    </div>
  );
};
