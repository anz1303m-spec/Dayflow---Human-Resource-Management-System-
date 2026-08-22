import React from 'react';
import { User } from '../../types/hrms';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Edit, MapPin, Building, Calendar, ShieldCheck } from 'lucide-react';
import { formatDate } from '../../utils/formatters';

interface ProfileHeaderProps {
  employee: User;
  onEditClick: () => void;
  canEdit: boolean;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

// Deterministic background color from name
const AVATAR_COLORS = [
  'bg-slate-600',
  'bg-zinc-600',
  'bg-stone-600',
  'bg-neutral-600',
  'bg-gray-700',
];
function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  employee,
  onEditClick,
  canEdit,
}) => {
  const initials = getInitials(employee.fullName);
  const avatarBg = getAvatarColor(employee.fullName);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">

        {/* Avatar + Info */}
        <div className="flex items-center gap-5">
          {/* Initials avatar — no stock photo */}
          <div className="relative shrink-0">
            <div
              className={`h-16 w-16 rounded-xl ${avatarBg} flex items-center justify-center text-white text-xl font-bold tracking-wide select-none`}
            >
              {initials}
            </div>
            {employee.isEmailVerified && (
              <div
                className="absolute -bottom-1 -right-1 p-0.5 bg-emerald-500 text-white rounded-full"
                title="Verified"
              >
                <ShieldCheck className="h-3 w-3" />
              </div>
            )}
          </div>

          {/* Name, role, meta */}
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                {employee.fullName}
              </h2>
              <Badge status={employee.status} size="sm" />
              <Badge variant="brand" size="sm">{employee.role.toUpperCase()}</Badge>
            </div>

            <p className="text-sm text-slate-500 dark:text-slate-400">
              {employee.designation}
              {employee.department && (
                <> &bull; <span className="text-slate-700 dark:text-slate-300">{employee.department}</span></>
              )}
            </p>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-0.5">
              {employee.employeeId && (
                <span className="flex items-center gap-1">
                  <Building className="h-3 w-3" />
                  {employee.employeeId}
                </span>
              )}
              {employee.workLocation && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {employee.workLocation}
                </span>
              )}
              {employee.joiningDate && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Joined {formatDate(employee.joiningDate)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Edit */}
        {canEdit && (
          <Button
            variant="outline"
            size="sm"
            onClick={onEditClick}
            leftIcon={<Edit className="h-3.5 w-3.5" />}
          >
            Edit Profile
          </Button>
        )}
      </div>
    </div>
  );
};
