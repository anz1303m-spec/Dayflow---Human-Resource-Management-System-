import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export const MasqueradeBanner: React.FC = () => {
  const { masqueradingId, masqueradeAs, effectiveUser } = useAuth();

  if (!masqueradingId || !effectiveUser) return null;

  return (
    <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white px-4 py-2 text-xs sm:text-sm font-medium shadow-sm flex items-center justify-between sticky top-0 z-50 animate-fadeIn">
      <div className="flex items-center gap-2">
        <ShieldAlert className="h-4 w-4 shrink-0 text-amber-100" />
        <span>
          <strong>Admin Preview Active:</strong> Viewing Dayflow as <span className="underline font-bold">{effectiveUser.fullName}</span> ({effectiveUser.designation} &bull; {effectiveUser.department})
        </span>
      </div>
      <button
        onClick={() => masqueradeAs(null)}
        className="inline-flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white px-2.5 py-1 rounded-lg transition-all font-semibold"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Exit Preview</span>
      </button>
    </div>
  );
};
