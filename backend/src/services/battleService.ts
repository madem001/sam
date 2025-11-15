import prisma from '../config/database.js';
import { ANSWER_COLORS, POINTS_PER_CORRECT_ANSWER, MAX_GROUP_MEMBERS } from '../config/constants.js';
import { CreateBattleDTO, JoinGroupDTO, SubmitAnswerDTO } from '../types/index.js';

export class BattleService {
  private generateGroupCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  async createBattle(teacherId: string, data: CreateBattleDTO) {
    const battle = await prisma.battle.create({
      data: {
        name: data.name,
        teacherId,
        questionCount: data.questionCount,
        status: 'WAITING',
        currentQuestionIndex: 0,
      },
    });

    const groupsData = Array.from({ length: data.groupCount }, (_, i) => ({
      battleId: battle.id,
      groupCode: this.generateGroupCode(),
      groupName: `Grupo ${i + 1}`,
      score: 0,
      correctAnswers: 0,
    }));

    const groups = await prisma.battleGroup.createMany({
      data: groupsData,
    });

    const questionsData = data.questions.map((q, index) => ({
      battleId: battle.id,
      questionText: q.text,
      answers: q.answers.map((text, idx) => ({
        text,
        color: ANSWER_COLORS[idx % ANSWER_COLORS.length],
      })),
      correctAnswerIndex: q.correctIndex,
      questionOrder: index,
    }));

    await prisma.battleQuestion.createMany({
      data: questionsData,
    });

    return {
      battle,
      groupsCreated: data.groupCount,
      questionsCreated: data.questions.length,
    };
  }

  async getBattleById(battleId: string) {
    return await prisma.battle.findUnique({
      where: { id: battleId },
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async getTeacherBattles(teacherId: string) {
    return await prisma.battle.findMany({
      where: { teacherId },
      orderBy: { createdAt: 'desc' },
      include: {
        groups: {
          select: {
            id: true,
            groupCode: true,
            groupName: true,
            score: true,
            correctAnswers: true,
          },
        },
      },
    });
  }

  async getBattleGroups(battleId: string) {
    return await prisma.battleGroup.findMany({
      where: { battleId },
      orderBy: [{ score: 'desc' }, { correctAnswers: 'desc' }],
      include: {
        members: {
          select: {
            id: true,
            studentId: true,
            studentName: true,
            joinedAt: true,
          },
        },
      },
    });
  }

  async getBattleQuestions(battleId: string) {
    return await prisma.battleQuestion.findMany({
      where: { battleId },
      orderBy: { questionOrder: 'asc' },
    });
  }

  async joinGroup(data: JoinGroupDTO) {
    const group = await prisma.battleGroup.findUnique({
      where: { groupCode: data.groupCode },
      include: {
        members: true,
      },
    });

    if (!group) {
      throw new Error('Código de grupo inválido');
    }

    if (group.members.length >= MAX_GROUP_MEMBERS) {
      throw new Error('El grupo está lleno');
    }

    const alreadyJoined = group.members.some((m) => m.studentId === data.studentId);
    if (alreadyJoined) {
      return { group, message: 'Ya estás en este grupo' };
    }

    await prisma.groupMember.create({
      data: {
        groupId: group.id,
        studentId: data.studentId,
        studentName: data.studentName,
      },
    });

    return { group, message: 'Te has unido al grupo exitosamente' };
  }

  async submitAnswer(data: SubmitAnswerDTO) {
    const question = await prisma.battleQuestion.findUnique({
      where: { id: data.questionId },
    });

    if (!question) {
      throw new Error('Pregunta no encontrada');
    }

    const isCorrect = data.answerIndex === question.correctAnswerIndex;

    const existingAnswer = await prisma.battleAnswer.findUnique({
      where: {
        questionId_groupId: {
          questionId: data.questionId,
          groupId: data.groupId,
        },
      },
    });

    if (existingAnswer) {
      throw new Error('Este grupo ya respondió esta pregunta');
    }

    await prisma.battleAnswer.create({
      data: {
        battleId: data.battleId,
        groupId: data.groupId,
        questionId: data.questionId,
        answerIndex: data.answerIndex,
        isCorrect,
        responseTimeMs: data.responseTimeMs,
      },
    });

    if (isCorrect) {
      await prisma.battleGroup.update({
        where: { id: data.groupId },
        data: {
          score: { increment: POINTS_PER_CORRECT_ANSWER },
          correctAnswers: { increment: 1 },
        },
      });
    }

    return { isCorrect, pointsEarned: isCorrect ? POINTS_PER_CORRECT_ANSWER : 0 };
  }

  async startBattle(battleId: string) {
    return await prisma.battle.update({
      where: { id: battleId },
      data: {
        status: 'ACTIVE',
        startedAt: new Date(),
      },
    });
  }

  async nextQuestion(battleId: string) {
    const battle = await prisma.battle.findUnique({
      where: { id: battleId },
    });

    if (!battle) {
      throw new Error('Batalla no encontrada');
    }

    const nextIndex = battle.currentQuestionIndex + 1;
    const isFinished = nextIndex >= battle.questionCount;

    return await prisma.battle.update({
      where: { id: battleId },
      data: {
        currentQuestionIndex: nextIndex,
        status: isFinished ? 'FINISHED' : battle.status,
        finishedAt: isFinished ? new Date() : null,
      },
    });
  }

  async getGroupMembers(groupId: string) {
    return await prisma.groupMember.findMany({
      where: { groupId },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });
  }

  async getBattleAnswers(battleId: string) {
    return await prisma.battleAnswer.findMany({
      where: { battleId },
      include: {
        group: {
          select: {
            groupName: true,
          },
        },
        question: {
          select: {
            questionText: true,
            questionOrder: true,
          },
        },
      },
      orderBy: { answeredAt: 'asc' },
    });
  }
}

export default new BattleService();
