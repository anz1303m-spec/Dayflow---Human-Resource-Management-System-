import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useHRMS } from '../context/HRMSContext';
import { ProfileHeader } from '../components/profile/ProfileHeader';
import { PersonalDetailsTab } from '../components/profile/PersonalDetailsTab';
import { JobDetailsTab } from '../components/profile/JobDetailsTab';
import { SalaryStructureTab } from '../components/profile/SalaryStructureTab';
import { DocumentsTab } from '../components/profile/DocumentsTab';
import { EditProfileModal } from '../components/profile/EditProfileModal';
import { Tabs, TabItem } from '../components/ui/Tabs';
import { User, Briefcase, DollarSign, FileText, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { User as UserType } from '../types/hrms';

export const EmployeeProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { allEmployees, effectiveUser, isAdminOrHr, updateCurrentUserProfile } = useAuth();
  const { updateEmployee } = useHRMS();

  const [activeTab, setActiveTab] = useState<string>('personal');
  const [editModalOpen, setEditModalOpen] = useState<boolean>(false);

  // If no ID in route, default to effective user
  const targetId = id || effectiveUser?.id || 'emp-001';
  const employee = allEmployees.find(e => e.id === targetId) || effectiveUser;

  if (!employee) return null;

  const canEdit = isAdminOrHr || effectiveUser?.id === employee.id;
  const isOwnProfile = effectiveUser?.id === employee.id;

  const handleSave = (updatedData: Partial<UserType>) => {
    if (isOwnProfile) {
      updateCurrentUserProfile(updatedData);
    } else {
      updateEmployee(employee.id, updatedData);
    }
    setEditModalOpen(false);
  };

  const handleAvatarChange = (dataUrl: string) => {
    const update = { avatar: dataUrl };
    if (isOwnProfile) {
      updateCurrentUserProfile(update);
    } else {
      updateEmployee(employee.id, update);
    }
  };

  const tabs: TabItem[] = [
    { id: 'personal', label: 'Personal Info', icon: <User className="h-4 w-4" /> },
    { id: 'job', label: 'Job & Organization', icon: <Briefcase className="h-4 w-4" /> },
    ...(isAdminOrHr
      ? [
          { id: 'salary', label: 'Salary Structure', icon: <DollarSign className="h-4 w-4" /> },
          { id: 'documents', label: 'Document Vault', icon: <FileText className="h-4 w-4" /> },
        ]
      : [{ id: 'documents', label: 'My Documents', icon: <FileText className="h-4 w-4" /> }]),
  ];

  return (
    <div className="space-y-6">
      {/* Back navigation if viewing another employee's profile */}
      {id && id !== effectiveUser?.id && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/employees')}
          leftIcon={<ArrowLeft className="h-4 w-4" />}
        >
          Back to Directory
        </Button>
      )}

      <ProfileHeader
        employee={employee}
        canEdit={canEdit}
        onEditClick={() => setEditModalOpen(true)}
        onAvatarChange={canEdit ? handleAvatarChange : undefined}
      />

      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      <div>
        {activeTab === 'personal' && <PersonalDetailsTab employee={employee} />}
        {activeTab === 'job' && <JobDetailsTab employee={employee} />}
        {activeTab === 'salary' && isAdminOrHr && <SalaryStructureTab employee={employee} />}
        {activeTab === 'documents' && <DocumentsTab employee={employee} />}
      </div>

      {editModalOpen && (
        <EditProfileModal
          employee={employee}
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          onSave={handleSave}
          canEditAll={isAdminOrHr}
        />
      )}
    </div>
  );
};