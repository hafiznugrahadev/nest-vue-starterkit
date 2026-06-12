import { defineStore } from 'pinia';
import { toast } from 'vue-sonner';
import type { User } from '@starterkit/shared-types';
import { useAuthStore } from '~/stores/auth.store';
import { profileApi, type ChangePasswordInput, type UpdateProfileInput } from './profile.api';

export const useProfileStore = defineStore('profile', {
  state: () => ({
    me: null as User | null,
    loading: false,
    updating: false,
    changingPassword: false,
  }),
  actions: {
    async fetchMe() {
      const auth = useAuthStore();
      if (!auth.isAuthenticated) return;
      // Seed from the session user so the page renders instantly.
      if (!this.me && auth.user) this.me = auth.user;
      this.loading = true;
      try {
        this.me = await profileApi.me();
      } catch {
        /* keep seeded value */
      } finally {
        this.loading = false;
      }
    },
    async updateProfile(input: UpdateProfileInput) {
      this.updating = true;
      try {
        const user = await profileApi.updateProfile(input);
        this.me = user;
        // Keep the session user (sidebar, user menu) in sync.
        const auth = useAuthStore();
        if (auth.accessToken) auth.setSession({ accessToken: auth.accessToken, user });
        toast.success('Profile updated');
      } catch (e) {
        toast.error((e as Error).message);
        throw e;
      } finally {
        this.updating = false;
      }
    },
    async changePassword(input: ChangePasswordInput) {
      this.changingPassword = true;
      try {
        await profileApi.changePassword(input);
        toast.success('Password changed');
      } catch (e) {
        toast.error((e as Error).message);
        throw e;
      } finally {
        this.changingPassword = false;
      }
    },
  },
});
