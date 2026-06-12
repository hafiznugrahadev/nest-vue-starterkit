<script setup lang="ts">
import { computed, toRef } from 'vue';
import { useField } from 'vee-validate';
import Label from '~/components/ui/Label.vue';
import { cn } from '~/lib/utils';

const props = defineProps<{
  name: string;
  label?: string;
  required?: boolean;
  min?: string;
  max?: string;
}>();

const { value, errorMessage, handleBlur, meta } = useField<string>(toRef(props, 'name'));
const error = computed(() => (meta.touched ? errorMessage.value : undefined));
</script>

<template>
  <div class="space-y-1.5">
    <Label v-if="props.label" :for="props.name">
      {{ props.label }}
      <span v-if="props.required" class="ml-0.5 text-destructive">*</span>
    </Label>
    <input
      :id="props.name"
      v-model="value"
      type="date"
      :min="props.min"
      :max="props.max"
      :class="
        cn(
          'flex h-11 w-full rounded-lg border border-input bg-transparent px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-colors disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-destructive focus:ring-destructive',
        )
      "
      @blur="handleBlur($event, true)"
    />
    <p v-if="error" class="text-xs text-destructive">{{ error }}</p>
  </div>
</template>
