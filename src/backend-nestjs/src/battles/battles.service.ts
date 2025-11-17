import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBattleDto } from './dto/create-battle.dto';
import { JoinBattleDto } from './dto/join-battle.dto';
import { SubmitAnswerDto } from './dto/submit-answer.dto';

const ANSWER_COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A'];
const POINTS_PER_CORRECT_ANSWER = 10;

@Injectable()
export class BattlesService {
  constructor(private prisma: PrismaService) {}

  private generateGroupCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  private generateBattleCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  async createBattle(teacherId: string, createBattleDto: CreateBattleDto) {
    const battle = await this.prisma.battle.create({
      data: {
        name: createBattleDto.name,
        teacherId,
        battleCode: this.generateBattleCode(),
        questionCount: createBattleDto.questionCount,
        groupCount: createBattleDto.groupCount,
        studentsPerGroup: 4,
        status: 'WAITING',
        currentQuestionIndex: 0,
      },
    });

    const groupsData = Array.from({ length: createBattleDto.groupCount }, (_, i) => ({
      battleId: battle.id,
      groupNumber: i + 1,
      groupCode: this.generateGroupCode(),
      score: 0,
      studentsCount: 0,
    }));

    await this.prisma.battleGroup.createMany({
      data: groupsData,
    });

    const questionsData = createBattleDto.questions.map((q, index) => ({
      battleId: battle.id,
      questionText: q.question,
      answers: q.options.map((text, idx) => ({
        text,
        color: ANSWER_COLORS[idx % ANSWER_COLORS.length],
      })),
      correctIndex: q.options.indexOf(q.correctAnswer),
      orderIndex: index,
    }));

    await this.prisma.battleQuestion.createMany({
      data: questionsData,
    });

    return {
      battle,
      groupsCreated: createBattleDto.groupCount,
      questionsCreated: createBattleDto.questions.length,
    };
  }

  async getBattleById(battleId: string) {
    const battle = await this.prisma.battle.findUnique({
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

    if (!battle) {
      throw new NotFoundException('Batalla no encontrada');
    }

    return battle;
  }

  async getTeacherBattles(teacherId: string) {
    return await this.prisma.battle.findMany({
      where: { teacherId },
      orderBy: { createdAt: 'desc' },
      include: {
        groups: {
          select: {
            id: true,
            groupCode: true,
            groupNumber: true,
            score: true,
            studentsCount: true,
          },
        },
      },
    });
  }

  async getBattleGroups(battleId: string) {
    return await this.prisma.battleGroup.findMany({
      where: { battleId },
      orderBy: [{ score: 'desc' }],
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
    return await this.prisma.battleQuestion.findMany({
      where: { battleId },
      orderBy: { orderIndex: 'asc' },
    });
  }

  async joinGroup(userId: string, userName: string, joinBattleDto: JoinBattleDto) {
    const battle = await this.prisma.battle.findUnique({
      where: { id: joinBattleDto.battleId },
      include: {
        groups: {
          include: {
            members: true,
          },
        },
      },
    });

    if (!battle) {
      throw new NotFoundException('Batalla no encontrada');
    }

    const alreadyInBattle = await this.prisma.groupMember.findFirst({
      where: {
        studentId: userId,
        group: {
          battleId: battle.id,
        },
      },
    });

    if (alreadyInBattle) {
      throw new BadRequestException('Ya estás en un grupo de esta batalla');
    }

    const targetGroup = battle.groups.find((g) => g.groupNumber === joinBattleDto.groupNumber);

    if (!targetGroup) {
      throw new NotFoundException('Grupo no encontrado');
    }

    if (targetGroup.studentsCount >= battle.studentsPerGroup) {
      throw new BadRequestException('El grupo está lleno');
    }

    const member = await this.prisma.groupMember.create({
      data: {
        groupId: targetGroup.id,
        studentId: userId,
        studentName: userName,
      },
    });

    await this.prisma.battleGroup.update({
      where: { id: targetGroup.id },
      data: { studentsCount: { increment: 1 } },
    });

    return {
      member,
      group: targetGroup,
      battle,
    };
  }

  async startBattle(battleId: string) {
    return await this.prisma.battle.update({
      where: { id: battleId },
      data: {
        status: 'ACTIVE',
        startedAt: new Date(),
      },
    });
  }

  async submitAnswer(userId: string, battleId: string, submitAnswerDto: SubmitAnswerDto) {
    const question = await this.prisma.battleQuestion.findUnique({
      where: { id: submitAnswerDto.questionId },
    });

    if (!question) {
      throw new NotFoundException('Pregunta no encontrada');
    }

    const member = await this.prisma.groupMember.findFirst({
      where: {
        studentId: userId,
        group: {
          battleId,
        },
      },
      include: {
        group: true,
      },
    });

    if (!member) {
      throw new BadRequestException('No estás en esta batalla');
    }

    const existingAnswer = await this.prisma.battleAnswer.findFirst({
      where: {
        studentId: userId,
        questionId: question.id,
      },
    });

    if (existingAnswer) {
      throw new BadRequestException('Ya respondiste esta pregunta');
    }

    const isCorrect = question.correctIndex === parseInt(submitAnswerDto.answer);
    const pointsEarned = isCorrect ? POINTS_PER_CORRECT_ANSWER : 0;

    const answer = await this.prisma.battleAnswer.create({
      data: {
        battleId,
        groupId: member.groupId,
        questionId: question.id,
        studentId: userId,
        selectedAnswer: parseInt(submitAnswerDto.answer),
        isCorrect,
      },
    });

    if (isCorrect) {
      await this.prisma.battleGroup.update({
        where: { id: member.groupId },
        data: {
          score: { increment: pointsEarned },
        },
      });

      await this.prisma.user.update({
        where: { id: userId },
        data: {
          points: { increment: pointsEarned },
        },
      });
    }

    return {
      answer,
      isCorrect,
      pointsEarned,
      correctAnswerIndex: question.correctIndex,
    };
  }

  async endBattle(battleId: string) {
    const battle = await this.prisma.battle.update({
      where: { id: battleId },
      data: {
        status: 'FINISHED',
        finishedAt: new Date(),
      },
    });

    const groups = await this.getBattleGroups(battleId);

    return {
      battle,
      results: groups,
    };
  }

  async getActiveBattles() {
    return await this.prisma.battle.findMany({
      where: {
        status: {
          in: ['WAITING', 'ACTIVE'],
        },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
          },
        },
        groups: {
          select: {
            id: true,
            groupCode: true,
            groupNumber: true,
            studentsCount: true,
            _count: {
              select: {
                members: true,
              },
            },
          },
        },
      },
    });
  }
}
