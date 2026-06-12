<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { SliderRoot, SliderTrack, SliderRange, SliderThumb } from 'reka-ui';
import { cn } from '~/lib/utils';

const props = defineProps<{
  id?: string;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  class?: HTMLAttributes['class'];
}>();
const model = defineModel<number[]>({ default: () => [0] });
</script>

<template>
  <SliderRoot
    :id="props.id"
    v-model="model"
    :min="props.min ?? 0"
    :max="props.max ?? 100"
    :step="props.step ?? 1"
    :disabled="props.disabled"
    :class="cn('relative flex w-full touch-none items-center', props.class)"
  >
    <SliderTrack class="relative h-2 w-full rounded-full bg-secondary">
      <SliderRange class="absolute h-full rounded-full bg-primary" />
    </SliderTrack>
    <SliderThumb
      class="block h-5 w-5 rounded-full border-2 border-primary bg-white shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
    />
  </SliderRoot>
</template>
