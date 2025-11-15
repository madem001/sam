import { supabase } from './supabase';

export const authApi = {
  register: async (email: string, password: string, name: string, role: 'STUDENT' | 'TEACHER') => {
    console.log('📝 Registrando en Supabase:', { email, name, role });

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: undefined,
      }
    });

    console.log('📝 Respuesta de Supabase signUp:', { authData, authError });

    if (authError) {
      console.error('❌ Error en signUp:', authError);
      throw authError;
    }

    if (!authData.user) {
      console.error('❌ No se obtuvo usuario de signUp');
      throw new Error('No se pudo crear el usuario');
    }

    console.log('📝 Creando perfil para usuario:', authData.user.id);

    const { error: profileError } = await supabase.from('profiles').insert({
      id: authData.user.id,
      email,
      name,
      role,
    });

    if (profileError) {
      console.error('❌ Error creando perfil:', profileError);
      throw profileError;
    }

    console.log('✅ Perfil creado exitosamente');
    console.log('✅ Registro completo - user:', authData.user.email, 'session:', !!authData.session);

    return { user: authData.user, session: authData.session };
  },

  login: async (email: string, password: string) => {
    console.log('🔐 Intentando login con email:', email);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    console.log('🔐 Respuesta de signInWithPassword:', { data, error });

    if (error) {
      console.error('❌ Error en login:', error.message);
      throw error;
    }

    console.log('✅ Login exitoso, usuario:', data.user?.email);
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
    console.log('👤 getProfile - Obteniendo usuario actual');

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError) {
      console.error('❌ Error obteniendo usuario:', userError);
      return null;
    }

    if (!user) {
      console.log('❌ No hay usuario autenticado');
      return null;
    }

    console.log('👤 Usuario autenticado:', user.email, 'ID:', user.id);

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (error) {
      console.error('❌ Error obteniendo perfil:', error);
      return null;
    }

    console.log('✅ Perfil obtenido:', data);
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
    console.log('🔍 getBattle llamado para:', battleId);

    const { data, error } = await supabase
      .from('battles')
      .select('*')
      .eq('id', battleId)
      .maybeSingle();

    if (error) {
      console.error('❌ Error obteniendo batalla:', error);
      throw error;
    }

    console.log('✅ Batalla obtenida:', data?.name);
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
    console.log('🔍 Buscando batalla con código:', battleCode);

    const { data: battle, error: battleError } = await supabase
      .from('battles')
      .select('*')
      .eq('battle_code', battleCode.toUpperCase())
      .maybeSingle();

    console.log('Battle query result:', { battle, battleError });

    if (battleError || !battle) {
      console.log('❌ Batalla no encontrada');
      throw new Error('Batalla no encontrada');
    }

    console.log('✅ Batalla encontrada:', battle.name, 'ID:', battle.id);

    const { data: allGroups, error: groupsError } = await supabase
      .from('battle_groups')
      .select('*')
      .eq('battle_id', battle.id);

    console.log('Groups query result:', { allGroups, groupsError });

    if (groupsError || !allGroups || allGroups.length === 0) {
      console.log('❌ No hay grupos en esta batalla');
      throw new Error('No hay grupos disponibles');
    }

    console.log('📊 Grupos encontrados:', allGroups.length);

    let selectedGroup = null;

    for (const group of allGroups) {
      if (group.is_full) {
        console.log(`⛔ Grupo ${group.group_name} está lleno`);
        continue;
      }

      const { data: members } = await supabase
        .from('group_members')
        .select('*')
        .eq('group_id', group.id);

      const memberCount = members?.length || 0;
      console.log(`👥 Grupo ${group.group_name}: ${memberCount}/${battle.students_per_group} miembros`);

      if (memberCount < battle.students_per_group) {
        selectedGroup = group;
        break;
      }
    }

    if (!selectedGroup) {
      selectedGroup = allGroups[0];
      console.log('⚠️ Usando primer grupo por defecto:', selectedGroup.group_name);
    } else {
      console.log('✅ Grupo seleccionado:', selectedGroup.group_name);
    }

    const { error: insertError } = await supabase.from('group_members').insert({
      group_id: selectedGroup.id,
      student_id: studentId,
      student_name: studentName,
    });

    if (insertError) {
      console.error('❌ Error insertando miembro:', insertError);
      throw new Error('No se pudo unir al grupo');
    }

    const { data: updatedMembers } = await supabase
      .from('group_members')
      .select('*')
      .eq('group_id', selectedGroup.id);

    if (updatedMembers && updatedMembers.length >= battle.students_per_group) {
      console.log('🔒 Marcando grupo como lleno');
      await supabase
        .from('battle_groups')
        .update({ is_full: true })
        .eq('id', selectedGroup.id);
    }

    return { group: selectedGroup, battle };
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
