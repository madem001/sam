import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { professorCardsApi } from '../../lib/api';

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
    avatar_base64?: string;
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
  const [tempPoints, setTempPoints] = useState<{ [key: string]: number }>({});
  const [assigningPoints, setAssigningPoints] = useState<{ [key: string]: boolean }>({});
  const [isRoomOccupied, setIsRoomOccupied] = useState(false);
  const [occupiedByTeacher, setOccupiedByTeacher] = useState<string | null>(null);

  useEffect(() => {
    loadActiveGame();
    const interval = setInterval(loadActiveGame, 2000);
    return () => {
      clearInterval(interval);
      terminateGameOnExit();
    };
  }, []);

  useEffect(() => {
    if (activeGame) {
      loadResponses();
      subscribeToResponses();
      updatePresence(activeGame.id);

      const heartbeatInterval = setInterval(() => {
        updatePresence(activeGame.id);
      }, 10000);

      return () => {
        clearInterval(heartbeatInterval);
        clearPresence();
      };
    }
  }, [activeGame]);

  const updatePresence = async (gameId: string) => {
    console.log('💓 [TEACHER] Actualizando presencia para juego:', gameId);

    const { error } = await supabase
      .from('teacher_presence')
      .upsert({
        teacher_id: teacherId,
        game_id: gameId,
        is_online: true,
        last_heartbeat: new Date().toISOString(),
      }, {
        onConflict: 'teacher_id'
      });

    if (error) {
      console.error('❌ [TEACHER] Error actualizando presencia:', error);
    } else {
      console.log('✅ [TEACHER] Presencia actualizada');
    }
  };

  const clearPresence = async () => {
    console.log('🔌 [TEACHER] Limpiando presencia');

    await supabase
      .from('teacher_presence')
      .update({
        is_online: false,
        game_id: null,
      })
      .eq('teacher_id', teacherId);
  };

  const terminateGameOnExit = async () => {
    console.log('🚪 [TEACHER] Saliendo de la pantalla, terminando juego activo...');

    const { data: currentGame } = await supabase
      .from('all_for_all_games')
      .select('id')
      .eq('teacher_id', teacherId)
      .eq('is_active', true)
      .maybeSingle();

    if (currentGame) {
      console.log('🛑 [TEACHER] Terminando juego:', currentGame.id);

      await clearPresence();

      await supabase
        .from('all_for_all_games')
        .update({
          is_active: false,
          ended_at: new Date().toISOString(),
        })
        .eq('id', currentGame.id);
    }
  };

  const loadActiveGame = async () => {
    const { data: myGame } = await supabase
      .from('all_for_all_games')
      .select('*')
      .eq('teacher_id', teacherId)
      .eq('is_active', true)
      .maybeSingle();

    setActiveGame(myGame);

    const { data: otherGames } = await supabase
      .from('all_for_all_games')
      .select('*, teacher:profiles!all_for_all_games_teacher_id_fkey(name)')
      .neq('teacher_id', teacherId)
      .eq('is_active', true)
      .maybeSingle();

    if (otherGames && !myGame) {
      setIsRoomOccupied(true);
      setOccupiedByTeacher((otherGames as any).teacher?.name || 'Otro profesor');
    } else {
      setIsRoomOccupied(false);
      setOccupiedByTeacher(null);
    }
  };

  const loadResponses = async () => {
    if (!activeGame) return;

    console.log('Loading responses for game:', activeGame.id);

    const { data, error } = await supabase
      .from('all_for_all_responses')
      .select(`
        *,
        student:profiles!all_for_all_responses_student_id_fkey(name, avatar_base64)
      `)
      .eq('game_id', activeGame.id)
      .order('rank_position', { ascending: true });

    console.log('Responses loaded:', data, 'Error:', error);

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
    console.log('🎮 [TEACHER] Verificando disponibilidad de sala...');

    const { data: existingGames } = await supabase
      .from('all_for_all_games')
      .select('id, teacher_id')
      .eq('is_active', true);

    if (existingGames && existingGames.length > 0) {
      const otherTeacherGame = existingGames.find(g => g.teacher_id !== teacherId);
      if (otherTeacherGame) {
        console.log('🚫 [TEACHER] Sala ocupada por otro profesor');
        alert('La sala está ocupada. Otro profesor tiene un juego activo en este momento.');
        await loadActiveGame();
        return;
      }
    }

    console.log('🎮 [TEACHER] Iniciando juego All for All...');

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
      console.log('✅ [TEACHER] Juego creado:', data.id);
      setActiveGame(data);
      setResponses([]);

      await updatePresence(data.id);
      console.log('✅ [TEACHER] Presencia registrada para el juego');
    } else {
      console.error('❌ [TEACHER] Error creando juego:', error);
    }
  };

  const endGame = async () => {
    if (!activeGame) return;

    await clearPresence();

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

  const updateTempPoints = (responseId: string, points: number) => {
    setTempPoints(prev => ({ ...prev, [responseId]: points }));
  };

  const assignPoints = async (response: Response) => {
    const points = tempPoints[response.id] || 0;
    if (points <= 0) return;

    setAssigningPoints(prev => ({ ...prev, [response.id]: true }));

    try {
      await supabase
        .from('all_for_all_responses')
        .update({ points_awarded: points })
        .eq('id', response.id);

      await professorCardsApi.addPointsToProfessorCard(
        response.student_id,
        teacherId,
        points
      );

      console.log('✅ Puntos asignados exitosamente:', points, 'a', response.student?.name);

      loadResponses();
    } catch (error) {
      console.error('❌ Error asignando puntos:', error);
    } finally {
      setAssigningPoints(prev => ({ ...prev, [response.id]: false }));
    }
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
    <div className="h-full w-full overflow-y-auto scrollbar-hide">
      <div className="p-6 space-y-6 pb-24">
        <div className="text-center animate-fade-in">
          <h1 className="text-3xl font-bold text-slate-800">
            All for All
          </h1>
          <p className="text-slate-500 mt-1">Panel de Control del Profesor</p>
        </div>

        {!activeGame ? (
          <>
            {isRoomOccupied && (
              <div className="bg-red-50 border-2 border-red-200 rounded-3xl p-8 text-center animate-scale-in mb-6">
                <div className="text-6xl mb-4">🚫</div>
                <h2 className="text-2xl font-bold text-red-800 mb-2">
                  Sala Ocupada
                </h2>
                <p className="text-red-600 text-lg mb-1">
                  {occupiedByTeacher} tiene un juego activo
                </p>
                <p className="text-red-500 text-sm">
                  Espera a que termine para poder iniciar tu juego
                </p>
              </div>
            )}

            <div className={`bg-white rounded-3xl p-6 shadow-sm border border-slate-200 animate-scale-in ${isRoomOccupied ? 'opacity-50 pointer-events-none' : ''}`}>
              <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">
                Configurar Nueva Ronda
              </h2>

            <div className="space-y-5">
              <div>
                <label className="text-sm font-bold text-slate-700 mb-2 block">
                  Palabra a Mostrar
                </label>
                <select
                  value={wordText}
                  onChange={(e) => setWordText(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all font-semibold text-base bg-white"
                >
                  {COLOR_OPTIONS.map((color) => (
                    <option key={color.value} value={color.name}>
                      {color.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-bold text-slate-700 mb-3 block">
                  Color del Texto
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {COLOR_OPTIONS.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setWordColor(color.value)}
                      className={`relative py-4 px-2 rounded-xl font-bold text-white text-xs transition-all ${
                        wordColor === color.value
                          ? 'ring-2 ring-slate-800 ring-offset-2'
                          : ''
                      } ${color.bg}`}
                    >
                      <span className="block truncate">{color.name}</span>
                      {wordColor === color.value && (
                        <div className="absolute -top-2 -right-2 w-5 h-5 bg-slate-800 rounded-full flex items-center justify-center">
                          <ion-icon name="checkmark" class="text-xs text-white"></ion-icon>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-bold text-slate-700 mb-3 block">
                  Respuesta Correcta
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setCorrectAnswer('text')}
                    className={`relative py-6 rounded-xl font-semibold transition-all ${
                      correctAnswer === 'text'
                        ? 'bg-slate-800 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <ion-icon name="chatbox-ellipses-outline" class="text-2xl mb-1"></ion-icon>
                    <div className="text-sm">Lo que dice</div>
                    <div className="text-xs opacity-70">el texto</div>
                    {correctAnswer === 'text' && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <ion-icon name="checkmark" class="text-sm text-white"></ion-icon>
                      </div>
                    )}
                  </button>
                  <button
                    onClick={() => setCorrectAnswer('color')}
                    className={`relative py-6 rounded-xl font-semibold transition-all ${
                      correctAnswer === 'color'
                        ? 'bg-slate-800 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <ion-icon name="color-fill-outline" class="text-2xl mb-1"></ion-icon>
                    <div className="text-sm">El color</div>
                    <div className="text-xs opacity-70">del texto</div>
                    {correctAnswer === 'color' && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <ion-icon name="checkmark" class="text-sm text-white"></ion-icon>
                      </div>
                    )}
                  </button>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                <p className="text-sm font-bold text-slate-700 mb-4">Vista Previa</p>

                <div className="bg-slate-900 rounded-xl p-8 mb-4 h-[180px] flex items-center justify-center overflow-hidden">
                  <p
                    className="text-5xl font-black tracking-tight leading-tight text-center"
                    style={{ color: wordColor }}
                  >
                    {wordText}
                  </p>
                </div>

                <div className="bg-white rounded-xl p-4 border border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                      <ion-icon name="checkmark-circle" class="text-lg text-white"></ion-icon>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium">Respuesta correcta</p>
                      <p className="text-lg font-bold text-slate-800">
                        {correctAnswer === 'text' ? wordText : COLOR_OPTIONS.find(c => c.value === wordColor)?.name}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={startGame}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold text-lg py-4 rounded-xl transition-all flex items-center justify-center gap-3"
                disabled={isRoomOccupied}
              >
                <ion-icon name="play-circle" class="text-2xl"></ion-icon>
                Iniciar Juego
              </button>
            </div>
          </div>
          </>
        ) : (
          <div className="space-y-6 animate-scale-in">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <h2 className="text-2xl font-bold text-slate-800">
                      Juego Activo
                    </h2>
                  </div>
                  <p className="text-sm text-slate-600">
                    <strong>{responses.length}</strong> {responses.length === 1 ? 'respuesta' : 'respuestas'}
                  </p>
                </div>
                <button
                  onClick={endGame}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold px-6 py-3 rounded-xl transition-all flex items-center gap-2"
                >
                  <ion-icon name="stop-circle" class="text-xl"></ion-icon>
                  Terminar
                </button>
              </div>

              <div className="bg-slate-900 rounded-xl p-8 h-[200px] flex items-center justify-center overflow-hidden">
                <p
                  className="text-6xl font-black tracking-tight leading-tight text-center"
                  style={{ color: activeGame.word_color }}
                >
                  {activeGame.word_text}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
              <h3 className="text-2xl font-bold text-slate-800 mb-5">
                Ranking en Tiempo Real
              </h3>

              {responses.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-3 bg-slate-100 rounded-full flex items-center justify-center">
                    <ion-icon name="hourglass-outline" class="text-3xl text-slate-400"></ion-icon>
                  </div>
                  <p className="text-slate-500 font-medium">Esperando respuestas...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {responses.map((response, index) => (
                    <div
                      key={response.id}
                      className={`flex items-center gap-4 p-4 rounded-xl border ${
                        response.is_correct
                          ? 'bg-green-50 border-green-200'
                          : 'bg-red-50 border-red-200'
                      }`}
                    >
                      <div className="text-3xl font-bold w-12 text-center">
                        {getRankEmoji(response.rank_position)}
                      </div>

                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold text-lg">
                          {response.student?.name?.charAt(0) || '?'}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">
                            {response.student?.name || 'Estudiante'}
                          </p>
                          <p className="text-sm text-slate-600">
                            Presionó: <strong>{COLOR_OPTIONS.find(c => c.value === response.button_pressed)?.name || response.button_pressed}</strong>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={tempPoints[response.id] ?? response.points_awarded}
                          onChange={(e) => updateTempPoints(response.id, parseInt(e.target.value) || 0)}
                          className="w-20 px-3 py-2 rounded-lg border border-slate-300 text-center font-bold bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                          placeholder="0"
                          disabled={response.points_awarded > 0}
                        />
                        <span className="text-slate-600 font-medium text-sm">pts</span>
                        {response.points_awarded === 0 ? (
                          <button
                            onClick={() => assignPoints(response)}
                            disabled={assigningPoints[response.id] || (tempPoints[response.id] || 0) <= 0}
                            className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 disabled:from-slate-300 disabled:to-slate-400 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all disabled:cursor-not-allowed"
                          >
                            {assigningPoints[response.id] ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                Asignando...
                              </>
                            ) : (
                              <>
                                <ion-icon name="trophy" class="text-lg"></ion-icon>
                                Asignar
                              </>
                            )}
                          </button>
                        ) : (
                          <div className="bg-green-100 text-green-700 px-4 py-2 rounded-lg font-semibold flex items-center gap-2">
                            <ion-icon name="checkmark-circle" class="text-lg"></ion-icon>
                            Asignado
                          </div>
                        )}
                      </div>

                      <div>
                        {response.is_correct ? (
                          <div className="bg-green-500 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2">
                            <ion-icon name="checkmark-circle" class="text-lg"></ion-icon>
                            Correcto
                          </div>
                        ) : (
                          <div className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2">
                            <ion-icon name="close-circle" class="text-lg"></ion-icon>
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
