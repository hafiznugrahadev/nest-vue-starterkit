<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import {
  Boxes,
  LayoutDashboard,
  Users,
  FlaskConical,
  ScrollText,
  BookOpen,
  ExternalLink,
  ChevronDown,
} from 'lucide-vue-next';
import { useSidebarStore } from '~/stores/sidebar.store';
import { useAuthStore } from '~/stores/auth.store';
import UserMenu from './UserMenu.vue';
import { cn } from '~/lib/utils';
import type { NavItem } from './AppSidebar.vue';

const props = defineProps<{ expanded: boolean }>();

// NestJS Swagger UI is served by the API at `${apiPrefix}/docs`. VITE_API_BASE
// already includes the prefix (e.g. https://api.starterkit-dev.orb.local/api), so the
// docs live one segment deeper.
const SWAGGER_URL = `${(import.meta.env['VITE_API_BASE'] as string | undefined) ?? 'http://localhost:4400/api'}/docs`;

const NAV: NavItem[] = [
  { key: 'nav.dashboard', to: '/dashboard', icon: LayoutDashboard },
  { key: 'nav.users', to: '/users', icon: Users, adminOnly: true },
  { key: 'nav.fieldsDemo', to: '/demo/fields', icon: FlaskConical },
  {
    key: 'nav.masterData',
    icon: Boxes,
    adminOnly: true,
    children: [
      { key: 'nav.categories', to: '/master/categories', icon: Boxes },
      { key: 'nav.products', to: '/master/products', icon: Boxes },
      { key: 'nav.suppliers', to: '/master/suppliers', icon: Users },
    ],
  },
  { key: 'nav.logs', to: '/logs', icon: ScrollText, superAdminOnly: true },
  { key: 'nav.apiDocs', href: SWAGGER_URL, icon: BookOpen, superAdminOnly: true },
];

const { t } = useI18n();
const route = useRoute();
const sidebar = useSidebarStore();
const auth = useAuthStore();

const navItems = computed(() =>
  NAV.filter(
    (item) =>
      (!item.adminOnly || auth.isAdmin || auth.isSuperAdmin) &&
      (!item.superAdminOnly || auth.isSuperAdmin),
  ),
);

function isItemActive(item: NavItem): boolean {
  if (!item.to) return false;
  return route.path === item.to || (item.to !== '/dashboard' && route.path.startsWith(item.to));
}

function linkClass(active: boolean, level = 0) {
  return cn(
    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
    active
      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
      : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
    !props.expanded && level === 0 && 'justify-center px-0',
  );
}
</script>

<template>
  <div class="flex flex-col h-full bg-sidebar text-sidebar-foreground">
    <div
      :class="
        cn(
          'flex items-center h-16 shrink-0 border-b border-sidebar-border',
          expanded ? 'px-6 gap-3' : 'justify-center px-2',
        )
      "
    >
      <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary">
        <Boxes class="h-5 w-5 text-white" />
      </div>
      <span v-if="expanded" class="font-bold text-lg text-sidebar-accent-foreground tracking-tight">
        Starter Kit
      </span>
    </div>

    <nav class="flex-1 overflow-y-auto py-4 px-3 space-y-1">
      <template v-for="item in navItems" :key="item.key">
        <!-- Parent item with children (dropdown) -->
        <div v-if="item.children?.length">
          <button
            type="button"
            :class="cn(linkClass(false), 'w-full text-left')"
            @click="sidebar.toggleGroup(item.key)"
          >
            <component :is="item.icon" :class="cn('shrink-0', expanded ? 'h-5 w-5' : 'h-6 w-6')" />
            <span v-if="expanded" class="flex-1">{{ t(item.key) }}</span>
            <ChevronDown
              v-if="expanded"
              :class="
                cn(
                  'h-4 w-4 shrink-0 opacity-60 transition-transform duration-200',
                  sidebar.expandedGroups.includes(item.key) && 'rotate-180',
                )
              "
            />
          </button>
          <div v-if="sidebar.expandedGroups.includes(item.key) && expanded" class="space-y-1 pl-2">
            <RouterLink
              v-for="child in item.children"
              :key="child.key"
              :to="child.to ?? '/'"
              :class="linkClass(isItemActive(child), 1)"
              @click="sidebar.closeMobile()"
            >
              <component :is="child.icon" class="h-5 w-5 shrink-0" />
              <span class="flex-1">{{ t(child.key) }}</span>
            </RouterLink>
          </div>
        </div>

        <!-- External link -->
        <a
          v-else-if="item.href"
          :href="item.href"
          target="_blank"
          rel="noopener noreferrer"
          :class="linkClass(false)"
          @click="sidebar.closeMobile()"
        >
          <component :is="item.icon" :class="cn('shrink-0', expanded ? 'h-5 w-5' : 'h-6 w-6')" />
          <span v-if="expanded" class="flex-1">{{ t(item.key) }}</span>
          <ExternalLink v-if="expanded" class="h-4 w-4 shrink-0 opacity-60" />
        </a>

        <!-- Internal leaf link -->
        <RouterLink
          v-else
          :to="item.to ?? '/'"
          :class="linkClass(isItemActive(item))"
          @click="sidebar.closeMobile()"
        >
          <component :is="item.icon" :class="cn('shrink-0', expanded ? 'h-5 w-5' : 'h-6 w-6')" />
          <span v-if="expanded" class="flex-1">{{ t(item.key) }}</span>
        </RouterLink>
      </template>
    </nav>

    <div class="border-t border-sidebar-border p-3">
      <UserMenu :variant="expanded ? 'full' : 'compact'" placement="up" />
    </div>
  </div>
</template>
