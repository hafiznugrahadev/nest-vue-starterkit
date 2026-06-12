<script setup lang="ts">
import { Boxes } from 'lucide-vue-next';
import ThemeToggle from '~/components/shell/ThemeToggle.vue';
import LanguageSwitcher from '~/components/shell/LanguageSwitcher.vue';
import { APP_NAME } from '~/lib/constants';
</script>

<template>
  <div class="min-h-screen lg:grid lg:grid-cols-2">
    <div class="flex flex-col items-center justify-center p-8 relative">
      <div class="absolute top-4 right-4 flex items-center gap-2">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>
      <div class="w-full max-w-sm">
        <RouterView />
      </div>
    </div>
    <div
      class="hidden lg:flex flex-col items-center justify-center bg-sidebar text-sidebar-foreground p-12"
    >
      <div class="flex flex-col items-center gap-6 text-center">
        <div class="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/10">
          <Boxes class="h-10 w-10" />
        </div>
        <div>
          <h1 class="text-3xl font-bold">{{ APP_NAME }}</h1>
          <p class="mt-2 text-sidebar-foreground/70 text-lg">NestJS + Vue SPA</p>
        </div>
      </div>
    </div>
  </div>
</template>
