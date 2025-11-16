import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface Game {
  id: string;
  word_text: string;
  word_color: string;
  correct_answer: string;
  is_active: boolean;
}

interface AllForAllScreenProps {
  userId: string;
}

const COLOR_OPTIONS = [
  { name: 'ROJO', value: 'red', bg: 'bg-red-500', hover: 'hover:bg-red-600' },
  { name: 'AZUL', value: 'blue', bg: 'bg-blue-500', hover: 'hover:bg-blue-600' },
  { name: 'VERDE', value: 'green', bg: 'bg-green-500', hover: 'hover:bg-green-600' },
  { name: 'AMARILLO', value: 'yellow', bg: 'bg-yellow-400', hover: 'hover:bg-yellow-500' },
];

const AllForAllScreen: React.FC<AllForAllScreenProps> = ({ userId }) => {
  const [game, setGame] = useState<Game | null>(null);
  const [hasResponded, setHasResponded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [responseStatus, setResponseStatus] = useState<'correct' | 'incorrect' | null>(null);

  useEffect(() => {
    loadActiveGame();
    subscribeToGames();
  }, []);

  const loadActiveGame = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('all_for_all_games')
      .select('*')
      .eq('is_active', true)
      .maybeSingle();

    if (data) {
      setGame(data);
      await checkIfResponded(data.id);
    } else {
      setGame(null);
      setHasResponded(false);
    }
    setIsLoading(false);
  };

  const checkIfResponded = async (gameId: string) => {
    const { data } = await supabase
      .from('all_for_all_responses')
      .select('*')
      .eq('game_id', gameId)
      .eq('student_id', userId)
      .maybeSingle();

    setHasResponded(!!data);
  };

  const subscribeToGames = () => {
    const channel = supabase
      .channel('all_for_all_games_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'all_for_all_games',
        },
        () => {
          loadActiveGame();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleButtonPress = async (buttonColor: string) => {
    if (!game || hasResponded) return;

    const isCorrect =
      (game.correct_answer === 'color' && buttonColor === game.word_color) ||
      (game.correct_answer === 'text' && buttonColor === game.word_text.toLowerCase());

    const { error } = await supabase
      .from('all_for_all_responses')
      .insert({
        game_id: game.id,
        student_id: userId,
        button_pressed: buttonColor,
        is_correct: isCorrect,
      });

    if (!error) {
      setHasResponded(true);
      setResponseStatus(isCorrect ? 'correct' : 'incorrect');
      setTimeout(() => setResponseStatus(null), 3000);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-900 border-t-transparent mx-auto mb-4"></div>
          <p className="text-slate-600 text-lg">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="text-center max-w-md">
          <div className="bg-white rounded-3xl p-8 shadow-xl">
            <div className="w-24 h-24 mx-auto mb-6 bg-slate-100 rounded-full flex items-center justify-center">
              <ion-icon name="timer-outline" class="text-6xl text-slate-400"></ion-icon>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-3">
              Esperando al Profesor
            </h2>
            <p className="text-slate-600">
              El juego "All for All" comenzará pronto. Tu profesor activará el juego cuando esté listo.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-6 relative overflow-hidden">
      {responseStatus && (
        <div className={`absolute top-8 left-1/2 transform -translate-x-1/2 z-50 px-8 py-4 rounded-2xl shadow-2xl ${
          responseStatus === 'correct' ? 'bg-green-500' : 'bg-red-500'
        } text-white font-bold text-xl animate-bounce-tab`}>
          {responseStatus === 'correct' ? '¡Correcto!' : 'Incorrecto'}
        </div>
      )}

      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-3xl p-8 shadow-2xl mb-8">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">
              All for All
            </h1>
            <p className="text-slate-600">
              {game.correct_answer === 'color'
                ? 'Presiona el botón del COLOR del texto'
                : 'Presiona el botón que diga lo mismo que el texto'}
            </p>
          </div>

          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-12 mb-8 flex items-center justify-center min-h-[200px]">
            <h2
              className="text-7xl font-black tracking-wider"
              style={{ color: game.word_color }}
            >
              {game.word_text}
            </h2>
          </div>

          {hasResponded ? (
            <div className="text-center py-8">
              <div className="inline-flex items-center gap-3 bg-gray-100 px-6 py-4 rounded-2xl">
                <ion-icon name="checkmark-circle" class="text-4xl text-green-500"></ion-icon>
                <span className="text-lg font-semibold text-slate-700">
                  Ya respondiste. Espera la siguiente ronda.
                </span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {COLOR_OPTIONS.map((color) => (
                <button
                  key={color.value}
                  onClick={() => handleButtonPress(color.value)}
                  className={`${color.bg} ${color.hover} text-white font-bold text-2xl py-8 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 active:scale-95`}
                >
                  {color.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="text-center text-slate-500 text-sm">
          <p>Presiona el botón correcto lo más rápido posible</p>
        </div>
      </div>
    </div>
  );
};

export default AllForAllScreen;
