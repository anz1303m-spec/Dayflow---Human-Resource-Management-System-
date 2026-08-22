import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import {
  Layers, Lock, Mail, User, ArrowRight, CheckCircle2,
  Phone, MapPin, Briefcase, Users, HeartPulse, ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { UserRole } from '../types/hrms';

const DEPARTMENTS = [
  'Engineering', 'Product & Design', 'Human Resources',
  'Sales & Growth', 'Marketing', 'Finance', 'Operations', 'Legal',
];

const DESIGNATIONS = [
  'Associate Specialist', 'Senior Specialist', 'Lead Engineer',
  'Software Engineer', 'Product Manager', 'Designer', 'Analyst',
  'Manager', 'Director', 'VP', 'Other',
];

const GENDERS = ['Male', 'Female', 'Non-binary', 'Prefer not to say'];
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
const WORK_LOCATIONS = ['On-site', 'Remote', 'Hybrid'];
const EMP_TYPES = ['full_time', 'part_time', 'contract', 'intern'];

type Step = 1 | 2 | 3 | 4;

const STEPS = [
  { id: 1, label: 'Account' },
  { id: 2, label: 'Personal' },
  { id: 3, label: 'Job Details' },
  { id: 4, label: 'Emergency' },
];

function SelectField({
  label, value, onChange, options, required,
}: {
  label: string; value: string; onChange: (v: string) => void;
  options: { label: string; value: string }[] | string[]; required?: boolean;
}) {
  const normalized = (options as any[]).map((o) =>
    typeof o === 'string' ? { label: o, value: o } : o
  );
  return (
    <div>
      <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
        {label}{required && ' *'}
      </label>
      <select
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 py-2 px-3 text-sm text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-slate-400 focus:outline-none transition-colors"
      >
        <option value="">— Select —</option>
        {normalized.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

export const SignUpPage: React.FC = () => {
  const { register } = useAuth();
  const { sendSimulatedEmail } = useNotifications();
  const navigate = useNavigate();

  // Step control
  const [step, setStep] = useState<Step>(1);

  // Step 1 — Account
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('employee');

  // Step 2 — Personal
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');

  // Step 3 — Job
  const [employeeId, setEmployeeId] = useState('');
  const [department, setDepartment] = useState('');
  const [designation, setDesignation] = useState('');
  const [workLocation, setWorkLocation] = useState('');
  const [employmentType, setEmploymentType] = useState('full_time');
  const [reportingManager, setReportingManager] = useState('');

  // Step 4 — Emergency contact
  const [ecName, setEcName] = useState('');
  const [ecRelation, setEcRelation] = useState('');
  const [ecPhone, setEcPhone] = useState('');

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const hasMinLength = password.length >= 6;

  const validateStep = (): string => {
    if (step === 1) {
      if (!fullName.trim()) return 'Full name is required.';
      if (!email.trim()) return 'Email is required.';
      if (!hasMinLength) return 'Password must be at least 6 characters.';
    }
    if (step === 2) {
      if (!phone.trim()) return 'Phone number is required.';
    }
    if (step === 3) {
      if (!department) return 'Department is required.';
      if (!designation) return 'Designation is required.';
    }
    return '';
  };

  const next = () => {
    const err = validateStep();
    if (err) { setError(err); return; }
    setError('');
    setStep((s) => (s < 4 ? (s + 1) as Step : s));
  };

  const back = () => {
    setError('');
    setStep((s) => (s > 1 ? (s - 1) as Step : s));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateStep();
    if (err) { setError(err); return; }
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      const res = register(
        {
          fullName,
          email,
          employeeId: employeeId || undefined,
          department,
          designation,
          phone,
          address,
          dob,
          gender,
          bloodGroup,
          role,
          workLocation,
          employmentType: employmentType as any,
          reportingManager,
          emergencyContact: { name: ecName, relation: ecRelation, phone: ecPhone },
        },
        password,
      );

      setIsLoading(false);

      if (res.success && res.verificationCode) {
        sendSimulatedEmail({
          to: email,
          subject: `Welcome to Dayflow — OTP: ${res.verificationCode}`,
          preview: `Your verification code is ${res.verificationCode}`,
          body: `Hello ${fullName},\n\nYour OTP is: ${res.verificationCode}\n\nThis code expires in 15 minutes.\n\n— Dayflow`,
          category: 'verification',
          verificationCode: res.verificationCode,
        });
        navigate('/auth/verify-email', { state: { email, code: res.verificationCode } });
      } else {
        setError(res.message || 'Registration failed.');
        setStep(1);
      }
    }, 400);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center p-4 py-10">
      <div className="w-full max-w-xl">

        {/* Brand */}
        <div className="text-center mb-8">
          <div className="h-10 w-10 rounded-xl bg-slate-800 dark:bg-slate-700 flex items-center justify-center text-white mx-auto mb-4">
            <Layers className="h-5 w-5" />
          </div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Create your account</h1>
          <p className="text-xs text-slate-400 mt-1">Fill in your details to join the Dayflow workspace</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-between mb-8 px-2">
          {STEPS.map((s, i) => (
            <React.Fragment key={s.id}>
              <div className="flex flex-col items-center gap-1">
                <div
                  className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                    step === s.id
                      ? 'bg-slate-800 text-white'
                      : step > s.id
                      ? 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                  }`}
                >
                  {step > s.id ? <CheckCircle2 className="h-4 w-4" /> : s.id}
                </div>
                <span className={`text-[10px] font-medium ${step === s.id ? 'text-slate-700 dark:text-slate-200' : 'text-slate-400'}`}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-px mx-2 mb-4 ${step > s.id ? 'bg-slate-300 dark:bg-slate-600' : 'bg-slate-100 dark:bg-slate-800'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Form card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-6">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-100 text-xs text-rose-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* ── Step 1: Account ── */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="mb-4">
                  <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                    <User className="h-4 w-4 text-slate-400" /> Account Credentials
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">Your login identity and role</p>
                </div>

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
                  placeholder="james.wilson@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  leftIcon={<Mail className="h-4 w-4" />}
                />

                <Input
                  label="Password"
                  type="password"
                  required
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  leftIcon={<Lock className="h-4 w-4" />}
                />
                {password && (
                  <p className={`text-[11px] flex items-center gap-1.5 -mt-2 ${hasMinLength ? 'text-emerald-600' : 'text-slate-400'}`}>
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {hasMinLength ? 'Password looks good' : 'At least 6 characters required'}
                  </p>
                )}

                {/* Role picker */}
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                    Account Role
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['employee', 'hr'] as UserRole[]).map((r) => (
                      <label
                        key={r}
                        className={`p-3 rounded-lg border cursor-pointer flex items-center gap-2.5 transition-all ${
                          role === r
                            ? 'bg-slate-800 border-slate-800 text-white'
                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <input type="radio" name="role" value={r} checked={role === r} onChange={() => setRole(r)} className="sr-only" />
                        <div className="text-xs">
                          <div className="font-semibold capitalize">{r === 'hr' ? 'HR / Admin' : 'Employee'}</div>
                          <div className={`text-[10px] mt-0.5 ${role === r ? 'text-slate-300' : 'text-slate-400'}`}>
                            {r === 'hr' ? 'Management access' : 'Standard portal'}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── Step 2: Personal ── */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="mb-4">
                  <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                    <HeartPulse className="h-4 w-4 text-slate-400" /> Personal Information
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">Your personal and contact details</p>
                </div>

                <Input
                  label="Phone Number"
                  required
                  placeholder="+1 (555) 000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  leftIcon={<Phone className="h-4 w-4" />}
                />

                <Input
                  label="Residential Address"
                  placeholder="123 Main St, City, State"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  leftIcon={<MapPin className="h-4 w-4" />}
                />

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Date of Birth</label>
                    <input
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 py-2 px-3 text-sm text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-slate-400 focus:outline-none"
                    />
                  </div>
                  <SelectField label="Gender" value={gender} onChange={setGender} options={GENDERS} />
                </div>

                <SelectField label="Blood Group" value={bloodGroup} onChange={setBloodGroup} options={BLOOD_GROUPS} />
              </div>
            )}

            {/* ── Step 3: Job ── */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="mb-4">
                  <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-slate-400" /> Job & Organization
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">Your position and work setup</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <SelectField label="Department" required value={department} onChange={setDepartment} options={DEPARTMENTS} />
                  <SelectField label="Designation" required value={designation} onChange={setDesignation} options={DESIGNATIONS} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <SelectField label="Work Location" value={workLocation} onChange={setWorkLocation} options={WORK_LOCATIONS} />
                  <SelectField
                    label="Employment Type"
                    value={employmentType}
                    onChange={setEmploymentType}
                    options={[
                      { label: 'Full Time', value: 'full_time' },
                      { label: 'Part Time', value: 'part_time' },
                      { label: 'Contract', value: 'contract' },
                      { label: 'Intern', value: 'intern' },
                    ]}
                  />
                </div>

                <Input
                  label="Employee ID (optional)"
                  placeholder="DF-1008"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                />

                <Input
                  label="Reporting Manager (optional)"
                  placeholder="e.g. Ananya Sharma"
                  value={reportingManager}
                  onChange={(e) => setReportingManager(e.target.value)}
                  leftIcon={<Users className="h-4 w-4" />}
                />
              </div>
            )}

            {/* ── Step 4: Emergency Contact ── */}
            {step === 4 && (
              <div className="space-y-4">
                <div className="mb-4">
                  <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                    <HeartPulse className="h-4 w-4 text-slate-400" /> Emergency Contact
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">Who to contact in an emergency</p>
                </div>

                <Input
                  label="Contact Name"
                  placeholder="e.g. Sarah Wilson"
                  value={ecName}
                  onChange={(e) => setEcName(e.target.value)}
                  leftIcon={<User className="h-4 w-4" />}
                />

                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Relationship"
                    placeholder="e.g. Spouse, Parent"
                    value={ecRelation}
                    onChange={(e) => setEcRelation(e.target.value)}
                  />
                  <Input
                    label="Phone"
                    placeholder="+1 (555) 111-2222"
                    value={ecPhone}
                    onChange={(e) => setEcPhone(e.target.value)}
                    leftIcon={<Phone className="h-4 w-4" />}
                  />
                </div>

                {/* Summary preview */}
                <div className="mt-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-xs space-y-2">
                  <p className="font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider text-[10px] mb-2">Account Summary</p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-slate-500 dark:text-slate-400">
                    <span><span className="font-medium text-slate-700 dark:text-slate-300">Name:</span> {fullName}</span>
                    <span><span className="font-medium text-slate-700 dark:text-slate-300">Email:</span> {email}</span>
                    <span><span className="font-medium text-slate-700 dark:text-slate-300">Role:</span> {role}</span>
                    <span><span className="font-medium text-slate-700 dark:text-slate-300">Dept:</span> {department}</span>
                    <span><span className="font-medium text-slate-700 dark:text-slate-300">Designation:</span> {designation}</span>
                    <span><span className="font-medium text-slate-700 dark:text-slate-300">Location:</span> {workLocation || '—'}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div>
                {step > 1 && (
                  <Button type="button" variant="ghost" size="sm" onClick={back} leftIcon={<ChevronLeft className="h-4 w-4" />}>
                    Back
                  </Button>
                )}
              </div>
              <div>
                {step < 4 ? (
                  <Button type="button" variant="primary" size="sm" onClick={next} rightIcon={<ChevronRight className="h-4 w-4" />}>
                    Continue
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    isLoading={isLoading}
                    rightIcon={<ArrowRight className="h-4 w-4" />}
                  >
                    Create Account
                  </Button>
                )}
              </div>
            </div>
          </form>
        </div>

        <div className="mt-5 text-center text-xs text-slate-400">
          Already have an account?{' '}
          <Link to="/auth/signin" className="font-semibold text-slate-600 dark:text-slate-300 hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
