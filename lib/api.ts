import { supabase } from './supabase';

export const authApi = {
  register: async (email: string, password: string, name: string, role: 'STUDENT' | 'TEACHER') => {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role,
        },
      },
    });

    if (authError) throw authError;

    if (authData.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email,
          name,
          role,
        });

      if (profileError && profileError.code !== '23505') {
        throw profileError;
      }
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
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  getCurrentUser: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  getProfile: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) throw error;
    return data;
  },
};

export const questionBankApi = {
  getQuestionSets: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('question_sets')
      .select('*')
      .eq('teacher_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  createQuestionSet: async (setName: string, description: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('question_sets')
      .insert({
        teacher_id: user.id,
        set_name: setName,
        description,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  getQuestionsBySet: async (setId: string) => {
    const { data, error } = await supabase
      .from('question_bank')
      .select('*')
      .eq('set_id', setId)
      .order('created_at', { ascending: false });

    if (error) throw error;
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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('question_bank')
      .insert({
        teacher_id: user.id,
        set_id: setId,
        question_text: questionText,
        answers,
        correct_answer_index: correctIndex,
        category,
        difficulty,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  deleteQuestion: async (questionId: string) => {
    const { error } = await supabase
      .from('question_bank')
      .delete()
      .eq('id', questionId);

    if (error) throw error;
  },

  updateQuestion: async (
    questionId: string,
    questionText: string,
    answers: string[],
    correctIndex: number
  ) => {
    const { data, error } = await supabase
      .from('question_bank')
      .update({
        question_text: questionText,
        answers,
        correct_answer_index: correctIndex,
        updated_at: new Date().toISOString(),
      })
      .eq('id', questionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

const generateGroupCode = (): string => {
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
    try {
      console.log('🚀 CREANDO BATALLA:', { name, roundCount, groupCount, questionsCount: questions.length });

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('No autenticado');
      }

      console.log('✅ Usuario:', user.id);

      const battleCode = Math.random().toString(36).substring(2, 8).toUpperCase();

      const { data: battle, error: battleError } = await supabase
        .from('battles')
        .insert({
          name,
          teacher_id: user.id,
          question_count: roundCount,
          battle_code: battleCode,
          students_per_group: studentsPerGroup || 4,
          status: 'waiting',
          current_question_index: 0,
        })
        .select()
        .single();

      if (battleError) {
        console.error('❌ Error batalla:', battleError);
        throw battleError;
      }

      console.log('✅ Batalla creada:', battle.id);

      const groupsData = Array.from({ length: groupCount }, (_, i) => ({
        battle_id: battle.id,
        group_code: generateGroupCode(),
        group_name: `Grupo ${i + 1}`,
        score: 0,
        correct_answers: 0,
        is_full: false,
      }));

      const { error: groupsError } = await supabase
        .from('battle_groups')
        .insert(groupsData);

      if (groupsError) {
        console.error('❌ Error grupos:', groupsError);
        throw groupsError;
      }

      console.log('✅ Grupos creados');

      const ANSWER_COLORS = ['#ef4444', '#3b82f6', '#22c55e', '#eab308'];
      const questionsData = questions.map((q, index) => ({
        battle_id: battle.id,
        question_text: q.text,
        answers: q.answers.map((text, idx) => ({
          text,
          color: ANSWER_COLORS[idx % ANSWER_COLORS.length],
        })),
        correct_answer_index: q.correctIndex,
        question_order: index,
      }));

      const { error: questionsError } = await supabase
        .from('battle_questions')
        .insert(questionsData);

      if (questionsError) {
        console.error('❌ Error preguntas:', questionsError);
        throw questionsError;
      }

      console.log('✅ Preguntas creadas');
      console.log('🎉 BATALLA COMPLETA');

      return { battle };
    } catch (error: any) {
      console.error('💥 ERROR TOTAL:', error);
      throw error;
    }
  },

  getTeacherBattles: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
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
      .eq('teacher_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  getBattle: async (battleId: string) => {
    const { data, error } = await supabase
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
      .single();

    if (error) throw error;
    return data;
  },

  updateBattleStatus: async (battleId: string, status: string) => {
    const { data, error } = await supabase
      .from('battles')
      .update({ status })
      .eq('id', battleId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  getBattleByCode: async (battleCode: string) => {
    const { data, error } = await supabase
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
      .single();

    if (error) throw error;
    return data;
  },

  joinGroup: async (groupCode: string, studentId: string, studentName: string) => {
    const { data: group, error: groupError } = await supabase
      .from('battle_groups')
      .select('*')
      .eq('group_code', groupCode.toUpperCase())
      .single();

    if (groupError) throw groupError;
    if (group.is_full) throw new Error('El grupo está lleno');

    const { error: memberError } = await supabase
      .from('group_members')
      .insert({
        group_id: group.id,
        student_id: studentId,
        student_name: studentName,
      });

    if (memberError) throw memberError;

    const { data: members } = await supabase
      .from('group_members')
      .select('*')
      .eq('group_id', group.id);

    const { data: battle } = await supabase
      .from('battles')
      .select('students_per_group')
      .eq('id', group.battle_id)
      .single();

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
