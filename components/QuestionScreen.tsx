import React, { useState, useEffect, useCallback } from 'react';

const COLORS = [
  { name: 'ROJO', hex: '#ef4444' },
  { name: 'AZUL', hex: '#3b82f6' },
  { name: 'VERDE', hex: '#22c55e' },
  { name: 'AMARILLO', hex: '#eab308' },
  { name: 'MORADO', hex: '#8b5cf6' },
  { name: 'NARANJA', hex: '#f97316' },
];

const ROUND_DURATION = 10000; // 10 seconds

interface CurrentColor {
  word: string;
  textColor: string;
}

interface QuestionScreenProps {
  onGameComplete: (score: number) => void;
  onBack: () => void;
}

const QuestionScreen: React.FC<QuestionScreenProps> = ({ onGameComplete, onBack }) => {
  const [timeLeft, setTimeLeft] = useState(ROUND_DURATION);
  const [currentColor, setCurrentColor] = useState<CurrentColor | null>(null);
  const [options, setOptions] = useState<{ name: string; hex: string }[]>([]);
  const [selectionStatus, setSelectionStatus] = useState<'correct' | 'incorrect' | null>(null);
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null);
  const [isLocked, setIsLocked] = useState(false);

  const generateChallenge = useCallback(() => {
    setIsLocked(false);
    setSelectionStatus(null);
    setSelectedCardIndex(null);
    
    // 1. Pick a correct color
    const correctColor = COLORS[Math.floor(Math.random() * COLORS.length)];

    // 2. Pick a text color that is different from the correct color
    let textColor: { name: string, hex: string };
    do {
      textColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    } while (textColor.name === correctColor.name);

    setCurrentColor({ word: correctColor.name, textColor: textColor.hex });

    // 3. Create options with the correct color and 3 other random colors
    const otherColors = COLORS.filter(c => c.name !== correctColor.name);
    const shuffledOthers = otherColors.sort(() => 0.5 - Math.random());
    const roundOptions = [correctColor, ...shuffledOthers.slice(0, 3)];

    // 4. Shuffle the final options
    setOptions(roundOptions.sort(() => 0.5 - Math.random()));
    setTimeLeft(ROUND_DURATION);
  }, []);

  // Timer effect
  useEffect(() => {
    if (isLocked) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 100) {
          clearInterval(timer);
          onGameComplete(0); // Time's up, you lose
          return 0;
        }
        return prev - 100;
      });
    }, 100);

    return () => clearInterval(timer);
  }, [isLocked, onGameComplete]);
  
  // Initial challenge generation
  useEffect(() => {
    generateChallenge();
  }, [generateChallenge]);

  const handleColorSelect = (selectedColor: { name: string; hex: string }, index: number) => {
    if (isLocked) return;
    setIsLocked(true);
    setSelectedCardIndex(index);

    if (selectedColor.name === currentColor?.word) {
      // Correct answer: proceed to trivia
      setSelectionStatus('correct');
      setTimeout(() => onGameComplete(1), 1000); // Using 1 to signify success
    } else {
      // Incorrect answer: lose the challenge
      setSelectionStatus('incorrect');
      setTimeout(() => onGameComplete(0), 1000); // Using 0 to signify failure
    }
  };
  
  const getTimerColor = () => {
    const percentage = (timeLeft / ROUND_DURATION) * 100;
    if (percentage < 25) return '#ef4444'; // red-500
    if (percentage < 50) return '#f59e0b'; // amber-500
    return '#22c55e'; // green-500
  };

  if (!currentColor) {
    return (
      <div className="flex justify-center items-center h-full bg-slate-100 dark:bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-400"></div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col h-full p-6 bg-question-screen">
      <button
            onClick={onBack}
            className="absolute top-4 left-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm text-slate-700 dark:text-slate-200 hover:bg-white/80 dark:hover:bg-slate-700/80 transition-colors shadow-md"
            aria-label="Regresar"
        >
            {/* FIX: Changed 'className' to 'class' for web component compatibility. */}
            <ion-icon name="arrow-back-outline" class="text-xl"></ion-icon>
      </button>

      {/* Header: Instructions and Timer */}
      <div className="flex-shrink-0 mb-8 animate-stagger" style={{ '--stagger-delay': '100ms' } as React.CSSProperties}>
        <div className="text-center mb-3">
            <h2 className="text-xl font-bold text-slate-700 dark:text-slate-200">¡El más rápido gana!</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Selecciona el color de la palabra para entrar a la trivia.</p>
        </div>
        <div className="timer-bar-container">
          <div className="timer-bar" style={{ 
              width: `${(timeLeft / ROUND_DURATION) * 100}%`,
              backgroundColor: getTimerColor()
          }}></div>
        </div>
      </div>

      {/* Color Word */}
      <div className="flex-grow flex items-center justify-center animate-stagger" style={{ '--stagger-delay': '200ms' } as React.CSSProperties}>
        <h1 className="text-6xl font-extrabold" style={{ color: currentColor.textColor, textShadow: '2px 2px 5px rgba(0,0,0,0.1)' }}>
          {currentColor.word}
        </h1>
      </div>

      {/* Color Options */}
      <div className="grid grid-cols-2 gap-5 flex-shrink-0 animate-stagger" style={{ '--stagger-delay': '300ms' } as React.CSSProperties}>
        {options.map((color, index) => (
          <button
            key={index}
            onClick={() => handleColorSelect(color, index)}
            disabled={isLocked}
            className={`color-card shadow-lg dark:shadow-black/30 ${selectedCardIndex === index ? selectionStatus : ''}`}
            style={{ backgroundColor: color.hex }}
          >
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuestionScreen;