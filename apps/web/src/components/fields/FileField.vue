<script setup lang="ts">
import { computed, ref, toRef } from 'vue';
import { useField } from 'vee-validate';
import { Paperclip, X } from 'lucide-vue-next';
import Label from '~/components/ui/Label.vue';
import { cn } from '~/lib/utils';

const props = defineProps<{
  name: string;
  label?: string;
  required?: boolean;
  accept?: string;
}>();

const inputRef = ref<HTMLInputElement | null>(null);

const { value, errorMessage, handleBlur, meta } = useField<File | null>(toRef(props, 'name'));
const error = computed(() => (meta.touched ? errorMessage.value : undefined));

function handleFileChange(e: Event) {
  const target = e.target as HTMLInputElement;
  value.value = target.files?.[0] ?? null;
}

function handleClear(e: Event) {
  e.stopPropagation();
  value.value = null;
  if (inputRef.value) inputRef.value.value = '';
}
</script>

<template>
  <div class="space-y-1.5">
    <Label v-if="props.label" :for="props.name">
      {{ props.label }}
      <span v-if="props.required" class="ml-0.5 text-destructive">*</span>
    </Label>
    <input
      :id="props.name"
      ref="inputRef"
      type="file"
      :accept="props.accept"
      class="hidden"
      @change="handleFileChange"
      @blur="handleBlur($event, true)"
    />
    <button
      type="button"
      :class="
        cn(
          'flex h-11 w-full items-center gap-2 rounded-lg border border-input bg-transparent px-4 py-2.5 text-sm transition-colors hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary',
          error && 'border-destructive focus:ring-destructive',
        )
      "
      @click="inputRef?.click()"
    >
      <Paperclip class="h-4 w-4 shrink-0 text-muted-foreground" />
      <span :class="cn('flex-1 truncate text-left', !value && 'text-muted-foreground')">
        {{ value ? value.name : 'Choose file...' }}
      </span>
      <span
        v-if="value"
        role="button"
        tabindex="0"
        class="text-muted-foreground hover:text-destructive transition-colors"
        @click="handleClear"
        @keydown.enter="handleClear"
      >
        <X class="h-4 w-4" />
      </span>
    </button>
    <p v-if="error" class="text-xs text-destructive">{{ error }}</p>
  </div>
</template>
