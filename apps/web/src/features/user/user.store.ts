import { defineStore } from 'pinia';
import { toast } from 'vue-sonner';
import type { PaginationMeta, User } from '@starterkit/shared-types';
import { PAGINATION } from '~/lib/constants';
import { userApi, type UserListParams } from './user.api';
import type { CreateUserValues, UpdateUserValues } from './user.schema';

export const useUserStore = defineStore('users', {
  state: () => ({
    items: [] as User[],
    meta: null as PaginationMeta | null,
    page: PAGINATION.DEFAULT_PAGE as number,
    limit: PAGINATION.DEFAULT_LIMIT as number,
    search: '',
    roles: [] as string[],
    loading: false,
    error: false,
    saving: false,
  }),
  getters: {
    totalPages: (s) => s.meta?.totalPages ?? 1,
    total: (s) => s.meta?.total ?? 0,
  },
  actions: {
    queryParams(): UserListParams {
      return {
        page: this.page,
        limit: this.limit,
        ...(this.search ? { search: this.search } : {}),
        ...(this.roles.length > 0 ? { roles: this.roles } : {}),
      };
    },
    async fetchList() {
      this.loading = true;
      this.error = false;
      try {
        const res = await userApi.list(this.queryParams());
        this.items = res.data;
        this.meta = res.meta;
      } catch {
        this.error = true;
      } finally {
        this.loading = false;
      }
    },
    setPage(page: number) {
      this.page = page;
      void this.fetchList();
    },
    setSearch(search: string) {
      this.search = search;
      this.page = 1;
      void this.fetchList();
    },
    toggleRole(role: string) {
      this.roles = this.roles.includes(role)
        ? this.roles.filter((r) => r !== role)
        : [...this.roles, role];
      this.page = 1;
      void this.fetchList();
    },
    clearRoles() {
      this.roles = [];
      this.page = 1;
      void this.fetchList();
    },
    async create(body: CreateUserValues) {
      this.saving = true;
      try {
        await userApi.create(body);
        toast.success('User created');
        await this.fetchList();
      } catch (e) {
        toast.error((e as Error).message);
        throw e;
      } finally {
        this.saving = false;
      }
    },
    async update(id: string, body: UpdateUserValues) {
      this.saving = true;
      try {
        await userApi.update(id, body);
        toast.success('User updated');
        await this.fetchList();
      } catch (e) {
        toast.error((e as Error).message);
        throw e;
      } finally {
        this.saving = false;
      }
    },
    async remove(id: string) {
      this.saving = true;
      try {
        await userApi.remove(id);
        toast.success('User deleted');
        await this.fetchList();
      } catch (e) {
        toast.error((e as Error).message);
        throw e;
      } finally {
        this.saving = false;
      }
    },
  },
});
