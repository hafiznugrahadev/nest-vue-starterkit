import { Injectable, NotFoundException } from '@nestjs/common';
import { and, desc, eq, isNull, sql } from 'drizzle-orm';
import { DrizzleService } from '@infrastructure/database/drizzle.service';
import { notifications } from '@infrastructure/database/schema';
import type { CreateNotificationDto } from './dto/notification.dto';

@Injectable()
export class NotificationsService {
  constructor(private readonly drizzle: DrizzleService) {}

  async findAll(userId: string) {
    const [list, unread] = await Promise.all([
      this.drizzle.db.query.notifications.findMany({
        where: eq(notifications.userId, userId),
        orderBy: desc(notifications.createdAt),
        limit: 50,
      }),
      this.countUnread(userId),
    ]);
    return { data: list, unread, total: list.length };
  }

  async create(userId: string, dto: CreateNotificationDto) {
    const [row] = await this.drizzle.db
      .insert(notifications)
      .values({ userId, title: dto.title, body: dto.body, type: dto.type ?? 'info' })
      .returning();
    return row;
  }

  async markRead(id: string, userId: string) {
    const notification = await this.drizzle.db.query.notifications.findFirst({
      where: and(eq(notifications.id, id), eq(notifications.userId, userId)),
    });
    if (!notification) throw new NotFoundException('Notification not found');
    if (notification.readAt) return notification;
    const [updated] = await this.drizzle.db
      .update(notifications)
      .set({ readAt: new Date() })
      .where(eq(notifications.id, id))
      .returning();
    return updated;
  }

  async markAllRead(userId: string) {
    await this.drizzle.db
      .update(notifications)
      .set({ readAt: new Date() })
      .where(and(eq(notifications.userId, userId), isNull(notifications.readAt)));
    return { success: true };
  }

  private async countUnread(userId: string): Promise<number> {
    const [{ count }] = await this.drizzle.db
      .select({ count: sql<number>`count(*)::int` })
      .from(notifications)
      .where(and(eq(notifications.userId, userId), isNull(notifications.readAt)));
    return count;
  }
}
