import React, { useState, useRef, useEffect } from 'react';
import { Professor } from '../types';

interface ProfessorCardProps {
  professor: Professor;
  onClick?: () => void;
  isActive?: boolean;
  points?: number;
  requiredPoints?: number;
}

const ProfessorCard: React.FC<ProfessorCardProps> = ({ professor, onClick, isActive = false, points = 0, requiredPoints = 100 }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const isLocked = professor.locked;
  const [isUnlocking, setIsUnlocking] = useState(false);
  const prevLockedState = useRef(isLocked);

  // Effect for handling the unlock animation
  useEffect(() => {
    if (prevLockedState.current === true && isLocked === false) {
      setIsUnlocking(true);
      const timer = setTimeout(() => setIsUnlocking(false), 1200); // Duration of animation
      return () => clearTimeout(timer);
    }
    prevLockedState.current = isLocked;
  }, [isLocked]);

  const isInteractive = isActive && !isLocked && !isUnlocking;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || !isInteractive) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const { width, height } = rect;

    const rotateX = (y / height - 0.5) * -30; // Max rotation 15deg
    const rotateY = (x / width - 0.5) * 30;  // Max rotation 15deg

    const shineX = (x / width) * 100;
    const shineY = (y / height) * 100;

    cardRef.current.style.setProperty('--rx', `${rotateY.toFixed(2)}deg`);
    cardRef.current.style.setProperty('--ry', `${rotateX.toFixed(2)}deg`);
    cardRef.current.style.setProperty('--shine-x', `${shineX.toFixed(2)}%`);
    cardRef.current.style.setProperty('--shine-y', `${shineY.toFixed(2)}%`);
    cardRef.current.style.setProperty('--shine-opacity', '1');
  };

  const handleMouseLeave = () => {
    if (!cardRef.current || !isInteractive) return;
    // Reset styles smoothly
    cardRef.current.style.setProperty('--rx', '0deg');
    cardRef.current.style.setProperty('--ry', '0deg');
    cardRef.current.style.setProperty('--shine-opacity', '0');
  };

  const unlockImageClasses = isUnlocking ? 'animate-unlock-colorize' : '';
  const unlockShineClasses = isUnlocking ? 'animate-unlock-shine' : '';
  const unlockIconClasses = isUnlocking ? 'animate-unlock-icon-pop' : '';

  return (
    <div
      ref={cardRef}
      className={`relative w-full h-full rounded-3xl shadow-lg overflow-hidden transition-transform duration-300 ${isInteractive ? 'tilt-card' : ''}`}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ imageRendering: 'crisp-edges' }}
    >
      <div className={isInteractive ? 'tilt-card-inner' : ''}>
        {/* Background Image & Color Filter */}
        <img
          src={professor.imageUrl}
          alt={professor.name}
          className={`w-full h-full object-cover transition-all duration-500 ${isLocked && !isUnlocking ? 'grayscale' : ''} ${unlockImageClasses} ${isInteractive ? 'tilt-card-bg' : ''}`}
          style={{ imageRendering: '-webkit-optimize-contrast' }}
        />
        
        {/* Gradient Overlay */}
        <div className={`absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent ${isInteractive ? 'tilt-card-bg' : ''}`}></div>

        {/* Points Badge - Top Right */}
        {!isLocked && (
          <div className="absolute top-4 right-4 bg-gradient-to-br from-amber-400 to-orange-500 text-white px-3 py-1.5 rounded-full shadow-lg border-2 border-white/30 backdrop-blur-sm z-10">
            <div className="flex items-center space-x-1">
              <ion-icon name="star" class="text-sm"></ion-icon>
              <span className="font-bold text-sm">{points}</span>
            </div>
          </div>
        )}

        {/* Lock Progress Badge - Top Right */}
        {isLocked && (
          <div className="absolute top-4 right-4 bg-slate-900/80 text-white px-3 py-1.5 rounded-full shadow-lg border-2 border-white/30 backdrop-blur-sm z-10">
            <div className="flex items-center space-x-1">
              <ion-icon name="lock-closed" class="text-xs"></ion-icon>
              <span className="font-bold text-xs">{points}/{requiredPoints}</span>
            </div>
          </div>
        )}

        {/* Text Content */}
        <div className={`absolute bottom-0 left-0 right-0 p-5 ${isInteractive ? 'tilt-card-content' : ''}`}>
            <h3 className="text-white text-xl font-bold leading-tight" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>{professor.name}</h3>
            <p className="text-sky-300 text-sm mt-1">{professor.title}</p>
        </div>

        {/* Shine effect for active card */}
        {isInteractive && <div className="tilt-card-shine"></div>}

        {/* Unlock Shine Animation */}
        <div className={`absolute inset-0 ${unlockShineClasses}`}></div>

        {/* Lock Icon Layer */}
        {isLocked && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <div className={unlockIconClasses}>
                    {/* FIX: Changed 'className' to 'class' for web component compatibility. */}
                    <ion-icon name="lock-closed" class="text-6xl text-white/70"></ion-icon>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default ProfessorCard;