<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { Search, Plus, ChevronLeft, ChevronRight, Loader2, Pencil, Trash2 } from 'lucide-vue-next';
import { useI18n } from 'vue-i18n';
import type { User } from '@starterkit/shared-types';
import Button from '~/components/ui/Button.vue';
import Input from '~/components/ui/Input.vue';
import Modal from '~/components/ui/Modal.vue';
import Badge from '~/components/ui/Badge.vue';
import Avatar from '~/components/ui/Avatar.vue';
import UserFormModal from './UserFormModal.vue';
import { useUserStore } from '../user.store';

const props = defineProps<{ canManage: boolean }>();

const ROLE_FILTER_VALUES = ['SUPER_ADMIN', 'ADMIN', 'USER'] as const;

const { t } = useI18n();
const users = useUserStore();

const search = ref('');
const editingUser = ref<User | null>(null);
const deletingUser = ref<User | null>(null);
const createOpen = ref(false);
const editOpen = ref(false);
const deleteOpen = ref(false);

let searchTimer: ReturnType<typeof setTimeout> | undefined;
watch(search, (value) => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => users.setSearch(value), 300);
});

onMounted(() => {
  void users.fetchList();
});
onUnmounted(() => clearTimeout(searchTimer));

const ROLE_LABELS = computed<Record<string, string>>(() => ({
  SUPER_ADMIN: t('users.roles.superAdmin'),
  ADMIN: t('users.roles.admin'),
  USER: t('users.roles.user'),
}));

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

function roleBadgeVariant(role: string): 'default' | 'secondary' | 'muted' {
  if (role === 'SUPER_ADMIN') return 'default';
  if (role === 'ADMIN') return 'secondary';
  return 'muted';
}

function openEdit(user: User) {
  editingUser.value = user;
  editOpen.value = true;
}

function openDelete(user: User) {
  deletingUser.value = user;
  deleteOpen.value = true;
}

async function handleDeleteConfirm() {
  if (!deletingUser.value) return;
  await users.remove(deletingUser.value.id);
  deleteOpen.value = false;
  deletingUser.value = null;
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div class="flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          :variant="users.roles.length === 0 ? 'default' : 'outline'"
          @click="users.clearRoles()"
        >
          {{ t('users.roles.all') }}
        </Button>
        <Button
          v-for="role in ROLE_FILTER_VALUES"
          :key="role"
          size="sm"
          :variant="users.roles.includes(role) ? 'default' : 'outline'"
          @click="users.toggleRole(role)"
        >
          {{ ROLE_LABELS[role] }}
        </Button>
      </div>

      <div class="flex items-center gap-2">
        <div class="relative">
          <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input v-model="search" :placeholder="t('users.search')" class="pl-9 w-56" />
        </div>
        <Button v-if="props.canManage" size="sm" @click="createOpen = true">
          <Plus class="h-4 w-4" />
          {{ t('users.addUser') }}
        </Button>
      </div>
    </div>

    <div class="rounded-xl border border-border bg-card overflow-hidden">
      <div
        v-if="users.loading"
        class="flex items-center justify-center py-20 text-muted-foreground gap-2"
      >
        <Loader2 class="h-5 w-5 animate-spin" />
        <span>{{ t('state.loading') }}</span>
      </div>
      <div v-else-if="users.error" class="flex flex-col items-center justify-center py-20 gap-3">
        <p class="text-sm text-muted-foreground">{{ t('state.error') }}</p>
        <Button variant="outline" size="sm" @click="users.fetchList()">
          {{ t('state.retry') }}
        </Button>
      </div>
      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-border bg-muted/40">
              <th
                class="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap"
              >
                User
              </th>
              <th
                class="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap"
              >
                Roles
              </th>
              <th
                class="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap"
              >
                Joined
              </th>
              <th
                v-if="props.canManage"
                class="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap"
              />
            </tr>
          </thead>
          <tbody>
            <tr v-if="users.items.length === 0">
              <td
                :colspan="props.canManage ? 4 : 3"
                class="px-4 py-16 text-center text-muted-foreground"
              >
                <p class="font-medium">{{ t('users.noResults') }}</p>
                <p class="text-xs mt-1">{{ t('users.noResultsHint') }}</p>
              </td>
            </tr>
            <tr
              v-for="user in users.items"
              v-else
              :key="user.id"
              class="border-b border-border last:border-0 transition-colors hover:bg-muted/30"
            >
              <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                  <Avatar
                    class="h-8 w-8"
                    :src="user.avatarUrl"
                    :fallback="getInitials(user.name)"
                  />
                  <div class="flex flex-col">
                    <span class="text-sm font-medium leading-tight">{{ user.name }}</span>
                    <span class="text-xs text-muted-foreground leading-tight">{{
                      user.email
                    }}</span>
                  </div>
                </div>
              </td>
              <td class="px-4 py-3">
                <div class="flex flex-wrap gap-1">
                  <Badge v-for="role in user.roles" :key="role" :variant="roleBadgeVariant(role)">
                    {{ role.replace('_', ' ') }}
                  </Badge>
                </div>
              </td>
              <td class="px-4 py-3">
                <span class="text-sm text-muted-foreground">
                  {{ new Date(user.createdAt).toLocaleDateString() }}
                </span>
              </td>
              <td v-if="props.canManage" class="px-4 py-3">
                <div class="flex items-center gap-1">
                  <Button variant="ghost" size="sm" @click="openEdit(user)">
                    <Pencil class="h-3.5 w-3.5" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    class="text-destructive hover:text-destructive"
                    @click="openDelete(user)"
                  >
                    <Trash2 class="h-3.5 w-3.5" />
                    Delete
                  </Button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div
      v-if="!users.loading && !users.error && users.total > 0"
      class="flex items-center justify-between text-sm text-muted-foreground"
    >
      <span>{{ t('users.pagination.total', { n: users.total }) }}</span>
      <div class="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          :disabled="users.page <= 1"
          @click="users.setPage(Math.max(1, users.page - 1))"
        >
          <ChevronLeft class="h-4 w-4" />
          {{ t('users.pagination.prev') }}
        </Button>
        <span class="px-2">
          {{ t('users.pagination.page') }} {{ users.page }} {{ t('users.pagination.of') }}
          {{ users.totalPages }}
        </span>
        <Button
          variant="outline"
          size="sm"
          :disabled="users.page >= users.totalPages"
          @click="users.setPage(Math.min(users.totalPages, users.page + 1))"
        >
          {{ t('users.pagination.next') }}
          <ChevronRight class="h-4 w-4" />
        </Button>
      </div>
    </div>

    <UserFormModal v-model:open="createOpen" :user="null" />
    <UserFormModal v-model:open="editOpen" :user="editingUser" />

    <Modal v-model:open="deleteOpen" :title="t('users.deleteModal.title')">
      <div class="flex flex-col gap-4">
        <p class="text-sm text-muted-foreground">
          {{ t('users.deleteModal.body', { name: deletingUser?.name ?? '' }) }}
        </p>
        <div class="flex justify-end gap-2">
          <Button variant="outline" :disabled="users.saving" @click="deleteOpen = false">
            {{ t('users.deleteModal.cancel') }}
          </Button>
          <Button variant="destructive" :disabled="users.saving" @click="handleDeleteConfirm">
            {{ users.saving ? t('users.deleteModal.deleting') : t('users.deleteModal.confirm') }}
          </Button>
        </div>
      </div>
    </Modal>
  </div>
</template>
