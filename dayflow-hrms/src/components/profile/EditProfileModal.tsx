import React, { useState } from 'react';
import { User, UserRole, EmploymentStatus } from '../../types/hrms';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useAuth } from '../../context/AuthContext';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: User;
  onSave: (updated: Partial<User>) => void;
  canEditAll?: boolean;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  employee,
  onSave,
  canEditAll,
}) => {
  const { isAdminOrHr } = useAuth();

  // Form state
  const [fullName, setFullName] = useState(employee.fullName);
  const [phone, setPhone] = useState(employee.phone);
  const [address, setAddress] = useState(employee.address);
  const [avatar, setAvatar] = useState(employee.avatar);
  const [emergencyName, setEmergencyName] = useState(employee.emergencyContact.name);
  const [emergencyRelation, setEmergencyRelation] = useState(employee.emergencyContact.relation);
  const [emergencyPhone, setEmergencyPhone] = useState(employee.emergencyContact.phone);

  // Admin-only fields
  const [designation, setDesignation] = useState(employee.designation);
  const [department, setDepartment] = useState(employee.department);
  const [role, setRole] = useState<UserRole>(employee.role);
  const [status, setStatus] = useState<EmploymentStatus>(employee.status);
  const [ctc, setCtc] = useState(employee.salaryStructure.ctc);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updatedData: Partial<User> = {
      fullName,
      phone,
      address,
      avatar,
      emergencyContact: {
        name: emergencyName,
        relation: emergencyRelation,
        phone: emergencyPhone,
      },
    };

    if (isAdminOrHr) {
      const basicMonthly = Math.round((ctc * 0.5) / 12);
      const hra = Math.round(basicMonthly * 0.5);
      const conveyanceAllowance = 400;
      const grossMonthly = Math.round(ctc / 12);
      const specialAllowance = Math.max(0, grossMonthly - basicMonthly - hra - conveyanceAllowance);
      const pfEmployee = Math.round(basicMonthly * 0.12);
      const professionalTax = 200;
      const incomeTaxTds = Math.round(grossMonthly * 0.12);
      const healthInsurance = 150;
      const netMonthly = grossMonthly - (pfEmployee + professionalTax + incomeTaxTds + healthInsurance);

      updatedData.designation = designation;
      updatedData.department = department;
      updatedData.role = role;
      updatedData.status = status;
      updatedData.salaryStructure = {
        ...employee.salaryStructure,
        ctc,
        basicMonthly,
        hra,
        conveyanceAllowance,
        specialAllowance,
        grossMonthly,
        pfEmployee,
        incomeTaxTds,
        netMonthly,
      };
    }

    onSave(updatedData);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Employee Profile"
      description={isAdminOrHr ? 'Full administrative profile editing enabled.' : 'You can update your personal contact details, address, and profile photo.'}
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Basic Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            disabled={!isAdminOrHr}
            required
          />
          <Input
            label="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>

        <Input
          label="Profile Picture URL"
          value={avatar}
          onChange={(e) => setAvatar(e.target.value)}
          helperText="Direct image URL for employee avatar"
        />

        <Input
          label="Residential Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          required
        />

        {/* Emergency Contact */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <span className="text-xs font-bold uppercase text-slate-400">Emergency Contact</span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
            <Input
              label="Contact Name"
              value={emergencyName}
              onChange={(e) => setEmergencyName(e.target.value)}
              required
            />
            <Input
              label="Relationship"
              value={emergencyRelation}
              onChange={(e) => setEmergencyRelation(e.target.value)}
              required
            />
            <Input
              label="Phone"
              value={emergencyPhone}
              onChange={(e) => setEmergencyPhone(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Admin Only Fields */}
        {isAdminOrHr && (
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase text-brand-600 dark:text-brand-400">Admin Privileged Controls</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Designation / Title"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                required
              />
              <Input
                label="Department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1.5">
                  Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 py-2.5 px-3 text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                >
                  <option value="employee">Employee</option>
                  <option value="hr">HR Officer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1.5">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as EmploymentStatus)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 py-2.5 px-3 text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                >
                  <option value="active">Active</option>
                  <option value="on_leave">On Leave</option>
                  <option value="probation">Probation</option>
                  <option value="terminated">Terminated</option>
                </select>
              </div>

              <Input
                label="Annual CTC ($)"
                type="number"
                value={ctc}
                onChange={(e) => setCtc(Number(e.target.value))}
                required
              />
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm">
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
};
