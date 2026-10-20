import React, { useEffect, useRef, useState, useCallback } from 'react';
import { AnimationPhase, GlowTheme, TrajectoryMode, OrbitPoint } from '../types';

interface HandwrittenLoveProps {
  phase: AnimationPhase;
  theme: GlowTheme;
  isPaused: boolean;
  trajectoryMode: TrajectoryMode;
  onWritingProgress?: (point: { x: number; y: number; active: boolean } | null) => void;
  onPhaseChange?: (newPhase: AnimationPhase) => void;
  onBurstRequest?: (x: number, y: number) => void;
  customDedication?: string;
}

// Master single-stroke cursive path for 'Love You' with heart flourish, centered at (0, 0)
const MASTER_CURSIVE_PATH = 
  'M -385.0 -37.0 C -370.0 -87.0 -350.0 -137.0 -320.0 -137.0 ' +
  'C -300.0 -137.0 -297.0 -117.0 -313.0 -87.0 ' +
  'C -335.0 -42.0 -370.0 18.0 -377.0 43.0 ' +
  'C -383.0 63.0 -399.0 68.0 -405.0 55.0 ' +
  'C -411.0 43.0 -395.0 27.0 -375.0 29.0 ' +
  'C -350.0 31.0 -325.0 48.0 -290.0 48.0 ' +
  'C -270.0 48.0 -253.0 8.0 -235.0 -32.0 ' +
  'C -250.0 -37.0 -270.0 -22.0 -275.0 -2.0 ' +
  'C -280.0 23.0 -263.0 45.0 -243.0 43.0 ' +
  'C -225.0 41.0 -215.0 21.0 -217.0 -2.0 ' +
  'C -219.0 -19.0 -235.0 -19.0 -239.0 -9.0 ' +
  'C -227.0 -12.0 -210.0 1.0 -193.0 1.0 ' +
  'C -183.0 1.0 -177.0 25.0 -169.0 41.0 ' +
  'C -163.0 49.0 -153.0 49.0 -147.0 35.0 ' +
  'C -137.0 13.0 -127.0 -9.0 -117.0 -9.0 ' +
  'C -111.0 -9.0 -109.0 -1.0 -115.0 5.0 ' +
  'C -107.0 5.0 -93.0 18.0 -80.0 13.0 ' +
  'C -67.0 8.0 -57.0 -12.0 -63.0 -22.0 ' +
  'C -73.0 -32.0 -87.0 -17.0 -89.0 3.0 ' +
  'C -91.0 28.0 -75.0 45.0 -55.0 43.0 ' +
  'C -37.0 41.0 -20.0 23.0 -5.0 8.0 ' +
  'C 20.0 -12.0 40.0 -47.0 55.0 -67.0 ' +
  'C 67.0 -82.0 83.0 -82.0 87.0 -62.0 ' +
  'C 91.0 -42.0 80.0 -7.0 83.0 18.0 ' +
  'C 87.0 38.0 103.0 41.0 115.0 23.0 ' +
  'C 130.0 -2.0 143.0 -42.0 150.0 -67.0 ' +
  'C 150.0 -42.0 135.0 43.0 125.0 88.0 ' +
  'C 115.0 128.0 90.0 138.0 80.0 121.0 ' +
  'C 70.0 101.0 87.0 65.0 117.0 38.0 ' +
  'C 140.0 18.0 163.0 -12.0 180.0 -27.0 ' +
  'C 167.0 -32.0 150.0 -19.0 145.0 3.0 ' +
  'C 140.0 28.0 155.0 45.0 173.0 43.0 ' +
  'C 190.0 41.0 200.0 21.0 197.0 -2.0 ' +
  'C 195.0 -19.0 180.0 -19.0 177.0 -9.0 ' +
  'C 187.0 -12.0 205.0 3.0 220.0 3.0 ' +
  'C 230.0 3.0 233.0 28.0 240.0 41.0 ' +
  'C 245.0 48.0 255.0 48.0 263.0 33.0 ' +
  'C 273.0 13.0 277.0 -7.0 283.0 -7.0 ' +
  'C 287.0 3.0 290.0 28.0 297.0 41.0 ' +
  'C 303.0 49.0 313.0 47.0 320.0 33.0 ' +
  'C 335.0 8.0 360.0 -17.0 380.0 -2.0 ' +
  'C 400.0 13.0 405.0 38.0 390.0 58.0 ' +
  'C 370.0 83.0 330.0 98.0 285.0 93.0';

export const HandwrittenLove: React.FC<HandwrittenLoveProps> = ({
  phase,
  theme,
  isPaused,
  trajectoryMode,
  onWritingProgress,
  onPhaseChange,
  onBurstRequest,
  customDedication
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const guidePathRef = useRef<SVGPathElement | null>(null);
  const [pathLength, setPathLength] = useState<number>(3600);
  const [writeOffset, setWriteOffset] = useState<number>(3600);
  const [penPoint, setPenPoint] = useState<{ x: number; y: number } | null>(null);
  const [penVisible, setPenVisible] = useState<boolean>(false);
  const [gleamActive, setGleamActive] = useState<boolean>(false);

  // Position and trails for orbital motion
  const [orbitPos, setOrbitPos] = useState<{ x: number; y: number; tilt: number }>({ x: 0, y: 0, tilt: 0 });
  const [trails, setTrails] = useState<OrbitPoint[]>([]);

  // Animation timing references
  const animFrameRef = useRef<number | 0>(0);
  const writingStartRef = useRef<number | null>(null);
  const orbitTimeRef = useRef<number>(0);
  const trailHistoryRef = useRef<OrbitPoint[]>([]);
  const lastTrailRecordRef = useRef<number>(0);

  // Measure path length on mount
  useEffect(() => {
    if (guidePathRef.current) {
      const len = guidePathRef.current.getTotalLength();
      if (len > 0) {
        setPathLength(len);
        setWriteOffset(len);
      }
    }
  }, []);

  // Compute orbital position based on trajectory mode
  const getTrajectoryPoint = useCallback((timeSec: number) => {
    const rx = 85;
    const ry = 48;

    if (trajectoryMode === 'circle') {
      const theta = timeSec * 0.45;
      const x = rx * Math.cos(theta);
      const y = ry * Math.sin(theta);
      // Gentle banking tilt that keeps text upright and readable
      const tilt = -4.5 * Math.sin(theta);
      return { x, y, tilt };
    } else if (trajectoryMode === 'lemniscate') {
      // Lemniscate infinity loop
      const t = timeSec * 0.4;
      const scale = 110;
      const denom = 1 + Math.sin(t) * Math.sin(t);
      const x = (scale * Math.cos(t)) / denom;
      const y = (scale * 0.48 * Math.sin(t) * Math.cos(t)) / denom;
      const tilt = 5.0 * Math.cos(t);
      return { x, y, tilt };
    } else {
      // Harmonic spiral (breathing radius)
      const theta = timeSec * 0.42;
      const rMod = 1 + 0.22 * Math.sin(timeSec * 0.25);
      const x = rx * rMod * Math.cos(theta);
      const y = ry * rMod * Math.sin(theta);
      const tilt = -5.0 * Math.sin(theta);
      return { x, y, tilt };
    }
  }, [trajectoryMode]);

  // Main animation frame handler
  useEffect(() => {
    let lastTs = performance.now();

    const loop = (timestamp: number) => {
      const dt = Math.min((timestamp - lastTs) / 1000, 0.1);
      lastTs = timestamp;

      if (!isPaused) {
        // PHASE 3: Writing animation
        if (phase === 'phase3_writing') {
          if (writingStartRef.current === null) {
            writingStartRef.current = timestamp;
          }
          const elapsed = (timestamp - writingStartRef.current) / 1000;
          const writeDuration = 4.2; // 4.2 seconds for realistic calligraphic flow
          const rawProgress = Math.min(1, elapsed / writeDuration);

          // Natural calligraphic easing (gentle start, fluid middle, delicate flourish finish)
          const easedProgress = rawProgress < 0.5
            ? 2 * rawProgress * rawProgress
            : 1 - Math.pow(-2 * rawProgress + 2, 2) / 2;

          const currentLen = pathLength * easedProgress;
          const newOffset = pathLength * (1 - easedProgress);
          setWriteOffset(newOffset);

          // Update glowing pen position along the path
          if (guidePathRef.current) {
            try {
              const pt = guidePathRef.current.getPointAtLength(currentLen);
              setPenPoint({ x: pt.x, y: pt.y });
              setPenVisible(true);

              // Inform parent/canvas of pen coordinate for champagne sparkle emission
              if (containerRef.current && onWritingProgress) {
                const rect = containerRef.current.getBoundingClientRect();
                // Map SVG viewBox (-450 to +450, -180 to +180) to screen pixel coordinates
                const scaleX = rect.width / 900;
                const scaleY = rect.height / 360;
                const screenX = rect.left + (pt.x + 450) * scaleX;
                const screenY = rect.top + (pt.y + 180) * scaleY;
                onWritingProgress({ x: screenX, y: screenY, active: true });
              }
            } catch {
              // point calculation fallback
            }
          }

          if (rawProgress >= 1) {
            setPenVisible(false);
            if (onWritingProgress) onWritingProgress(null);
            // Trigger phase 4 (gleam & transition)
            if (onPhaseChange) onPhaseChange('phase4_gleam');
          }
        }

        // PHASE 4: Gleam flourish transition
        if (phase === 'phase4_gleam') {
          setGleamActive(true);
          // After brief radiant gleam, transition into continuous orbital flow
          const gleamTimer = setTimeout(() => {
            setGleamActive(false);
            if (onPhaseChange) onPhaseChange('phase5_orbit');
          }, 900);
          return () => clearTimeout(gleamTimer);
        }

        // PHASE 5: Continuous circular path motion & luminous trails
        if (phase === 'phase5_orbit') {
          orbitTimeRef.current += dt;
          const pos = getTrajectoryPoint(orbitTimeRef.current);
          setOrbitPos(pos);

          // Record trail points every 80ms
          if (timestamp - lastTrailRecordRef.current > 75) {
            lastTrailRecordRef.current = timestamp;
            const newTrail: OrbitPoint = {
              x: pos.x,
              y: pos.y,
              tilt: pos.tilt,
              timestamp
            };
            const updatedTrails = [newTrail, ...trailHistoryRef.current.slice(0, 5)];
            trailHistoryRef.current = updatedTrails;
            setTrails(updatedTrails);
          }
        }
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [phase, isPaused, pathLength, getTrajectoryPoint, onPhaseChange, onWritingProgress]);

  // Handle phase reset if replayed
  useEffect(() => {
    if (phase === 'phase1_fadein' || phase === 'phase2_halo') {
      writingStartRef.current = null;
      setWriteOffset(pathLength);
      setPenVisible(false);
      setGleamActive(false);
      setOrbitPos({ x: 0, y: 0, tilt: 0 });
      setTrails([]);
      trailHistoryRef.current = [];
    }
  }, [phase, pathLength]);

  // Trail ghost opacities and blurs
  const ghostStyles = [
    { opacity: 0.40, blur: 2, scale: 0.99 },
    { opacity: 0.28, blur: 4, scale: 0.98 },
    { opacity: 0.18, blur: 6, scale: 0.97 },
    { opacity: 0.11, blur: 8, scale: 0.96 },
    { opacity: 0.06, blur: 11, scale: 0.95 },
    { opacity: 0.03, blur: 14, scale: 0.94 }
  ];

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-4xl h-72 sm:h-80 md:h-96 flex items-center justify-center select-none"
    >
      {/* 1. FAINT CRIMSON / THEME HALO (Gently breathing background aura) */}
      <div
        className="absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full pointer-events-none transition-all duration-1000 ease-out"
        style={{
          background: `radial-gradient(circle, ${theme.haloColor} 0%, ${theme.secondaryHalo} 45%, transparent 72%)`,
          opacity: phase === 'phase1_fadein' ? 0 : 0.42,
          transform: `scale(${phase === 'phase1_fadein' ? 0.7 : 1 + 0.06 * Math.sin(orbitPos.x * 0.03)})`,
          filter: 'blur(35px)',
          transition: 'opacity 1.8s ease-in-out'
        }}
        aria-hidden="true"
      />

      {/* 2. SUBTLE CELESTIAL ORBITAL PATH GUIDE (Faint luminous trajectory ring) */}
      {phase === 'phase5_orbit' && (
        <svg
          viewBox="-450 -180 900 360"
          className="absolute inset-0 w-full h-full pointer-events-none opacity-25"
          aria-hidden="true"
        >
          <ellipse
            cx="0"
            cy="0"
            rx="85"
            ry="48"
            fill="none"
            stroke={theme.haloColor}
            strokeWidth="1.2"
            strokeDasharray="4 8"
            filter="blur(0.5px)"
          />
        </svg>
      )}

      {/* 3. LUMINOUS TRAILS (Ghost instances traveling along previous trajectory points) */}
      {phase === 'phase5_orbit' && trails.map((trail, index) => {
        const style = ghostStyles[index] || { opacity: 0.02, blur: 12, scale: 0.95 };
        return (
          <div
            key={`trail-${index}`}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={{
              transform: `translate3d(${trail.x}px, ${trail.y}px, 0) rotate(${trail.tilt}deg) scale(${style.scale})`,
              opacity: style.opacity,
              filter: `blur(${style.blur}px)`,
              transition: 'transform 0.08s linear'
            }}
            aria-hidden="true"
          >
            <svg
              viewBox="-450 -180 900 360"
              className="w-full h-full overflow-visible"
            >
              <path
                d={MASTER_CURSIVE_PATH}
                fill="none"
                stroke={theme.haloColor}
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        );
      })}

      {/* 4. MAIN HANDWRITTEN "LOVE YOU" SVG CONTAINER */}
      <div
        className="relative w-full h-full flex items-center justify-center"
        style={{
          transform: phase === 'phase5_orbit' 
            ? `translate3d(${orbitPos.x}px, ${orbitPos.y}px, 0) rotate(${orbitPos.tilt}deg)`
            : 'translate3d(0, 0, 0)',
          transition: phase === 'phase5_orbit' ? 'none' : 'transform 1.2s cubic-bezier(0.2, 0.8, 0.3, 1)'
        }}
      >
        <svg
          viewBox="-450 -180 900 360"
          className="w-full h-full overflow-visible"
          style={{
            filter: gleamActive ? 'brightness(1.4) drop-shadow(0 0 15px #FFE0B2)' : 'none',
            transition: 'filter 0.4s ease-out'
          }}
        >
          <defs>
            {/* Rose-Gold & Champagne Linear Gradient with fluid theme transition */}
            <linearGradient id="roseGoldScriptGrad" x1="0%" y1="0%" x2="100%" y2="80%">
              <stop offset="0%" stopColor={theme.penHighlight} style={{ transition: 'stop-color 1.2s ease-in-out' }} />
              <stop offset="25%" stopColor={theme.penColor} style={{ transition: 'stop-color 1.2s ease-in-out' }} />
              <stop offset="55%" stopColor={theme.penColor} style={{ transition: 'stop-color 1.2s ease-in-out' }} />
              <stop offset="78%" stopColor={theme.penColor} style={{ transition: 'stop-color 1.2s ease-in-out' }} />
              <stop offset="100%" stopColor={theme.penHighlight} style={{ transition: 'stop-color 1.2s ease-in-out' }} />
            </linearGradient>

            {/* Glowing filter for deep atmosphere */}
            <filter id="crimsonHaloFilter" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="blur1" />
              <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur2" />
              <feMerge>
                <feMergeNode in="blur1" />
                <feMergeNode in="blur2" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Core luminous glow filter */}
            <filter id="coreGlowFilter" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" result="glow" />
              <feMerge>
                <feMergeNode in="glow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Hidden reference path for length & point calculations */}
          <path
            ref={guidePathRef}
            d={MASTER_CURSIVE_PATH}
            fill="none"
            stroke="transparent"
          />

          {/* Layer A: Broad Outer Crimson Ambient Aura */}
          <path
            d={MASTER_CURSIVE_PATH}
            fill="none"
            stroke={theme.haloColor}
            strokeWidth="14"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={pathLength}
            strokeDashoffset={writeOffset}
            opacity={phase === 'phase1_fadein' ? 0 : 0.38}
            style={{
              filter: 'blur(10px)',
              transition: 'opacity 0.8s ease-in-out, stroke 1.2s ease-in-out'
            }}
          />

          {/* Layer B: Mid Rose-Gold Luminous Halo */}
          <path
            d={MASTER_CURSIVE_PATH}
            fill="none"
            stroke={theme.penColor}
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={pathLength}
            strokeDashoffset={writeOffset}
            opacity={phase === 'phase1_fadein' ? 0 : 0.72}
            style={{
              filter: 'blur(3.5px)',
              transition: 'opacity 0.8s ease-in-out, stroke 1.2s ease-in-out'
            }}
          />

          {/* Layer C: Core Calligraphic Rose-Gold Line */}
          <path
            d={MASTER_CURSIVE_PATH}
            fill="none"
            stroke="url(#roseGoldScriptGrad)"
            strokeWidth="3.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={pathLength}
            strokeDashoffset={writeOffset}
            opacity={phase === 'phase1_fadein' ? 0 : 1}
            style={{
              filter: 'url(#coreGlowFilter)',
              transition: 'opacity 0.8s ease-in-out'
            }}
          />

          {/* Layer D: Champagne Highlight Center Thread */}
          <path
            d={MASTER_CURSIVE_PATH}
            fill="none"
            stroke={theme.penHighlight}
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={pathLength}
            strokeDashoffset={writeOffset}
            opacity={phase === 'phase1_fadein' ? 0 : 0.85}
            style={{
              transition: 'stroke 1.2s ease-in-out'
            }}
          />

          {/* 5. DYNAMIC GLOWING PEN NIB & SPARKLE STAR (Visible during Phase 3) */}
          {penVisible && penPoint && (
            <g transform={`translate(${penPoint.x}, ${penPoint.y})`}>
              {/* Soft warm pen halo */}
              <circle r="12" fill={theme.haloColor} opacity="0.4" filter="blur(4px)" />
              <circle r="6" fill={theme.penColor} opacity="0.8" filter="blur(1.5px)" />
              {/* Intense champagne pen core */}
              <circle r="2.8" fill={theme.penHighlight} />

              {/* Four-pointed sparkle star at pen tip */}
              <path
                d="M 0 -8 Q 0 0 8 0 Q 0 0 0 8 Q 0 0 -8 0 Q 0 0 0 -8 Z"
                fill={theme.penHighlight}
                opacity="0.95"
                filter="drop-shadow(0 0 4px #FFE0B2)"
              />
            </g>
          )}
        </svg>

        {/* Optional Custom Dedication Caption underneath */}
        {customDedication && (
          <div
            className="absolute -bottom-8 md:-bottom-10 left-0 right-0 text-center font-serif text-sm md:text-base tracking-widest text-[#E6A078]/80 transition-opacity duration-1000"
            style={{
              opacity: phase === 'phase5_orbit' ? 0.9 : 0,
              textShadow: '0 0 10px #430018'
            }}
          >
            {customDedication}
          </div>
        )}
      </div>
    </div>
  );
};
