import React, { useEffect } from 'react';

interface WinnerScreenProps {
  points: number;
  onContinue: () => void;
}

const WinnerScreen: React.FC<WinnerScreenProps> = ({ points, onContinue }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onContinue();
    }, 3000); // Automatically continue after 3 seconds

    return () => clearTimeout(timer);
  }, [onContinue]);

  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-gradient-to-br from-green-400 to-teal-500 dark:from-green-500 dark:to-teal-600 text-white">
      <div className="animate-bounce mb-6 text-7xl">
        {/* FIX: Changed 'className' to 'class' for web component compatibility. */}
        <ion-icon name="trophy"></ion-icon>
      </div>
      <h1 className="text-4xl font-extrabold mb-2">¡Felicitaciones!</h1>
      <p className="text-xl opacity-90 mb-8">Has completado la trivia.</p>
      <div className="bg-white/30 dark:bg-black/20 rounded-xl px-6 py-3">
        <p className="text-2xl font-bold">+{points} Puntos</p>
      </div>
       <button onClick={onContinue} className="mt-10 text-white/80 font-semibold underline">
        Volver al Perfil
      </button>
    </div>
  );
};

export default WinnerScreen;