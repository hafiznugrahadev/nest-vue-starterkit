<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { cn } from '~/lib/utils';
import { buttonVariants, type ButtonVariants } from './button-variants';

interface Props {
  variant?: ButtonVariants['variant'];
  size?: ButtonVariants['size'];
  class?: HTMLAttributes['class'];
  // When set, renders a RouterLink styled as a button (replaces React's asChild).
  to?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), { type: 'button' });
</script>

<template>
  <RouterLink
    v-if="props.to"
    :to="props.to"
    :class="cn(buttonVariants({ variant, size }), props.class)"
  >
    <slot />
  </RouterLink>
  <button
    v-else
    :type="props.type"
    :disabled="props.disabled"
    :class="cn(buttonVariants({ variant, size }), props.class)"
  >
    <slot />
  </button>
</template>
