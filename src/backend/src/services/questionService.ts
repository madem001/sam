import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class QuestionService {
  async createQuestionSet(teacherId: string, data: {
    name: string;
    questions: any[];
  }) {
    return await prisma.questionSet.create({
      data: {
        teacherId,
        name: data.name,
        questions: data.questions
      },
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
  }

  async getQuestionSet(id: string) {
    return await prisma.questionSet.findUnique({
      where: { id },
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
  }

  async getAllQuestionSets() {
    return await prisma.questionSet.findMany({
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });
  }

  async getQuestionSetsByTeacher(teacherId: string) {
    return await prisma.questionSet.findMany({
      where: { teacherId },
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });
  }

  async updateQuestionSet(id: string, data: {
    name?: string;
    questions?: any[];
  }) {
    return await prisma.questionSet.update({
      where: { id },
      data,
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
  }

  async deleteQuestionSet(id: string) {
    return await prisma.questionSet.delete({
      where: { id }
    });
  }

  async duplicateQuestionSet(id: string, newName: string) {
    const original = await this.getQuestionSet(id);

    if (!original) {
      throw new Error('Banco de preguntas no encontrado');
    }

    return await this.createQuestionSet(original.teacherId, {
      name: newName || `${original.name} (Copia)`,
      questions: original.questions as any[]
    });
  }
}

export default new QuestionService();
