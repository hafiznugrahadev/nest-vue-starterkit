<script setup lang="ts">
import { computed, toRef } from 'vue';
import { useField } from 'vee-validate';
import Switch from '~/components/ui/Switch.vue';
import Label from '~/components/ui/Label.vue';

const props = defineProps<{ name: string; label?: string; required?: boolean }>();

const { value, errorMessage, handleBlur, meta } = useField<boolean>(toRef(props, 'name'));
const error = computed(() => (meta.touched ? errorMessage.value : undefined));

const model = computed({
  get: () => value.value === true,
  set: (v: boolean) => {
    value.value = v;
    handleBlur(undefined, true);
  },
});
</script>

<template>
  <div class="space-y-1.5">
    <div class="flex items-center gap-2">
      <Switch :id="props.name" v-model="model" />
      <Label v-if="props.label" :for="props.name" class="cursor-pointer">
        {{ props.label }}
        <span v-if="props.required" class="ml-0.5 text-destructive">*</span>
      </Label>
    </div>
    <p v-if="error" class="text-xs text-destructive">{{ error }}</p>
  </div>
</template>
