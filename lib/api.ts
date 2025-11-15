import { supabase } from './supabase';

export const authApi = {
  register: async (email: string, password: string, name: string, role: 'STUDENT' | 'TEACHER') => {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) throw authError;

    if (authData.user) {
      await supabase.from('profiles').insert({
        id: authData.user.id,
        email,
        name,
        role,
      });
    }

    return { user: authData.user, session: authData.session };
  },

  login: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  },

  logout: async () => {
    await supabase.auth.signOut();
  },

  getCurrentUser: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  getProfile: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    return data;
  },
};

export const questionBankApi = {
  getQuestionSets: async () => {
    const { data } = await supabase
      .from('question_sets')
      .select('*')
      .order('created_at', { ascending: false });

    return data || [];
  },

  createQuestionSet: async (setName: string, description: string) => {
    const { data } = await supabase
      .from('question_sets')
      .insert({
        teacher_id: 'default-teacher',
        set_name: setName,
        description,
      })
      .select()
      .maybeSingle();

    return data;
  },

  getQuestionsBySet: async (setId: string) => {
    const { data } = await supabase
      .from('question_bank')
      .select('*')
      .eq('set_id', setId)
      .order('created_at', { ascending: false });

    return data || [];
  },

  createQuestion: async (
    setId: string,
    questionText: string,
    answers: string[],
    correctIndex: number,
    category?: string,
    difficulty?: string
  ) => {
    const { data } = await supabase
      .from('question_bank')
      .insert({
        teacher_id: 'default-teacher',
        set_id: setId,
        question_text: questionText,
        answers,
        correct_answer_index: correctIndex,
        category,
        difficulty,
      })
      .select()
      .maybeSingle();

    return data;
  },

  deleteQuestion: async (questionId: string) => {
    await supabase.from('question_bank').delete().eq('id', questionId);
  },

  updateQuestion: async (
    questionId: string,
    questionText: string,
    answers: string[],
    correctIndex: number
  ) => {
    const { data } = await supabase
      .from('question_bank')
      .update({
        question_text: questionText,
        answers,
        correct_answer_index: correctIndex,
        updated_at: new Date().toISOString(),
      })
      .eq('id', questionId)
      .select()
      .maybeSingle();

    return data;
  },
};

const generateGroupCode = (): string => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

const generateCode = (): string => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

export const battleApi = {
  createBattle: async (
    name: string,
    roundCount: number,
    groupCount: number,
    questions: { text: string; answers: string[]; correctIndex: number }[],
    studentsPerGroup?: number
  ) => {
    console.log('🚀 Creando batalla:', name);

    const battleCode = generateCode();

    const { data: battle } = await supabase
      .from('battles')
      .insert({
        name,
        teacher_id: 'default-teacher',
        question_count: roundCount,
        battle_code: battleCode,
        students_per_group: studentsPerGroup || 4,
        status: 'waiting',
        current_question_index: 0,
      })
      .select()
      .maybeSingle();

    if (!battle) throw new Error('No se pudo crear batalla');

    console.log('✅ Batalla creada:', battle.id);

    const groupsData = Array.from({ length: groupCount }, (_, i) => ({
      battle_id: battle.id,
      group_code: generateCode(),
      group_name: `Grupo ${i + 1}`,
      score: 0,
      correct_answers: 0,
      is_full: false,
    }));

    await supabase.from('battle_groups').insert(groupsData);

    console.log('✅ Grupos creados:', groupCount);

    const COLORS = ['#ef4444', '#3b82f6', '#22c55e', '#eab308'];
    const questionsData = questions.map((q, index) => ({
      battle_id: battle.id,
      question_text: q.text,
      answers: q.answers.map((text, idx) => ({
        text,
        color: COLORS[idx % COLORS.length],
      })),
      correct_answer_index: q.correctIndex,
      question_order: index,
    }));

    await supabase.from('battle_questions').insert(questionsData);

    console.log('✅ Preguntas creadas:', questions.length);
    console.log('🎉 BATALLA LISTA');

    return { battle };
  },

  getTeacherBattles: async () => {
    const { data } = await supabase
      .from('battles')
      .select(`
        *,
        battle_groups (
          id,
          group_code,
          group_name,
          score,
          correct_answers,
          is_full
        )
      `)
      .order('created_at', { ascending: false });

    return data || [];
  },

  getBattle: async (battleId: string) => {
    const { data } = await supabase
      .from('battles')
      .select(`
        *,
        battle_groups (
          id,
          group_code,
          group_name,
          score,
          correct_answers,
          is_full,
          group_members (
            id,
            student_id,
            student_name
          )
        ),
        battle_questions (
          id,
          question_text,
          answers,
          correct_answer_index,
          question_order
        )
      `)
      .eq('id', battleId)
      .maybeSingle();

    return data;
  },

  updateBattleStatus: async (battleId: string, status: string) => {
    const { data } = await supabase
      .from('battles')
      .update({ status })
      .eq('id', battleId)
      .select()
      .maybeSingle();

    return data;
  },

  getBattleByCode: async (battleCode: string) => {
    const { data } = await supabase
      .from('battles')
      .select(`
        *,
        battle_groups (
          id,
          group_code,
          group_name,
          is_full
        )
      `)
      .eq('battle_code', battleCode.toUpperCase())
      .maybeSingle();

    return data;
  },

  joinBattleWithCode: async (battleCode: string, studentId: string, studentName: string) => {
    console.log('Buscando batalla con código:', battleCode);

    const { data: battle } = await supabase
      .from('battles')
      .select('*')
      .eq('battle_code', battleCode.toUpperCase())
      .maybeSingle();

    if (!battle) {
      console.log('Batalla no encontrada');
      throw new Error('Batalla no encontrada');
    }

    console.log('Batalla encontrada:', battle);

    const { data: groups } = await supabase
      .from('battle_groups')
      .select('*, group_members(*)')
      .eq('battle_id', battle.id)
      .eq('is_full', false);

    if (!groups || groups.length === 0) {
      throw new Error('No hay grupos disponibles');
    }

    console.log('Grupos disponibles:', groups.length);

    const availableGroup = groups.find(g =>
      (g.group_members?.length || 0) < battle.students_per_group
    ) || groups[0];

    console.log('Grupo seleccionado:', availableGroup.group_name);

    await supabase.from('group_members').insert({
      group_id: availableGroup.id,
      student_id: studentId,
      student_name: studentName,
    });

    const { data: updatedMembers } = await supabase
      .from('group_members')
      .select('*')
      .eq('group_id', availableGroup.id);

    if (updatedMembers && updatedMembers.length >= battle.students_per_group) {
      await supabase
        .from('battle_groups')
        .update({ is_full: true })
        .eq('id', availableGroup.id);
    }

    return { group: availableGroup, battle };
  },

  joinGroup: async (groupCode: string, studentId: string, studentName: string) => {
    const { data: group } = await supabase
      .from('battle_groups')
      .select('*')
      .eq('group_code', groupCode.toUpperCase())
      .maybeSingle();

    if (!group) throw new Error('Grupo no encontrado');
    if (group.is_full) throw new Error('Grupo lleno');

    await supabase.from('group_members').insert({
      group_id: group.id,
      student_id: studentId,
      student_name: studentName,
    });

    const { data: members } = await supabase
      .from('group_members')
      .select('*')
      .eq('group_id', group.id);

    const { data: battle } = await supabase
      .from('battles')
      .select('students_per_group')
      .eq('id', group.battle_id)
      .maybeSingle();

    if (members && battle && members.length >= battle.students_per_group) {
      await supabase
        .from('battle_groups')
        .update({ is_full: true })
        .eq('id', group.id);
    }

    return group;
  },
};

export default {
  auth: authApi,
  questionBank: questionBankApi,
  battle: battleApi,
};
