import React, { useState, useEffect } from 'react';

/**
 * UnsoldAnimation - A somber overlay that animates when an auction
 * closes with no bids. Shows a fading gavel, "UNSOLD" stamp,
 * and falling dust particles instead of confetti.
 * 
 * Props:
 * - show (bool): Whether to trigger the animation
 * - onComplete (fn): Called when animation finishes (to dismiss)
 * - itemName (string): Optional item name to display
 */
const UnsoldAnimation = ({ show, onComplete, itemName }) => {
  const [phase, setPhase] = useState('hidden');
  const [dustParticles, setDustParticles] = useState([]);

  useEffect(() => {
    if (!show) {
      setPhase('hidden');
      return;
    }

    setPhase('entering');

    // Generate dust / ash particles (muted, somber colors)
    const particles = [];
    for (let i = 0; i < 40; i++) {
      particles.push({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 2,
        duration: Math.random() * 3 + 3,
        size: Math.random() * 5 + 2,
        rotation: Math.random() * 360,
        color: [
          '#8a8a8a', '#6e6e6e', '#555555', '#9e9e9e',
          '#a09080', '#7a6b5a', '#bbb', '#c8c0b0'
        ][Math.floor(Math.random() * 8)],
        opacity: Math.random() * 0.5 + 0.2,
        swingAmplitude: Math.random() * 20 + 5,
        swingSpeed: Math.random() * 3 + 2,
      });
    }
    setDustParticles(particles);

    const revealTimer = setTimeout(() => setPhase('revealed'), 500);
    const fadeTimer = setTimeout(() => setPhase('fading'), 4200);
    const hideTimer = setTimeout(() => {
      setPhase('hidden');
      onComplete?.();
    }, 5000);

    return () => {
      clearTimeout(revealTimer);
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, [show, onComplete]);

  if (phase === 'hidden') return null;

  return (
    <div
      className={`unsold-overlay unsold-overlay--${phase}`}
      onClick={() => { setPhase('hidden'); onComplete?.(); }}
      role="presentation"
    >
      {/* Dust particles */}
      <div className="unsold-dust-container">
        {dustParticles.map(p => (
          <div
            key={p.id}
            className="unsold-dust-piece"
            style={{
              '--x': `${p.x}vw`,
              '--delay': `${p.delay}s`,
              '--duration': `${p.duration}s`,
              '--rotation': `${p.rotation}deg`,
              '--swing-amp': `${p.swingAmplitude}px`,
              '--swing-speed': `${p.swingSpeed}s`,
              '--opacity': p.opacity,
              width: `${p.size}px`,
              height: `${p.size}px`,
              borderRadius: '50%',
              backgroundColor: p.color,
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="unsold-stamp-container">
        {/* Fading gavel */}
        <div className="unsold-gavel">🔨</div>

        {/* UNSOLD stamp */}
        <div className="unsold-stamp">
          <div className="unsold-stamp-inner">
            <span className="unsold-stamp-text">UNSOLD</span>
          </div>
        </div>

        {/* Message */}
        {phase !== 'entering' && (
          <div className="unsold-details">
            <div className="unsold-message">No bids were placed</div>
            {itemName && (
              <div className="unsold-item-name">{itemName}</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UnsoldAnimation;
