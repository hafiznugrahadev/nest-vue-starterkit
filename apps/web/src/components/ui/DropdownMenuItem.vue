<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { DropdownMenuItem } from 'reka-ui';
import { cn } from '~/lib/utils';

const props = defineProps<{ class?: HTMLAttributes['class'] }>();
const emit = defineEmits<{ select: [event: Event] }>();
</script>

<template>
  <DropdownMenuItem
    :class="
      cn(
        'flex items-center gap-2 rounded-lg px-3 py-2 text-sm cursor-pointer hover:bg-accent outline-none',
        props.class,
      )
    "
    @select="emit('select', $event)"
  >
    <slot />
  </DropdownMenuItem>
</template>
