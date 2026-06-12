<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { DropdownMenuLabel } from 'reka-ui';
import { cn } from '~/lib/utils';

const props = defineProps<{ class?: HTMLAttributes['class'] }>();
</script>

<template>
  <DropdownMenuLabel
    :class="cn('px-3 py-1.5 text-xs text-muted-foreground font-medium', props.class)"
  >
    <slot />
  </DropdownMenuLabel>
</template>
