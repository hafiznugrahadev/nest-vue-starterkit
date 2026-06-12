import { apiFetch, apiFetchRaw, unwrapPaginated } from '~/lib/api-client';
import type { Paginated, User } from '@starterkit/shared-types';
import type { CreateUserValues, UpdateUserValues } from './user.schema';

export interface UserListParams extends Record<string, unknown> {
  page?: number;
  limit?: number;
  search?: string;
  roles?: string[];
}

export const userApi = {
  async list(params: UserListParams): Promise<Paginated<User>> {
    const res = await apiFetchRaw<User[]>('/users', {
      query: params as Record<string, string | number | boolean | string[] | undefined>,
    });
    return unwrapPaginated(res);
  },

  create(body: CreateUserValues): Promise<User> {
    return apiFetch('/users', { method: 'POST', body });
  },

  update(id: string, body: UpdateUserValues): Promise<User> {
    return apiFetch(`/users/${id}`, { method: 'PATCH', body });
  },

  remove(id: string): Promise<User> {
    return apiFetch(`/users/${id}`, { method: 'DELETE' });
  },
};
