<script setup lang="ts">
import { Moon, Sun } from 'lucide-vue-next';
import { useThemeStore } from '~/stores/theme.store';

const theme = useThemeStore();
</script>

<template>
  <button
    type="button"
    class="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-accent transition-colors"
    @click="theme.toggle()"
  >
    <Sun v-if="theme.theme === 'dark'" class="h-5 w-5" />
    <Moon v-else class="h-5 w-5" />
  </button>
</template>
