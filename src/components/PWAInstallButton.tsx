import React, { useState } from 'react';
import { Download, X, Share, PlusSquare, Smartphone, Check } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  className?: string;
  variant?: 'dock' | 'banner' | 'modal';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ className = '', variant = 'dock' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);
  const [installedSuccess, setInstalledSuccess] = useState(false);

  // If already installed and running standalone, do not display install buttons
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const success = await install();
      if (success) {
        setInstalledSuccess(true);
        setTimeout(() => setInstalledSuccess(false), 3000);
      }
    } else {
      // Show guided instructions for iOS or desktop browsers
      setShowGuide(true);
    }
  };

  return (
    <>
      <button
        onClick={handleInstallClick}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-serif tracking-wider transition-all duration-300 active:scale-95 focus:outline-none focus-visible:ring-1 focus-visible:ring-[#E6A078] ${
          variant === 'dock'
            ? 'bg-[#E6A078]/20 hover:bg-[#E6A078]/30 text-[#FFE0B2] border border-[#E6A078]/35 shadow-sm'
            : 'bg-[#E6A078] hover:bg-[#FFE0B2] text-[#24000D] font-medium shadow-md shadow-[#E6A078]/25'
        } ${className}`}
        title="Install Éternité to your home screen"
        aria-label="Install App"
      >
        {installedSuccess ? (
          <>
            <Check size={14} className="text-emerald-400" />
            <span>Installed</span>
          </>
        ) : (
          <>
            <Download size={14} className={variant === 'dock' ? 'text-[#E6A078]' : 'text-[#24000D]'} />
            <span className="inline">Install App</span>
          </>
        )}
      </button>

      {/* Guided Installation Modal for iOS / Safari / Desktop */}
      {showGuide && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Install App Instructions"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md transition-all duration-300"
        >
          <div className="relative w-full max-w-sm p-6 sm:p-7 rounded-3xl bg-[#24000D]/95 border border-[#E6A078]/35 shadow-[0_20px_50px_rgba(0,0,0,0.9)] text-[#FFE0B2]">
            <button
              onClick={() => setShowGuide(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-[#E6A078] active:scale-90 transition-all focus:outline-none"
              aria-label="Close installation guide"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-[#430018] border border-[#E6A078]/40 flex items-center justify-center shadow-lg overflow-hidden">
                <img src="/pwa-192x192.png" alt="Éternité Icon" className="w-10 h-10 object-contain rounded-xl" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-medium text-[#FFE0B2]">Install Éternité</h3>
                <p className="text-[11px] font-sans text-[#E6A078]/70">Standalone Romantic Experience</p>
              </div>
            </div>

            <div className="space-y-3 my-5 text-xs text-[#FFE0B2]/90 leading-relaxed font-sans">
              {isIOS ? (
                <>
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                    <Share size={18} className="text-[#E6A078] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-medium text-[#FFE0B2]">1. Tap Share</span>
                      <p className="text-gray-400 mt-0.5 text-[11px]">Tap the share icon in your Safari bottom bar.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                    <PlusSquare size={18} className="text-[#E6A078] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-medium text-[#FFE0B2]">2. Add to Home Screen</span>
                      <p className="text-gray-400 mt-0.5 text-[11px]">Scroll down and choose &ldquo;Add to Home Screen&rdquo;.</p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                    <Smartphone size={18} className="text-[#E6A078] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-medium text-[#FFE0B2]">Direct Home Screen Access</span>
                      <p className="text-gray-400 mt-0.5 text-[11px]">
                        Open your browser menu (three dots or share menu) and tap &ldquo;Install app&rdquo; or &ldquo;Add to Home Screen&rdquo;.
                      </p>
                    </div>
                  </div>
                </>
              )}

              <div className="p-2.5 rounded-lg bg-[#430018]/50 border border-[#E6A078]/20 text-[11px] text-[#E6A078]/90 text-center font-serif">
                ✨ Launches full-screen without address bars and works completely offline!
              </div>
            </div>

            <button
              onClick={() => setShowGuide(false)}
              className="w-full py-2.5 rounded-xl bg-[#E6A078] hover:bg-[#FFE0B2] text-[#24000D] font-serif font-medium text-xs tracking-wider transition-all shadow-md active:scale-95"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};
