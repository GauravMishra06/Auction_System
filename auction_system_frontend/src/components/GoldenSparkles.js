import React, { useEffect, useRef, useCallback } from 'react';

/**
 * GoldenSparkles - A canvas-based particle system that renders
 * floating golden sparkles across the page background.
 * 
 * Also exposes window.triggerSparkBurst() for on-demand burst effects
 * (e.g. when a bid is placed).
 */

const PARTICLE_COUNT = 45;

const GOLD_PALETTE = [
  { r: 181, g: 148, b: 91 },   // Champagne Gold (primary)
  { r: 197, g: 168, b: 128 },  // Light Gold
  { r: 218, g: 190, b: 140 },  // Pale Gold
  { r: 143, g: 109, b: 59 },   // Deep Bronze
  { r: 255, g: 223, b: 150 },  // Bright Gold
  { r: 230, g: 200, b: 120 },  // Warm Gold
];

const GoldenSparkles = () => {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const animFrameRef = useRef(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });

  const createParticle = useCallback((x, y, isBurst = false) => {
    const color = GOLD_PALETTE[Math.floor(Math.random() * GOLD_PALETTE.length)];
    const size = isBurst
      ? Math.random() * 5 + 2
      : Math.random() * 3.5 + 0.8;

    return {
      x: x ?? Math.random() * (canvasRef.current?.width || window.innerWidth),
      y: y ?? Math.random() * (canvasRef.current?.height || window.innerHeight),
      size,
      baseSize: size,
      color,
      opacity: isBurst ? 0.9 : Math.random() * 0.4 + 0.15,
      maxOpacity: isBurst ? 1 : Math.random() * 0.5 + 0.2,
      speedX: isBurst
        ? (Math.random() - 0.5) * 6
        : (Math.random() - 0.5) * 0.3,
      speedY: isBurst
        ? (Math.random() - 0.5) * 6 - 2
        : -Math.random() * 0.4 - 0.1,
      twinkleSpeed: Math.random() * 0.03 + 0.01,
      twinklePhase: Math.random() * Math.PI * 2,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 2,
      life: isBurst ? 1 : Infinity,
      decay: isBurst ? 0.015 : 0,
      isBurst,
      drift: Math.random() * 0.5 + 0.2,
      driftPhase: Math.random() * Math.PI * 2,
    };
  }, []);

  const triggerBurst = useCallback((x, y, count = 35) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const cx = x ?? canvas.width / 2;
    const cy = y ?? canvas.height / 2;
    for (let i = 0; i < count; i++) {
      particlesRef.current.push(createParticle(cx, cy, true));
    }
  }, [createParticle]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Initialize ambient particles
    particlesRef.current = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particlesRef.current.push(createParticle());
    }

    // Expose burst trigger globally
    window.triggerSparkBurst = triggerBurst;

    const handleMouseMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMouseMove);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current = particlesRef.current.filter(p => {
        if (p.isBurst && p.life <= 0) return false;
        return true;
      });

      // Keep ambient particle count stable
      while (particlesRef.current.filter(p => !p.isBurst).length < PARTICLE_COUNT) {
        const p = createParticle();
        p.y = canvas.height + 10;
        particlesRef.current.push(p);
      }

      particlesRef.current.forEach(p => {
        // Update position
        p.driftPhase += 0.008;
        const driftX = Math.sin(p.driftPhase) * p.drift;
        p.x += p.speedX + driftX;
        p.y += p.speedY;

        // Twinkle
        p.twinklePhase += p.twinkleSpeed;
        const twinkle = (Math.sin(p.twinklePhase) + 1) / 2;

        if (p.isBurst) {
          // Burst particles decay
          p.life -= p.decay;
          p.opacity = p.maxOpacity * p.life;
          p.speedY += 0.05; // gravity
          p.speedX *= 0.98;
          p.size = p.baseSize * p.life;
        } else {
          // Ambient: twinkle opacity
          p.opacity = p.maxOpacity * (0.3 + twinkle * 0.7);

          // Wrap around edges
          if (p.y < -20) {
            p.y = canvas.height + 10;
            p.x = Math.random() * canvas.width;
          }
          if (p.x < -20) p.x = canvas.width + 10;
          if (p.x > canvas.width + 20) p.x = -10;
        }

        // Mouse proximity glow (ambient only)
        let extraGlow = 0;
        if (!p.isBurst) {
          const dx = p.x - mouseRef.current.x;
          const dy = p.y - mouseRef.current.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            extraGlow = (1 - dist / 150) * 0.5;
          }
        }

        const finalOpacity = Math.min(p.opacity + extraGlow, 1);
        if (finalOpacity <= 0 || p.size <= 0) return;

        ctx.save();
        ctx.translate(p.x, p.y);
        p.rotation += p.rotationSpeed;
        ctx.rotate((p.rotation * Math.PI) / 180);

        // Draw sparkle (4-pointed star)
        const { r, g, b } = p.color;
        const glowSize = p.size * (1.5 + twinkle * 0.5);

        // Outer glow
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, glowSize * 2);
        gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${finalOpacity * 0.4})`);
        gradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${finalOpacity * 0.1})`);
        gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, glowSize * 2, 0, Math.PI * 2);
        ctx.fill();

        // Star shape
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${finalOpacity})`;
        ctx.beginPath();
        const arms = 4;
        const outerR = p.size;
        const innerR = p.size * 0.35;
        for (let i = 0; i < arms * 2; i++) {
          const angle = (i * Math.PI) / arms - Math.PI / 2;
          const radius = i % 2 === 0 ? outerR : innerR;
          const sx = Math.cos(angle) * radius;
          const sy = Math.sin(angle) * radius;
          if (i === 0) ctx.moveTo(sx, sy);
          else ctx.lineTo(sx, sy);
        }
        ctx.closePath();
        ctx.fill();

        // Bright center dot
        ctx.fillStyle = `rgba(255, 255, 240, ${finalOpacity * 0.8})`;
        ctx.beginPath();
        ctx.arc(0, 0, p.size * 0.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      });

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      delete window.triggerSparkBurst;
    };
  }, [createParticle, triggerBurst]);

  return (
    <canvas
      ref={canvasRef}
      id="golden-sparkles-canvas"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
};

export default GoldenSparkles;
