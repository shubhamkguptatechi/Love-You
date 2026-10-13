import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Heart, 
  Maximize2, 
  Minimize2,
  Compass,
  BookOpen
} from 'lucide-react';
import { GlowTheme, GlowThemeId, TrajectoryMode } from '../types';
import { PWAInstallButton } from './PWAInstallButton';

interface ControlsProps {
  isPaused: boolean;
  onTogglePause: () => void;
  onRestart: () => void;
  currentTheme: GlowTheme;
  onSelectTheme: (themeId: GlowThemeId) => void;
  isAudioPlaying: boolean;
  onToggleAudio: () => void;
  trajectoryMode: TrajectoryMode;
  onSelectTrajectory: (mode: TrajectoryMode) => void;
  onOpenLetter: () => void;
  onTriggerHeartBurst: () => void;
}

const THEME_OPTIONS: { id: GlowThemeId; label: string; color: string }[] = [
  { id: 'rosegold', label: 'Rose Gold', color: '#E6A078' },
  { id: 'crimson', label: 'Crimson Velvet', color: '#E6395B' },
  { id: 'champagne', label: 'Champagne', color: '#FFE0B2' },
  { id: 'amethyst', label: 'Twilight Violet', color: '#C77DFF' },
];

const TRAJECTORY_OPTIONS: { mode: TrajectoryMode; label: string }[] = [
  { mode: 'circle', label: 'Celestial Orbit' },
  { mode: 'lemniscate', label: 'Infinity Flow' },
  { mode: 'spiral', label: 'Harmonic Spiral' },
];

export const Controls: React.FC<ControlsProps> = ({
  isPaused,
  onTogglePause,
  onRestart,
  currentTheme,
  onSelectTheme,
  isAudioPlaying,
  onToggleAudio,
  trajectoryMode,
  onSelectTrajectory,
  onOpenLetter,
  onTriggerHeartBurst
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const [isTrajectoryMenuOpen, setIsTrajectoryMenuOpen] = useState(false);
  const [isIdle, setIsIdle] = useState(false);

  // Auto-dim controls after 4 seconds of inactivity so artwork is uninterrupted
  useEffect(() => {
    let timeout: number;
    const resetIdle = () => {
      setIsIdle(false);
      clearTimeout(timeout);
      timeout = window.setTimeout(() => setIsIdle(true), 4500);
    };

    window.addEventListener('mousemove', resetIdle);
    window.addEventListener('touchstart', resetIdle);
    resetIdle();

    return () => {
      window.removeEventListener('mousemove', resetIdle);
      window.removeEventListener('touchstart', resetIdle);
      clearTimeout(timeout);
    };
  }, []);

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <nav
      aria-label="Experience controls"
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-30 transition-opacity duration-700 ${
        isIdle ? 'opacity-35 hover:opacity-100' : 'opacity-100'
      }`}
    >
      <div className="flex items-center gap-1.5 sm:gap-2 px-3 py-2 rounded-full bg-[#24000D]/70 backdrop-blur-xl border border-[#E6A078]/25 shadow-[0_8px_32px_rgba(36,0,13,0.8)] text-[#FFE0B2]">
        {/* 1. Play / Pause */}
        <button
          onClick={onTogglePause}
          className="p-2 sm:px-3 sm:py-2 rounded-full hover:bg-[#E6A078]/15 active:scale-95 transition-all text-[#FFE0B2] flex items-center gap-1.5 focus:outline-none focus-visible:ring-1 focus-visible:ring-[#E6A078]"
          title={isPaused ? 'Resume animation' : 'Pause animation'}
          aria-label={isPaused ? 'Resume' : 'Pause'}
        >
          {isPaused ? <Play size={16} className="text-[#E6A078]" /> : <Pause size={16} className="text-[#E6A078]" />}
          <span className="hidden sm:inline text-xs font-serif tracking-wider">
            {isPaused ? 'Resume' : 'Pause'}
          </span>
        </button>

        <div className="w-[1px] h-4 bg-[#E6A078]/20" aria-hidden="true" />

        {/* 2. Replay Opening Sequence */}
        <button
          onClick={onRestart}
          className="p-2 sm:px-3 sm:py-2 rounded-full hover:bg-[#E6A078]/15 active:scale-95 transition-all text-[#FFE0B2] flex items-center gap-1.5 focus:outline-none focus-visible:ring-1 focus-visible:ring-[#E6A078]"
          title="Replay opening handwriting sequence"
          aria-label="Replay sequence"
        >
          <RotateCcw size={15} className="text-[#E6A078]" />
          <span className="hidden sm:inline text-xs font-serif tracking-wider">Replay</span>
        </button>

        <div className="w-[1px] h-4 bg-[#E6A078]/20" aria-hidden="true" />

        {/* 3. Glow Theme Switcher */}
        <div className="relative">
          <button
            onClick={() => {
              setIsThemeMenuOpen(!isThemeMenuOpen);
              setIsTrajectoryMenuOpen(false);
            }}
            className="p-2 sm:px-3 sm:py-2 rounded-full hover:bg-[#E6A078]/15 active:scale-95 transition-all text-[#FFE0B2] flex items-center gap-1.5 focus:outline-none focus-visible:ring-1 focus-visible:ring-[#E6A078]"
            title="Switch romantic glow aura"
            aria-label="Glow themes"
            aria-expanded={isThemeMenuOpen}
          >
            <span
              className="w-3.5 h-3.5 rounded-full border border-white/40 shadow-sm"
              style={{ backgroundColor: currentTheme.penColor }}
              aria-hidden="true"
            />
            <span className="hidden sm:inline text-xs font-serif tracking-wider">Aura</span>
          </button>

          {isThemeMenuOpen && (
            <div 
              role="menu"
              className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 p-1.5 rounded-2xl bg-[#24000D]/95 backdrop-blur-2xl border border-[#E6A078]/30 shadow-2xl flex flex-col gap-1 min-w-[150px]"
            >
              <div className="px-2.5 py-1 text-[10px] uppercase tracking-widest text-[#E6A078]/70 font-sans">
                Glow Palette
              </div>
              {THEME_OPTIONS.map(opt => (
                <button
                  key={opt.id}
                  role="menuitem"
                  onClick={() => {
                    onSelectTheme(opt.id);
                    setIsThemeMenuOpen(false);
                  }}
                  className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-serif tracking-wide transition-all ${
                    currentTheme.id === opt.id
                      ? 'bg-[#E6A078]/20 text-[#FFE0B2]'
                      : 'hover:bg-white/5 text-[#E6A078]/80'
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: opt.color }}
                    aria-hidden="true"
                  />
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="w-[1px] h-4 bg-[#E6A078]/20" aria-hidden="true" />

        {/* 4. Motion Trajectory Path Switcher */}
        <div className="relative">
          <button
            onClick={() => {
              setIsTrajectoryMenuOpen(!isTrajectoryMenuOpen);
              setIsThemeMenuOpen(false);
            }}
            className="p-2 sm:px-3 sm:py-2 rounded-full hover:bg-[#E6A078]/15 active:scale-95 transition-all text-[#FFE0B2] flex items-center gap-1.5 focus:outline-none focus-visible:ring-1 focus-visible:ring-[#E6A078]"
            title="Switch motion trajectory"
            aria-label="Motion trajectory"
            aria-expanded={isTrajectoryMenuOpen}
          >
            <Compass size={15} className="text-[#E6A078]" />
            <span className="hidden sm:inline text-xs font-serif tracking-wider">Path</span>
          </button>

          {isTrajectoryMenuOpen && (
            <div 
              role="menu"
              className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 p-1.5 rounded-2xl bg-[#24000D]/95 backdrop-blur-2xl border border-[#E6A078]/30 shadow-2xl flex flex-col gap-1 min-w-[150px]"
            >
              <div className="px-2.5 py-1 text-[10px] uppercase tracking-widest text-[#E6A078]/70 font-sans">
                Motion Flow
              </div>
              {TRAJECTORY_OPTIONS.map(opt => (
                <button
                  key={opt.mode}
                  role="menuitem"
                  onClick={() => {
                    onSelectTrajectory(opt.mode);
                    setIsTrajectoryMenuOpen(false);
                  }}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-serif tracking-wide transition-all ${
                    trajectoryMode === opt.mode
                      ? 'bg-[#E6A078]/20 text-[#FFE0B2]'
                      : 'hover:bg-white/5 text-[#E6A078]/80'
                  }`}
                >
                  <Sparkles size={12} className={trajectoryMode === opt.mode ? 'text-[#FFE0B2]' : 'text-transparent'} />
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="w-[1px] h-4 bg-[#E6A078]/20" aria-hidden="true" />

        {/* 5. Heart Burst Quick Trigger */}
        <button
          onClick={onTriggerHeartBurst}
          className="p-2 sm:px-3 sm:py-2 rounded-full hover:bg-[#E6395B]/20 active:scale-90 transition-all text-[#FFE0B2] flex items-center gap-1.5 focus:outline-none focus-visible:ring-1 focus-visible:ring-[#E6395B]"
          title="Release shower of glowing hearts"
          aria-label="Release hearts"
        >
          <Heart size={15} className="text-[#E6395B] fill-[#E6395B]/40" />
          <span className="hidden md:inline text-xs font-serif tracking-wider">Hearts</span>
        </button>

        <div className="w-[1px] h-4 bg-[#E6A078]/20" aria-hidden="true" />

        {/* 6. Ambient Romantic Music Toggle */}
        <button
          onClick={onToggleAudio}
          className={`p-2 sm:px-3 sm:py-2 rounded-full active:scale-95 transition-all flex items-center gap-1.5 focus:outline-none focus-visible:ring-1 focus-visible:ring-[#E6A078] ${
            isAudioPlaying
              ? 'bg-[#E6A078]/20 text-[#FFE0B2]'
              : 'hover:bg-[#E6A078]/15 text-[#E6A078]/80'
          }`}
          title={isAudioPlaying ? 'Mute ambient music' : 'Play ambient romantic soundscape'}
          aria-label={isAudioPlaying ? 'Mute music' : 'Play music'}
        >
          {isAudioPlaying ? (
            <>
              <Volume2 size={16} className="text-[#FFE0B2]" />
              <span className="hidden sm:inline text-xs font-serif tracking-wider">Music On</span>
              {/* Subtle animated audio wave lines */}
              <span className="flex items-center gap-0.5 ml-0.5">
                <span className="w-0.5 h-2 bg-[#FFE0B2] animate-pulse" />
                <span className="w-0.5 h-3.5 bg-[#FFE0B2] animate-pulse [animation-delay:150ms]" />
                <span className="w-0.5 h-2 bg-[#FFE0B2] animate-pulse [animation-delay:300ms]" />
              </span>
            </>
          ) : (
            <>
              <VolumeX size={16} className="text-[#E6A078]" />
              <span className="hidden sm:inline text-xs font-serif tracking-wider">Sound</span>
            </>
          )}
        </button>

        <div className="w-[1px] h-4 bg-[#E6A078]/20" aria-hidden="true" />

        {/* 7. Romantic Letter / Dedication Modal Trigger */}
        <button
          onClick={onOpenLetter}
          className="p-2 rounded-full hover:bg-[#E6A078]/15 active:scale-95 transition-all text-[#E6A078] focus:outline-none focus-visible:ring-1 focus-visible:ring-[#E6A078]"
          title="Romantic Dedication Letter"
          aria-label="Open dedication letter"
        >
          <BookOpen size={16} />
        </button>

        {/* 8. Fullscreen Toggle */}
        <button
          onClick={handleToggleFullscreen}
          className="p-2 rounded-full hover:bg-[#E6A078]/15 active:scale-95 transition-all text-[#E6A078] focus:outline-none focus-visible:ring-1 focus-visible:ring-[#E6A078]"
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          aria-label="Toggle fullscreen"
        >
          {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
        </button>

        <div className="w-[1px] h-4 bg-[#E6A078]/20" aria-hidden="true" />

        {/* 9. Install App Button */}
        <PWAInstallButton />
      </div>
    </nav>
  );
};
