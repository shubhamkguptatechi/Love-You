import React, { useState, useEffect, useCallback } from 'react';
import { HandwrittenLove } from './components/HandwrittenLove';
import { AtmosphereCanvas } from './components/AtmosphereCanvas';
import { Controls } from './components/Controls';
import { RomanticLetterModal } from './components/RomanticLetterModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { AnimationPhase, GlowTheme, GlowThemeId, TrajectoryMode } from './types';
import { romanticAudio } from './utils/audioSynth';

const GLOW_THEMES: Record<GlowThemeId, GlowTheme> = {
  rosegold: {
    id: 'rosegold',
    name: 'Rose Gold & Crimson',
    penColor: '#E6A078',
    penHighlight: '#FFE0B2',
    haloColor: '#E6395B',
    secondaryHalo: '#430018',
    particleColor: '#E6A078',
    sparkleColor: '#FFE0B2',
  },
  crimson: {
    id: 'crimson',
    name: 'Crimson Velvet',
    penColor: '#FF2E63',
    penHighlight: '#FFAAA6',
    haloColor: '#E6395B',
    secondaryHalo: '#300010',
    particleColor: '#FF2E63',
    sparkleColor: '#FFAAA6',
  },
  champagne: {
    id: 'champagne',
    name: 'Warm Champagne',
    penColor: '#FFE0B2',
    penHighlight: '#FFF8E7',
    haloColor: '#D47A4A',
    secondaryHalo: '#3D1308',
    particleColor: '#FFE0B2',
    sparkleColor: '#FFFDF5',
  },
  amethyst: {
    id: 'amethyst',
    name: 'Twilight Violet',
    penColor: '#C77DFF',
    penHighlight: '#E0AAFF',
    haloColor: '#7B2CBF',
    secondaryHalo: '#24002E',
    particleColor: '#C77DFF',
    sparkleColor: '#F3C4FB',
  },
};

export default function App() {
  const [phase, setPhase] = useState<AnimationPhase>('phase1_fadein');
  const [currentThemeId, setCurrentThemeId] = useState<GlowThemeId>('rosegold');
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [trajectoryMode, setTrajectoryMode] = useState<TrajectoryMode>('circle');
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);
  const [penTip, setPenTip] = useState<{ x: number; y: number; active: boolean } | null>(null);
  const [burstTrigger, setBurstTrigger] = useState<{ x: number; y: number; id: number } | null>(null);
  const [isLetterOpen, setIsLetterOpen] = useState<boolean>(false);
  const [dedicationText, setDedicationText] = useState<string>('');

  const currentTheme = GLOW_THEMES[currentThemeId];

  // Initialize dedication from URL query params if present (e.g. ?for=Sarah)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const forParam = params.get('for');
    if (forParam) {
      setDedicationText(decodeURIComponent(forParam));
    }
  }, []);

  // Orchestrate Opening Sequence Timing
  // Phase 1 (0 -> 1.3s): Near-black fades into deep burgundy
  // Phase 2 (1.3s -> 2.3s): Crimson halo blooms
  // Phase 3 (2.3s onwards): Rose-gold pen writes 'Love You'
  useEffect(() => {
    let t1: number;
    let t2: number;

    if (phase === 'phase1_fadein') {
      t1 = window.setTimeout(() => {
        setPhase('phase2_halo');
      }, 1300);
    } else if (phase === 'phase2_halo') {
      t2 = window.setTimeout(() => {
        setPhase('phase3_writing');
      }, 1000);
    }

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [phase]);

  // Restart Sequence Function
  const handleRestart = useCallback(() => {
    setPhase('phase1_fadein');
    setPenTip(null);
  }, []);

  // Audio Toggle
  const handleToggleAudio = useCallback(() => {
    const playing = romanticAudio.toggle();
    setIsAudioPlaying(playing);
  }, []);

  // Quick Burst from Controls or Center
  const handleTriggerHeartBurst = useCallback(() => {
    setBurstTrigger({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      id: Date.now(),
    });
  }, []);

  // Canvas Click: Spawns heart burst where user clicked
  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    setBurstTrigger({
      x: e.clientX,
      y: e.clientY,
      id: Date.now(),
    });
  }, []);

  return (
    <main
      aria-label="Love You animated experience"
      className="relative w-screen h-screen overflow-hidden bg-[#24000D] flex items-center justify-center select-none pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]"
    >
      {/* Offline Status Toast */}
      <OfflineIndicator />

      {/* Subtle App Identity Watermark */}
      <header className="fixed top-5 left-6 z-30 flex items-center gap-2 pointer-events-none opacity-70 hover:opacity-100 transition-opacity">
        <span className="w-2 h-2 rounded-full bg-[#E6A078] shadow-[0_0_8px_#FFE0B2]" aria-hidden="true" />
        <span className="font-serif text-sm tracking-widest text-[#FFE0B2] uppercase">
          Éternité
        </span>
      </header>

      {/* 1. CINEMATIC BACKGROUND GRADIENT & DARK CHERRY VIGNETTE */}
      <div
        className="absolute inset-0 pointer-events-none transition-colors duration-1000"
        style={{
          background: `radial-gradient(circle at 50% 50%, #430018 0%, #24000D 65%, #120006 100%)`,
        }}
        aria-hidden="true"
      />

      {/* 2. SUBTLE CINEMATIC GRAIN / BREATHING SHADOW */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20 mix-blend-overlay"
        style={{
          backgroundImage: `radial-gradient(#FFE0B2 0.7px, transparent 0.7px)`,
          backgroundSize: '24px 24px',
        }}
        aria-hidden="true"
      />

      {/* 3. ATMOSPHERIC CANVAS LAYER (Bokeh, particles, sparkles, interactive bursts) */}
      <AtmosphereCanvas
        theme={currentTheme}
        penTip={penTip}
        onCanvasClick={handleCanvasClick}
        externalBurstTrigger={burstTrigger}
      />

      {/* 4. MAIN CENTRAL HANDWRITTEN "LOVE YOU" ANIMATION */}
      <div className="relative z-20 flex flex-col items-center justify-center pointer-events-none px-4">
        <HandwrittenLove
          phase={phase}
          theme={currentTheme}
          isPaused={isPaused}
          trajectoryMode={trajectoryMode}
          onWritingProgress={setPenTip}
          onPhaseChange={setPhase}
          customDedication={dedicationText}
        />
      </div>

      {/* 5. MINIMAL, REFINED FLOATING CONTROLS DOCK */}
      <Controls
        isPaused={isPaused}
        onTogglePause={() => setIsPaused(!isPaused)}
        onRestart={handleRestart}
        currentTheme={currentTheme}
        onSelectTheme={setCurrentThemeId}
        isAudioPlaying={isAudioPlaying}
        onToggleAudio={handleToggleAudio}
        trajectoryMode={trajectoryMode}
        onSelectTrajectory={setTrajectoryMode}
        onOpenLetter={() => setIsLetterOpen(true)}
        onTriggerHeartBurst={handleTriggerHeartBurst}
      />

      {/* 6. ROMANTIC LETTER / DEDICATION MODAL */}
      <RomanticLetterModal
        isOpen={isLetterOpen}
        onClose={() => setIsLetterOpen(false)}
        dedication={dedicationText}
        onSaveDedication={setDedicationText}
      />

      {/* 7. PHASE 1 NEAR-BLACK SCREEN FADE-IN CURTAIN */}
      <div
        className="absolute inset-0 bg-[#0d0005] pointer-events-none transition-opacity duration-1000 ease-out z-40"
        style={{
          opacity: phase === 'phase1_fadein' ? 1 : 0,
        }}
        aria-hidden="true"
      />
    </main>
  );
}
