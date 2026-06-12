<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { RadioGroupItem, RadioGroupIndicator } from 'reka-ui';
import { cn } from '~/lib/utils';

const props = defineProps<{
  id?: string;
  value: string;
  disabled?: boolean;
  class?: HTMLAttributes['class'];
}>();
</script>

<template>
  <RadioGroupItem
    :id="props.id"
    :value="props.value"
    :disabled="props.disabled"
    :class="
      cn(
        'h-5 w-5 rounded-full border-2 border-input data-[state=checked]:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
        props.class,
      )
    "
  >
    <RadioGroupIndicator class="flex items-center justify-center">
      <div class="h-2.5 w-2.5 rounded-full bg-primary" />
    </RadioGroupIndicator>
  </RadioGroupItem>
</template>
