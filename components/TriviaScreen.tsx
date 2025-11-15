import React, { useState, useEffect } from 'react';
import { Question } from '../types';
import { getTriviaQuestions } from '../api';

const ROUND_DURATION = 30000; // 30 seconds

interface TriviaScreenProps {
  onWin: (points: number) => void;
  onLose: () => void;
  onBack: () => void;
}

const TriviaScreen: React.FC<TriviaScreenProps> = ({ onWin, onLose, onBack }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [round, setRound] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [timeLeft, setTimeLeft] = useState(ROUND_DURATION);

  useEffect(() => {
    getTriviaQuestions().then(data => {
      setQuestions(data);
      setIsLoading(false);
    });
  }, []);
  
  const currentQuestion = questions[round];

  useEffect(() => {
    if (isAnswered || isLoading) {
      return;
    }

    setTimeLeft(ROUND_DURATION); // Reset timer for new question

    const timerId = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 100) {
          clearInterval(timerId);
          handleTimeUp();
          return 0;
        }
        return prevTime - 100;
      });
    }, 100);

    return () => clearInterval(timerId);
  }, [round, isAnswered, isLoading]);

  const handleNext = () => {
    if (round < questions.length - 1) {
      setRound(round + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      const pointsMapping: { [key: number]: number } = {
        3: 100,
        2: 70,
        1: 30,
      };
      const pointsWon = pointsMapping[correctAnswers] || 0;
      if (pointsWon > 0) {
        onWin(pointsWon);
      } else {
        onLose();
      }
    }
  };

  const handleTimeUp = () => {
      setIsAnswered(true);
      // Not selecting an answer, just showing the correct one
      setTimeout(handleNext, 1500);
  }

  const handleAnswer = (index: number) => {
    if (isAnswered) return;
    
    setSelectedAnswer(index);
    setIsAnswered(true);

    if (index === currentQuestion.correctAnswerIndex) {
      setCorrectAnswers(correctAnswers + 1);
    }

    setTimeout(handleNext, 1500);
  };
  
  const getTimerColor = () => {
    const percentage = (timeLeft / ROUND_DURATION) * 100;
    if (percentage < 25) return '#ef4444'; // red-500
    if (percentage < 50) return '#f59e0b'; // amber-500
    return '#22c55e'; // green-500
  };

  const getButtonClass = (index: number) => {
      if (!isAnswered) return 'bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200';
      if (index === currentQuestion.correctAnswerIndex) return 'bg-green-500 border-green-600 text-white';
      if (index === selectedAnswer && index !== currentQuestion.correctAnswerIndex) return 'bg-red-500 border-red-600 text-white';
      return 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 opacity-50 dark:opacity-40';
  }

  if (isLoading) {
    return (
        <div className="flex justify-center items-center h-full bg-slate-50 dark:bg-slate-800">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
        </div>
    );
  }

  if (!currentQuestion) {
      return (
          <div className="flex flex-col justify-center items-center h-full bg-slate-50 dark:bg-slate-800 text-center p-4">
              <h1 className="text-2xl font-bold text-slate-700 dark:text-slate-200">¡Trivia completada!</h1>
              <p className="text-slate-500 dark:text-slate-400 mt-2">Calculando tus resultados...</p>
          </div>
      );
  }

  return (
    <div className="relative flex flex-col h-full p-6 bg-slate-50 dark:bg-slate-800">
        <button
            onClick={onBack}
            className="absolute top-4 left-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 dark:bg-slate-700/80 text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-600/80 transition-colors shadow-md"
            aria-label="Regresar"
        >
            {/* FIX: Changed 'className' to 'class' for web component compatibility. */}
            <ion-icon name="arrow-back-outline" class="text-xl"></ion-icon>
        </button>

      <div className="animate-stagger" style={{ '--stagger-delay': '100ms' } as React.CSSProperties}>
        <p className="text-center text-sky-600 dark:text-sky-400 font-bold">Ronda {round + 1} / {questions.length}</p>
        
        {/* Timer Bar */}
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 my-3">
            <div 
                className="h-2.5 rounded-full" 
                style={{ 
                    width: `${(timeLeft / ROUND_DURATION) * 100}%`,
                    backgroundColor: getTimerColor(),
                    transition: 'width 0.1s linear, background-color 0.3s ease'
                }}
            ></div>
        </div>

        <h1 className="text-center text-2xl font-bold text-slate-800 dark:text-slate-100 mt-2">{currentQuestion.text}</h1>
      </div>

      <div className="flex-grow flex flex-col justify-center space-y-4 animate-stagger" style={{ '--stagger-delay': '200ms' } as React.CSSProperties}>
        {currentQuestion.answers.map((answer, index) => (
          <button
            key={index}
            onClick={() => handleAnswer(index)}
            disabled={isAnswered}
            className={`w-full p-4 rounded-xl text-lg font-semibold border-2 shadow-sm transition-all duration-300 ${getButtonClass(index)}`}
          >
            {answer}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TriviaScreen;