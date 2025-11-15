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

  useEffect(() => {
    loadBattleData();
    const battleSub = battleApi.subscribeToBattle(battleId, () => {
      loadBattleData();
    });
    const groupsSub = battleApi.subscribeToBattleGroups(battleId, () => {
      loadGroups();
    });

    return () => {
      battleSub.unsubscribe();
      groupsSub.unsubscribe();
    };
  }, [battleId]);

  const loadBattleData = async () => {
    console.log('📥 StudentBattleScreen: Cargando datos de batalla...');
    try {
      const battleData = await battleApi.getBattleState(battleId);
      console.log('✅ StudentBattleScreen: Batalla cargada:', battleData);

      if (battleData) {
        setBattle(battleData);
        const questionsData = await battleApi.getBattleQuestions(battleId);
        console.log('✅ StudentBattleScreen: Preguntas cargadas:', questionsData.length);
        setQuestions(questionsData);

        if (questionsData.length > 0 && battleData.status === 'active') {
          const currentQ = questionsData[battleData.current_question_index];
          if (currentQ) {
            setCurrentQuestion(currentQ);
            setStartTime(Date.now());
            setHasAnswered(false);
            setSelectedAnswer(null);
          }
        }
      }
      await loadGroups();
      console.log('✅ StudentBattleScreen: Datos completos cargados');
    } catch (error) {
      console.error('❌ StudentBattleScreen: Error cargando datos:', error);
    }
  };

  const loadGroups = async () => {
    const groupsData = await battleApi.getBattleGroups(battleId);
    setGroups(groupsData);
    const myGroupData = groupsData.find(g => g.id === groupId);
    if (myGroupData) {
      setMyGroup(myGroupData);
    }
  };

  const handleAnswerSelect = async (answerIndex: number) => {
    if (hasAnswered || !currentQuestion) return;

    setSelectedAnswer(answerIndex);
    setHasAnswered(true);

    const responseTime = Date.now() - startTime;
    await battleApi.submitAnswer(
      battleId,
      groupId,
      currentQuestion.id,
      answerIndex,
      currentQuestion.correct_answer_index,
      responseTime
    );

    await loadGroups();
  };

  if (!battle) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  const isWaiting = battle.status === 'waiting';
  const isActive = battle.status === 'active';
  const isFinished = battle.status === 'finished';

  return (
    <div className="relative h-full overflow-y-auto bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <button
        onClick={onBack}
        className="absolute top-4 left-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 transition-colors shadow-lg"
        aria-label="Regresar"
      >
        <ion-icon name="arrow-back-outline" class="text-xl"></ion-icon>
      </button>

      <div className="p-6 space-y-6 pt-16">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">{battle.name}</h1>
          {myGroup && (
            <div className="mt-3 inline-block px-6 py-2 bg-gradient-to-r from-sky-500 to-blue-500 text-white rounded-full shadow-lg">
              <p className="font-bold text-lg">{myGroup.group_name}</p>
              <p className="text-sm opacity-90">Puntos: {myGroup.score}</p>
            </div>
          )}
        </div>

        {isWaiting && (
          <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl text-center">
            <div className="animate-pulse">
              <ion-icon name="hourglass-outline" class="text-6xl text-sky-500 mb-4"></ion-icon>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">Esperando Inicio</h2>
            <p className="text-slate-600 dark:text-slate-400">El maestro iniciará la batalla pronto...</p>
          </div>
        )}

        {isActive && currentQuestion && (
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                Pregunta {battle.current_question_index + 1} de {battle.question_count}
              </span>
              {!hasAnswered && (
                <div className="flex items-center space-x-2 text-orange-500">
                  <ion-icon name="time-outline" class="text-xl"></ion-icon>
                  <span className="font-bold">Responde</span>
                </div>
              )}
              {hasAnswered && (
                <div className="flex items-center space-x-2 text-green-500">
                  <ion-icon name="checkmark-circle" class="text-xl"></ion-icon>
                  <span className="font-bold">Respondido</span>
                </div>
              )}
            </div>

            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6">
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
                        ? 'bg-green-100 dark:bg-green-900/30 border-green-500 scale-105 shadow-lg'
                        : showResult && isSelected && !isCorrect
                        ? 'bg-red-100 dark:bg-red-900/30 border-red-500'
                        : showResult && isCorrect
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-400'
                        : 'bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600'
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
                      <span className="text-slate-800 dark:text-slate-100 flex-grow">
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

        {isFinished && (
          <div className="bg-gradient-to-br from-amber-400 to-orange-500 dark:from-amber-500 dark:to-orange-600 p-8 rounded-2xl shadow-xl text-white text-center">
            <ion-icon name="trophy" class="text-7xl mb-4"></ion-icon>
            <h2 className="text-3xl font-bold mb-2">Batalla Finalizada</h2>
            {myGroup && (
              <p className="text-xl opacity-90 mt-4">
                Puntuación Final: <span className="font-bold">{myGroup.score}</span>
              </p>
            )}
          </div>
        )}

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl">
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center">
            <ion-icon name="podium" class="text-2xl mr-2 text-amber-500"></ion-icon>
            Ranking en Vivo
          </h3>
          {groups.length === 0 ? (
            <p className="text-slate-500 dark:text-slate-400 text-center py-4">No hay grupos</p>
          ) : (
            <div className="space-y-2">
              {groups.map((group, idx) => (
                <div
                  key={group.id}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    group.id === groupId
                      ? 'bg-sky-100 dark:bg-sky-900/30 border-2 border-sky-500'
                      : idx === 0
                      ? 'bg-amber-50 dark:bg-amber-900/20'
                      : 'bg-slate-50 dark:bg-slate-700/30'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span
                      className={`text-lg font-bold ${
                        idx === 0
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-100">
                        {group.group_name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {group.correct_answers} correctas
                      </p>
                    </div>
                  </div>
                  <p className="text-xl font-bold text-sky-600 dark:text-sky-400">{group.score}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentBattleScreen;
