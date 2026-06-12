<script setup lang="ts">
import { DropdownMenuRoot, DropdownMenuTrigger } from 'reka-ui';
import { LogOut, User } from 'lucide-vue-next';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { computed } from 'vue';
import DropdownMenuContent from '~/components/ui/DropdownMenuContent.vue';
import DropdownMenuItem from '~/components/ui/DropdownMenuItem.vue';
import DropdownMenuLabel from '~/components/ui/DropdownMenuLabel.vue';
import DropdownMenuSeparator from '~/components/ui/DropdownMenuSeparator.vue';
import { useAuthStore } from '~/stores/auth.store';
import { cn } from '~/lib/utils';

const props = withDefaults(
  defineProps<{ variant?: 'compact' | 'full'; placement?: 'up' | 'down' }>(),
  {
    variant: 'compact',
    placement: 'down',
  },
);

const { t } = useI18n();
const router = useRouter();
const auth = useAuthStore();

const initials = computed(() => {
  const name = auth.user?.name;
  if (!name) return '?';
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
});

async function handleLogout() {
  await auth.logout();
  router.push({ name: 'login' });
}
</script>

<template>
  <DropdownMenuRoot>
    <DropdownMenuTrigger as-child>
      <button
        type="button"
        data-testid="user-menu-trigger"
        :class="
          cn(
            'flex items-center gap-2.5 rounded-lg transition-colors outline-none',
            props.variant === 'full'
              ? 'w-full px-3 py-2 hover:bg-sidebar-accent'
              : 'p-1 hover:bg-accent',
          )
        "
      >
        <div
          class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold"
        >
          {{ initials }}
        </div>
        <div v-if="props.variant === 'full' && auth.user" class="flex flex-col items-start min-w-0">
          <span class="text-sm font-medium text-sidebar-foreground truncate max-w-[150px]">
            {{ auth.user.name }}
          </span>
          <span class="text-xs text-sidebar-foreground/60 truncate max-w-[150px]">
            {{ auth.user.email }}
          </span>
        </div>
      </button>
    </DropdownMenuTrigger>
    <DropdownMenuContent
      align="end"
      :side="props.placement === 'up' ? 'top' : 'bottom'"
      class="w-56"
    >
      <template v-if="auth.user">
        <DropdownMenuLabel class="px-3 py-2">
          <p class="text-sm font-semibold text-foreground">{{ auth.user.name }}</p>
          <p class="text-xs text-muted-foreground">{{ auth.user.email }}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
      </template>
      <DropdownMenuItem @select="router.push({ name: 'profile' })">
        <User class="h-4 w-4" />
        {{ t('nav.profile') }}
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        data-testid="logout-button"
        class="text-destructive focus:text-destructive"
        @select="handleLogout"
      >
        <LogOut class="h-4 w-4" />
        {{ t('nav.signOut') }}
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenuRoot>
</template>
