<script setup lang="ts">
import { computed, ref, toRef } from 'vue';
import { useField } from 'vee-validate';
import { PopoverRoot, PopoverTrigger } from 'reka-ui';
import { Check, ChevronsUpDown, X } from 'lucide-vue-next';
import PopoverContent from '~/components/ui/PopoverContent.vue';
import Label from '~/components/ui/Label.vue';
import { cn } from '~/lib/utils';

interface SelectOption {
  label: string;
  value: string;
}

const props = withDefaults(
  defineProps<{
    name: string;
    label?: string;
    required?: boolean;
    placeholder?: string;
    options: SelectOption[];
    multiple?: boolean;
  }>(),
  { placeholder: 'Select...', multiple: false },
);

const open = ref(false);
const search = ref('');

const { value, errorMessage, handleBlur, meta } = useField<string | string[] | undefined>(
  toRef(props, 'name'),
);
const error = computed(() => (meta.touched ? errorMessage.value : undefined));

const filteredOptions = computed(() =>
  props.options.filter((o) => o.label.toLowerCase().includes(search.value.toLowerCase())),
);

const singleValue = computed(() =>
  props.multiple ? undefined : (value.value as string | undefined),
);
const multiValue = computed(() => (props.multiple ? ((value.value as string[]) ?? []) : []));

function isSelected(v: string) {
  if (props.multiple) return multiValue.value.includes(v);
  return singleValue.value === v;
}

function handleSelect(v: string) {
  if (props.multiple) {
    const current = multiValue.value;
    value.value = current.includes(v) ? current.filter((x) => x !== v) : [...current, v];
  } else {
    value.value = v;
    open.value = false;
  }
}

function removeTag(v: string, e: Event) {
  e.stopPropagation();
  value.value = multiValue.value.filter((x) => x !== v);
}

function getLabel(v: string) {
  return props.options.find((o) => o.value === v)?.label ?? v;
}
</script>

<template>
  <div class="space-y-1.5">
    <Label v-if="props.label">
      {{ props.label }}
      <span v-if="props.required" class="ml-0.5 text-destructive">*</span>
    </Label>
    <PopoverRoot v-model:open="open">
      <PopoverTrigger as-child>
        <button
          type="button"
          :class="
            cn(
              'flex min-h-11 w-full items-center rounded-lg border border-input bg-transparent px-4 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary',
              error && 'border-destructive focus:ring-destructive',
            )
          "
          @blur="handleBlur($event, true)"
        >
          <span class="flex flex-1 flex-wrap gap-1.5">
            <template v-if="props.multiple">
              <template v-if="multiValue.length > 0">
                <span
                  v-for="v in multiValue"
                  :key="v"
                  class="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary"
                >
                  {{ getLabel(v) }}
                  <!-- Not a <button>: this sits inside the trigger <button>,
                       so nesting one would be invalid HTML. -->
                  <span
                    role="button"
                    tabindex="-1"
                    :aria-label="`Remove ${getLabel(v)}`"
                    class="cursor-pointer hover:text-destructive"
                    @pointerdown.stop
                    @click="removeTag(v, $event)"
                  >
                    <X class="h-3 w-3" />
                  </span>
                </span>
              </template>
              <span v-else class="text-muted-foreground">{{ props.placeholder }}</span>
            </template>
            <template v-else>
              <span v-if="singleValue">{{ getLabel(singleValue) }}</span>
              <span v-else class="text-muted-foreground">{{ props.placeholder }}</span>
            </template>
          </span>
          <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent class="w-full min-w-[var(--reka-popover-trigger-width)] p-0">
        <div class="flex flex-col">
          <div class="border-b border-border px-3 py-2">
            <input
              v-model="search"
              type="text"
              placeholder="Search..."
              class="w-full bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none"
            />
          </div>
          <ul class="max-h-60 overflow-y-auto p-1.5">
            <li v-if="filteredOptions.length === 0" class="px-3 py-2 text-sm text-muted-foreground">
              No options found.
            </li>
            <li v-for="option in filteredOptions" v-else :key="option.value">
              <button
                type="button"
                class="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-accent transition-colors"
                @click="handleSelect(option.value)"
              >
                <Check
                  :class="
                    cn('h-4 w-4 shrink-0', isSelected(option.value) ? 'text-primary' : 'opacity-0')
                  "
                />
                {{ option.label }}
              </button>
            </li>
          </ul>
        </div>
      </PopoverContent>
    </PopoverRoot>
    <p v-if="error" class="text-xs text-destructive">{{ error }}</p>
  </div>
</template>
