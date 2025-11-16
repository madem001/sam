import React, { useRef, MouseEvent } from 'react';

interface ParallaxAvatarProps {
  imageUrl: string;
}

const ParallaxAvatar: React.FC<ParallaxAvatarProps> = ({ imageUrl }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const { clientX, clientY, currentTarget } = e;
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    const x = (clientX - left) / width; // 0 to 1
    const y = (clientY - top) / height; // 0 to 1

    const rotateX = (y - 0.5) * -20; // Max rotation 10deg
    const rotateY = (x - 0.5) * 20;  // Max rotation 10deg

    containerRef.current.style.setProperty('--rx', `${rotateY.toFixed(2)}deg`);
    containerRef.current.style.setProperty('--ry', `${rotateX.toFixed(2)}deg`);
    containerRef.current.style.setProperty('--shine-opacity', '0.6');
    containerRef.current.style.setProperty('--shine-x', `${(x * 100).toFixed(2)}%`);
    containerRef.current.style.setProperty('--shine-y', `${(y * 100).toFixed(2)}%`);
  };

  const handleMouseLeave = () => {
    if (!containerRef.current) return;
    containerRef.current.style.setProperty('--rx', '0deg');
    containerRef.current.style.setProperty('--ry', '0deg');
    containerRef.current.style.setProperty('--shine-opacity', '0');
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="w-full h-full tilt-card"
    >
      <div className="tilt-card-inner shadow-2xl rounded-full">
        <div 
          className="absolute inset-0 rounded-full bg-gradient-to-br from-sky-100 to-indigo-200 tilt-card-bg"
        ></div>
        <img
          src={imageUrl}
          alt="User Avatar"
          className="absolute inset-0 w-full h-full object-cover rounded-full tilt-card-content p-2"
          style={{ transform: 'translateZ(30px) scale(0.95)' }}
        />
        <div 
          className="tilt-card-shine rounded-full"
          style={{ borderRadius: '50%'}}
        ></div>
      </div>
    </div>
  );
};

export default ParallaxAvatar;
