import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#430018]/90 backdrop-blur-md border border-[#E6A078]/30 shadow-lg text-[#FFE0B2] text-xs font-serif tracking-wide transition-all"
    >
      <WifiOff size={14} className="text-[#E6A078]" />
      <span>Offline Mode — All visuals & ambient music work locally</span>
    </div>
  );
};
