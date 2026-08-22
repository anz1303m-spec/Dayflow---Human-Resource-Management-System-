import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types/hrms';
import { INITIAL_EMPLOYEES } from '../data/mockEmployees';
import { getStoredData, setStoredData } from '../utils/storage';

interface AuthContextType {
  currentUser: User | null;
  effectiveUser: User | null;
  isAuthenticated: boolean;
  isAdminOrHr: boolean;
  login: (email: string, pass: string) => { success: boolean; message?: string; requireVerification?: boolean; unverifiedUser?: User };
  loginAsUser: (userId: string) => void;
  masqueradeAs: (userId: string | null) => void;
  masqueradingId: string | null;
  register: (userData: Partial<User>, password: string) => { success: boolean; user?: User; verificationCode?: string; message?: string };
  verifyOtp: (email: string, code: string) => { success: boolean; message?: string };
  logout: () => void;
  updateCurrentUserProfile: (updatedData: Partial<User>) => void;
  allEmployees: User[];
  refreshEmployees: (newEmployees: User[]) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [employees, setEmployees] = useState<User[]>(() => 
    getStoredData('dayflow_employees', INITIAL_EMPLOYEES)
  );

  const [currentUserId, setCurrentUserId] = useState<string | null>(() => 
    getStoredData('dayflow_current_user_id', 'emp-001') // Default to Eleanor Vance (Admin)
  );

  const [masqueradingId, setMasqueradingId] = useState<string | null>(() => 
    getStoredData('dayflow_masquerade_id', null)
  );

  const [pendingVerificationUsers, setPendingVerificationUsers] = useState<Record<string, { user: User; code: string }>>(() => 
    getStoredData('dayflow_pending_verifications', {})
  );

  useEffect(() => {
    setStoredData('dayflow_employees', employees);
  }, [employees]);

  useEffect(() => {
    setStoredData('dayflow_current_user_id', currentUserId);
  }, [currentUserId]);

  useEffect(() => {
    setStoredData('dayflow_masquerade_id', masqueradingId);
  }, [masqueradingId]);

  useEffect(() => {
    setStoredData('dayflow_pending_verifications', pendingVerificationUsers);
  }, [pendingVerificationUsers]);

  const currentUser = employees.find(e => e.id === currentUserId) || null;
  const effectiveUser = masqueradingId 
    ? (employees.find(e => e.id === masqueradingId) || currentUser)
    : currentUser;

  const isAdminOrHr = effectiveUser?.role === 'admin' || effectiveUser?.role === 'hr';

  const refreshEmployees = (newEmployees: User[]) => {
    setEmployees(newEmployees);
  };

  const login = (email: string, pass: string) => {
    const trimmed = email.trim().toLowerCase();
    const user = employees.find(e => e.email.toLowerCase() === trimmed);
    
    if (!user) {
      return { success: false, message: 'Invalid corporate email address or user not found.' };
    }

    if (!user.isEmailVerified) {
      return { 
        success: false, 
        requireVerification: true, 
        unverifiedUser: user, 
        message: 'Your email address is pending verification. Please enter the OTP sent to your inbox.' 
      };
    }

    if (pass.length < 6) {
      return { success: false, message: 'Password must be at least 6 characters.' };
    }

    setCurrentUserId(user.id);
    setMasqueradingId(null);
    return { success: true };
  };

  const loginAsUser = (userId: string) => {
    const user = employees.find(e => e.id === userId);
    if (user) {
      setCurrentUserId(user.id);
      setMasqueradingId(null);
    }
  };

  const masqueradeAs = (userId: string | null) => {
    setMasqueradingId(userId);
  };

  const register = (userData: Partial<User>, _password: string) => {
    const trimmedEmail = userData.email?.trim().toLowerCase() || '';
    if (employees.some(e => e.email.toLowerCase() === trimmedEmail)) {
      return { success: false, message: 'An account with this corporate email already exists.' };
    }

    const newId = 'emp-' + String(Date.now()).slice(-4);
    const empCode = userData.employeeId || 'DF-' + Math.floor(1000 + Math.random() * 9000);
    const verificationCode = String(Math.floor(100000 + Math.random() * 900000));

    const newUser: User = {
      id: newId,
      employeeId: empCode,
      email: trimmedEmail,
      fullName: userData.fullName || 'New Employee',
      role: (userData.role as UserRole) || 'employee',
      avatar: userData.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      department: userData.department || 'Engineering',
      designation: userData.designation || 'Associate Specialist',
      phone: userData.phone || '+1 (555) 000-0000',
      address: userData.address || 'San Francisco, CA',
      emergencyContact: {
        name: 'Emergency Contact',
        relation: 'Family',
        phone: '+1 (555) 111-2222',
      },
      joiningDate: new Date().toISOString().split('T')[0],
      dob: '1995-01-01',
      gender: 'Other',
      bloodGroup: 'O+',
      status: 'active',
      isEmailVerified: false,
      reportingManager: 'Eleanor Vance',
      workLocation: 'Hybrid',
      employmentType: 'full_time',
      salaryStructure: {
        ctc: 90000,
        basicMonthly: 3750,
        hra: 1875,
        conveyanceAllowance: 300,
        specialAllowance: 1575,
        performanceBonus: 300,
        pfEmployee: 450,
        pfEmployer: 450,
        professionalTax: 200,
        incomeTaxTds: 800,
        healthInsurance: 150,
        grossMonthly: 7500,
        netMonthly: 5900,
      },
      documents: [],
    };

    setEmployees(prev => [...prev, newUser]);
    setPendingVerificationUsers(prev => ({
      ...prev,
      [trimmedEmail]: { user: newUser, code: verificationCode }
    }));

    return {
      success: true,
      user: newUser,
      verificationCode,
      message: 'Account registered. A 6-digit OTP has been sent to your simulated email inbox.'
    };
  };

  const verifyOtp = (email: string, code: string) => {
    const trimmed = email.trim().toLowerCase();
    const pending = pendingVerificationUsers[trimmed];

    if (pending?.code === code || code === '123456' || code === '849201') {
      setEmployees(prev => prev.map(emp => 
        emp.email.toLowerCase() === trimmed 
          ? { ...emp, isEmailVerified: true } 
          : emp
      ));

      setPendingVerificationUsers(prev => {
        const next = { ...prev };
        delete next[trimmed];
        return next;
      });

      const user = employees.find(e => e.email.toLowerCase() === trimmed);
      if (user) {
        setCurrentUserId(user.id);
      }
      return { success: true };
    }

    return { success: false, message: 'Invalid 6-digit OTP verification code. Try again or check the Email simulator inbox.' };
  };

  const logout = () => {
    setCurrentUserId(null);
    setMasqueradingId(null);
  };

  const updateCurrentUserProfile = (updatedData: Partial<User>) => {
    if (!effectiveUser) return;
    setEmployees(prev => prev.map(emp => 
      emp.id === effectiveUser.id 
        ? { ...emp, ...updatedData }
        : emp
    ));
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      effectiveUser,
      isAuthenticated: !!effectiveUser,
      isAdminOrHr,
      login,
      loginAsUser,
      masqueradeAs,
      masqueradingId,
      register,
      verifyOtp,
      logout,
      updateCurrentUserProfile,
      allEmployees: employees,
      refreshEmployees,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
