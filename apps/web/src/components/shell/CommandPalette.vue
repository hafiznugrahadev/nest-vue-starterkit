<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch, type Component } from 'vue';
import {
  DialogRoot,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from 'reka-ui';
import { LayoutDashboard, Users, User, LogOut } from 'lucide-vue-next';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { usePaletteStore } from '~/stores/palette.store';
import { useAuthStore } from '~/stores/auth.store';
import { cn } from '~/lib/utils';

const { t } = useI18n();
const router = useRouter();
const palette = usePaletteStore();
const auth = useAuthStore();

const query = ref('');
const activeIndex = ref(0);

interface PaletteItem {
  key: string;
  icon: Component;
  destructive?: boolean;
  run: () => void | Promise<void>;
}

const ITEMS: PaletteItem[] = [
  {
    key: 'nav.dashboard',
    icon: LayoutDashboard,
    run: () => {
      void router.push({ name: 'dashboard' });
    },
  },
  {
    key: 'nav.users',
    icon: Users,
    run: () => {
      void router.push({ name: 'users' });
    },
  },
  {
    key: 'nav.profile',
    icon: User,
    run: () => {
      void router.push({ name: 'profile' });
    },
  },
  {
    key: 'nav.signOut',
    icon: LogOut,
    destructive: true,
    run: async () => {
      await auth.logout();
      void router.push({ name: 'login' });
    },
  },
];

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase();
  if (!q) return ITEMS;
  return ITEMS.filter((item) => t(item.key).toLowerCase().includes(q));
});

watch([query, () => palette.open], () => {
  activeIndex.value = 0;
  if (!palette.open) query.value = '';
});

function runItem(item: PaletteItem) {
  palette.closePalette();
  void item.run();
}

function onKeydown(e: KeyboardEvent) {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault();
    palette.toggle();
  }
}

function onListKeydown(e: KeyboardEvent) {
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    activeIndex.value = Math.min(activeIndex.value + 1, filtered.value.length - 1);
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    activeIndex.value = Math.max(activeIndex.value - 1, 0);
  } else if (e.key === 'Enter') {
    e.preventDefault();
    const item = filtered.value[activeIndex.value];
    if (item) runItem(item);
  }
}

onMounted(() => document.addEventListener('keydown', onKeydown));
onUnmounted(() => document.removeEventListener('keydown', onKeydown));
</script>

<template>
  <DialogRoot
    :open="palette.open"
    @update:open="(v) => (v ? palette.openPalette() : palette.closePalette())"
  >
    <DialogPortal>
      <DialogOverlay
        class="fixed inset-0 bg-black/60 z-50 data-[state=open]:animate-[dialog-overlay-in_200ms_ease-out] data-[state=closed]:animate-[dialog-overlay-out_150ms_ease-in]"
      />
      <DialogContent
        class="fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%] w-full max-w-lg rounded-2xl border border-border bg-card shadow-theme-md p-0 gap-0 overflow-hidden data-[state=open]:animate-[dialog-content-in_200ms_ease-out] data-[state=closed]:animate-[dialog-content-out_150ms_ease-in]"
      >
        <DialogTitle class="sr-only">{{ t('commandPalette.title') }}</DialogTitle>
        <DialogDescription class="sr-only">{{ t('commandPalette.placeholder') }}</DialogDescription>
        <div class="flex items-center border-b border-border px-3">
          <!-- eslint-disable-next-line vuejs-accessibility/no-autofocus -->
          <input
            v-model="query"
            autofocus
            :placeholder="t('commandPalette.placeholder')"
            class="flex h-11 w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
            @keydown="onListKeydown"
          />
        </div>
        <div class="max-h-[320px] overflow-y-auto p-2">
          <p v-if="filtered.length === 0" class="py-6 text-center text-sm text-muted-foreground">
            {{ t('commandPalette.noResults') }}
          </p>
          <template v-else>
            <p class="px-3 py-2 text-xs font-medium text-muted-foreground">
              {{ t('commandPalette.navigation') }}
            </p>
            <button
              v-for="(item, index) in filtered"
              :key="item.key"
              type="button"
              :class="
                cn(
                  'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm cursor-pointer hover:bg-accent outline-none',
                  index === activeIndex && 'bg-accent',
                  item.destructive && 'text-destructive',
                )
              "
              @mouseenter="activeIndex = index"
              @click="runItem(item)"
            >
              <component
                :is="item.icon"
                :class="cn('h-4 w-4', !item.destructive && 'text-muted-foreground')"
              />
              {{ t(item.key) }}
            </button>
          </template>
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
