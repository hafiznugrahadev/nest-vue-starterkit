<script setup lang="ts">
import AppSidebar from '~/components/shell/AppSidebar.vue';
import AppHeader from '~/components/shell/AppHeader.vue';
import CommandPalette from '~/components/shell/CommandPalette.vue';
import { useSidebarStore } from '~/stores/sidebar.store';
import { cn } from '~/lib/utils';

const sidebar = useSidebarStore();
</script>

<template>
  <div class="flex min-h-screen bg-background">
    <AppSidebar />
    <div
      :class="
        cn(
          'flex flex-1 flex-col transition-all duration-300',
          sidebar.expanded ? 'lg:ml-[290px]' : 'lg:ml-[90px]',
        )
      "
    >
      <AppHeader />
      <main class="flex-1 p-6">
        <RouterView />
      </main>
    </div>
    <CommandPalette />
  </div>
</template>
