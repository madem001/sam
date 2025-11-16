import React, { useState, useEffect } from 'react';
import * as battleApi from '../lib/battleApi';

interface StudentBattleScreenProps {
  groupId: string;
  battleId: string;
  studentId: string;
  studentName: string;
  onBack: () => void;
}

const StudentBattleScreen: React.FC<StudentBattleScreenProps> = ({
  groupId,
  battleId,
  studentId,
  studentName,
  onBack,
}) => {
  const [battle, setBattle] = useState<battleApi.Battle | null>(null);
  const [groups, setGroups] = useState<battleApi.BattleGroup[]>([]);
  const [questions, setQuestions] = useState<battleApi.BattleQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<battleApi.BattleQuestion | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [myGroup, setMyGroup] = useState<battleApi.BattleGroup | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(60);
  const [showEndGamePopup, setShowEndGamePopup] = useState(false);
  const [finalScore, setFinalScore] = useState(0);

  useEffect(() => {
    loadBattleData();

    const battleSub = battleApi.subscribeToBattle(battleId, (payload) => {
      console.log('🔔 [STUDENT] Cambio en batalla detectado:', payload.eventType);
      console.log('🔔 [STUDENT] Nuevo estado:', payload.new?.status);
      loadBattleData();
    });

    const groupsSub = battleApi.subscribeToBattleGroups(battleId, (payload) => {
      console.log('🔔 [STUDENT] Cambio en grupos detectado:', payload.eventType);
      loadGroups();
    });

    const pollingInterval = setInterval(() => {
      console.log('🔄 [STUDENT] Polling battle state...');
      loadBattleData();
    }, 2000);

    return () => {
      battleSub.unsubscribe();
      groupsSub.unsubscribe();
      clearInterval(pollingInterval);
    };
  }, [battleId]);

  const loadBattleData = async () => {
    console.log('📥 [STUDENT] Cargando datos de batalla...');
    try {
      const battleData = await battleApi.getBattleState(battleId);
      console.log('✅ [STUDENT] Batalla cargada:', {
        name: battleData?.name,
        status: battleData?.status,
        totalQuestions: battleData?.question_count,
        currentQuestionIndex: battleData?.current_question_index
      });

      if (battleData) {
        setBattle(battleData);
        console.log('👨‍🏫 [STUDENT] Teacher ID de la batalla:', battleData.teacher_id);
        const questionsData = await battleApi.getBattleQuestions(battleId);
        console.log('✅ [STUDENT] Preguntas cargadas:', questionsData.length);
        setQuestions(questionsData);
      }
      await loadGroups();
      console.log('✅ [STUDENT] Datos completos cargados');
    } catch (error) {
      console.error('❌ [STUDENT] Error cargando datos:', error);
    }
  };

  const loadGroups = async () => {
    console.log('👥 [STUDENT] Cargando grupos...');
    const groupsData = await battleApi.getBattleGroups(battleId);
    console.log('✅ [STUDENT] Grupos cargados:', groupsData.length);
    setGroups(groupsData);
    const myGroupData = groupsData.find(g => g.id === groupId);
    if (myGroupData) {
      console.log('✅ [STUDENT] Mi grupo encontrado:', {
        id: myGroupData.id,
        name: myGroupData.group_name,
        currentQuestionIndex: myGroupData.current_question_index,
        isEliminated: myGroupData.is_eliminated
      });
      setMyGroup(myGroupData);
    } else {
      console.log('❌ [STUDENT] Mi grupo NO encontrado. GroupId buscado:', groupId);
    }
  };

  useEffect(() => {
    console.log('🔍 [STUDENT] Verificando condiciones para mostrar pregunta:', {
      hasMyGroup: !!myGroup,
      hasBattle: !!battle,
      battleStatus: battle?.status,
      questionsCount: questions.length,
      isEliminated: myGroup?.is_eliminated,
      currentQuestionIndex: myGroup?.current_question_index
    });

    if (!myGroup || !battle || !questions.length) {
      console.log('⚠️ [STUDENT] Faltan datos para mostrar pregunta');
      return;
    }

    if (battle.status === 'active' && !myGroup.is_eliminated) {
      const currentQ = questions[myGroup.current_question_index];
      if (currentQ) {
        console.log('📝 [STUDENT] Pregunta disponible:', {
          index: myGroup.current_question_index,
          text: currentQ.question_text.substring(0, 50) + '...',
          currentQuestionId: currentQuestion?.id,
          newQuestionId: currentQ.id
        });

        if (!currentQuestion || currentQuestion.id !== currentQ.id) {
          console.log('✅ [STUDENT] Cargando nueva pregunta...');
          setCurrentQuestion(currentQ);
          setStartTime(Date.now());
          setHasAnswered(false);
          setSelectedAnswer(null);
          setTimeRemaining(60);
        }
      } else {
        console.log('❌ [STUDENT] No hay pregunta en el índice:', myGroup.current_question_index);
      }
    } else {
      console.log('⏸️ [STUDENT] Batalla no activa o grupo eliminado');
    }
  }, [myGroup, battle, questions]);

  useEffect(() => {
    if (!battle || !currentQuestion || hasAnswered || battle.status !== 'active') {
      return;
    }

    const questionStartedAt = battle.question_started_at ? new Date(battle.question_started_at).getTime() : Date.now();
    const timeLimit = battle.question_time_limit || 60;

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - questionStartedAt) / 1000);
      const remaining = Math.max(0, timeLimit - elapsed);
      setTimeRemaining(remaining);

      if (remaining === 0 && !hasAnswered) {
        console.log('⏰ [STUDENT] Tiempo agotado, enviando respuesta automática incorrecta');
        setHasAnswered(true);
        handleAnswerSelect(-1);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [battle, currentQuestion, hasAnswered]);

  const handleAnswerSelect = async (answerIndex: number) => {
    if (hasAnswered || !currentQuestion || !myGroup) return;

    console.log('✅ [STUDENT] Respuesta seleccionada:', {
      answerIndex,
      isCorrect: answerIndex === currentQuestion.correct_answer_index
    });

    setSelectedAnswer(answerIndex);
    setHasAnswered(true);

    const responseTime = Date.now() - startTime;

    try {
      await battleApi.submitAnswer(
        battleId,
        groupId,
        currentQuestion.id,
        answerIndex,
        currentQuestion.correct_answer_index,
        responseTime
      );
      console.log('✅ [STUDENT] Respuesta enviada exitosamente');

      await loadGroups();

      setTimeout(async () => {
        if (myGroup.current_question_index + 1 < (battle?.question_count || 0)) {
          console.log('⏭️ [STUDENT] Auto-avanzando a siguiente pregunta...');
          await battleApi.nextQuestionForGroup(groupId, battleId);
          await loadGroups();
        } else {
          console.log('🏁 [STUDENT] Grupo completó todas las preguntas');

          const finalPoints = await battleApi.calculateFinalPoints(battleId, groupId);
          console.log('🏆 [STUDENT] Puntos finales calculados:', finalPoints);

          setFinalScore(finalPoints);
          setShowEndGamePopup(true);

          const teacherId = battle?.teacher_id || '';
          console.log('🎯 [STUDENT] Asignando puntos:', {
            studentId,
            teacherId,
            points: finalPoints,
            professorName: battle?.name
          });
          if (teacherId && finalPoints > 0) {
            await battleApi.addPointsToProfessorCard(studentId, teacherId, finalPoints);
            console.log('✅ [STUDENT] Puntos asignados a la carta del profesor');
          } else {
            console.warn('⚠️ [STUDENT] No se pueden asignar puntos:', { teacherId, finalPoints });
          }
        }
      }, 2000);
    } catch (error) {
      console.error('❌ [STUDENT] Error enviando respuesta:', error);
    }
  };

  if (!battle) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const isWaiting = battle.status === 'waiting';
  const isActive = battle.status === 'active';
  const isFinished = battle.status === 'finished';

  console.log('🎨 [STUDENT] Renderizando con estado:', {
    status: battle.status,
    isWaiting,
    isActive,
    isFinished,
    hasCurrentQuestion: !!currentQuestion
  });

  return (
    <div className="relative h-full overflow-y-auto bg-gradient-to-br from-gray-50 to-gray-100 dark:to-slate-800">
      <button
        onClick={onBack}
        className="absolute top-4 left-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 transition-colors shadow-lg"
        aria-label="Regresar"
      >
        <ion-icon name="arrow-back-outline" class="text-xl"></ion-icon>
      </button>

      <div className="p-6 space-y-6 pt-16">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-800">{battle.name}</h1>
          {myGroup && (
            <div className="space-y-2 mt-3">
              <div className={`inline-block px-6 py-2 rounded-full shadow-lg ${
                myGroup.is_eliminated
                  ? 'bg-gradient-to-r from-red-500 to-red-600'
                  : 'bg-gradient-to-r from-gray-800 to-gray-900'
              } text-white`}>
                <p className="font-bold text-lg">
                  {myGroup.is_eliminated ? '💀 ELIMINADO' : myGroup.group_name}
                </p>
                <p className="text-sm opacity-90">Puntos: {myGroup.score}</p>
                {!myGroup.is_eliminated && myGroup.wrong_answers > 0 && (
                  <p className="text-sm font-bold text-yellow-200">
                    ⚠️ {myGroup.wrong_answers}/2 errores
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {isWaiting && (
          <div className="bg-white p-8 rounded-2xl shadow-xl text-center">
            <div className="animate-pulse">
              <ion-icon name="hourglass-outline" class="text-6xl text-gray-700 mb-4"></ion-icon>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Esperando Inicio</h2>
            <p className="text-slate-600">El maestro iniciará la batalla pronto...</p>
          </div>
        )}

        {isActive && currentQuestion && !myGroup?.is_eliminated && (
          <div className="bg-white p-6 rounded-2xl shadow-xl">
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-slate-500">
                  Pregunta {(myGroup?.current_question_index || 0) + 1} de {battle.question_count}
                </span>
                <div className={`flex items-center space-x-2 font-bold text-2xl ${
                  timeRemaining <= 10 ? 'text-red-500 animate-pulse' :
                  timeRemaining <= 30 ? 'text-orange-500' : 'text-green-500'
                }`}>
                  <ion-icon name="timer-outline" class="text-3xl"></ion-icon>
                  <span>{timeRemaining}s</span>
                </div>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    timeRemaining <= 10 ? 'bg-red-500' :
                    timeRemaining <= 30 ? 'bg-orange-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${(timeRemaining / 60) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="flex justify-between items-center mb-6">
              {!hasAnswered && (
                <div className="flex items-center space-x-2 text-orange-500">
                  <ion-icon name="alert-circle-outline" class="text-xl"></ion-icon>
                  <span className="font-semibold">¡Responde antes que termine el tiempo!</span>
                </div>
              )}
              {hasAnswered && (
                <div className="flex items-center space-x-2 text-green-500">
                  <ion-icon name="checkmark-circle" class="text-xl"></ion-icon>
                  <span className="font-bold">Respondido</span>
                </div>
              )}
            </div>

            <h2 className="text-xl font-bold text-slate-800 mb-6">
              {currentQuestion.question_text}
            </h2>

            <div className="grid grid-cols-1 gap-4">
              {currentQuestion.answers.map((answer, idx) => {
                const isSelected = selectedAnswer === idx;
                const isCorrect = idx === currentQuestion.correct_answer_index;
                const showResult = hasAnswered;

                return (
                  <button
                    key={idx}
                    onClick={() => handleAnswerSelect(idx)}
                    disabled={hasAnswered}
                    className={`p-4 rounded-xl border-3 font-semibold text-left transition-all transform ${
                      !showResult
                        ? 'hover:scale-105 hover:shadow-lg active:scale-95'
                        : ''
                    } ${
                      showResult && isSelected && isCorrect
                        ? 'bg-green-100 border-green-500 scale-105 shadow-lg'
                        : showResult && isSelected && !isCorrect
                        ? 'bg-red-100 border-red-500'
                        : showResult && isCorrect
                        ? 'bg-green-50 border-green-400'
                        : 'bg-white hover:bg-slate-50 dark:hover:bg-slate-600'
                    }`}
                    style={{
                      borderColor: !showResult ? answer.color : undefined,
                      borderWidth: '3px',
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-8 h-8 rounded-full flex-shrink-0"
                        style={{ backgroundColor: answer.color }}
                      ></div>
                      <span className="text-slate-800 flex-grow">
                        {answer.text}
                      </span>
                      {showResult && isCorrect && (
                        <ion-icon name="checkmark-circle" class="text-2xl text-green-500"></ion-icon>
                      )}
                      {showResult && isSelected && !isCorrect && (
                        <ion-icon name="close-circle" class="text-2xl text-red-500"></ion-icon>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {isActive && myGroup && myGroup.current_question_index >= battle.question_count && !myGroup.is_eliminated && (
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-8 rounded-2xl shadow-xl text-white text-center">
            <div className="animate-bounce">
              <ion-icon name="checkmark-circle" class="text-7xl mb-4"></ion-icon>
            </div>
            <h2 className="text-3xl font-bold mb-2">¡Completaste todas las preguntas!</h2>
            <p className="text-xl opacity-90">
              Excelente trabajo
            </p>
            <p className="text-lg mt-4">
              Puntuación: <span className="font-bold">{myGroup.score}</span>
            </p>
            <p className="text-sm mt-6 opacity-75">
              Espera a que otros grupos terminen
            </p>
          </div>
        )}

        {isActive && myGroup?.is_eliminated && (
          <div className="bg-gradient-to-br from-red-500 to-red-700 p-8 rounded-2xl shadow-xl text-white text-center">
            <div className="animate-bounce">
              <ion-icon name="skull" class="text-7xl mb-4"></ion-icon>
            </div>
            <h2 className="text-3xl font-bold mb-2">¡Has sido eliminado!</h2>
            <p className="text-xl opacity-90">
              Tuviste 2 respuestas incorrectas
            </p>
            <p className="text-lg mt-4">
              Puntuación Final: <span className="font-bold">{myGroup.score}</span>
            </p>
            <p className="text-sm mt-6 opacity-75">
              Puedes seguir viendo la batalla en el ranking
            </p>
          </div>
        )}

        {isFinished && (
          <div className="bg-gradient-to-br from-amber-400 to-orange-500 dark:to-orange-600 p-8 rounded-2xl shadow-xl text-white text-center">
            <ion-icon name="trophy" class="text-7xl mb-4"></ion-icon>
            <h2 className="text-3xl font-bold mb-2">Batalla Finalizada</h2>
            {myGroup && (
              <>
                <p className="text-xl opacity-90 mt-4">
                  Puntuación Final: <span className="font-bold">{myGroup.score}</span>
                </p>
                {myGroup.is_eliminated && (
                  <p className="text-lg mt-2 bg-red-500/30 px-4 py-2 rounded-lg">
                    Eliminado por respuestas incorrectas
                  </p>
                )}
              </>
            )}
          </div>
        )}

        <div className="bg-white p-6 rounded-2xl shadow-xl">
          <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
            <ion-icon name="podium" class="text-2xl mr-2 text-amber-500"></ion-icon>
            Ranking en Vivo
          </h3>
          {groups.length === 0 ? (
            <p className="text-slate-500 text-center py-4">No hay grupos</p>
          ) : (
            <div className="space-y-2">
              {groups.map((group, idx) => (
                <div
                  key={group.id}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    group.is_eliminated
                      ? 'bg-red-100 opacity-60'
                      : group.id === groupId
                      ? 'bg-gray-200 border-2 border-gray-900'
                      : idx === 0
                      ? 'bg-amber-50'
                      : 'bg-slate-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span
                      className={`text-lg font-bold ${
                        group.is_eliminated
                          ? 'text-red-600'
                          : idx === 0
                          ? 'text-amber-600'
                          : 'text-slate-600'
                      }`}
                    >
                      {group.is_eliminated ? '💀' : idx + 1}
                    </span>
                    <div>
                      <p className="font-bold text-slate-800">
                        {group.group_name}
                        {group.is_eliminated && (
                          <span className="ml-2 text-xs text-red-600">ELIMINADO</span>
                        )}
                      </p>
                      <p className="text-xs text-slate-500">
                        Pregunta {group.current_question_index + 1}/{battle.question_count} • {group.correct_answers} correctas • {group.wrong_answers} errores
                      </p>
                    </div>
                  </div>
                  <p className={`text-xl font-bold ${
                    group.is_eliminated
                      ? 'text-red-600'
                      : 'text-sky-600'
                  }`}>{group.score}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showEndGamePopup && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-green-400 to-emerald-500 rounded-3xl shadow-2xl p-8 max-w-md w-full text-white text-center transform animate-bounce-in">
            <div className="mb-6">
              <ion-icon name="trophy" class="text-8xl"></ion-icon>
            </div>
            <h2 className="text-4xl font-black mb-4">¡Juego Completado!</h2>
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 mb-6">
              <p className="text-lg mb-2 opacity-90">Puntos Obtenidos</p>
              <p className="text-6xl font-black">{finalScore}</p>
              <p className="text-sm mt-2 opacity-75">de 200 puntos posibles</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4 mb-6">
              <p className="text-sm">
                🎴 Los puntos se han agregado a la carta de tu profesor
              </p>
            </div>
            <button
              onClick={() => {
                setShowEndGamePopup(false);
                onBack();
              }}
              className="w-full bg-white text-green-600 font-bold py-3 px-6 rounded-xl hover:bg-slate-100 transition-colors text-lg"
            >
              Continuar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentBattleScreen;
