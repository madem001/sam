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
  const [pointsAwarded, setPointsAwarded] = useState<number | null>(null);
  const [showPointsPopup, setShowPointsPopup] = useState(false);

  useEffect(() => {
    cleanupAllChannels();

    loadActiveGame();
    const cleanupGames = subscribeToGames();
    const cleanupResponses = subscribeToResponses();
    const cleanupPresence = subscribeToPresence();

    const refreshInterval = setInterval(() => {
      console.log('🔄 [STUDENT] Refrescando estado del juego...');
      loadActiveGame();
    }, 3000);

    return () => {
      clearInterval(refreshInterval);
      cleanupGames();
      cleanupResponses();
      cleanupPresence();
      cleanupAllChannels();
    };
  }, []);

  const cleanupAllChannels = async () => {
    console.log('🧹 [STUDENT] Limpiando todos los canales de Realtime...');
    try {
      await supabase.removeAllChannels();
      console.log('✅ [STUDENT] Canales limpiados');
    } catch (error) {
      console.error('❌ [STUDENT] Error limpiando canales:', error);
    }
  };

  const loadActiveGame = async () => {
    console.log('🔍 [STUDENT] Cargando juego activo...');
    setIsLoading(true);

    const { data: myProfessors, error: profError } = await supabase
      .from('student_professor_points')
      .select('professor_id')
      .eq('student_id', userId);

    console.log('📋 [STUDENT] Query profesores:', { myProfessors, profError });

    if (profError || !myProfessors || myProfessors.length === 0) {
      console.log('⚠️ [STUDENT] No tengo profesores asignados');
      setGame(null);
      setHasResponded(false);
      setIsLoading(false);
      return;
    }

    const professorIds = myProfessors.map(p => p.professor_id);
    console.log('👨‍🏫 [STUDENT] Mis profesores:', professorIds);

    const { data: onlinePresence, error: presenceError } = await supabase
      .from('teacher_presence')
      .select('teacher_id, game_id, is_online, last_heartbeat')
      .eq('is_online', true)
      .in('teacher_id', professorIds);

    console.log('📡 [STUDENT] Presencia:', { onlinePresence, presenceError });

    if (!onlinePresence || onlinePresence.length === 0) {
      console.log('⏳ [STUDENT] Ninguno de mis profesores está en línea');
      setGame(null);
      setHasResponded(false);
      setIsLoading(false);
      return;
    }

    const onlineTeachers = onlinePresence.map(p => p.teacher_id);
    const activeGameIds = onlinePresence.map(p => p.game_id).filter(id => id !== null);

    console.log('✅ [STUDENT] Profesores en línea:', onlineTeachers);
    console.log('🎮 [STUDENT] Game IDs de presencia:', activeGameIds);

    if (activeGameIds.length === 0) {
      console.log('⚠️ [STUDENT] No hay game_ids en la presencia');
      setGame(null);
      setHasResponded(false);
      setIsLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('all_for_all_games')
      .select('*')
      .eq('is_active', true)
      .in('id', activeGameIds)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    console.log('📦 [STUDENT] Resultado de búsqueda de juegos:', { data, error });

    if (data) {
      console.log('✅ [STUDENT] Juego activo encontrado:', JSON.stringify(data, null, 2));
      setGame(data);
      await checkIfResponded(data.id);
    } else {
      console.log('⏳ [STUDENT] No hay juego activo de profesores en línea');
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
    console.log('👂 [STUDENT] Suscribiéndose a cambios en all_for_all_games');

    const channel = supabase
      .channel('all_for_all_games_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'all_for_all_games',
        },
        (payload) => {
          console.log('🔔 [STUDENT] Cambio detectado en juegos:', payload);
          loadActiveGame();
        }
      )
      .subscribe((status) => {
        console.log('📡 [STUDENT] Estado de suscripción:', status);
      });

    return () => {
      console.log('🔌 [STUDENT] Desconectando suscripción juegos');
      supabase.removeChannel(channel);
    };
  };

  const subscribeToResponses = () => {
    console.log('👂 [STUDENT] Suscribiéndose a cambios en respuestas');

    const channel = supabase
      .channel('my_responses_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'all_for_all_responses',
          filter: `student_id=eq.${userId}`,
        },
        (payload) => {
          console.log('🔔 [STUDENT] Cambio detectado en mi respuesta:', payload);
          const newPoints = payload.new?.points_awarded;
          if (newPoints && newPoints > 0) {
            console.log('🎉 [STUDENT] ¡Puntos recibidos!:', newPoints);
            setPointsAwarded(newPoints);
            setShowPointsPopup(true);
            setTimeout(() => {
              setShowPointsPopup(false);
            }, 4000);
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 [STUDENT] Estado de suscripción respuestas:', status);
      });

    return () => {
      console.log('🔌 [STUDENT] Desconectando suscripción respuestas');
      supabase.removeChannel(channel);
    };
  };

  const subscribeToPresence = () => {
    console.log('👂 [STUDENT] Suscribiéndose a cambios en presencia de profesores');

    const channel = supabase
      .channel('teacher_presence_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'teacher_presence',
        },
        (payload) => {
          console.log('🔔 [STUDENT] Cambio detectado en presencia:', payload);
          loadActiveGame();
        }
      )
      .subscribe((status) => {
        console.log('📡 [STUDENT] Estado de suscripción presencia:', status);
      });

    return () => {
      console.log('🔌 [STUDENT] Desconectando suscripción presencia');
      supabase.removeChannel(channel);
    };
  };

  const handleButtonPress = async (buttonColor: string) => {
    if (!game || hasResponded) return;

    console.log('Button pressed:', buttonColor);
    console.log('Game:', game);

    const isCorrect =
      (game.correct_answer === 'color' && buttonColor === game.word_color) ||
      (game.correct_answer === 'text' && buttonColor === game.word_text.toLowerCase());

    console.log('Is correct:', isCorrect);

    const { data, error } = await supabase
      .from('all_for_all_responses')
      .insert({
        game_id: game.id,
        student_id: userId,
        button_pressed: buttonColor,
        is_correct: isCorrect,
      })
      .select();

    console.log('Insert result:', data, 'Error:', error);

    if (!error) {
      setHasResponded(true);
      setResponseStatus(isCorrect ? 'correct' : 'incorrect');
      setTimeout(() => setResponseStatus(null), 3000);
    } else {
      console.error('Error inserting response:', error);
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

      {showPointsPopup && pointsAwarded && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 animate-fade-in">
          <div className="bg-white rounded-3xl p-8 shadow-2xl max-w-sm mx-4 text-center animate-scale-in">
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
              <ion-icon name="star" class="text-5xl text-white"></ion-icon>
            </div>
            <h2 className="text-3xl font-black text-slate-800 mb-2">¡Puntos Ganados!</h2>
            <p className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600 mb-4">
              +{pointsAwarded}
            </p>
            <p className="text-slate-600 mb-6">
              Estos puntos se han sumado a tu tarjeta del profesor
            </p>
            <button
              onClick={() => setShowPointsPopup(false)}
              className="px-8 py-3 bg-gradient-to-r from-gray-800 to-gray-900 text-white font-bold rounded-xl hover:shadow-lg transition-all"
            >
              ¡Genial!
            </button>
          </div>
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
