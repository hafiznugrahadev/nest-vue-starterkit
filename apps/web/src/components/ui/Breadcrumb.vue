<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { ChevronRight } from 'lucide-vue-next';
import { cn } from '~/lib/utils';

export interface BreadcrumbItem {
  label: string;
  to?: string;
}

const props = defineProps<{ items: BreadcrumbItem[]; class?: HTMLAttributes['class'] }>();
</script>

<template>
  <nav aria-label="breadcrumb" :class="cn('flex items-center', props.class)">
    <ol class="flex items-center gap-1.5">
      <li v-for="(item, index) in props.items" :key="index" class="flex items-center gap-1.5">
        <span v-if="index === props.items.length - 1" class="text-foreground font-medium text-sm">
          {{ item.label }}
        </span>
        <RouterLink
          v-else-if="item.to"
          :to="item.to"
          class="text-muted-foreground hover:text-foreground text-sm transition-colors"
        >
          {{ item.label }}
        </RouterLink>
        <span v-else class="text-muted-foreground text-sm">{{ item.label }}</span>
        <ChevronRight
          v-if="index !== props.items.length - 1"
          class="h-4 w-4 text-muted-foreground"
        />
      </li>
    </ol>
  </nav>
</template>
