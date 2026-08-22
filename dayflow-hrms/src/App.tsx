import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { HRMSProvider } from './context/HRMSContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { MasqueradeBanner } from './components/layout/MasqueradeBanner';
import { EmailSimulatorModal } from './components/layout/EmailSimulatorModal';

import { LandingPage } from './pages/LandingPage';
import { SignInPage } from './pages/SignInPage';
import { SignUpPage } from './pages/SignUpPage';
import { VerifyEmailPage } from './pages/VerifyEmailPage';
import { DashboardPage } from './pages/DashboardPage';
import { EmployeesPage } from './pages/EmployeesPage';
import { EmployeeProfilePage } from './pages/EmployeeProfilePage';
import { AttendancePage } from './pages/AttendancePage';
import { LeavesPage } from './pages/LeavesPage';
import { PayrollPage } from './pages/PayrollPage';
import { AnalyticsPage } from './pages/AnalyticsPage';

// Protected Layout component
const AppLayout: React.FC = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/auth/signin" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <MasqueradeBanner />
      <Navbar />

      <div className="max-w-7xl mx-auto flex">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          <Outlet />
        </main>
      </div>

      <EmailSimulatorModal />
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <HRMSProvider>
            <Routes>
              {/* Public Gateway */}
              <Route path="/" element={<LandingPage />} />

              {/* Auth Routes */}
              <Route path="/auth/signin" element={<SignInPage />} />
              <Route path="/auth/signup" element={<SignUpPage />} />
              <Route path="/auth/verify-email" element={<VerifyEmailPage />} />

              {/* Protected HRMS Routes */}
              <Route element={<AppLayout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/employees" element={<EmployeesPage />} />
                <Route path="/profile" element={<EmployeeProfilePage />} />
                <Route path="/profile/:id" element={<EmployeeProfilePage />} />
                <Route path="/attendance" element={<AttendancePage />} />
                <Route path="/leaves" element={<LeavesPage />} />
                <Route path="/payroll" element={<PayrollPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
              </Route>

              {/* Catch-all Fallback */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </HRMSProvider>
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
}
