<script setup lang="ts">
import { computed, ref, toRef } from 'vue';
import { useField } from 'vee-validate';
import { Eye, EyeOff } from 'lucide-vue-next';
import Label from '~/components/ui/Label.vue';
import { cn } from '~/lib/utils';

const props = defineProps<{
  name: string;
  label?: string;
  required?: boolean;
  placeholder?: string;
}>();

const show = ref(false);
const { value, errorMessage, handleBlur, meta } = useField<string>(toRef(props, 'name'));
const error = computed(() => (meta.touched ? errorMessage.value : undefined));
</script>

<template>
  <div class="space-y-1.5">
    <Label v-if="props.label" :for="props.name">
      {{ props.label }}
      <span v-if="props.required" class="ml-0.5 text-destructive">*</span>
    </Label>
    <div class="relative">
      <input
        :id="props.name"
        v-model="value"
        :type="show ? 'text' : 'password'"
        :placeholder="props.placeholder"
        :class="
          cn(
            'flex h-11 w-full rounded-lg border border-input bg-transparent px-4 py-2.5 pr-10 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-colors disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-destructive focus:ring-destructive',
          )
        "
        @blur="handleBlur($event, true)"
      />
      <button
        type="button"
        tabindex="-1"
        class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
        @click="show = !show"
      >
        <EyeOff v-if="show" class="h-4 w-4" />
        <Eye v-else class="h-4 w-4" />
      </button>
    </div>
    <p v-if="error" class="text-xs text-destructive">{{ error }}</p>
  </div>
</template>
