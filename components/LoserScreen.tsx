import React, { useEffect } from 'react';

interface LoserScreenProps {
  onContinue: () => void;
}

const LoserScreen: React.FC<LoserScreenProps> = ({ onContinue }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onContinue();
    }, 3000); // Automatically continue after 3 seconds

    return () => clearTimeout(timer);
  }, [onContinue]);

  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-gradient-to-br from-red-500 to-orange-500 dark:from-red-600 dark:to-orange-600 text-white">
      <div className="animate-pulse mb-6 text-7xl">
        {/* FIX: Changed 'className' to 'class' for web component compatibility. */}
        <ion-icon name="sad-outline"></ion-icon>
      </div>
      <h1 className="text-4xl font-extrabold mb-2">Respuesta Incorrecta</h1>
      <p className="text-xl opacity-90 mb-8">¡Mejor suerte la próxima vez!</p>
      <button onClick={onContinue} className="mt-10 text-white/80 font-semibold underline">
        Volver al Perfil
      </button>
    </div>
  );
};

export default LoserScreen;