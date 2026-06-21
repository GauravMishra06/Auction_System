import React, { useState, useEffect } from 'react';

/**
 * SoldAnimation - A dramatic "SOLD" stamp overlay that animates in
 * when an auction is completed. Shows a gavel icon, the sold stamp,
 * and falling golden confetti.
 * 
 * Props:
 * - show (bool): Whether to trigger the animation
 * - onComplete (fn): Called when animation finishes (to dismiss)
 * - winnerName (string): Optional winner username to display
 * - finalPrice (number): Optional final selling price
 */
const SoldAnimation = ({ show, onComplete, winnerName, finalPrice }) => {
  const [phase, setPhase] = useState('hidden'); // hidden | stamping | celebrating | fading
  const [confetti, setConfetti] = useState([]);

  useEffect(() => {
    if (!show) {
      setPhase('hidden');
      return;
    }

    setPhase('stamping');

    // Generate confetti pieces
    const pieces = [];
    for (let i = 0; i < 60; i++) {
      pieces.push({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 1.5,
        duration: Math.random() * 2 + 2,
        size: Math.random() * 8 + 4,
        rotation: Math.random() * 360,
        color: [
          '#b5945b', '#c5a880', '#dabe8c', '#8f6d3b',
          '#ffdf96', '#e6c878', '#f0d090', '#d4a84b',
          '#ffffff', '#faf9f6'
        ][Math.floor(Math.random() * 10)],
        shape: Math.random() > 0.5 ? 'rect' : 'circle',
        swingAmplitude: Math.random() * 30 + 10,
        swingSpeed: Math.random() * 2 + 1,
      });
    }
    setConfetti(pieces);

    const celebrateTimer = setTimeout(() => setPhase('celebrating'), 600);
    const fadeTimer = setTimeout(() => setPhase('fading'), 4000);
    const hideTimer = setTimeout(() => {
      setPhase('hidden');
      onComplete?.();
    }, 4800);

    return () => {
      clearTimeout(celebrateTimer);
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, [show, onComplete]);

  if (phase === 'hidden') return null;

  return (
    <div
      className={`sold-overlay sold-overlay--${phase}`}
      onClick={() => { setPhase('hidden'); onComplete?.(); }}
      role="presentation"
    >
      {/* Confetti */}
      <div className="sold-confetti-container">
        {confetti.map(piece => (
          <div
            key={piece.id}
            className="sold-confetti-piece"
            style={{
              '--x': `${piece.x}vw`,
              '--delay': `${piece.delay}s`,
              '--duration': `${piece.duration}s`,
              '--rotation': `${piece.rotation}deg`,
              '--swing-amp': `${piece.swingAmplitude}px`,
              '--swing-speed': `${piece.swingSpeed}s`,
              width: piece.shape === 'rect' ? `${piece.size}px` : `${piece.size}px`,
              height: piece.shape === 'rect' ? `${piece.size * 0.6}px` : `${piece.size}px`,
              borderRadius: piece.shape === 'circle' ? '50%' : '1px',
              backgroundColor: piece.color,
            }}
          />
        ))}
      </div>

      {/* Stamp */}
      <div className="sold-stamp-container">
        {/* Gavel Icon */}
        <div className="sold-gavel">🔨</div>

        {/* Stamp */}
        <div className="sold-stamp">
          <div className="sold-stamp-inner">
            <span className="sold-stamp-text">SOLD</span>
          </div>
        </div>

        {/* Details */}
        {(winnerName || finalPrice) && phase !== 'stamping' && (
          <div className="sold-details">
            {finalPrice && (
              <div className="sold-price">${finalPrice.toFixed(2)}</div>
            )}
            {winnerName && (
              <div className="sold-winner">Won by {winnerName}</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SoldAnimation;
