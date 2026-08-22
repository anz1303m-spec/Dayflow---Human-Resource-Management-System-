import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Sparkles, Lock, Mail, User, ArrowRight, CheckCircle2 } from 'lucide-react';
import { UserRole } from '../types/hrms';

export const SignUpPage: React.FC = () => {
  const { register } = useAuth();
  const { sendSimulatedEmail } = useNotifications();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [role, setRole] = useState<UserRole>('employee');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const hasMinLength = password.length >= 6;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!hasMinLength) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const res = register({
        fullName,
        email,
        employeeId: employeeId || undefined,
        department,
        role,
      }, password);

      setIsLoading(false);

      if (res.success && res.verificationCode) {
        sendSimulatedEmail({
          to: email,
          subject: `Welcome to Dayflow - OTP Code: ${res.verificationCode}`,
          preview: `Your one-time email verification code is ${res.verificationCode}`,
          body: `Hello ${fullName},\n\nYour one-time email verification code is: ${res.verificationCode}\n\nThis code expires in 15 minutes.`,
          category: 'verification',
          verificationCode: res.verificationCode,
        });

        navigate('/auth/verify-email', { state: { email, code: res.verificationCode } });
      } else {
        setError(res.message || 'Registration failed.');
      }
    }, 400);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-lg p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl">
        
        <div className="text-center mb-6">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-sky-500 flex items-center justify-center text-white mx-auto mb-3 shadow-md">
            <Sparkles className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Create your Dayflow Account</h1>
          <p className="text-xs text-slate-500 mt-1">Join your organization's HRMS workspace</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300">
              {error}
            </div>
          )}

          <Input
            label="Full Name"
            required
            placeholder="e.g. James Wilson"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            leftIcon={<User className="h-4 w-4" />}
          />

          <Input
            label="Corporate Email"
            type="email"
            required
            placeholder="james.wilson@dayflow.corp"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail className="h-4 w-4" />}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Employee ID (Optional)"
              placeholder="DF-1008"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
            />

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1.5">
                Department
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 py-2.5 px-3 text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 focus:outline-none"
              >
                <option value="Engineering">Engineering</option>
                <option value="Product & Design">Product &amp; Design</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Sales & Growth">Sales &amp; Growth</option>
                <option value="Marketing">Marketing</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1.5">
              Account Role
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className={`p-3 rounded-xl border cursor-pointer flex items-center gap-2.5 transition-all ${role === 'employee' ? 'bg-brand-50/80 border-brand-600 text-brand-900 dark:text-white' : 'border-slate-200 dark:border-slate-800'}`}>
                <input
                  type="radio"
                  name="role"
                  value="employee"
                  checked={role === 'employee'}
                  onChange={() => setRole('employee')}
                  className="text-brand-600"
                />
                <div className="text-xs">
                  <div className="font-bold">Employee</div>
                  <div className="text-slate-500 text-[10px]">Standard portal</div>
                </div>
              </label>

              <label className={`p-3 rounded-xl border cursor-pointer flex items-center gap-2.5 transition-all ${role === 'hr' ? 'bg-brand-50/80 border-brand-600 text-brand-900 dark:text-white' : 'border-slate-200 dark:border-slate-800'}`}>
                <input
                  type="radio"
                  name="role"
                  value="hr"
                  checked={role === 'hr'}
                  onChange={() => setRole('hr')}
                  className="text-brand-600"
                />
                <div className="text-xs">
                  <div className="font-bold">HR / Admin</div>
                  <div className="text-slate-500 text-[10px]">Management privileges</div>
                </div>
              </label>
            </div>
          </div>

          <Input
            label="Secure Password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<Lock className="h-4 w-4" />}
          />

          <div className="space-y-1 text-[11px] text-slate-500 dark:text-slate-400">
            <div className={`flex items-center gap-1.5 ${hasMinLength ? 'text-emerald-600 dark:text-emerald-400' : ''}`}>
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>At least 6 characters</span>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            className="w-full mt-2"
            rightIcon={<ArrowRight className="h-4 w-4" />}
          >
            Continue to Email Verification
          </Button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500">
          Already have an account?{' '}
          <Link to="/auth/signin" className="font-semibold text-brand-600 dark:text-brand-400 hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
