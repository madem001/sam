import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

interface Game {
  id: string;
  word_text: string;
  word_color: string;
  correct_answer: string;
  is_active: boolean;
  created_at: string;
}

interface Response {
  id: string;
  student_id: string;
  button_pressed: string;
  is_correct: boolean;
  response_time: string;
  rank_position: number;
  points_awarded: number;
  student: {
    name: string;
    avatar_url?: string;
  };
}

interface AllForAllControlScreenProps {
  teacherId: string;
}

const COLOR_OPTIONS = [
  { name: 'ROJO', value: 'red' },
  { name: 'AZUL', value: 'blue' },
  { name: 'VERDE', value: 'green' },
  { name: 'AMARILLO', value: 'yellow' },
];

const AllForAllControlScreen: React.FC<AllForAllControlScreenProps> = ({ teacherId }) => {
  const [activeGame, setActiveGame] = useState<Game | null>(null);
  const [responses, setResponses] = useState<Response[]>([]);
  const [wordText, setWordText] = useState('ROJO');
  const [wordColor, setWordColor] = useState('blue');
  const [correctAnswer, setCorrectAnswer] = useState<'text' | 'color'>('color');

  useEffect(() => {
    loadActiveGame();
    const interval = setInterval(loadActiveGame, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (activeGame) {
      loadResponses();
      subscribeToResponses();
    }
  }, [activeGame]);

  const loadActiveGame = async () => {
    const { data } = await supabase
      .from('all_for_all_games')
      .select('*')
      .eq('teacher_id', teacherId)
      .eq('is_active', true)
      .maybeSingle();

    setActiveGame(data);
  };

  const loadResponses = async () => {
    if (!activeGame) return;

    const { data } = await supabase
      .from('all_for_all_responses')
      .select(`
        *,
        student:profiles!all_for_all_responses_student_id_fkey(name, avatar_url)
      `)
      .eq('game_id', activeGame.id)
      .order('rank_position', { ascending: true });

    if (data) {
      setResponses(data as any);
    }
  };

  const subscribeToResponses = () => {
    if (!activeGame) return;

    const channel = supabase
      .channel(`responses_${activeGame.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'all_for_all_responses',
          filter: `game_id=eq.${activeGame.id}`,
        },
        () => {
          loadResponses();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const startGame = async () => {
    const { data, error } = await supabase
      .from('all_for_all_games')
      .insert({
        teacher_id: teacherId,
        word_text: wordText.toUpperCase(),
        word_color: wordColor,
        correct_answer: correctAnswer,
        is_active: true,
      })
      .select()
      .single();

    if (data) {
      setActiveGame(data);
      setResponses([]);
    }
  };

  const endGame = async () => {
    if (!activeGame) return;

    await supabase
      .from('all_for_all_games')
      .update({
        is_active: false,
        ended_at: new Date().toISOString(),
      })
      .eq('id', activeGame.id);

    setActiveGame(null);
    setResponses([]);
  };

  const awardPoints = async (responseId: string, points: number) => {
    await supabase
      .from('all_for_all_responses')
      .update({ points_awarded: points })
      .eq('id', responseId);

    loadResponses();
  };

  const getRankEmoji = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            All for All - Control del Profesor
          </h1>
          <p className="text-slate-600">
            Gestiona el juego en tiempo real y asigna puntos manualmente
          </p>
        </div>

        {!activeGame ? (
          <div className="bg-white rounded-3xl p-8 shadow-xl">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">
              Configurar Nueva Ronda
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Palabra a Mostrar
                </label>
                <select
                  value={wordText}
                  onChange={(e) => setWordText(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-gray-900 outline-none transition-colors"
                >
                  {COLOR_OPTIONS.map((color) => (
                    <option key={color.value} value={color.name}>
                      {color.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Color del Texto
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {COLOR_OPTIONS.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setWordColor(color.value)}
                      className={`py-3 rounded-xl font-semibold transition-all ${
                        wordColor === color.value
                          ? 'ring-4 ring-gray-900 scale-105'
                          : 'ring-2 ring-slate-200 hover:scale-105'
                      }`}
                      style={{ backgroundColor: color.value, color: 'white' }}
                    >
                      {color.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Respuesta Correcta
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setCorrectAnswer('text')}
                    className={`py-4 rounded-xl font-semibold transition-all ${
                      correctAnswer === 'text'
                        ? 'bg-gray-900 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Lo que dice el texto
                  </button>
                  <button
                    onClick={() => setCorrectAnswer('color')}
                    className={`py-4 rounded-xl font-semibold transition-all ${
                      correctAnswer === 'color'
                        ? 'bg-gray-900 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    El color del texto
                  </button>
                </div>
              </div>

              <div className="bg-gray-100 rounded-2xl p-6">
                <p className="text-sm font-semibold text-slate-600 mb-2">Vista Previa:</p>
                <div className="bg-gray-800 rounded-xl p-8 text-center">
                  <p
                    className="text-6xl font-black"
                    style={{ color: wordColor }}
                  >
                    {wordText}
                  </p>
                </div>
                <p className="text-sm text-slate-600 mt-3 text-center">
                  Respuesta correcta: <strong>{correctAnswer === 'text' ? wordText : COLOR_OPTIONS.find(c => c.value === wordColor)?.name}</strong>
                </p>
              </div>

              <button
                onClick={startGame}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-xl"
              >
                Iniciar Juego
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-8 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">
                    Juego Activo
                  </h2>
                  <p className="text-slate-600 mt-1">
                    {responses.length} estudiante{responses.length !== 1 ? 's' : ''} ha{responses.length !== 1 ? 'n' : ''} respondido
                  </p>
                </div>
                <button
                  onClick={endGame}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-lg"
                >
                  Terminar Juego
                </button>
              </div>

              <div className="bg-gray-800 rounded-2xl p-8 text-center mb-6">
                <p
                  className="text-6xl font-black"
                  style={{ color: activeGame.word_color }}
                >
                  {activeGame.word_text}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-xl">
              <h3 className="text-xl font-bold text-slate-800 mb-4">
                Ranking en Tiempo Real
              </h3>

              {responses.length === 0 ? (
                <div className="text-center py-12">
                  <ion-icon name="hourglass-outline" class="text-6xl text-slate-300"></ion-icon>
                  <p className="text-slate-500 mt-3">Esperando respuestas...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {responses.map((response) => (
                    <div
                      key={response.id}
                      className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${
                        response.is_correct
                          ? 'bg-green-50 border-2 border-green-200'
                          : 'bg-red-50 border-2 border-red-200'
                      }`}
                    >
                      <div className="text-3xl font-bold w-16 text-center">
                        {getRankEmoji(response.rank_position)}
                      </div>

                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-white font-bold">
                          {response.student?.name?.charAt(0) || '?'}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">
                            {response.student?.name || 'Estudiante'}
                          </p>
                          <p className="text-sm text-slate-500">
                            Presionó: <strong>{COLOR_OPTIONS.find(c => c.value === response.button_pressed)?.name || response.button_pressed}</strong>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={response.points_awarded}
                          onChange={(e) => awardPoints(response.id, parseInt(e.target.value) || 0)}
                          className="w-20 px-3 py-2 rounded-lg border-2 border-slate-200 text-center font-bold"
                          placeholder="0"
                        />
                        <span className="text-slate-600 font-semibold">pts</span>
                      </div>

                      <div>
                        {response.is_correct ? (
                          <div className="bg-green-500 text-white px-4 py-2 rounded-full font-semibold">
                            ✓ Correcto
                          </div>
                        ) : (
                          <div className="bg-red-500 text-white px-4 py-2 rounded-full font-semibold">
                            ✗ Incorrecto
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllForAllControlScreen;
