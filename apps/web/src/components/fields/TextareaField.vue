<script setup lang="ts">
import { computed, toRef } from 'vue';
import { useField } from 'vee-validate';
import Textarea from '~/components/ui/Textarea.vue';
import Label from '~/components/ui/Label.vue';
import { cn } from '~/lib/utils';

const props = withDefaults(
  defineProps<{
    name: string;
    label?: string;
    required?: boolean;
    placeholder?: string;
    rows?: number;
  }>(),
  { rows: 4 },
);

const { value, errorMessage, handleBlur, meta } = useField<string>(toRef(props, 'name'));
const error = computed(() => (meta.touched ? errorMessage.value : undefined));
</script>

<template>
  <div class="space-y-1.5">
    <Label v-if="props.label" :for="props.name">
      {{ props.label }}
      <span v-if="props.required" class="ml-0.5 text-destructive">*</span>
    </Label>
    <Textarea
      :id="props.name"
      v-model="value"
      :placeholder="props.placeholder"
      :rows="props.rows"
      :class="cn(error && 'border-destructive focus:ring-destructive')"
      @blur="handleBlur($event, true)"
    />
    <p v-if="error" class="text-xs text-destructive">{{ error }}</p>
  </div>
</template>
