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
  { name: 'ROJO', value: 'red', bg: 'bg-red-500', hover: 'hover:bg-red-600', gradient: 'from-red-500 to-red-600' },
  { name: 'AZUL', value: 'blue', bg: 'bg-blue-500', hover: 'hover:bg-blue-600', gradient: 'from-blue-500 to-blue-600' },
  { name: 'VERDE', value: 'green', bg: 'bg-green-500', hover: 'hover:bg-green-600', gradient: 'from-green-500 to-green-600' },
  { name: 'AMARILLO', value: 'yellow', bg: 'bg-yellow-400', hover: 'hover:bg-yellow-500', gradient: 'from-yellow-400 to-yellow-500' },
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

  const selectedColorOption = COLOR_OPTIONS.find(c => c.value === wordColor);

  return (
    <div className="h-full w-full overflow-hidden bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 p-0">
      <div className="h-full w-full overflow-y-auto scrollbar-hide px-6 py-4 pb-24">
        <div className="mb-4 animate-fade-in">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
              <ion-icon name="color-palette" class="text-xl text-white"></ion-icon>
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800">
                All for All
              </h1>
              <p className="text-sm text-slate-600">Panel de Control del Profesor</p>
            </div>
          </div>
        </div>

        {!activeGame ? (
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/40 animate-scale-in">
            <div className="flex items-center gap-2 mb-4">
              <ion-icon name="settings-outline" class="text-2xl text-purple-600"></ion-icon>
              <h2 className="text-xl font-bold text-slate-800">
                Configurar Nueva Ronda
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 mb-2">
                  <ion-icon name="text-outline" class="text-lg"></ion-icon>
                  Palabra a Mostrar
                </label>
                <select
                  value={wordText}
                  onChange={(e) => setWordText(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border-2 border-slate-200 focus:border-purple-500 outline-none transition-all font-semibold text-base bg-white shadow-sm hover:shadow-md"
                >
                  {COLOR_OPTIONS.map((color) => (
                    <option key={color.value} value={color.name}>
                      {color.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 mb-2">
                  <ion-icon name="brush-outline" class="text-lg"></ion-icon>
                  Color del Texto
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {COLOR_OPTIONS.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setWordColor(color.value)}
                      className={`relative py-4 px-2 rounded-2xl font-bold text-white text-xs transition-all transform shadow-lg hover:shadow-xl hover:-translate-y-1 ${
                        wordColor === color.value
                          ? 'ring-4 ring-slate-900 scale-105'
                          : 'hover:scale-105'
                      } ${color.bg}`}
                    >
                      <span className="block truncate">{color.name}</span>
                      {wordColor === color.value && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-slate-900 rounded-full flex items-center justify-center">
                          <ion-icon name="checkmark" class="text-sm text-white"></ion-icon>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 mb-2">
                  <ion-icon name="help-circle-outline" class="text-lg"></ion-icon>
                  Respuesta Correcta
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setCorrectAnswer('text')}
                    className={`relative py-4 rounded-2xl font-bold transition-all transform shadow-lg hover:shadow-xl hover:-translate-y-1 ${
                      correctAnswer === 'text'
                        ? 'bg-gradient-to-br from-slate-800 to-slate-900 text-white scale-105'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <ion-icon name="chatbox-ellipses-outline" class="text-xl mb-1"></ion-icon>
                    <div className="text-xs">Lo que dice</div>
                    <div className="text-[10px] opacity-80">el texto</div>
                    {correctAnswer === 'text' && (
                      <div className="absolute -top-2 -right-2 w-7 h-7 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                        <ion-icon name="checkmark" class="text-white"></ion-icon>
                      </div>
                    )}
                  </button>
                  <button
                    onClick={() => setCorrectAnswer('color')}
                    className={`relative py-4 rounded-2xl font-bold transition-all transform shadow-lg hover:shadow-xl hover:-translate-y-1 ${
                      correctAnswer === 'color'
                        ? 'bg-gradient-to-br from-slate-800 to-slate-900 text-white scale-105'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <ion-icon name="color-fill-outline" class="text-xl mb-1"></ion-icon>
                    <div className="text-xs">El color</div>
                    <div className="text-[10px] opacity-80">del texto</div>
                    {correctAnswer === 'color' && (
                      <div className="absolute -top-2 -right-2 w-7 h-7 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                        <ion-icon name="checkmark" class="text-white"></ion-icon>
                      </div>
                    )}
                  </button>
                </div>
              </div>

              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-4 border-2 border-slate-200">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-slate-700 rounded-xl flex items-center justify-center shadow-lg">
                    <ion-icon name="eye-outline" class="text-lg text-white"></ion-icon>
                  </div>
                  <div>
                    <p className="text-base font-black text-slate-800">Vista Previa</p>
                    <p className="text-[10px] text-slate-500">Como verán los estudiantes</p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 rounded-2xl p-12 text-center shadow-2xl mb-3 border-4 border-slate-700 overflow-hidden min-h-[180px] flex items-center justify-center">
                  <p
                    className="text-7xl font-black tracking-tight drop-shadow-2xl break-words leading-tight max-w-full"
                    style={{ color: wordColor }}
                  >
                    {wordText}
                  </p>
                </div>

                <div className="bg-white rounded-xl p-3 shadow-md border border-slate-200">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-6 h-6 bg-green-500 rounded-lg flex items-center justify-center shadow-md">
                      <ion-icon name="checkmark-circle" class="text-base text-white"></ion-icon>
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] text-slate-500 font-medium">Respuesta correcta</p>
                      <p className="text-base font-black text-slate-800">
                        {correctAnswer === 'text' ? wordText : COLOR_OPTIONS.find(c => c.value === wordColor)?.name}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={startGame}
                className="w-full bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-black text-lg py-5 rounded-2xl transition-all shadow-2xl hover:shadow-green-500/50 hover:-translate-y-1 transform flex items-center justify-center gap-3"
              >
                <ion-icon name="play-circle" class="text-3xl"></ion-icon>
                Iniciar Juego
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-scale-in">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/40">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <h2 className="text-2xl font-black text-slate-800">
                      Juego Activo
                    </h2>
                  </div>
                  <p className="text-slate-600 flex items-center gap-2">
                    <ion-icon name="people" class="text-lg"></ion-icon>
                    <strong>{responses.length}</strong> {responses.length === 1 ? 'respuesta' : 'respuestas'}
                  </p>
                </div>
                <button
                  onClick={endGame}
                  className="bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold px-6 py-3 rounded-2xl transition-all shadow-xl hover:shadow-red-500/50 hover:-translate-y-1 transform flex items-center gap-2"
                >
                  <ion-icon name="stop-circle" class="text-xl"></ion-icon>
                  Terminar
                </button>
              </div>

              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-12 text-center shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10"></div>
                <p
                  className="text-8xl font-black tracking-tight drop-shadow-2xl relative z-10 animate-pulse-slow"
                  style={{ color: activeGame.word_color }}
                >
                  {activeGame.word_text}
                </p>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/40">
              <div className="flex items-center gap-3 mb-6">
                <ion-icon name="podium" class="text-3xl text-amber-500"></ion-icon>
                <h3 className="text-2xl font-black text-slate-800">
                  Ranking en Tiempo Real
                </h3>
              </div>

              {responses.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full flex items-center justify-center">
                    <ion-icon name="hourglass-outline" class="text-4xl text-slate-500"></ion-icon>
                  </div>
                  <p className="text-slate-500 font-semibold text-lg">Esperando respuestas...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {responses.map((response, index) => (
                    <div
                      key={response.id}
                      className={`flex items-center gap-4 p-5 rounded-3xl transition-all transform hover:scale-102 shadow-lg ${
                        response.is_correct
                          ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300'
                          : 'bg-gradient-to-br from-red-50 to-pink-50 border-2 border-red-300'
                      }`}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="text-4xl font-black w-20 text-center bg-white/50 rounded-2xl py-2">
                        {getRankEmoji(response.rank_position)}
                      </div>

                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white font-black text-xl shadow-lg">
                          {response.student?.name?.charAt(0) || '?'}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-lg">
                            {response.student?.name || 'Estudiante'}
                          </p>
                          <p className="text-sm text-slate-600 flex items-center gap-1">
                            <ion-icon name="hand-left" class="text-base"></ion-icon>
                            Presionó: <strong>{COLOR_OPTIONS.find(c => c.value === response.button_pressed)?.name || response.button_pressed}</strong>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={response.points_awarded}
                          onChange={(e) => awardPoints(response.id, parseInt(e.target.value) || 0)}
                          className="w-24 px-4 py-3 rounded-xl border-2 border-slate-300 text-center font-black text-lg bg-white shadow-inner focus:border-purple-500 outline-none transition-all"
                          placeholder="0"
                        />
                        <span className="text-slate-700 font-bold text-sm">pts</span>
                      </div>

                      <div>
                        {response.is_correct ? (
                          <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white px-5 py-3 rounded-2xl font-bold shadow-lg flex items-center gap-2">
                            <ion-icon name="checkmark-circle" class="text-xl"></ion-icon>
                            Correcto
                          </div>
                        ) : (
                          <div className="bg-gradient-to-br from-red-500 to-pink-600 text-white px-5 py-3 rounded-2xl font-bold shadow-lg flex items-center gap-2">
                            <ion-icon name="close-circle" class="text-xl"></ion-icon>
                            Incorrecto
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
