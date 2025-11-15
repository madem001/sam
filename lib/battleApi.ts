export interface Battle {
  id: string;
  name: string;
  teacher_id: string;
  question_count: number;
  status: 'waiting' | 'active' | 'finished';
  current_question_index: number;
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

export interface BattleAnswer {
  id: string;
  battle_id: string;
  group_id: string;
  question_id: string;
  answer_index: number;
  is_correct: boolean;
  answered_at: string;
  response_time_ms?: number;
}

const mockBattles: Battle[] = [];
const mockGroups: BattleGroup[] = [];
const mockQuestions: BattleQuestion[] = [];
const mockMembers: GroupMember[] = [];
const mockAnswers: BattleAnswer[] = [];

const ANSWER_COLORS = [
  '#ef4444',
  '#3b82f6',
  '#22c55e',
  '#eab308',
];

const generateGroupCode = (): string => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

export const createBattle = async (
  teacherId: string,
  battleName: string,
  questionCount: number
): Promise<Battle | null> => {
  const battle: Battle = {
    id: `battle-${Date.now()}`,
    name: battleName,
    teacher_id: teacherId,
    question_count: questionCount,
    status: 'waiting',
    current_question_index: 0,
    created_at: new Date().toISOString(),
  };
  mockBattles.push(battle);
  return battle;
};

export const createBattleGroups = async (
  battleId: string,
  groupCount: number
): Promise<BattleGroup[]> => {
  const groups: BattleGroup[] = [];

  for (let i = 0; i < groupCount; i++) {
    const group: BattleGroup = {
      id: `group-${Date.now()}-${i}`,
      battle_id: battleId,
      group_code: generateGroupCode(),
      group_name: `Grupo ${i + 1}`,
      score: 0,
      correct_answers: 0,
      created_at: new Date().toISOString(),
    };
    groups.push(group);
    mockGroups.push(group);
  }

  return groups;
};

export const addBattleQuestions = async (
  battleId: string,
  questions: { text: string; answers: string[]; correctIndex: number }[]
): Promise<boolean> => {
  questions.forEach((q, index) => {
    const question: BattleQuestion = {
      id: `question-${Date.now()}-${index}`,
      battle_id: battleId,
      question_text: q.text,
      answers: q.answers.map((text, idx) => ({
        text,
        color: ANSWER_COLORS[idx % ANSWER_COLORS.length],
      })),
      correct_answer_index: q.correctIndex,
      question_order: index,
    };
    mockQuestions.push(question);
  });

  return true;
};

export const joinBattleGroup = async (
  groupCode: string,
  studentId: string,
  studentName: string
): Promise<{ success: boolean; group?: BattleGroup; message?: string }> => {
  const group = mockGroups.find(g => g.group_code === groupCode);

  if (!group) {
    return { success: false, message: 'Código de grupo inválido' };
  }

  const members = mockMembers.filter(m => m.group_id === group.id);

  if (members.length >= 4) {
    return { success: false, message: 'El grupo está lleno (máximo 4 estudiantes)' };
  }

  const alreadyJoined = members.some(m => m.student_id === studentId);
  if (alreadyJoined) {
    return { success: true, group, message: 'Ya estás en este grupo' };
  }

  const member: GroupMember = {
    id: `member-${Date.now()}`,
    group_id: group.id,
    student_id: studentId,
    student_name: studentName,
    joined_at: new Date().toISOString(),
  };
  mockMembers.push(member);

  return { success: true, group };
};

export const getBattleGroups = async (battleId: string): Promise<BattleGroup[]> => {
  return mockGroups
    .filter(g => g.battle_id === battleId)
    .sort((a, b) => b.score - a.score);
};

export const getGroupMembers = async (groupId: string): Promise<GroupMember[]> => {
  return mockMembers.filter(m => m.group_id === groupId);
};

export const getBattleQuestions = async (battleId: string): Promise<BattleQuestion[]> => {
  return mockQuestions
    .filter(q => q.battle_id === battleId)
    .sort((a, b) => a.question_order - b.question_order);
};

export const submitAnswer = async (
  battleId: string,
  groupId: string,
  questionId: string,
  answerIndex: number,
  correctIndex: number,
  responseTimeMs: number
): Promise<boolean> => {
  const isCorrect = answerIndex === correctIndex;

  const answer: BattleAnswer = {
    id: `answer-${Date.now()}`,
    battle_id: battleId,
    group_id: groupId,
    question_id: questionId,
    answer_index: answerIndex,
    is_correct: isCorrect,
    answered_at: new Date().toISOString(),
    response_time_ms: responseTimeMs,
  };
  mockAnswers.push(answer);

  if (isCorrect) {
    const group = mockGroups.find(g => g.id === groupId);
    if (group) {
      group.score += 100;
      group.correct_answers += 1;
    }
  }

  return true;
};

export const startBattle = async (battleId: string): Promise<boolean> => {
  const battle = mockBattles.find(b => b.id === battleId);
  if (battle) {
    battle.status = 'active';
    battle.started_at = new Date().toISOString();
    return true;
  }
  return false;
};

export const nextQuestion = async (battleId: string): Promise<boolean> => {
  const battle = mockBattles.find(b => b.id === battleId);
  if (!battle) return false;

  const nextIndex = battle.current_question_index + 1;
  const isFinished = nextIndex >= battle.question_count;

  battle.current_question_index = nextIndex;
  if (isFinished) {
    battle.status = 'finished';
    battle.finished_at = new Date().toISOString();
  }

  return true;
};

export const getBattleState = async (battleId: string): Promise<Battle | null> => {
  return mockBattles.find(b => b.id === battleId) || null;
};

export const getTeacherBattles = async (teacherId: string): Promise<Battle[]> => {
  return mockBattles
    .filter(b => b.teacher_id === teacherId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
};

export const subscribeToBattle = (
  battleId: string,
  callback: (payload: any) => void
) => {
  return {
    unsubscribe: () => {},
  };
};

export const subscribeToBattleGroups = (
  battleId: string,
  callback: (payload: any) => void
) => {
  return {
    unsubscribe: () => {},
  };
};
