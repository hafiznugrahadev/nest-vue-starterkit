<script setup lang="ts">
import { Menu, PanelLeftClose, PanelLeftOpen, Search } from 'lucide-vue-next';
import { useI18n } from 'vue-i18n';
import { useSidebarStore } from '~/stores/sidebar.store';
import { usePaletteStore } from '~/stores/palette.store';
import ThemeToggle from './ThemeToggle.vue';
import LanguageSwitcher from './LanguageSwitcher.vue';
import NotificationPanel from './NotificationPanel.vue';
import UserMenu from './UserMenu.vue';

const { t } = useI18n();
const sidebar = useSidebarStore();
const palette = usePaletteStore();
</script>

<template>
  <header
    class="h-16 sticky top-0 z-30 bg-card/95 backdrop-blur border-b border-border flex items-center px-4 gap-3"
  >
    <button
      type="button"
      class="flex lg:hidden h-10 w-10 items-center justify-center rounded-lg hover:bg-accent transition-colors"
      @click="sidebar.toggleMobile()"
    >
      <Menu class="h-5 w-5" />
    </button>

    <button
      type="button"
      class="hidden lg:flex h-10 w-10 items-center justify-center rounded-lg hover:bg-accent transition-colors"
      @click="sidebar.toggleExpanded()"
    >
      <PanelLeftClose v-if="sidebar.expanded" class="h-5 w-5" />
      <PanelLeftOpen v-else class="h-5 w-5" />
    </button>

    <button
      type="button"
      class="hidden md:flex flex-1 max-w-sm items-center gap-2 rounded-lg border border-input bg-background px-3 py-2 text-sm text-muted-foreground hover:bg-accent transition-colors"
      @click="palette.openPalette()"
    >
      <Search class="h-4 w-4 shrink-0" />
      <span class="flex-1 text-left">{{ t('commandPalette.placeholder') }}</span>
      <kbd
        class="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-border bg-muted px-1.5 text-xs font-mono text-muted-foreground"
      >
        <span class="text-xs">⌘</span>K
      </kbd>
    </button>

    <div class="flex-1" />

    <div class="flex items-center gap-1">
      <LanguageSwitcher />
      <ThemeToggle />
      <NotificationPanel />
      <UserMenu variant="compact" />
    </div>
  </header>
</template>
