const fs = require('fs');
const path = require('path');

function saveFile(relPath, content) {
  const fullPath = path.resolve(relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + '\n', 'utf8');
  console.log('Saved: ' + relPath);
}

// 1. ProfileHeader.tsx
saveFile('src/components/profile/ProfileHeader.tsx', `
import React from 'react';
import { User } from '../../types/hrms';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Edit, Mail, Phone, MapPin, Building, Calendar, ShieldCheck } from 'lucide-react';
import { formatDate } from '../../utils/formatters';

interface ProfileHeaderProps {
  employee: User;
  onEditClick: () => void;
  canEdit: boolean;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  employee,
  onEditClick,
  canEdit,
}) => {
  return (
    <div className="relative rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-card overflow-hidden">
      {/* Top Banner Gradient */}
      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-r from-brand-600 via-indigo-600 to-sky-500 opacity-90" />

      <div className="relative pt-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        
        {/* Avatar & Key Info */}
        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5">
          <div className="relative">
            <img
              src={employee.avatar}
              alt={employee.fullName}
              className="h-28 w-28 rounded-2xl object-cover ring-4 ring-white dark:ring-slate-900 shadow-lg"
            />
            {employee.isEmailVerified && (
              <div className="absolute -bottom-1 -right-1 p-1 bg-emerald-500 text-white rounded-full shadow" title="Verified Corporate ID">
                <ShieldCheck className="h-4 w-4" />
              </div>
            )}
          </div>

          <div className="text-center sm:text-left space-y-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {employee.fullName}
              </h2>
              <Badge status={employee.status} size="sm" />
              <Badge variant="brand" size="sm">{employee.role.toUpperCase()}</Badge>
            </div>
            
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
              {employee.designation} &bull; <span className="text-brand-600 dark:text-brand-400">{employee.department}</span>
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-500 dark:text-slate-400 pt-1">
              <span className="flex items-center gap-1">
                <Building className="h-3.5 w-3.5" />
                {employee.employeeId}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {employee.workLocation}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                Joined {formatDate(employee.joiningDate)}
              </span>
            </div>
          </div>
        </div>

        {/* Action button */}
        {canEdit && (
          <Button
            variant="outline"
            size="sm"
            onClick={onEditClick}
            leftIcon={<Edit className="h-4 w-4" />}
            className="self-center sm:self-end"
          >
            Edit Profile
          </Button>
        )}
      </div>
    </div>
  );
};
`);

// 2. PersonalDetailsTab.tsx
saveFile('src/components/profile/PersonalDetailsTab.tsx', `
import React from 'react';
import { User } from '../../types/hrms';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { formatDate } from '../../utils/formatters';
import { User as UserIcon, Phone, MapPin, HeartHandshake, Shield } from 'lucide-react';

export const PersonalDetailsTab: React.FC<{ employee: User }> = ({ employee }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      
      {/* Basic Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <UserIcon className="h-4 w-4 text-brand-500" />
            <span>Personal Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-400 uppercase font-semibold">Date of Birth</span>
              <p className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5">{formatDate(employee.dob)}</p>
            </div>
            <div>
              <span className="text-slate-400 uppercase font-semibold">Gender</span>
              <p className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5">{employee.gender}</p>
            </div>
            <div>
              <span className="text-slate-400 uppercase font-semibold">Blood Group</span>
              <p className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5">{employee.bloodGroup}</p>
            </div>
            <div>
              <span className="text-slate-400 uppercase font-semibold">Nationality / Status</span>
              <p className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5">United States</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Phone className="h-4 w-4 text-brand-500" />
            <span>Contact &amp; Address</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3 text-xs">
            <div>
              <span className="text-slate-400 uppercase font-semibold">Corporate Email</span>
              <p className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5">{employee.email}</p>
            </div>
            <div>
              <span className="text-slate-400 uppercase font-semibold">Phone Number</span>
              <p className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5">{employee.phone}</p>
            </div>
            <div>
              <span className="text-slate-400 uppercase font-semibold">Residential Address</span>
              <p className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5">{employee.address}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Emergency Contact */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <HeartHandshake className="h-4 w-4 text-rose-500" />
            <span>Emergency Contact</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-slate-400 uppercase font-semibold">Contact Name</span>
              <p className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5">{employee.emergencyContact.name}</p>
            </div>
            <div>
              <span className="text-slate-400 uppercase font-semibold">Relationship</span>
              <p className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5">{employee.emergencyContact.relation}</p>
            </div>
            <div>
              <span className="text-slate-400 uppercase font-semibold">Emergency Phone</span>
              <p className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5">{employee.emergencyContact.phone}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
`);

// 3. JobDetailsTab.tsx
saveFile('src/components/profile/JobDetailsTab.tsx', `
import React from 'react';
import { User } from '../../types/hrms';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { formatDate } from '../../utils/formatters';
import { Briefcase, Building, Shield, UserCheck, Calendar } from 'lucide-react';
import { Badge } from '../ui/Badge';

export const JobDetailsTab: React.FC<{ employee: User }> = ({ employee }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-brand-500" />
            <span>Position &amp; Role</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-400 uppercase font-semibold">Employee ID</span>
              <p className="font-bold text-slate-900 dark:text-slate-100 mt-0.5">{employee.employeeId}</p>
            </div>
            <div>
              <span className="text-slate-400 uppercase font-semibold">Role Privilege</span>
              <div className="mt-0.5"><Badge variant="brand" size="sm">{employee.role.toUpperCase()}</Badge></div>
            </div>
            <div>
              <span className="text-slate-400 uppercase font-semibold">Job Title</span>
              <p className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5">{employee.designation}</p>
            </div>
            <div>
              <span className="text-slate-400 uppercase font-semibold">Department</span>
              <p className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5">{employee.department}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Building className="h-4 w-4 text-brand-500" />
            <span>Employment Timeline</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-400 uppercase font-semibold">Employment Type</span>
              <p className="font-semibold capitalize text-slate-900 dark:text-slate-100 mt-0.5">
                {employee.employmentType.replace('_', ' ')}
              </p>
            </div>
            <div>
              <span className="text-slate-400 uppercase font-semibold">Employment Status</span>
              <div className="mt-0.5"><Badge status={employee.status} size="sm" /></div>
            </div>
            <div>
              <span className="text-slate-400 uppercase font-semibold">Date of Joining</span>
              <p className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5">{formatDate(employee.joiningDate)}</p>
            </div>
            <div>
              <span className="text-slate-400 uppercase font-semibold">Reporting Manager</span>
              <p className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5">{employee.reportingManager}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
`);

// 4. SalaryStructureTab.tsx
saveFile('src/components/profile/SalaryStructureTab.tsx', `
import React from 'react';
import { User } from '../../types/hrms';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { formatCurrency } from '../../utils/formatters';
import { DollarSign, ShieldAlert, ArrowUpRight, TrendingUp, Sparkles } from 'lucide-react';

export const SalaryStructureTab: React.FC<{ employee: User }> = ({ employee }) => {
  const sal = employee.salaryStructure;

  return (
    <div className="space-y-6">
      {/* Top 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-gradient-to-br from-brand-600 to-indigo-700 text-white shadow-md">
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-200">Annual CTC Package</span>
          <div className="text-3xl font-black mt-1">{formatCurrency(sal.ctc)}</div>
          <span className="text-[11px] text-brand-100 mt-1 block">Cost to Company (Annual)</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Monthly Gross</span>
          <div className="text-3xl font-black text-slate-900 dark:text-white mt-1">{formatCurrency(sal.grossMonthly)}</div>
          <span className="text-[11px] text-slate-500 mt-1 block">Before Statutory Deductions</span>
        </div>

        <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 shadow-card">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Monthly Net Pay</span>
          <div className="text-3xl font-black text-emerald-900 dark:text-emerald-300 mt-1">{formatCurrency(sal.netMonthly)}</div>
          <span className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-1 block">Estimated Take-Home</span>
        </div>
      </div>

      {/* Earnings vs Deductions Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Earnings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              <span className="text-emerald-600 dark:text-emerald-400">Monthly Earnings</span>
              <span className="text-sm font-bold text-slate-900 dark:text-white">{formatCurrency(sal.grossMonthly)}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-600 dark:text-slate-400 font-medium">Basic Pay</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(sal.basicMonthly)}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-600 dark:text-slate-400 font-medium">House Rent Allowance (HRA)</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(sal.hra)}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-600 dark:text-slate-400 font-medium">Conveyance Allowance</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(sal.conveyanceAllowance)}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-600 dark:text-slate-400 font-medium">Special Allowance</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(sal.specialAllowance)}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-600 dark:text-slate-400 font-medium">Performance Bonus</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(sal.performanceBonus)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Deductions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              <span className="text-rose-600 dark:text-rose-400">Monthly Deductions</span>
              <span className="text-sm font-bold text-rose-600 dark:text-rose-400">
                {formatCurrency(sal.pfEmployee + sal.professionalTax + sal.incomeTaxTds + sal.healthInsurance)}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-600 dark:text-slate-400 font-medium">Provident Fund (Employee PF)</span>
                <span className="font-semibold text-rose-600 dark:text-rose-400">-{formatCurrency(sal.pfEmployee)}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-600 dark:text-slate-400 font-medium">Professional Tax</span>
                <span className="font-semibold text-rose-600 dark:text-rose-400">-{formatCurrency(sal.professionalTax)}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-600 dark:text-slate-400 font-medium">Income Tax (TDS Slab)</span>
                <span className="font-semibold text-rose-600 dark:text-rose-400">-{formatCurrency(sal.incomeTaxTds)}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-600 dark:text-slate-400 font-medium">Corporate Health Insurance</span>
                <span className="font-semibold text-rose-600 dark:text-rose-400">-{formatCurrency(sal.healthInsurance)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
`);

// 5. DocumentsTab.tsx
saveFile('src/components/profile/DocumentsTab.tsx', `
import React, { useState } from 'react';
import { User, DocumentItem } from '../../types/hrms';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { FileText, Download, Upload, ShieldCheck, Trash2 } from 'lucide-react';
import { formatDate } from '../../utils/formatters';

export const DocumentsTab: React.FC<{ employee: User; onUploadDocument?: (doc: DocumentItem) => void }> = ({ employee }) => {
  const [documents, setDocuments] = useState<DocumentItem[]>(employee.documents || []);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const handleSimulatedUpload = () => {
    setIsUploading(true);
    setTimeout(() => {
      const newDoc: DocumentItem = {
        id: 'doc-' + Date.now(),
        title: 'Updated State Certificate 2026',
        category: 'certificate',
        fileName: 'Certificate_Verified_2026.pdf',
        fileSize: '1.4 MB',
        uploadDate: new Date().toISOString().split('T')[0],
      };
      setDocuments(prev => [newDoc, ...prev]);
      setIsUploading(false);
    }, 800);
  };

  const handleDownload = (doc: DocumentItem) => {
    alert(\`Simulated download started for "\${doc.fileName}"\`);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>Employee Document Vault</span>
          </CardTitle>
          <p className="text-xs text-slate-500">Verified employment agreements, identity documents, and tax forms</p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={handleSimulatedUpload}
          isLoading={isUploading}
          leftIcon={<Upload className="h-4 w-4" />}
        >
          Upload Document
        </Button>
      </CardHeader>

      <CardContent>
        {documents.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No documents uploaded yet.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {documents.map((doc) => (
              <div key={doc.id} className="py-3.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{doc.title}</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {doc.fileName} &bull; {doc.fileSize} &bull; Uploaded {formatDate(doc.uploadDate)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(doc)}
                    leftIcon={<Download className="h-3.5 w-3.5" />}
                  >
                    Download
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
`);

// 6. EditProfileModal.tsx
saveFile('src/components/profile/EditProfileModal.tsx', `
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
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  employee,
  onSave,
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
`);

console.log('Profile components generated!');