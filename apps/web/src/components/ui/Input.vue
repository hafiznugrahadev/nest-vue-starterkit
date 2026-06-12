<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { cn } from '~/lib/utils';

defineOptions({ inheritAttrs: false });
const props = defineProps<{ class?: HTMLAttributes['class'] }>();
const model = defineModel<string>({ default: '' });
</script>

<template>
  <input
    v-bind="$attrs"
    v-model="model"
    :class="
      cn(
        'flex h-11 w-full rounded-lg border border-input bg-transparent px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-colors disabled:cursor-not-allowed disabled:opacity-50',
        props.class,
      )
    "
  />
</template>
