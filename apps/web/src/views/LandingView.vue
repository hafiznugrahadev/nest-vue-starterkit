<script setup lang="ts">
import { Boxes, ShieldCheck, Table2, Component as ComponentIcon } from 'lucide-vue-next';
import Button from '~/components/ui/Button.vue';
import ThemeToggle from '~/components/shell/ThemeToggle.vue';
import { useAuthStore } from '~/stores/auth.store';
import { APP_NAME } from '~/lib/constants';

const auth = useAuthStore();

const FEATURES = [
  {
    icon: ShieldCheck,
    title: 'Auth',
    desc: 'JWT + httpOnly refresh cookie, role-based access',
  },
  {
    icon: Table2,
    title: 'DataTable',
    desc: 'Server-side pagination & filters',
  },
  {
    icon: ComponentIcon,
    title: 'Components',
    desc: '11 form fields, shadcn-vue, TailAdmin design',
  },
];
</script>

<template>
  <div class="min-h-screen bg-background flex flex-col">
    <header class="h-16 border-b border-border flex items-center px-6 justify-between">
      <div class="flex items-center gap-2 font-bold text-lg">
        <Boxes class="h-6 w-6 text-primary" />
        {{ APP_NAME }}
      </div>
      <div class="flex items-center gap-3">
        <ThemeToggle />
        <Button :to="auth.isAuthenticated ? '/dashboard' : '/login'">
          {{ auth.isAuthenticated ? 'Dashboard' : 'Sign in' }}
        </Button>
      </div>
    </header>
    <main class="flex-1 flex flex-col items-center justify-center p-8 text-center gap-12">
      <div class="space-y-4">
        <h1 class="text-5xl font-bold">{{ APP_NAME }}</h1>
        <p class="text-xl text-muted-foreground max-w-xl">
          NestJS API + Vue 3 SPA — production-ready monorepo starter
        </p>
        <div class="flex gap-3 justify-center mt-6">
          <Button size="lg" :to="auth.isAuthenticated ? '/dashboard' : '/login'">
            {{ auth.isAuthenticated ? 'Go to Dashboard' : 'Sign in' }}
          </Button>
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl w-full">
        <div
          v-for="feature in FEATURES"
          :key="feature.title"
          class="rounded-xl border border-border bg-card p-6 text-left"
        >
          <component :is="feature.icon" class="h-8 w-8 text-primary mb-3" />
          <h3 class="font-semibold mb-1">{{ feature.title }}</h3>
          <p class="text-sm text-muted-foreground">{{ feature.desc }}</p>
        </div>
      </div>
    </main>
  </div>
</template>
