import React, { useEffect, useRef, useCallback } from 'react';
import { Particle, GlowTheme } from '../types';

interface AtmosphereCanvasProps {
  theme: GlowTheme;
  penTip: { x: number; y: number; active: boolean } | null;
  onCanvasClick?: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  externalBurstTrigger?: { x: number; y: number; id: number } | null;
}

export const AtmosphereCanvas: React.FC<AtmosphereCanvasProps> = ({
  theme,
  penTip,
  onCanvasClick,
  externalBurstTrigger
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const bokehRef = useRef<Particle[]>([]);
  const lastTimeRef = useRef<number>(performance.now());
  const penSparkleTimerRef = useRef<number>(0);

  // Helper to draw a heart shape on canvas context
  const drawHeart = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string, alpha: number, rotation: number) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
    ctx.fillStyle = color;
    ctx.shadowColor = theme.haloColor;
    ctx.shadowBlur = size * 1.5;

    ctx.beginPath();
    const topCurveHeight = size * 0.3;
    ctx.moveTo(0, topCurveHeight);
    // top left curve
    ctx.bezierCurveTo(
      -size / 2, -size / 2,
      -size, topCurveHeight / 3,
      0, size
    );
    // top right curve
    ctx.bezierCurveTo(
      size, topCurveHeight / 3,
      size / 2, -size / 2,
      0, topCurveHeight
    );
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  };

  // Helper to draw a four-pointed star sparkle
  const drawSparkle = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string, alpha: number, rotation: number) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
    ctx.fillStyle = color;
    ctx.shadowColor = theme.penHighlight;
    ctx.shadowBlur = size * 2;

    ctx.beginPath();
    const inner = size * 0.22;
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2;
      ctx.lineTo(Math.cos(angle) * size, Math.sin(angle) * size);
      ctx.lineTo(Math.cos(angle + Math.PI / 4) * inner, Math.sin(angle + Math.PI / 4) * inner);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  };

  // Spawn an interactive burst of glowing hearts & golden sparkles
  const spawnBurst = useCallback((x: number, y: number, count = 16) => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.8 + Math.random() * 2.8;
      const isHeart = Math.random() > 0.4;
      const size = isHeart ? 7 + Math.random() * 9 : 3 + Math.random() * 5;
      const life = 1400 + Math.random() * 1600;

      newParticles.push({
        id: Math.random() * 1000000,
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.9, // Gentle upward lift
        size,
        opacity: 0.95,
        maxLife: life,
        life,
        color: isHeart ? (Math.random() > 0.5 ? theme.penColor : theme.haloColor) : theme.penHighlight,
        type: isHeart ? 'heart' : 'sparkle',
        rotation: (Math.random() - 0.5) * 0.6,
        vRot: (Math.random() - 0.5) * 0.04
      });
    }
    particlesRef.current.push(...newParticles);
  }, [theme]);

  // Handle external burst trigger
  useEffect(() => {
    if (externalBurstTrigger) {
      spawnBurst(externalBurstTrigger.x, externalBurstTrigger.y, 20);
    }
  }, [externalBurstTrigger, spawnBurst]);

  // Handle initial canvas resize and background bokeh generation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = window.innerWidth;
      const height = window.innerHeight;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      // Generate ambient background bokeh lights
      const bokehCount = Math.floor(Math.max(12, (width * height) / 80000));
      bokehRef.current = Array.from({ length: bokehCount }, (_, i) => ({
        id: i,
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.12,
        vy: -0.08 - Math.random() * 0.15,
        size: 35 + Math.random() * 85,
        opacity: 0.05 + Math.random() * 0.12,
        maxLife: 10000,
        life: 10000,
        color: i % 2 === 0 ? theme.haloColor : theme.penColor,
        type: 'bokeh',
        rotation: 0,
        vRot: 0
      }));

      // Generate initial gentle floating stardust
      const starCount = Math.floor(Math.max(25, (width * height) / 35000));
      particlesRef.current = Array.from({ length: starCount }, (_, i) => ({
        id: i,
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: -0.15 - Math.random() * 0.35,
        size: Math.random() > 0.7 ? 4 + Math.random() * 4 : 1.5 + Math.random() * 2.5,
        opacity: 0.2 + Math.random() * 0.6,
        maxLife: 6000 + Math.random() * 4000,
        life: 2000 + Math.random() * 6000,
        color: Math.random() > 0.4 ? theme.penColor : theme.penHighlight,
        type: Math.random() > 0.65 ? 'heart' : 'sparkle',
        rotation: (Math.random() - 0.5) * 0.4,
        vRot: (Math.random() - 0.5) * 0.015
      }));
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [theme]);

  // Main animation render loop
  useEffect(() => {
    let animId: number;

    const render = (time: number) => {
      const dt = Math.min(time - lastTimeRef.current, 50);
      lastTimeRef.current = time;

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = canvas.width / dpr;
      const height = canvas.height / dpr;

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      // 1. Draw drifting bokeh lights
      bokehRef.current.forEach(b => {
        b.x += b.vx * (dt / 16);
        b.y += b.vy * (dt / 16);

        // Wrap around screen edges
        if (b.y < -b.size) b.y = height + b.size;
        if (b.x < -b.size) b.x = width + b.size;
        if (b.x > width + b.size) b.x = -b.size;

        const grad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.size);
        grad.addColorStop(0, b.color);
        grad.addColorStop(0.7, theme.secondaryHalo || '#430018');
        grad.addColorStop(1, 'transparent');

        ctx.save();
        ctx.globalAlpha = b.opacity;
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // 2. Pen sparkle emission during handwriting
      if (penTip && penTip.active) {
        penSparkleTimerRef.current += dt;
        if (penSparkleTimerRef.current > 38) { // Emit every 38ms
          penSparkleTimerRef.current = 0;
          const isHeart = Math.random() > 0.65;
          particlesRef.current.push({
            id: Math.random() * 1000000,
            x: penTip.x + (Math.random() - 0.5) * 8,
            y: penTip.y + (Math.random() - 0.5) * 8,
            vx: (Math.random() - 0.5) * 0.8,
            vy: -0.6 - Math.random() * 1.2,
            size: isHeart ? 5 + Math.random() * 5 : 2.5 + Math.random() * 3.5,
            opacity: 0.95,
            maxLife: 900 + Math.random() * 800,
            life: 900 + Math.random() * 800,
            color: isHeart ? theme.penColor : theme.penHighlight,
            type: isHeart ? 'heart' : 'sparkle',
            rotation: (Math.random() - 0.5) * 0.5,
            vRot: (Math.random() - 0.5) * 0.03
          });
        }
      }

      // 3. Update & render floating particles, sparks & hearts
      particlesRef.current = particlesRef.current.filter(p => {
        p.life -= dt;
        if (p.life <= 0) {
          // If ambient particle, respawn at bottom to keep atmosphere populated
          if (p.maxLife > 5000) {
            p.life = p.maxLife;
            p.y = height + 10;
            p.x = Math.random() * width;
            p.opacity = 0.2 + Math.random() * 0.5;
            return true;
          }
          return false;
        }

        p.x += p.vx * (dt / 16);
        p.y += p.vy * (dt / 16);
        p.rotation += p.vRot * (dt / 16);

        // Calculate fading opacity
        const progress = p.life / p.maxLife;
        const currentAlpha = p.opacity * Math.sin(progress * Math.PI);

        if (p.type === 'heart') {
          drawHeart(ctx, p.x, p.y, p.size, p.color, currentAlpha, p.rotation);
        } else {
          drawSparkle(ctx, p.x, p.y, p.size, p.color, currentAlpha, p.rotation);
        }

        return true;
      });

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [theme, penTip]);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    spawnBurst(x, y, 18);
    if (onCanvasClick) onCanvasClick(e);
  };

  return (
    <canvas
      ref={canvasRef}
      onClick={handleClick}
      className="absolute inset-0 z-10 pointer-events-auto cursor-pointer"
      aria-hidden="true"
    />
  );
};
