<script setup lang="ts">
import { computed, toRef } from 'vue';
import { useField } from 'vee-validate';
import RadioGroup from '~/components/ui/RadioGroup.vue';
import RadioGroupItem from '~/components/ui/RadioGroupItem.vue';
import Label from '~/components/ui/Label.vue';

const props = defineProps<{
  name: string;
  label?: string;
  required?: boolean;
  options: { label: string; value: string }[];
}>();

const { value, errorMessage, handleBlur, meta } = useField<string>(toRef(props, 'name'));
const error = computed(() => (meta.touched ? errorMessage.value : undefined));

const model = computed({
  get: () => value.value ?? '',
  set: (v: string) => {
    value.value = v;
    handleBlur(undefined, true);
  },
});
</script>

<template>
  <div class="space-y-1.5">
    <Label v-if="props.label">
      {{ props.label }}
      <span v-if="props.required" class="ml-0.5 text-destructive">*</span>
    </Label>
    <RadioGroup v-model="model" class="flex flex-col gap-2">
      <div v-for="option in props.options" :key="option.value" class="flex items-center gap-2">
        <RadioGroupItem :id="`${props.name}-${option.value}`" :value="option.value" />
        <Label :for="`${props.name}-${option.value}`" class="cursor-pointer font-normal">
          {{ option.label }}
        </Label>
      </div>
    </RadioGroup>
    <p v-if="error" class="text-xs text-destructive">{{ error }}</p>
  </div>
</template>
