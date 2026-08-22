import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import {
  Sparkles,
  CalendarCheck,
  CalendarClock,
  CreditCard,
  BarChart3,
  Users,
  ArrowRight,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">

      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-slate-800 dark:bg-slate-700 flex items-center justify-center text-white">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="font-bold text-base tracking-tight text-slate-800 dark:text-slate-100">
              Dayflow <span className="text-slate-500 dark:text-slate-400 font-normal">HRMS</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <Link to="/dashboard">
                <Button variant="primary" size="sm" rightIcon={<ArrowRight className="h-4 w-4" />}>
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/auth/signin">
                  <Button variant="ghost" size="sm">Sign In</Button>
                </Link>
                <Link to="/auth/signup">
                  <Button variant="primary" size="sm">Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-xs font-medium mb-8">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Human Resource Management System</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-[1.1]">
            Every workday,{' '}
            <span className="text-slate-500 dark:text-slate-400">perfectly aligned.</span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Dayflow streamlines your entire HR lifecycle — attendance, leave workflows, payroll,
            workforce profiles, and company analytics, all in one place.
          </p>

          {/* CTA block */}
          <div className="mt-10 flex items-center justify-center gap-3 flex-wrap">
            <Link to="/auth/signup">
              <Button variant="primary" size="lg" rightIcon={<ArrowRight className="h-4 w-4" />}>
                Create an account
              </Button>
            </Link>
            <Link to="/auth/signin">
              <Button variant="ghost" size="lg">
                Sign in
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
              Built for modern teams
            </h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              All the tools HR, Finance, and Employees need — unified and easy to use.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                icon: <CalendarCheck className="h-5 w-5" />,
                title: 'Attendance Tracking',
                desc: 'Punch-in/out with duration timers, weekly matrix, break calculation, and company-wide controls.',
              },
              {
                icon: <CalendarClock className="h-5 w-5" />,
                title: 'Leave Approval Engine',
                desc: 'Request time-off with auto-days calculation, attachments, and instant HR decision notifications.',
              },
              {
                icon: <CreditCard className="h-5 w-5" />,
                title: 'Payroll & PDF Paystubs',
                desc: 'Comprehensive earnings breakdowns with one-click PDF download and salary disbursement simulations.',
              },
              {
                icon: <Users className="h-5 w-5" />,
                title: 'Employee Directory',
                desc: 'Unified workforce profiles with role management, department views, and search.',
              },
              {
                icon: <BarChart3 className="h-5 w-5" />,
                title: 'Company Analytics',
                desc: 'Headcount trends, attrition rates, department cost analysis, and custom reporting.',
              },
              {
                icon: <Sparkles className="h-5 w-5" />,
                title: 'Smart Dashboard',
                desc: 'Personalized daily overview for employees and an admin command center for HR.',
              },
            ].map((f) => (
              <div
                key={f.title}
                className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
              >
                <div className="h-9 w-9 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center mb-4">
                  {f.icon}
                </div>
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-1">{f.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="py-8 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
        Dayflow Human Resource Management System &bull; Every workday, perfectly aligned.
      </footer>
    </div>
  );
};
