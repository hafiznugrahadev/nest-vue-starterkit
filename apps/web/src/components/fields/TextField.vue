<script setup lang="ts">
import { computed, toRef } from 'vue';
import { useField } from 'vee-validate';
import Input from '~/components/ui/Input.vue';
import Label from '~/components/ui/Label.vue';
import { cn } from '~/lib/utils';

const props = withDefaults(
  defineProps<{
    name: string;
    label?: string;
    required?: boolean;
    type?: string;
    placeholder?: string;
  }>(),
  { type: 'text' },
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
    <Input
      :id="props.name"
      v-model="value"
      :type="props.type"
      :placeholder="props.placeholder"
      :class="cn(error && 'border-destructive focus:ring-destructive')"
      @blur="handleBlur($event, true)"
    />
    <p v-if="error" class="text-xs text-destructive">{{ error }}</p>
  </div>
</template>
