<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { PopoverPortal, PopoverContent } from 'reka-ui';
import { cn } from '~/lib/utils';

const props = withDefaults(
  defineProps<{
    align?: 'start' | 'center' | 'end';
    sideOffset?: number;
    class?: HTMLAttributes['class'];
  }>(),
  { align: 'center', sideOffset: 4 },
);
</script>

<template>
  <PopoverPortal>
    <PopoverContent
      :align="props.align"
      :side-offset="props.sideOffset"
      :class="cn('z-50 rounded-xl border border-border bg-card shadow-theme-md', props.class)"
    >
      <slot />
    </PopoverContent>
  </PopoverPortal>
</template>
