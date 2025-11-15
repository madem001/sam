import prisma from '../config/database.js';
import { ANSWER_COLORS, POINTS_PER_CORRECT_ANSWER } from '../config/constants.js';
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
        roundCount: data.questionCount,
        studentsPerGroup: data.studentsPerGroup || 4,
        status: 'WAITING',
        currentRoundIndex: 0,
      },
    });

    const groupsData = Array.from({ length: data.groupCount }, (_, i) => ({
      battleId: battle.id,
      groupCode: this.generateGroupCode(),
      groupName: `Grupo ${i + 1}`,
      score: 0,
      correctAnswers: 0,
      isFull: false,
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
            isFull: true,
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
        battle: true,
      },
    });

    if (!group) {
      throw new Error('Código de grupo inválido');
    }

    if (group.isFull) {
      const availableGroups = await prisma.battleGroup.findMany({
        where: {
          battleId: group.battleId,
          isFull: false,
        },
        include: {
          members: true,
        },
      });

      if (availableGroups.length === 0) {
        throw new Error('Todos los grupos están llenos');
      }

      const randomGroup = availableGroups[Math.floor(Math.random() * availableGroups.length)];

      const alreadyInBattle = await prisma.groupMember.findFirst({
        where: {
          studentId: data.studentId,
          group: {
            battleId: group.battleId,
          },
        },
      });

      if (alreadyInBattle) {
        const currentGroup = await prisma.battleGroup.findUnique({
          where: { id: alreadyInBattle.groupId },
        });
        return { group: currentGroup!, message: 'Ya estás en un grupo de esta batalla' };
      }

      await prisma.groupMember.create({
        data: {
          groupId: randomGroup.id,
          studentId: data.studentId,
          studentName: data.studentName,
        },
      });

      const updatedMembers = await prisma.groupMember.count({
        where: { groupId: randomGroup.id },
      });

      if (updatedMembers >= group.battle.studentsPerGroup) {
        await prisma.battleGroup.update({
          where: { id: randomGroup.id },
          data: { isFull: true },
        });
      }

      const finalGroup = await prisma.battleGroup.findUnique({
        where: { id: randomGroup.id },
      });

      return { group: finalGroup!, message: 'Te has unido al grupo exitosamente' };
    }

    const alreadyInBattle = await prisma.groupMember.findFirst({
      where: {
        studentId: data.studentId,
        group: {
          battleId: group.battleId,
        },
      },
    });

    if (alreadyInBattle) {
      const currentGroup = await prisma.battleGroup.findUnique({
        where: { id: alreadyInBattle.groupId },
      });
      return { group: currentGroup!, message: 'Ya estás en un grupo de esta batalla' };
    }

    await prisma.groupMember.create({
      data: {
        groupId: group.id,
        studentId: data.studentId,
        studentName: data.studentName,
      },
    });

    const updatedMembers = await prisma.groupMember.count({
      where: { groupId: group.id },
    });

    if (updatedMembers >= group.battle.studentsPerGroup) {
      await prisma.battleGroup.update({
        where: { id: group.id },
        data: { isFull: true },
        });
    }

    const finalGroup = await prisma.battleGroup.findUnique({
      where: { id: group.id },
    });

    return { group: finalGroup!, message: 'Te has unido al grupo exitosamente' };
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

    const nextIndex = battle.currentRoundIndex + 1;
    const isFinished = nextIndex >= battle.roundCount;

    return await prisma.battle.update({
      where: { id: battleId },
      data: {
        currentRoundIndex: nextIndex,
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
