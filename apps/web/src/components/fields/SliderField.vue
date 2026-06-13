<script setup lang="ts">
import { computed, toRef } from 'vue';
import { useField } from 'vee-validate';
import Slider from '~/components/ui/Slider.vue';
import Label from '~/components/ui/Label.vue';
import FieldError from '~/components/fields/FieldError.vue';

const props = withDefaults(
  defineProps<{
    name: string;
    label?: string;
    required?: boolean;
    min?: number;
    max?: number;
    step?: number;
  }>(),
  { min: 0, max: 100, step: 1 },
);

const { value, errorMessage, meta, handleBlur } = useField<number>(toRef(props, 'name'));
const error = computed(() => (meta.touched ? errorMessage.value : undefined));

const model = computed({
  get: () => [value.value ?? 0],
  set: (v: number[]) => {
    value.value = v[0] ?? 0;
    handleBlur(undefined, true);
  },
});
</script>

<template>
  <div class="space-y-1.5">
    <div v-if="props.label" class="flex items-center justify-between">
      <Label :for="props.name">
        {{ props.label }}
        <span v-if="props.required" class="ml-0.5 text-destructive">*</span>
      </Label>
      <span class="text-sm text-muted-foreground">{{ value }}</span>
    </div>
    <Slider :id="props.name" v-model="model" :min="props.min" :max="props.max" :step="props.step" />
    <FieldError :error="error" />
  </div>
</template>
