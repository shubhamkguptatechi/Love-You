export type AnimationPhase = 
  | 'phase1_fadein'     // Near-black fading into deep burgundy
  | 'phase2_halo'       // Faint crimson halo blooms at center
  | 'phase3_writing'    // Rose-gold pen writes 'Love You' stroke by stroke
  | 'phase4_gleam'      // Gleam flash & transition into motion
  | 'phase5_orbit';     // Continuous circular orbital motion

export type GlowThemeId = 'rosegold' | 'crimson' | 'champagne' | 'amethyst';

export interface GlowTheme {
  id: GlowThemeId;
  name: string;
  penColor: string;
  penHighlight: string;
  haloColor: string;
  secondaryHalo: string;
  particleColor: string;
  sparkleColor: string;
}

export type TrajectoryMode = 'circle' | 'lemniscate' | 'spiral';

export interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  maxLife: number;
  life: number;
  color: string;
  type: 'heart' | 'sparkle' | 'bokeh' | 'trail';
  rotation: number;
  vRot: number;
  scale?: number;
}

export interface OrbitPoint {
  x: number;
  y: number;
  tilt: number;
  timestamp: number;
}
