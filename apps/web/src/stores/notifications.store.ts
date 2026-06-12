import { defineStore } from 'pinia';
import { apiFetch } from '~/lib/api-client';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: string;
  readAt: string | null;
  createdAt: string;
}

export const useNotificationsStore = defineStore('notifications', {
  state: () => ({
    items: [] as Notification[],
    unreadCount: 0,
    loading: false,
    fetched: false,
  }),
  actions: {
    async fetch() {
      if (this.loading) return;
      this.loading = true;
      try {
        const res = await apiFetch<{ notifications: Notification[]; unread: number }>(
          '/notifications',
        );
        this.items = res.notifications;
        this.unreadCount = res.unread;
        this.fetched = true;
      } catch {
        /* swallow */
      } finally {
        this.loading = false;
      }
    },
    async markRead(id: string) {
      this.items = this.items.map((n) =>
        n.id === id ? { ...n, readAt: new Date().toISOString() } : n,
      );
      this.unreadCount = Math.max(0, this.unreadCount - 1);
      try {
        await apiFetch(`/notifications/${id}/read`, { method: 'PATCH' });
      } catch {
        /* optimistic — ignore */
      }
    },
    async markAllRead() {
      const now = new Date().toISOString();
      this.items = this.items.map((n) => (n.readAt ? n : { ...n, readAt: now }));
      this.unreadCount = 0;
      try {
        await apiFetch('/notifications/read-all', { method: 'PATCH' });
      } catch {
        /* optimistic */
      }
    },
  },
});
