import React, { useRef, useState } from 'react';
import { User } from '../../types/hrms';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Edit, MapPin, Building, Calendar, ShieldCheck, Camera, X, Upload } from 'lucide-react';
import { formatDate } from '../../utils/formatters';

interface ProfileHeaderProps {
  employee: User;
  onEditClick: () => void;
  canEdit: boolean;
  onAvatarChange?: (dataUrl: string) => void;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

const AVATAR_COLORS = [
  'bg-slate-600', 'bg-zinc-600', 'bg-stone-600', 'bg-neutral-700', 'bg-gray-700',
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
  onAvatarChange,
}) => {
  const initials = getInitials(employee.fullName);
  const avatarBg = getAvatarColor(employee.fullName);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [hovering, setHovering] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [cropModal, setCropModal] = useState<string | null>(null); // raw file dataURL
  const [error, setError] = useState('');

  // Determine what to show: uploaded preview > stored avatar (if it's a data URL or custom) > initials
  const hasStoredAvatar =
    employee.avatar &&
    (employee.avatar.startsWith('data:') || employee.avatar.startsWith('blob:'));
  const displayAvatar = preview || (hasStoredAvatar ? employee.avatar : null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (JPG, PNG, WEBP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be smaller than 5 MB.');
      return;
    }

    setError('');
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setCropModal(dataUrl); // open confirm modal
    };
    reader.readAsDataURL(file);

    // reset input so same file can be re-selected
    e.target.value = '';
  };

  const handleConfirm = () => {
    if (!cropModal) return;
    setPreview(cropModal);
    onAvatarChange?.(cropModal);
    setCropModal(null);
  };

  const handleRemove = () => {
    setPreview(null);
    onAvatarChange?.('');
    setCropModal(null);
  };

  return (
    <>
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">

          {/* Avatar + Info */}
          <div className="flex items-center gap-5">

            {/* Avatar — click to upload */}
            <div
              className="relative shrink-0 group"
              onMouseEnter={() => setHovering(true)}
              onMouseLeave={() => setHovering(false)}
            >
              {/* Image or initials */}
              {displayAvatar ? (
                <img
                  src={displayAvatar}
                  alt={employee.fullName}
                  className="h-16 w-16 rounded-xl object-cover select-none"
                />
              ) : (
                <div
                  className={`h-16 w-16 rounded-xl ${avatarBg} flex items-center justify-center text-white text-xl font-bold tracking-wide select-none`}
                >
                  {initials}
                </div>
              )}

              {/* Hover overlay with camera icon — only if canEdit */}
              {canEdit && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={`absolute inset-0 rounded-xl flex items-center justify-center bg-black/40 transition-opacity duration-150 ${
                    hovering ? 'opacity-100' : 'opacity-0'
                  }`}
                  title="Change profile picture"
                >
                  <Camera className="h-5 w-5 text-white" />
                </button>
              )}

              {/* Verified badge */}
              {employee.isEmailVerified && (
                <div
                  className="absolute -bottom-1 -right-1 p-0.5 bg-emerald-500 text-white rounded-full shadow-sm"
                  title="Verified"
                >
                  <ShieldCheck className="h-3 w-3" />
                </div>
              )}

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="sr-only"
                onChange={handleFileChange}
              />
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
                  <span className="flex items-center gap-1"><Building className="h-3 w-3" />{employee.employeeId}</span>
                )}
                {employee.workLocation && (
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{employee.workLocation}</span>
                )}
                {employee.joiningDate && (
                  <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />Joined {formatDate(employee.joiningDate)}</span>
                )}
              </div>

              {/* Upload hint + error */}
              {canEdit && (
                <div className="pt-0.5">
                  {error ? (
                    <p className="text-[11px] text-rose-500">{error}</p>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 flex items-center gap-1 transition-colors"
                    >
                      <Upload className="h-3 w-3" />
                      {displayAvatar ? 'Change photo' : 'Upload photo'}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Edit profile button */}
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

      {/* Confirm photo modal */}
      {cropModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Use this photo?</h3>
              <button onClick={() => setCropModal(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Preview */}
            <div className="flex justify-center mb-5">
              <img
                src={cropModal}
                alt="Preview"
                className="h-32 w-32 rounded-xl object-cover border border-slate-100 dark:border-slate-700"
              />
            </div>

            <p className="text-xs text-slate-400 text-center mb-5">
              This image will be set as your profile picture.
            </p>

            <div className="flex gap-2">
              <Button variant="ghost" size="sm" className="flex-1" onClick={() => setCropModal(null)}>
                Cancel
              </Button>
              {displayAvatar && (
                <Button variant="outline" size="sm" onClick={handleRemove} leftIcon={<X className="h-3.5 w-3.5" />}>
                  Remove
                </Button>
              )}
              <Button variant="primary" size="sm" className="flex-1" onClick={handleConfirm}>
                Set Photo
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
