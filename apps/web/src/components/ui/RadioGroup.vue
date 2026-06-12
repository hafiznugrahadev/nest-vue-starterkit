<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { RadioGroupRoot } from 'reka-ui';
import { cn } from '~/lib/utils';

const props = defineProps<{ class?: HTMLAttributes['class']; disabled?: boolean }>();
const model = defineModel<string>({ default: '' });
</script>

<template>
  <RadioGroupRoot v-model="model" :disabled="props.disabled" :class="cn('grid gap-2', props.class)">
    <slot />
  </RadioGroupRoot>
</template>
