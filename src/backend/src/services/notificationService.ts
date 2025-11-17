import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class NotificationService {
  async createNotification(userId: string, data: {
    message: string;
    type: string;
    payload?: any;
  }) {
    return await prisma.notification.create({
      data: {
        userId,
        message: data.message,
        type: data.type,
        payload: data.payload,
        read: false
      }
    });
  }

  async getUserNotifications(userId: string, unreadOnly: boolean = false) {
    return await prisma.notification.findMany({
      where: {
        userId,
        read: unreadOnly ? false : undefined
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  async getNotification(id: string) {
    return await prisma.notification.findUnique({
      where: { id }
    });
  }

  async markAsRead(id: string) {
    return await prisma.notification.update({
      where: { id },
      data: { read: true }
    });
  }

  async markAllAsRead(userId: string) {
    return await prisma.notification.updateMany({
      where: {
        userId,
        read: false
      },
      data: { read: true }
    });
  }

  async deleteNotification(id: string) {
    return await prisma.notification.delete({
      where: { id }
    });
  }

  async deleteAllUserNotifications(userId: string) {
    return await prisma.notification.deleteMany({
      where: { userId }
    });
  }

  async getUnreadCount(userId: string) {
    return await prisma.notification.count({
      where: {
        userId,
        read: false
      }
    });
  }

  async sendBulkNotification(userIds: string[], data: {
    message: string;
    type: string;
    payload?: any;
  }) {
    const notifications = userIds.map(userId => ({
      userId,
      message: data.message,
      type: data.type,
      payload: data.payload,
      read: false
    }));

    return await prisma.notification.createMany({
      data: notifications
    });
  }
}

export default new NotificationService();
