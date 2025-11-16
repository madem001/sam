import React from 'react';

const Card: React.FC<{
  number: number;
  title: string;
  icon: string;
  color: string;
  rotation: string;
  delay: string;
}> = ({ number, title, icon, color, rotation, delay }) => {
  return (
    <div
      className="absolute w-36 h-56 bg-white dark:bg-slate-800 rounded-lg shadow-2xl border-4 p-2 animate-card-fall"
      style={{
        borderColor: color,
        // @ts-ignore
        '--final-rotation': rotation,
        animationDelay: delay,
        opacity: 0, // Start hidden
      }}
    >
      <div className="relative w-full h-full border-2 rounded-md" style={{ borderColor: color }}>
        <span className="absolute top-1 left-2 font-bold text-lg" style={{ color }}>
          {number}
        </span>
        <div className="flex flex-col items-center justify-center h-full">
          {/* FIX: Changed 'className' to 'class' for web component compatibility. */}
          <ion-icon name={icon} class="text-6xl" style={{ color }}></ion-icon>
        </div>
        <span className="absolute bottom-1 right-2 font-semibold text-sm" style={{ color }}>
          {title}
        </span>
      </div>
    </div>
  );
};

const LoadingScreen: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
      <div className="relative w-64 h-64 flex items-center justify-center mb-12">
        <Card
          number={3}
          title="La Dama"
          icon="woman-outline"
          color="#d946ef" // fuchsia-500
          rotation="-10deg"
          delay="0.2s"
        />
        <Card
          number={27}
          title="El Corazón"
          icon="heart-outline"
          color="#be185d" // pink-700
          rotation="5deg"
          delay="0.4s"
        />
         <Card
          number={1}
          title="La Calavera"
          icon="skull-outline"
          color="#f59e0b" // amber-500
          rotation="-2deg"
          delay="0.6s"
        />
      </div>
      <h1 className="text-4xl font-extrabold text-slate-700 dark:text-slate-200 animate-text-fade-in" style={{ animationDelay: '1.2s', opacity: 0 }}>
        EduBattle Arena
      </h1>
    </div>
  );
};

export default LoadingScreen;