<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { CheckboxRoot, CheckboxIndicator } from 'reka-ui';
import { Check } from 'lucide-vue-next';
import { cn } from '~/lib/utils';

const props = defineProps<{
  id?: string;
  disabled?: boolean;
  class?: HTMLAttributes['class'];
}>();
const model = defineModel<boolean>({ default: false });
</script>

<template>
  <CheckboxRoot
    :id="props.id"
    v-model="model"
    :disabled="props.disabled"
    :class="
      cn(
        'h-5 w-5 rounded border-2 border-input data-[state=checked]:bg-primary data-[state=checked]:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
        props.class,
      )
    "
  >
    <CheckboxIndicator class="flex items-center justify-center">
      <Check class="w-3 h-3 text-white" />
    </CheckboxIndicator>
  </CheckboxRoot>
</template>
