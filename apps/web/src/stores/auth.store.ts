import { defineStore } from 'pinia';
import { UserRole, type User } from '@starterkit/shared-types';
import { clientRefresh, getApiBase } from '~/lib/api-client';

export interface SessionPayload {
  accessToken: string;
  user: User;
}

// Auth API calls go through raw fetch (not apiFetch) so a 401 here can never
// trigger the refresh-retry loop.
async function authPost(path: string, body: unknown) {
  const res = await fetch(`${getApiBase()}${path}`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = (await res.json()) as {
    success: boolean;
    data?: SessionPayload;
    message?: string | string[];
  };
  if (!json.success)
    throw new Error(Array.isArray(json.message) ? json.message.join(', ') : String(json.message));
  return json.data;
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    accessToken: null as string | null,
    booted: false,
  }),
  getters: {
    isAuthenticated: (s) => !!s.accessToken,
    isAdmin: (s) => s.user?.roles?.includes(UserRole.ADMIN) ?? false,
    isSuperAdmin: (s) => s.user?.roles?.includes(UserRole.SUPER_ADMIN) ?? false,
  },
  actions: {
    setSession(payload: SessionPayload) {
      this.accessToken = payload.accessToken;
      this.user = payload.user;
    },
    clearSession() {
      this.user = null;
      this.accessToken = null;
    },
    /** App boot: exchange the httpOnly refresh cookie for a session (no-op 401 for anonymous). */
    async bootstrap() {
      await clientRefresh();
      this.booted = true;
    },
    async login(email: string, password: string) {
      const data = await authPost('/auth/login', { email, password });
      if (data) this.setSession(data);
      return data;
    },
    async register(name: string, email: string, password: string) {
      const data = await authPost('/auth/register', { name, email, password });
      if (data) this.setSession(data);
      return data;
    },
    async logout() {
      try {
        await fetch(`${getApiBase()}/auth/logout`, { method: 'POST', credentials: 'include' });
      } catch {
        /* best-effort */
      }
      this.clearSession();
    },
    async forgotPassword(email: string) {
      await authPost('/auth/forgot-password', { email });
    },
    async resetPassword(token: string, newPassword: string) {
      await authPost('/auth/reset-password', { token, newPassword });
    },
  },
});
