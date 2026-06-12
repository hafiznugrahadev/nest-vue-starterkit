<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { SwitchRoot, SwitchThumb } from 'reka-ui';
import { cn } from '~/lib/utils';

const props = defineProps<{
  id?: string;
  disabled?: boolean;
  class?: HTMLAttributes['class'];
}>();
const model = defineModel<boolean>({ default: false });
</script>

<template>
  <SwitchRoot
    :id="props.id"
    v-model="model"
    :disabled="props.disabled"
    :class="
      cn(
        'h-6 w-11 rounded-full border-2 border-transparent transition-colors data-[state=checked]:bg-primary data-[state=unchecked]:bg-input focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
        props.class,
      )
    "
  >
    <SwitchThumb
      class="pointer-events-none block h-5 w-5 rounded-full bg-white shadow-sm transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0"
    />
  </SwitchRoot>
</template>
