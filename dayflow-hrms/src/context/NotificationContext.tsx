import React, { createContext, useContext, useState, useEffect } from 'react';
import { NotificationItem, SimulatedEmail } from '../types/hrms';
import { INITIAL_EMAILS } from '../data/mockEmails';
import { getStoredData, setStoredData } from '../utils/storage';

interface NotificationContextType {
  notifications: NotificationItem[];
  emails: SimulatedEmail[];
  unreadNotificationCount: number;
  unreadEmailCount: number;
  isEmailModalOpen: boolean;
  setIsEmailModalOpen: (open: boolean) => void;
  selectedEmail: SimulatedEmail | null;
  setSelectedEmail: (email: SimulatedEmail | null) => void;
  sendSimulatedEmail: (email: Omit<SimulatedEmail, 'id' | 'sentAt' | 'read'>) => void;
  addNotification: (notif: Omit<NotificationItem, 'id' | 'createdAt' | 'read'>) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  markEmailAsRead: (id: string) => void;
  clearAllNotifications: () => void;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n-1',
    userId: 'emp-001',
    title: 'New Leave Request',
    message: 'Aarav Mehta submitted a request for 4 days of Annual Paid Leave.',
    type: 'leave',
    read: false,
    createdAt: '2026-08-20T10:30:00Z',
    actionUrl: '/leaves',
  },
  {
    id: 'n-2',
    userId: 'emp-002',
    title: 'Leave Request Status',
    message: 'Your leave request for Sep 01 - Sep 04 is currently under review.',
    type: 'leave',
    read: true,
    createdAt: '2026-08-20T10:31:00Z',
    actionUrl: '/leaves',
  },
  {
    id: 'n-3',
    userId: 'all',
    title: 'July 2026 Salary Slips Available',
    message: 'Monthly payroll has been processed. Download your official payslip now.',
    type: 'payroll',
    read: false,
    createdAt: '2026-07-31T17:00:00Z',
    actionUrl: '/payroll',
  }
];

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => 
    getStoredData('dayflow_notifications', INITIAL_NOTIFICATIONS)
  );

  const [emails, setEmails] = useState<SimulatedEmail[]>(() => 
    getStoredData('dayflow_simulated_emails', INITIAL_EMAILS)
  );

  const [isEmailModalOpen, setIsEmailModalOpen] = useState<boolean>(false);
  const [selectedEmail, setSelectedEmail] = useState<SimulatedEmail | null>(null);

  useEffect(() => {
    setStoredData('dayflow_notifications', notifications);
  }, [notifications]);

  useEffect(() => {
    setStoredData('dayflow_simulated_emails', emails);
  }, [emails]);

  const unreadNotificationCount = notifications.filter(n => !n.read).length;
  const unreadEmailCount = emails.filter(e => !e.read).length;

  const sendSimulatedEmail = (emailData: Omit<SimulatedEmail, 'id' | 'sentAt' | 'read'>) => {
    const newEmail: SimulatedEmail = {
      ...emailData,
      id: 'email-' + Date.now(),
      sentAt: new Date().toISOString(),
      read: false,
    };
    setEmails(prev => [newEmail, ...prev]);
  };

  const addNotification = (notifData: Omit<NotificationItem, 'id' | 'createdAt' | 'read'>) => {
    const newNotif: NotificationItem = {
      ...notifData,
      id: 'n-' + Date.now(),
      createdAt: new Date().toISOString(),
      read: false,
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markEmailAsRead = (id: string) => {
    setEmails(prev => prev.map(e => e.id === id ? { ...e, read: true } : e));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      emails,
      unreadNotificationCount,
      unreadEmailCount,
      isEmailModalOpen,
      setIsEmailModalOpen,
      selectedEmail,
      setSelectedEmail,
      sendSimulatedEmail,
      addNotification,
      markNotificationAsRead,
      markAllNotificationsAsRead,
      markEmailAsRead,
      clearAllNotifications,
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within a NotificationProvider');
  return context;
};
