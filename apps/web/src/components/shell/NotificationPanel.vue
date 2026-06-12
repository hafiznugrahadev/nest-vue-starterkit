<script setup lang="ts">
import { PopoverRoot, PopoverTrigger } from 'reka-ui';
import { Bell, Info, AlertTriangle, CheckCircle2 } from 'lucide-vue-next';
import { formatDistanceToNow } from 'date-fns';
import { useI18n } from 'vue-i18n';
import PopoverContent from '~/components/ui/PopoverContent.vue';
import { useNotificationsStore } from '~/stores/notifications.store';
import { useAuthStore } from '~/stores/auth.store';
import { cn } from '~/lib/utils';

const { t } = useI18n();
const auth = useAuthStore();
const notifications = useNotificationsStore();

function handleOpen(open: boolean) {
  if (open && auth.isAuthenticated && !notifications.fetched) {
    notifications.fetch();
  }
}
</script>

<template>
  <PopoverRoot @update:open="handleOpen">
    <PopoverTrigger as-child>
      <button
        type="button"
        class="relative flex h-10 w-10 items-center justify-center rounded-lg hover:bg-accent transition-colors"
      >
        <Bell class="h-5 w-5" />
        <span
          v-if="notifications.unreadCount > 0"
          class="absolute top-1.5 right-1.5 flex h-2 w-2 items-center justify-center rounded-full bg-primary"
        >
          <span
            class="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"
          />
        </span>
      </button>
    </PopoverTrigger>
    <PopoverContent align="end" class="w-80 p-0">
      <div class="flex items-center justify-between border-b border-border px-4 py-3">
        <h3 class="font-semibold text-sm">{{ t('notifications.title') }}</h3>
        <button
          v-if="notifications.unreadCount > 0"
          type="button"
          class="text-xs text-primary hover:underline"
          @click="notifications.markAllRead()"
        >
          {{ t('notifications.markAllRead') }}
        </button>
      </div>
      <div class="max-h-[360px] overflow-y-auto">
        <div
          v-if="notifications.items.length === 0"
          class="flex flex-col items-center justify-center gap-1.5 py-10 text-center px-4"
        >
          <Bell class="h-8 w-8 text-muted-foreground/40" />
          <p class="text-sm font-medium text-muted-foreground">{{ t('notifications.empty') }}</p>
          <p class="text-xs text-muted-foreground/70">{{ t('notifications.emptyHint') }}</p>
        </div>
        <button
          v-for="n in notifications.items"
          v-else
          :key="n.id"
          type="button"
          :class="
            cn(
              'flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-accent transition-colors border-b border-border last:border-0',
              !n.readAt && 'bg-primary/5',
            )
          "
          @click="!n.readAt && notifications.markRead(n.id)"
        >
          <div class="mt-0.5">
            <AlertTriangle
              v-if="n.type === 'warning' || n.type === 'alert'"
              class="h-4 w-4 text-warning-500 shrink-0"
            />
            <CheckCircle2
              v-else-if="n.type === 'success'"
              class="h-4 w-4 text-success-500 shrink-0"
            />
            <Info v-else class="h-4 w-4 text-primary shrink-0" />
          </div>
          <div class="flex-1 min-w-0">
            <p :class="cn('text-sm font-medium truncate', !n.readAt && 'text-foreground')">
              {{ n.title }}
            </p>
            <p class="text-xs text-muted-foreground mt-0.5 line-clamp-2">{{ n.body }}</p>
            <p class="text-xs text-muted-foreground/60 mt-1">
              {{ formatDistanceToNow(new Date(n.createdAt), { addSuffix: true }) }}
            </p>
          </div>
          <span v-if="!n.readAt" class="mt-1.5 h-2 w-2 rounded-full bg-primary shrink-0" />
        </button>
      </div>
    </PopoverContent>
  </PopoverRoot>
</template>
