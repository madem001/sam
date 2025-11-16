import { battleApi as api } from './api';
import { supabase } from './supabase';

export interface Battle {
  id: string;
  name: string;
  teacher_id: string;
  question_count: number;
  battle_code?: string;
  status: 'waiting' | 'active' | 'finished';
  current_question_index: number;
  question_time_limit: number;
  question_started_at?: string;
  created_at: string;
  started_at?: string;
  finished_at?: string;
}

export interface BattleGroup {
  id: string;
  battle_id: string;
  group_code: string;
  group_name: string;
  score: number;
  correct_answers: number;
  wrong_answers: number;
  is_eliminated: boolean;
  current_question_index: number;
  created_at: string;
}

export interface BattleQuestion {
  id: string;
  battle_id: string;
  question_text: string;
  answers: { text: string; color: string }[];
  correct_answer_index: number;
  question_order: number;
}

export interface GroupMember {
  id: string;
  group_id: string;
  student_id: string;
  student_name: string;
  joined_at: string;
}

const mapBattleFromAPI = (data: any): Battle => ({
  id: data.id,
  name: data.name,
  teacher_id: data.teacher_id || data.teacherId,
  question_count: data.question_count || data.roundCount || data.questionCount,
  battle_code: data.battle_code,
  status: data.status.toLowerCase(),
  current_question_index: data.current_question_index !== undefined ? data.current_question_index : (data.currentRoundIndex !== undefined ? data.currentRoundIndex : data.currentQuestionIndex),
  question_time_limit: data.question_time_limit || 60,
  question_started_at: data.question_started_at,
  created_at: data.created_at || data.createdAt,
  started_at: data.started_at || data.startedAt,
  finished_at: data.finished_at || data.finishedAt,
});

const mapGroupFromAPI = (data: any): BattleGroup => ({
  id: data.id,
  battle_id: data.battle_id || data.battleId,
  group_code: data.group_code || data.groupCode,
  group_name: data.group_name || data.groupName,
  score: data.score,
  correct_answers: data.correct_answers || data.correctAnswers,
  wrong_answers: data.wrong_answers || 0,
  is_eliminated: data.is_eliminated || false,
  current_question_index: data.current_question_index || 0,
  created_at: data.created_at || data.createdAt,
});

const mapQuestionFromAPI = (data: any): BattleQuestion => ({
  id: data.id,
  battle_id: data.battle_id || data.battleId,
  question_text: data.question_text || data.questionText,
  answers: data.answers,
  correct_answer_index: data.correct_answer_index || data.correctAnswerIndex,
  question_order: data.question_order || data.questionOrder,
});

export const createBattle = async (
  teacherId: string,
  battleName: string,
  questionCount: number
): Promise<Battle | null> => {
  try {
    const result = await api.createBattle(battleName, questionCount, 0, []);
    return mapBattleFromAPI(result.battle);
  } catch (error) {
    console.error('Error creating battle:', error);
    return null;
  }
};

export const createBattleGroups = async (
  battleId: string,
  groupCount: number
): Promise<BattleGroup[]> => {
  return [];
};

export const addBattleQuestions = async (
  battleId: string,
  questions: { text: string; answers: string[]; correctIndex: number }[]
): Promise<boolean> => {
  return true;
};

export const createFullBattle = async (
  teacherId: string,
  battleName: string,
  questionCount: number,
  groupCount: number,
  questions: { text: string; answers: string[]; correctIndex: number }[],
  studentsPerGroup?: number
): Promise<{ battle: Battle; groups: BattleGroup[] } | null> => {
  try {
    console.log('🎯 createFullBattle llamado con:', { battleName, questionCount, groupCount, questionsLength: questions.length });

    const result = await api.createBattle(battleName, questionCount, groupCount, questions, studentsPerGroup);

    console.log('📦 Resultado de api.createBattle:', result);

    if (!result || !result.battle) {
      console.error('❌ No se recibió batalla del API');
      throw new Error('La API no retornó una batalla válida');
    }

    const battle = mapBattleFromAPI(result.battle);
    console.log('✅ Batalla mapeada:', battle);

    const groups = await getBattleGroups(battle.id);
    console.log('✅ Grupos obtenidos:', groups.length);

    return { battle, groups };
  } catch (error: any) {
    console.error('💥 Error en createFullBattle:', error);
    console.error('Stack trace:', error.stack);
    throw error;
  }
};

export const joinBattleWithCode = async (
  battleCode: string,
  studentId: string,
  studentName: string
): Promise<{ success: boolean; group?: BattleGroup; battle?: Battle; message?: string }> => {
  try {
    const result = await api.joinBattleWithCode(battleCode, studentId, studentName);
    return {
      success: true,
      group: mapGroupFromAPI(result.group),
      battle: mapBattleFromAPI(result.battle),
    };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

export const joinBattleGroup = async (
  groupCode: string,
  studentId: string,
  studentName: string
): Promise<{ success: boolean; group?: BattleGroup; message?: string }> => {
  try {
    const result = await api.joinGroup(groupCode, studentId, studentName);
    return {
      success: true,
      group: mapGroupFromAPI(result.group),
      message: result.message
    };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

export const getBattleGroups = async (battleId: string): Promise<BattleGroup[]> => {
  try {
    const groups = await api.getBattleGroups(battleId);
    return groups.map(mapGroupFromAPI);
  } catch (error) {
    console.error('Error getting battle groups:', error);
    return [];
  }
};

export const getGroupMembers = async (groupId: string): Promise<GroupMember[]> => {
  try {
    const members = await api.getGroupMembers(groupId);
    return members.map((m: any) => ({
      id: m.id,
      group_id: m.group_id || m.groupId,
      student_id: m.student_id || m.studentId,
      student_name: m.student_name || m.studentName,
      joined_at: m.joined_at || m.joinedAt,
    }));
  } catch (error) {
    console.error('Error getting group members:', error);
    return [];
  }
};

export const getBattleQuestions = async (battleId: string): Promise<BattleQuestion[]> => {
  try {
    const questions = await api.getBattleQuestions(battleId);
    return questions.map(mapQuestionFromAPI);
  } catch (error) {
    console.error('Error getting battle questions:', error);
    return [];
  }
};

export const submitAnswer = async (
  battleId: string,
  groupId: string,
  questionId: string,
  answerIndex: number,
  correctIndex: number,
  responseTimeMs: number
): Promise<boolean> => {
  try {
    await api.submitAnswer(battleId, groupId, questionId, answerIndex, correctIndex, responseTimeMs);
    return true;
  } catch (error) {
    console.error('Error submitting answer:', error);
    return false;
  }
};

export const startBattle = async (battleId: string): Promise<boolean> => {
  try {
    await api.startBattle(battleId);
    return true;
  } catch (error) {
    console.error('Error starting battle:', error);
    return false;
  }
};

export const nextQuestion = async (battleId: string): Promise<boolean> => {
  try {
    await api.nextQuestion(battleId);
    return true;
  } catch (error) {
    console.error('Error advancing question:', error);
    return false;
  }
};

export const nextQuestionForGroup = async (groupId: string, battleId: string): Promise<boolean> => {
  try {
    await api.nextQuestionForGroup(groupId, battleId);
    return true;
  } catch (error) {
    console.error('Error advancing group question:', error);
    return false;
  }
};

export const restartBattle = async (battleId: string): Promise<boolean> => {
  try {
    await api.restartBattle(battleId);
    return true;
  } catch (error) {
    console.error('Error restarting battle:', error);
    return false;
  }
};

export const getBattleState = async (battleId: string): Promise<Battle | null> => {
  try {
    const battle = await api.getBattleState(battleId);
    if (!battle) return null;
    return mapBattleFromAPI(battle);
  } catch (error) {
    console.error('Error getting battle state:', error);
    return null;
  }
};

export const getTeacherBattles = async (teacherId: string): Promise<Battle[]> => {
  try {
    const battles = await api.getTeacherBattles();
    return battles.map(mapBattleFromAPI);
  } catch (error) {
    console.error('Error getting teacher battles:', error);
    return [];
  }
};

export const subscribeToBattle = (battleId: string, callback: (payload: any) => void) => {
  const channel = supabase
    .channel(`battle:${battleId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'battles',
        filter: `id=eq.${battleId}`,
      },
      (payload) => {
        callback(payload);
      }
    )
    .subscribe();

  return {
    unsubscribe: () => {
      channel.unsubscribe();
    },
  };
};

export const subscribeToBattleGroups = (battleId: string, callback: (payload: any) => void) => {
  const channel = supabase
    .channel(`battle_groups:${battleId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'battle_groups',
        filter: `battle_id=eq.${battleId}`,
      },
      (payload) => {
        callback(payload);
      }
    )
    .subscribe();

  return {
    unsubscribe: () => {
      channel.unsubscribe();
    },
  };
};
