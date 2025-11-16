import { supabase } from './supabase';

export const authApi = {
  register: async (email: string, password: string, name: string, role: 'STUDENT' | 'TEACHER', avatar?: string) => {
    console.log('📝 Registrando en Supabase:', { email, name, role, avatar });

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

    const defaultAvatar = avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=3b82f6&color=fff&bold=true&size=128`;

    const { error: profileError } = await supabase.from('profiles').insert({
      id: authData.user.id,
      email,
      name,
      role,
      avatar: defaultAvatar,
    });

    if (profileError) {
      console.error('❌ Error creando perfil:', profileError);
      throw profileError;
    }

    console.log('✅ Perfil creado exitosamente con avatar:', defaultAvatar);
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

    if (data && data.avatar_base64) {
      data.avatar = data.avatar_base64;
    }

    console.log('✅ Perfil obtenido:', data);
    return data;
  },

  updateProfile: async (userId: string, updates: {
    name?: string;
    avatar?: string;
    subjects?: string[];
    skills?: string[];
    cycles?: string[];
  }) => {
    console.log('✏️ Actualizando perfil:', userId, updates);

    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.avatar !== undefined) {
      updateData.avatar = updates.avatar;
      if (updates.avatar.startsWith('data:image')) {
        updateData.avatar_base64 = updates.avatar;
      }
    }
    if (updates.subjects !== undefined) updateData.subjects = updates.subjects;
    if (updates.skills !== undefined) updateData.skills = updates.skills;
    if (updates.cycles !== undefined) updateData.cycles = updates.cycles;

    const { error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', userId);

    if (error) {
      console.error('❌ Error actualizando perfil:', error);
      throw error;
    }

    console.log('✅ Perfil actualizado exitosamente');
  },
};

export const professorCardsApi = {
  getStudentCards: async (studentId: string) => {
    console.log('🎴 Obteniendo cartas para estudiante:', studentId);

    const { data, error } = await supabase
      .from('student_professor_cards')
      .select(`
        id,
        unlocked,
        unlocked_at,
        card:professor_cards (
          id,
          name,
          title,
          description,
          image_url,
          avatar_base64,
          unlock_points,
          teacher_id
        )
      `)
      .eq('student_id', studentId);

    if (error) {
      console.error('❌ Error obteniendo cartas:', error);
      return [];
    }

    if (data) {
      for (const item of data) {
        if (item.card && item.card.avatar_base64) {
          item.card.image_url = item.card.avatar_base64;
        }

        if (item.card && item.card.teacher_id) {
          const { data: pointsData } = await supabase
            .from('student_professor_points')
            .select('points')
            .eq('student_id', studentId)
            .eq('professor_id', item.card.teacher_id)
            .maybeSingle();

          item.card.points = pointsData?.points || 0;
          console.log('📊 Puntos para profesor', item.card.name, ':', item.card.points);
        }
      }
    }

    console.log('✅ Cartas obtenidas:', data);
    return data || [];
  },

  unlockCard: async (studentId: string, cardId: string) => {
    console.log('🔓 Desbloqueando carta:', cardId, 'para estudiante:', studentId);

    const { error } = await supabase
      .from('student_professor_cards')
      .update({
        unlocked: true,
        unlocked_at: new Date().toISOString(),
      })
      .eq('student_id', studentId)
      .eq('card_id', cardId);

    if (error) {
      console.error('❌ Error desbloqueando carta:', error);
      throw error;
    }

    console.log('✅ Carta desbloqueada exitosamente');
  },

  addPointsToProfessorCard: async (studentId: string, teacherId: string, points: number) => {
    console.log('➕ [POINTS] Agregando puntos:', { studentId, teacherId, points });

    const { data: card, error: cardError } = await supabase
      .from('professor_cards')
      .select('id, unlock_points')
      .eq('teacher_id', teacherId)
      .maybeSingle();

    if (cardError || !card) {
      console.error('❌ [POINTS] Error buscando carta del profesor:', cardError);
      return;
    }

    console.log('📋 [POINTS] Carta encontrada:', card);

    const { data: studentCard, error: scError } = await supabase
      .from('student_professor_cards')
      .select('id, unlocked')
      .eq('student_id', studentId)
      .eq('card_id', card.id)
      .maybeSingle();

    if (!studentCard) {
      console.log('🆕 [POINTS] Creando relación estudiante-carta');
      const { error: insertError } = await supabase
        .from('student_professor_cards')
        .insert({
          student_id: studentId,
          card_id: card.id,
          unlocked: false,
        });

      if (insertError) {
        console.error('❌ [POINTS] Error creando student_professor_cards:', insertError);
      }
    } else {
      console.log('✅ [POINTS] Relación estudiante-carta ya existe, unlocked:', studentCard.unlocked);
    }

    const { data: pointsRecord, error: pointsError } = await supabase
      .from('student_professor_points')
      .select('points')
      .eq('student_id', studentId)
      .eq('professor_id', teacherId)
      .maybeSingle();

    let newTotalPoints = points;

    if (pointsRecord) {
      newTotalPoints = pointsRecord.points + points;
      console.log('📊 [POINTS] Actualizando puntos:', pointsRecord.points, '+', points, '=', newTotalPoints);
      const { error: updateError } = await supabase
        .from('student_professor_points')
        .update({ points: newTotalPoints })
        .eq('student_id', studentId)
        .eq('professor_id', teacherId);

      if (updateError) {
        console.error('❌ [POINTS] Error actualizando puntos:', updateError);
      }
    } else {
      console.log('🆕 [POINTS] Creando registro de puntos:', points);
      const { error: insertError } = await supabase
        .from('student_professor_points')
        .insert({
          student_id: studentId,
          professor_id: teacherId,
          points: points,
        });

      if (insertError) {
        console.error('❌ [POINTS] Error insertando puntos:', insertError);
      }
    }

    if (newTotalPoints >= card.unlock_points && studentCard && !studentCard.unlocked) {
      console.log('🔓 [POINTS] Desbloqueando carta! Puntos:', newTotalPoints, '>=', card.unlock_points);
      const { error: unlockError } = await supabase
        .from('student_professor_cards')
        .update({
          unlocked: true,
          unlocked_at: new Date().toISOString(),
        })
        .eq('student_id', studentId)
        .eq('card_id', card.id);

      if (unlockError) {
        console.error('❌ [POINTS] Error desbloqueando carta:', unlockError);
      } else {
        console.log('✅ [POINTS] Carta desbloqueada exitosamente!');
      }
    }

    console.log('✅ [POINTS] Puntos agregados. Total:', newTotalPoints);
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
    studentsPerGroup?: number,
    teacherId?: string
  ) => {
    console.log('🚀 Creando batalla:', name, 'Teacher ID:', teacherId);

    const battleCode = generateCode();

    const { data: battle, error: battleError } = await supabase
      .from('battles')
      .insert({
        name,
        teacher_id: teacherId || 'default-teacher',
        question_count: roundCount,
        battle_code: battleCode,
        students_per_group: studentsPerGroup || 4,
        status: 'waiting',
        current_question_index: 0,
      })
      .select()
      .maybeSingle();

    if (battleError) {
      console.error('❌ Error creando batalla:', battleError);
      throw battleError;
    }

    if (!battle) throw new Error('No se pudo crear batalla');

    console.log('✅ Batalla creada con teacher_id:', battle.teacher_id);

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
    try {
      console.log('🔍 [JOIN] Buscando batalla con código:', battleCode);

      const { data: battle, error: battleError } = await supabase
        .from('battles')
        .select('*')
        .eq('battle_code', battleCode.toUpperCase())
        .maybeSingle();

      console.log('📦 [JOIN] Battle query result:', { battle, battleError });

      if (battleError) {
        console.error('❌ [JOIN] Error en query de batalla:', battleError);
        throw new Error('Error al buscar la batalla: ' + battleError.message);
      }

      if (!battle) {
        console.log('❌ [JOIN] Batalla no encontrada con código:', battleCode);
        throw new Error('Batalla no encontrada. Verifica el código.');
      }

      console.log('✅ [JOIN] Batalla encontrada:', battle.name, 'ID:', battle.id, 'Status:', battle.status);

      const { data: allGroups, error: groupsError } = await supabase
        .from('battle_groups')
        .select('*')
        .eq('battle_id', battle.id);

      console.log('📦 [JOIN] Groups query result:', { allGroups, groupsError });

      if (groupsError) {
        console.error('❌ [JOIN] Error en query de grupos:', groupsError);
        throw new Error('Error al buscar grupos: ' + groupsError.message);
      }

      if (!allGroups || allGroups.length === 0) {
        console.log('❌ [JOIN] No hay grupos en esta batalla');
        throw new Error('No hay grupos disponibles en esta batalla');
      }

      console.log('📊 [JOIN] Grupos encontrados:', allGroups.length);

      let selectedGroup = null;

      for (const group of allGroups) {
        if (group.is_full) {
          console.log(`⛔ [JOIN] Grupo ${group.group_name} está lleno`);
          continue;
        }

        const { data: members, error: membersError } = await supabase
          .from('group_members')
          .select('*')
          .eq('group_id', group.id);

        if (membersError) {
          console.error('❌ [JOIN] Error consultando miembros:', membersError);
          continue;
        }

        const memberCount = members?.length || 0;
        console.log(`👥 [JOIN] Grupo ${group.group_name}: ${memberCount}/${battle.students_per_group} miembros`);

        if (memberCount < battle.students_per_group) {
          selectedGroup = group;
          break;
        }
      }

      if (!selectedGroup) {
        selectedGroup = allGroups[0];
        console.log('⚠️ [JOIN] Usando primer grupo por defecto:', selectedGroup.group_name);
      } else {
        console.log('✅ [JOIN] Grupo seleccionado:', selectedGroup.group_name, 'ID:', selectedGroup.id);
      }

      console.log('💾 [JOIN] Insertando estudiante en grupo...');
      const { error: insertError } = await supabase.from('group_members').insert({
        group_id: selectedGroup.id,
        student_id: studentId,
        student_name: studentName,
      });

      if (insertError) {
        console.error('❌ [JOIN] Error insertando miembro:', insertError);
        throw new Error('No se pudo unir al grupo: ' + insertError.message);
      }

      console.log('✅ [JOIN] Estudiante agregado exitosamente al grupo');

      const { data: updatedMembers } = await supabase
        .from('group_members')
        .select('*')
        .eq('group_id', selectedGroup.id);

      if (updatedMembers && updatedMembers.length >= battle.students_per_group) {
        console.log('🔒 [JOIN] Grupo alcanzó capacidad máxima, marcando como lleno');
        await supabase
          .from('battle_groups')
          .update({ is_full: true })
          .eq('id', selectedGroup.id);
      }

      console.log('🎉 [JOIN] UNIÓN EXITOSA - Grupo:', selectedGroup.group_name, 'Batalla:', battle.name);

      return {
        group: {
          id: selectedGroup.id,
          battle_id: battle.id,
          groupCode: selectedGroup.group_code,
          groupName: selectedGroup.group_name,
          score: selectedGroup.score,
          correctAnswers: selectedGroup.correct_answers,
          createdAt: selectedGroup.created_at
        },
        battle: {
          id: battle.id,
          name: battle.name,
          teacherId: battle.teacher_id,
          questionCount: battle.question_count,
          status: battle.status,
          currentQuestionIndex: battle.current_question_index,
          createdAt: battle.created_at
        }
      };
    } catch (error: any) {
      console.error('💥 [JOIN] Error completo:', error);
      throw error;
    }
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

  getBattleGroups: async (battleId: string) => {
    try {
      const { data, error } = await supabase
        .from('battle_groups')
        .select('*')
        .eq('battle_id', battleId)
        .order('score', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ Error getting battle groups:', error);
      throw error;
    }
  },

  getGroupMembers: async (groupId: string) => {
    try {
      const { data, error } = await supabase
        .from('group_members')
        .select('*')
        .eq('group_id', groupId);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ Error getting group members:', error);
      throw error;
    }
  },

  getBattleQuestions: async (battleId: string) => {
    try {
      const { data, error } = await supabase
        .from('battle_questions')
        .select('*')
        .eq('battle_id', battleId)
        .order('question_order', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ Error getting battle questions:', error);
      throw error;
    }
  },

  getBattleState: async (battleId: string) => {
    try {
      const { data, error } = await supabase
        .from('battles')
        .select('*')
        .eq('id', battleId)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('❌ Error getting battle state:', error);
      throw error;
    }
  },

  submitAnswer: async (
    battleId: string,
    groupId: string,
    questionId: string,
    answerIndex: number,
    correctAnswerIndex: number,
    responseTime: number
  ) => {
    try {
      const isCorrect = answerIndex === correctAnswerIndex;

      const { error: answerError } = await supabase.from('battle_answers').insert({
        battle_id: battleId,
        group_id: groupId,
        question_id: questionId,
        answer_index: answerIndex,
        is_correct: isCorrect,
        response_time: responseTime,
      });

      if (answerError) throw answerError;

      const { data: group } = await supabase
        .from('battle_groups')
        .select('score, correct_answers, wrong_answers, is_eliminated')
        .eq('id', groupId)
        .maybeSingle();

      if (group) {
        if (isCorrect) {
          const tempPoints = Math.max(1000 - responseTime, 100);

          await supabase
            .from('battle_groups')
            .update({
              score: group.score + tempPoints,
              correct_answers: group.correct_answers + 1,
            })
            .eq('id', groupId);
          console.log('✅ [API] Respuesta correcta, puntos temporales:', tempPoints);
        } else {
          const newWrongAnswers = group.wrong_answers + 1;
          const shouldEliminate = newWrongAnswers >= 2;

          await supabase
            .from('battle_groups')
            .update({
              wrong_answers: newWrongAnswers,
              is_eliminated: shouldEliminate,
            })
            .eq('id', groupId);

          if (shouldEliminate) {
            console.log('💀 [API] Grupo eliminado por 2 respuestas incorrectas');
          } else {
            console.log('⚠️ [API] Respuesta incorrecta, advertencia:', newWrongAnswers, '/2');
          }
        }
      }
    } catch (error) {
      console.error('❌ Error submitting answer:', error);
      throw error;
    }
  },

  startBattle: async (battleId: string) => {
    try {
      console.log('🚀 [API] Iniciando batalla:', battleId);
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('battles')
        .update({
          status: 'active',
          started_at: now,
          question_started_at: now,
        })
        .eq('id', battleId)
        .select();

      if (error) {
        console.error('❌ [API] Error en startBattle:', error);
        throw error;
      }

      console.log('✅ [API] Batalla actualizada con timer iniciado:', data);
      return true;
    } catch (error) {
      console.error('❌ [API] Error starting battle:', error);
      return false;
    }
  },

  nextQuestion: async (battleId: string) => {
    try {
      const { data: battle } = await supabase
        .from('battles')
        .select('current_question_index, question_count')
        .eq('id', battleId)
        .maybeSingle();

      if (!battle) return false;

      const nextIndex = battle.current_question_index + 1;

      if (nextIndex >= battle.question_count) {
        await supabase
          .from('battles')
          .update({
            status: 'finished',
            finished_at: new Date().toISOString(),
          })
          .eq('id', battleId);
        console.log('🏁 [API] Batalla finalizada');
      } else {
        await supabase
          .from('battles')
          .update({
            current_question_index: nextIndex,
            question_started_at: new Date().toISOString(),
          })
          .eq('id', battleId);
        console.log('⏭️ [API] Avanzado a pregunta:', nextIndex + 1);
      }

      return true;
    } catch (error) {
      console.error('❌ Error advancing question:', error);
      return false;
    }
  },

  nextQuestionForGroup: async (groupId: string, battleId: string) => {
    try {
      const { data: group } = await supabase
        .from('battle_groups')
        .select('current_question_index')
        .eq('id', groupId)
        .maybeSingle();

      if (!group) return false;

      const { data: battle } = await supabase
        .from('battles')
        .select('question_count')
        .eq('id', battleId)
        .maybeSingle();

      if (!battle) return false;

      const nextIndex = group.current_question_index + 1;

      if (nextIndex >= battle.question_count) {
        console.log('🏁 [API] Grupo completó todas las preguntas');
        return false;
      }

      await supabase
        .from('battle_groups')
        .update({ current_question_index: nextIndex })
        .eq('id', groupId);

      console.log('⏭️ [API] Grupo avanzó a pregunta:', nextIndex + 1);
      return true;
    } catch (error) {
      console.error('❌ Error advancing group question:', error);
      return false;
    }
  },

  restartBattle: async (battleId: string) => {
    try {
      console.log('🔄 [API] Reiniciando batalla:', battleId);

      await supabase
        .from('battle_answers')
        .delete()
        .eq('battle_id', battleId);

      await supabase
        .from('battle_groups')
        .update({
          score: 0,
          correct_answers: 0,
          wrong_answers: 0,
          is_eliminated: false,
          current_question_index: 0,
        })
        .eq('battle_id', battleId);

      const now = new Date().toISOString();
      await supabase
        .from('battles')
        .update({
          status: 'waiting',
          current_question_index: 0,
          started_at: null,
          finished_at: null,
          question_started_at: null,
        })
        .eq('id', battleId);

      console.log('✅ [API] Batalla reiniciada exitosamente');
      return true;
    } catch (error) {
      console.error('❌ Error restarting battle:', error);
      return false;
    }
  },

  calculateFinalPoints: async (battleId: string, groupId: string): Promise<number> => {
    try {
      const { data: allGroups } = await supabase
        .from('battle_groups')
        .select('id, score, is_eliminated')
        .eq('battle_id', battleId)
        .order('score', { ascending: false });

      if (!allGroups) return 0;

      const activeGroups = allGroups.filter(g => !g.is_eliminated);
      const groupRank = activeGroups.findIndex(g => g.id === groupId);

      if (groupRank === -1) return 0;

      const pointsByRank = [200, 150, 100];
      const points = pointsByRank[groupRank] || 50;

      console.log('🏆 [API] Puntos finales calculados:', { groupRank: groupRank + 1, points });
      return points;
    } catch (error) {
      console.error('❌ Error calculating final points:', error);
      return 0;
    }
  },
};

export default {
  auth: authApi,
  questionBank: questionBankApi,
  battle: battleApi,
};
