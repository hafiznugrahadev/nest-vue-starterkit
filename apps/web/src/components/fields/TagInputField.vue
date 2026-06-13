<script setup lang="ts">
import { computed, ref, toRef } from 'vue';
import { useField } from 'vee-validate';
import { X } from 'lucide-vue-next';
import Label from '~/components/ui/Label.vue';
import FieldError from '~/components/fields/FieldError.vue';
import { cn } from '~/lib/utils';

const props = withDefaults(
  defineProps<{ name: string; label?: string; required?: boolean; placeholder?: string }>(),
  { placeholder: 'Add tag...' },
);

const inputValue = ref('');
const inputRef = ref<HTMLInputElement | null>(null);

const { value, errorMessage, handleBlur, meta } = useField<string[]>(toRef(props, 'name'));
const error = computed(() => (meta.touched ? errorMessage.value : undefined));
const tags = computed(() => value.value ?? []);

function addTag(raw: string) {
  const trimmed = raw.trim().replace(/,$/, '').trim();
  if (trimmed && !tags.value.includes(trimmed)) {
    value.value = [...tags.value, trimmed];
  }
  inputValue.value = '';
}

function removeTag(index: number) {
  value.value = tags.value.filter((_, i) => i !== index);
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' || e.key === ',') {
    e.preventDefault();
    addTag(inputValue.value);
  } else if (e.key === 'Backspace' && inputValue.value === '' && tags.value.length > 0) {
    value.value = tags.value.slice(0, -1);
  }
}

function handleInput() {
  if (inputValue.value.endsWith(',')) {
    addTag(inputValue.value);
  }
}
</script>

<template>
  <div class="space-y-1.5">
    <Label v-if="props.label">
      {{ props.label }}
      <span v-if="props.required" class="ml-0.5 text-destructive">*</span>
    </Label>
    <div
      :class="
        cn(
          'flex min-h-11 w-full flex-wrap items-center gap-1.5 rounded-lg border border-input bg-transparent px-3 py-2 transition-colors focus-within:ring-2 focus-within:ring-ring focus-within:border-primary cursor-text',
          error && 'border-destructive focus-within:ring-destructive',
        )
      "
      @click="inputRef?.focus()"
    >
      <span
        v-for="(tag, index) in tags"
        :key="index"
        class="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
      >
        {{ tag }}
        <button
          type="button"
          class="hover:text-destructive transition-colors"
          @click="removeTag(index)"
        >
          <X class="h-3 w-3" />
        </button>
      </span>
      <input
        ref="inputRef"
        v-model="inputValue"
        type="text"
        :placeholder="tags.length === 0 ? props.placeholder : ''"
        class="flex-1 min-w-[120px] bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none"
        @keydown="handleKeydown"
        @input="handleInput"
        @blur="handleBlur($event, true)"
      />
    </div>
    <FieldError :error="error" />
  </div>
</template>
