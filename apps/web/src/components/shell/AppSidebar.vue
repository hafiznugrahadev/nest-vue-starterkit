<script setup lang="ts">
import type { Component } from 'vue';
import { X } from 'lucide-vue-next';
import { useSidebarStore } from '~/stores/sidebar.store';
import SidebarContent from './SidebarContent.vue';

export interface NavItem {
  key: string;
  icon: Component;
  // Internal route (rendered as <RouterLink>) …
  to?: string;
  // … or an external URL (rendered as <a target="_blank">). Mutually exclusive with `to`.
  href?: string;
  adminOnly?: boolean;
  superAdminOnly?: boolean;
  // Nested navigation items for dropdowns
  children?: NavItem[];
}

const sidebar = useSidebarStore();
</script>

<template>
  <aside
    class="hidden lg:flex flex-col fixed left-0 top-0 h-full z-40 transition-all duration-300 overflow-hidden"
    :class="sidebar.expanded ? 'w-[290px]' : 'w-[90px]'"
  >
    <SidebarContent :expanded="sidebar.expanded" />
  </aside>

  <div
    v-if="sidebar.mobileOpen"
    class="fixed inset-0 z-40 bg-black/50 lg:hidden"
    @click="sidebar.closeMobile()"
  />
  <aside
    class="lg:hidden fixed left-0 top-0 h-full z-50 w-[290px] transition-transform duration-300"
    :class="sidebar.mobileOpen ? 'translate-x-0' : '-translate-x-full'"
  >
    <button
      type="button"
      class="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-accent hover:opacity-80 text-sidebar-accent-foreground transition-colors z-10"
      @click="sidebar.closeMobile()"
    >
      <X class="h-4 w-4" />
    </button>
    <SidebarContent :expanded="true" />
  </aside>
</template>
