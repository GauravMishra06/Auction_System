import React, { useState, useEffect } from 'react';

/**
 * WinnerCelebration - A jubilant overlay shown to the winning bidder
 * when they view their won auction results. Shows a trophy, congratulations
 * message, and golden confetti burst.
 * 
 * Props:
 * - show (bool): Whether to trigger the animation
 * - onComplete (fn): Called when animation finishes (to dismiss)
 * - itemName (string): Name of the won item
 * - finalPrice (number): Winning bid amount
 * - username (string): The winner's username
 */
const WinnerCelebration = ({ show, onComplete, itemName, finalPrice, username }) => {
  const [phase, setPhase] = useState('hidden');
  const [confetti, setConfetti] = useState([]);
  const [sparkles, setSparkles] = useState([]);

  useEffect(() => {
    if (!show) {
      setPhase('hidden');
      return;
    }

    setPhase('entering');

    // Generate luxury golden confetti
    const pieces = [];
    for (let i = 0; i < 80; i++) {
      pieces.push({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 2,
        duration: Math.random() * 2.5 + 2,
        size: Math.random() * 10 + 4,
        rotation: Math.random() * 360,
        color: [
          '#b5945b', '#c5a880', '#dabe8c', '#8f6d3b',
          '#ffdf96', '#e6c878', '#f0d090', '#d4a84b',
          '#ffd700', '#f5c542', '#ffffff', '#faf9f6'
        ][Math.floor(Math.random() * 12)],
        shape: ['rect', 'circle', 'star'][Math.floor(Math.random() * 3)],
        swingAmplitude: Math.random() * 40 + 15,
        swingSpeed: Math.random() * 2 + 1,
      });
    }
    setConfetti(pieces);

    // Generate side sparkle bursts
    const sparks = [];
    for (let i = 0; i < 20; i++) {
      sparks.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 1.5 + 0.3,
        size: Math.random() * 16 + 6,
        duration: Math.random() * 1.5 + 0.8,
      });
    }
    setSparkles(sparks);

    const revealTimer = setTimeout(() => setPhase('celebrating'), 400);
    const fadeTimer = setTimeout(() => setPhase('fading'), 5500);
    const hideTimer = setTimeout(() => {
      setPhase('hidden');
      onComplete?.();
    }, 6300);

    // Trigger sparkle bursts if available
    if (window.triggerSparkBurst) {
      setTimeout(() => {
        window.triggerSparkBurst?.(window.innerWidth * 0.5, window.innerHeight * 0.3, 60);
      }, 500);
      setTimeout(() => {
        window.triggerSparkBurst?.(window.innerWidth * 0.2, window.innerHeight * 0.5, 30);
        window.triggerSparkBurst?.(window.innerWidth * 0.8, window.innerHeight * 0.5, 30);
      }, 800);
    }

    return () => {
      clearTimeout(revealTimer);
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, [show, onComplete]);

  if (phase === 'hidden') return null;

  return (
    <div
      className={`winner-overlay winner-overlay--${phase}`}
      onClick={() => { setPhase('hidden'); onComplete?.(); }}
      role="presentation"
    >
      {/* Confetti rain */}
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
              width: `${piece.size}px`,
              height: piece.shape === 'rect' ? `${piece.size * 0.6}px` : `${piece.size}px`,
              borderRadius: piece.shape === 'circle' ? '50%' : piece.shape === 'star' ? '2px' : '1px',
              backgroundColor: piece.color,
              transform: piece.shape === 'star' ? 'rotate(45deg)' : undefined,
            }}
          />
        ))}
      </div>

      {/* Sparkle bursts */}
      {sparkles.map(spark => (
        <div
          key={spark.id}
          className="winner-sparkle"
          style={{
            left: `${spark.x}%`,
            top: `${spark.y}%`,
            '--delay': `${spark.delay}s`,
            '--size': `${spark.size}px`,
            '--duration': `${spark.duration}s`,
          }}
        />
      ))}

      {/* Main content */}
      <div className="winner-content">
        {/* Trophy */}
        <div className="winner-trophy">🏆</div>

        {/* Congratulations text */}
        <div className="winner-title">Congratulations!</div>
        
        {username && (
          <div className="winner-username">{username}</div>
        )}

        <div className="winner-divider">
          <span>◆</span>
        </div>

        <div className="winner-subtitle">You Won This Auction</div>

        {itemName && (
          <div className="winner-item-name">"{itemName}"</div>
        )}

        {finalPrice != null && (
          <div className="winner-final-price">
            <span className="winner-price-label">Winning Bid</span>
            <span className="winner-price-value">${finalPrice.toFixed(2)}</span>
          </div>
        )}

        <div className="winner-cta">Click anywhere to continue</div>
      </div>
    </div>
  );
};

export default WinnerCelebration;
