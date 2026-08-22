/**
 * Renders a small avatar: uploaded photo (data: URL) or initials circle.
 * className is applied to the outer wrapper div.
 */
import React from 'react';

interface AvatarProps {
  name: string;
  avatar?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  rounded?: 'full' | 'lg' | 'md';
}

const COLORS = [
  'bg-slate-600', 'bg-zinc-600', 'bg-stone-600', 'bg-neutral-700', 'bg-gray-700',
];

function initials(name: string) {
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
}

function color(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return COLORS[Math.abs(h) % COLORS.length];
}

const SIZE_MAP = {
  sm: 'h-7 w-7 text-xs',
  md: 'h-9 w-9 text-sm',
  lg: 'h-16 w-16 text-xl',
};

const RADIUS_MAP = {
  full: 'rounded-full',
  lg: 'rounded-xl',
  md: 'rounded-lg',
};

export const Avatar: React.FC<AvatarProps> = ({
  name,
  avatar,
  size = 'md',
  className = '',
  rounded = 'md',
}) => {
  const isCustomPhoto =
    avatar && (avatar.startsWith('data:') || avatar.startsWith('blob:'));

  const sizeClass  = SIZE_MAP[size];
  const radiusClass = RADIUS_MAP[rounded];

  if (isCustomPhoto) {
    return (
      <img
        src={avatar}
        alt={name}
        className={`${sizeClass} ${radiusClass} object-cover select-none ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} ${radiusClass} ${color(name)} flex items-center justify-center text-white font-semibold select-none ${className}`}
    >
      {initials(name)}
    </div>
  );
};
