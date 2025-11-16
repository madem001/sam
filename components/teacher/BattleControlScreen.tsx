import React, { useState, useEffect } from 'react';
import * as battleApi from '../../lib/battleApi';
import { supabase } from '../../lib/supabase';

interface BattleControlScreenProps {
  battleId: string;
  onBack: () => void;
}

const BattleControlScreen: React.FC<BattleControlScreenProps> = ({ battleId, onBack }) => {
  const [battle, setBattle] = useState<battleApi.Battle | null>(null);
  const [groups, setGroups] = useState<battleApi.BattleGroup[]>([]);
  const [questions, setQuestions] = useState<battleApi.BattleQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<battleApi.BattleQuestion | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdvancing, setIsAdvancing] = useState(false);

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
    const battleData = await battleApi.getBattleState(battleId);
    if (battleData) {
      setBattle(battleData);
      const questionsData = await battleApi.getBattleQuestions(battleId);
      setQuestions(questionsData);
      if (questionsData.length > 0) {
        setCurrentQuestion(questionsData[battleData.current_question_index] || null);
      }
    }
    await loadGroups();
    setIsLoading(false);
  };

  const loadGroups = async () => {
    const groupsData = await battleApi.getBattleGroups(battleId);
    setGroups(groupsData);
  };

  const handleStartBattle = async () => {
    console.log('🎮 [TEACHER] Iniciando batalla:', battleId);
    const success = await battleApi.startBattle(battleId);
    if (success) {
      console.log('✅ [TEACHER] Batalla iniciada exitosamente');
      await loadBattleData();
    } else {
      console.error('❌ [TEACHER] Error al iniciar batalla');
      alert('Error al iniciar la batalla');
    }
  };

  const handleNextQuestion = async () => {
    try {
      console.log('⏭️ [CONTROL] Avanzando a siguiente pregunta...');
      const success = await battleApi.nextQuestion(battleId);
      if (success) {
        console.log('✅ [CONTROL] Pregunta avanzada exitosamente');
        await loadBattleData();
      } else {
        console.error('❌ [CONTROL] Error al avanzar pregunta');
        alert('Error al avanzar a la siguiente pregunta');
      }
    } catch (error) {
      console.error('❌ [CONTROL] Error en handleNextQuestion:', error);
      alert('Error al avanzar a la siguiente pregunta');
    }
  };

  const isWaiting = battle?.status === 'waiting';
  const isActive = battle?.status === 'active';
  const isFinished = battle?.status === 'finished';

  useEffect(() => {
    if (!battle || !isActive || !currentQuestion || isAdvancing) return;

    const checkAutoAdvance = async () => {
      try {
        const totalGroups = groups.length;
        if (totalGroups === 0) return;

        const { data: answers, error } = await supabase
          .from('battle_answers')
          .select('group_id')
          .eq('battle_id', battleId)
          .eq('question_id', currentQuestion.id);

        if (error) {
          console.error('❌ [AUTO-ADVANCE] Error consultando respuestas:', error);
          return;
        }

        const uniqueGroupsAnswered = new Set(answers?.map(a => a.group_id) || []).size;

        if (uniqueGroupsAnswered >= totalGroups && !isAdvancing) {
          console.log('🎯 [AUTO-ADVANCE] ¡Todos respondieron! Avanzando en 2 segundos...');
          setIsAdvancing(true);

          setTimeout(async () => {
            console.log('⏭️ [AUTO-ADVANCE] Avanzando automáticamente...');
            await handleNextQuestion();
            setIsAdvancing(false);
          }, 2000);
        }
      } catch (error) {
        console.error('❌ [AUTO-ADVANCE] Error en checkAutoAdvance:', error);
      }
    };

    const interval = setInterval(checkAutoAdvance, 1500);

    return () => clearInterval(interval);
  }, [battle, isActive, currentQuestion, groups, battleId, isAdvancing]);

  if (isLoading || !battle) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  return (
    <div className="relative h-full overflow-y-auto">
      <button
        onClick={onBack}
        className="absolute top-0 left-0 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-slate-200/50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
        aria-label="Regresar"
      >
        <ion-icon name="arrow-back-outline" class="text-xl"></ion-icon>
      </button>

      <div className="p-2 space-y-6">
        <div className="text-center pt-10">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">{battle.name}</h1>
          <div className="flex items-center justify-center space-x-2 mt-2">
            <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
              isWaiting ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300' :
              isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' :
              'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
            }`}>
              {isWaiting ? 'Esperando' : isActive ? 'En Curso' : 'Finalizada'}
            </span>
            <span className="text-slate-500 dark:text-slate-400">
              Pregunta {battle.current_question_index + 1} de {battle.question_count}
            </span>
          </div>
        </div>

        <div className="bg-gradient-to-r from-sky-500 to-blue-600 p-6 rounded-xl shadow-lg text-white text-center">
          <p className="text-sm font-semibold mb-2 opacity-90">CÓDIGO DE BATALLA</p>
          <p className="text-4xl font-black tracking-wider mb-1">{(battle as any).battle_code || 'N/A'}</p>
          <p className="text-xs opacity-75">Los estudiantes usan este código para unirse</p>
        </div>

        {isWaiting && (
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 text-center">
            <p className="text-slate-600 dark:text-slate-400 mb-4">La batalla está lista. Los estudiantes pueden unirse con sus códigos de grupo.</p>
            <button
              onClick={handleStartBattle}
              className="px-8 py-3 bg-green-500 text-white font-bold rounded-lg shadow-md hover:bg-green-600 transition-colors"
            >
              <ion-icon name="play-outline" class="mr-2"></ion-icon>
              Iniciar Batalla
            </button>
          </div>
        )}

        {isActive && currentQuestion && (
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">Pregunta Actual</h2>
            <p className="text-lg text-slate-700 dark:text-slate-300 mb-4">{currentQuestion.question_text}</p>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {currentQuestion.answers.map((answer, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg border-2 flex items-center space-x-2"
                  style={{ borderColor: answer.color, backgroundColor: `${answer.color}15` }}
                >
                  <div className="w-6 h-6 rounded-full" style={{ backgroundColor: answer.color }}></div>
                  <span className="text-slate-700 dark:text-slate-200 font-medium">{answer.text}</span>
                  {idx === currentQuestion.correct_answer_index && (
                    <ion-icon name="checkmark-circle" class="text-green-500 text-xl ml-auto"></ion-icon>
                  )}
                </div>
              ))}
            </div>
            <div className="bg-gradient-to-r from-sky-100 to-blue-100 dark:from-sky-900/30 dark:to-blue-900/30 p-4 rounded-lg border-2 border-sky-300 dark:border-sky-700">
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-pulse">
                  <ion-icon name="hourglass-outline" class="text-2xl text-sky-600 dark:text-sky-400"></ion-icon>
                </div>
                <p className="text-sky-800 dark:text-sky-300 font-semibold">
                  Esperando respuestas de los estudiantes...
                </p>
              </div>
              <p className="text-sm text-sky-700 dark:text-sky-400 text-center mt-2">
                La pregunta avanzará automáticamente cuando todos respondan
              </p>
            </div>
          </div>
        )}

        {isFinished && (
          <div className="bg-gradient-to-br from-green-400 to-teal-500 dark:from-green-500 dark:to-teal-600 p-6 rounded-xl shadow-lg text-white text-center">
            <ion-icon name="trophy" class="text-6xl mb-2"></ion-icon>
            <h2 className="text-2xl font-bold">Batalla Finalizada</h2>
            <p className="mt-2 opacity-90">Revisa el ranking final a continuación</p>
          </div>
        )}

        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">Ranking de Grupos</h2>
          {groups.length === 0 ? (
            <p className="text-slate-500 dark:text-slate-400 text-center py-4">No hay grupos registrados</p>
          ) : (
            <div className="space-y-3">
              {groups.map((group, idx) => (
                <div
                  key={group.id}
                  className={`flex items-center justify-between p-4 rounded-lg ${
                    idx === 0 ? 'bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-400' :
                    idx === 1 ? 'bg-slate-50 dark:bg-slate-700/50 border-2 border-slate-400' :
                    idx === 2 ? 'bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-400' :
                    'bg-slate-50 dark:bg-slate-700/30 border border-slate-200 dark:border-slate-600'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`text-2xl font-bold ${
                      idx === 0 ? 'text-amber-600 dark:text-amber-400' :
                      idx === 1 ? 'text-slate-600 dark:text-slate-400' :
                      idx === 2 ? 'text-orange-600 dark:text-orange-400' :
                      'text-slate-500 dark:text-slate-400'
                    }`}>
                      {idx + 1}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-100">{group.group_name}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Código: {group.group_code}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-sky-600 dark:text-sky-400">{group.score}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{group.correct_answers} correctas</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BattleControlScreen;
