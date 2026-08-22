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
