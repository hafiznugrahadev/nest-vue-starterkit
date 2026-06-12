<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { DropdownMenuPortal, DropdownMenuContent } from 'reka-ui';
import { cn } from '~/lib/utils';

const props = withDefaults(
  defineProps<{
    align?: 'start' | 'center' | 'end';
    side?: 'top' | 'right' | 'bottom' | 'left';
    sideOffset?: number;
    class?: HTMLAttributes['class'];
  }>(),
  { align: 'center', side: 'bottom', sideOffset: 4 },
);
</script>

<template>
  <DropdownMenuPortal>
    <DropdownMenuContent
      :align="props.align"
      :side="props.side"
      :side-offset="props.sideOffset"
      :class="
        cn(
          'z-50 min-w-[180px] rounded-xl border border-border bg-card p-1.5 shadow-theme-md',
          props.class,
        )
      "
    >
      <slot />
    </DropdownMenuContent>
  </DropdownMenuPortal>
</template>
