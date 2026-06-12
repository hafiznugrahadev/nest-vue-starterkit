import { apiFetch } from '~/lib/api-client';
import type { User } from '@starterkit/shared-types';

export interface UpdateProfileInput {
  name?: string;
  avatarUrl?: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export const profileApi = {
  me(): Promise<User> {
    return apiFetch('/users/me');
  },

  updateProfile(input: UpdateProfileInput): Promise<User> {
    return apiFetch('/users/me', { method: 'PATCH', body: input });
  },

  changePassword(input: ChangePasswordInput): Promise<null> {
    return apiFetch('/users/me/password', { method: 'PATCH', body: input });
  },
};
