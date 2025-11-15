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

  getMe: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No user logged in');

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) throw error;
    return profile;
  },

  updateProfile: async (name?: string, avatar?: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No user logged in');

    const updates: any = {};
    if (name) updates.name = name;
    if (avatar) updates.avatar = avatar;

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  getStudents: async () => {
    const { data, error} = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'STUDENT')
      .order('points', { ascending: false });

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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

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

    if (battleError) throw battleError;

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

    if (groupsError) throw groupsError;

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

    if (questionsError) throw questionsError;

    return { battle };
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
    return data;
  },

  getBattle: async (battleId: string) => {
    const { data, error } = await supabase
      .from('battles')
      .select('*')
      .eq('id', battleId)
      .single();

    if (error) throw error;
    return data;
  },

  getBattleGroups: async (battleId: string) => {
    const { data, error } = await supabase
      .from('battle_groups')
      .select(`
        *,
        group_members (
          id,
          student_id,
          student_name,
          joined_at
        )
      `)
      .eq('battle_id', battleId)
      .order('score', { ascending: false });

    if (error) throw error;
    return data;
  },

  getBattleQuestions: async (battleId: string) => {
    const { data, error } = await supabase
      .from('battle_questions')
      .select('*')
      .eq('battle_id', battleId)
      .order('question_order', { ascending: true });

    if (error) throw error;
    return data;
  },

  getBattleAnswers: async (battleId: string) => {
    const { data, error } = await supabase
      .from('battle_answers')
      .select('*')
      .eq('battle_id', battleId)
      .order('answered_at', { ascending: true });

    if (error) throw error;
    return data;
  },

  joinGroup: async (groupCode: string, studentId: string, studentName: string) => {
    const { data: groups, error: groupError } = await supabase
      .from('battle_groups')
      .select('*, battles!inner(students_per_group, id)')
      .eq('group_code', groupCode);

    if (groupError || !groups || groups.length === 0) {
      throw new Error('Código de grupo inválido');
    }

    const group = groups[0];
    const battleId = group.battles.id;

    const { data: existingMember } = await supabase
      .from('group_members')
      .select('*, battle_groups!inner(battle_id)')
      .eq('student_id', studentId)
      .eq('battle_groups.battle_id', battleId)
      .maybeSingle();

    if (existingMember) {
      const { data: currentGroup } = await supabase
        .from('battle_groups')
        .select('*')
        .eq('id', existingMember.group_id)
        .single();

      return {
        group: currentGroup,
        message: 'Ya estás en un grupo de esta batalla'
      };
    }

    let targetGroup = group;

    if (group.is_full) {
      const { data: availableGroups } = await supabase
        .from('battle_groups')
        .select('*, battles!inner(students_per_group)')
        .eq('battle_id', battleId)
        .eq('is_full', false);

      if (!availableGroups || availableGroups.length === 0) {
        throw new Error('Todos los grupos están llenos');
      }

      targetGroup = availableGroups[Math.floor(Math.random() * availableGroups.length)];
    }

    const { error: insertError } = await supabase
      .from('group_members')
      .insert({
        group_id: targetGroup.id,
        student_id: studentId,
        student_name: studentName,
      });

    if (insertError) throw insertError;

    const { count } = await supabase
      .from('group_members')
      .select('*', { count: 'exact', head: true })
      .eq('group_id', targetGroup.id);

    if (count && count >= targetGroup.battles.students_per_group) {
      await supabase
        .from('battle_groups')
        .update({ is_full: true })
        .eq('id', targetGroup.id);
    }

    const { data: finalGroup } = await supabase
      .from('battle_groups')
      .select('*')
      .eq('id', targetGroup.id)
      .single();

    return {
      group: finalGroup,
      message: 'Te has unido al grupo exitosamente'
    };
  },

  submitAnswer: async (
    battleId: string,
    groupId: string,
    questionId: string,
    answerIndex: number,
    responseTimeMs: number
  ) => {
    const { data: question, error: questionError } = await supabase
      .from('battle_questions')
      .select('correct_answer_index')
      .eq('id', questionId)
      .single();

    if (questionError) throw new Error('Pregunta no encontrada');

    const isCorrect = answerIndex === question.correct_answer_index;

    const { error: insertError } = await supabase
      .from('battle_answers')
      .insert({
        battle_id: battleId,
        group_id: groupId,
        question_id: questionId,
        answer_index: answerIndex,
        is_correct: isCorrect,
        response_time_ms: responseTimeMs,
      });

    if (insertError) {
      if (insertError.code === '23505') {
        throw new Error('Este grupo ya respondió esta pregunta');
      }
      throw insertError;
    }

    if (isCorrect) {
      const { data: currentGroup } = await supabase
        .from('battle_groups')
        .select('score, correct_answers')
        .eq('id', groupId)
        .single();

      if (currentGroup) {
        await supabase
          .from('battle_groups')
          .update({
            score: currentGroup.score + 100,
            correct_answers: currentGroup.correct_answers + 1,
          })
          .eq('id', groupId);
      }
    }

    return { isCorrect, pointsEarned: isCorrect ? 100 : 0 };
  },

  startBattle: async (battleId: string) => {
    const { data, error } = await supabase
      .from('battles')
      .update({
        status: 'active',
        started_at: new Date().toISOString(),
      })
      .eq('id', battleId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  nextQuestion: async (battleId: string) => {
    const { data: battle, error: fetchError } = await supabase
      .from('battles')
      .select('current_round_index, round_count')
      .eq('id', battleId)
      .single();

    if (fetchError) throw fetchError;

    const nextIndex = (battle.current_round_index || 0) + 1;
    const isFinished = nextIndex >= battle.round_count;

    const updates: any = {
      current_round_index: nextIndex,
    };

    if (isFinished) {
      updates.status = 'finished';
      updates.finished_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('battles')
      .update(updates)
      .eq('id', battleId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  getGroupMembers: async (groupId: string) => {
    const { data, error } = await supabase
      .from('group_members')
      .select('*')
      .eq('group_id', groupId);

    if (error) throw error;
    return data;
  },
};
