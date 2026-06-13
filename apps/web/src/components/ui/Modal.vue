<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import {
  DialogRoot,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from 'reka-ui';
import { X } from 'lucide-vue-next';
import { cn } from '~/lib/utils';

const props = defineProps<{
  title?: string;
  description?: string;
  class?: HTMLAttributes['class'];
}>();
const open = defineModel<boolean>('open', { default: false });
</script>

<template>
  <DialogRoot v-model:open="open">
    <DialogPortal>
      <DialogOverlay
        class="fixed inset-0 bg-black/60 z-50 data-[state=open]:animate-[dialog-overlay-in_200ms_ease-out] data-[state=closed]:animate-[dialog-overlay-out_150ms_ease-in]"
      />
      <DialogContent
        :class="
          cn(
            'fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%] w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-theme-md',
            'data-[state=open]:animate-[dialog-content-in_200ms_ease-out] data-[state=closed]:animate-[dialog-content-out_150ms_ease-in]',
            props.class,
          )
        "
      >
        <div v-if="props.title || props.description" class="mb-4">
          <DialogTitle v-if="props.title" class="text-lg font-semibold">
            {{ props.title }}
          </DialogTitle>
          <DialogDescription v-if="props.description" class="text-sm text-muted-foreground mt-1">
            {{ props.description }}
          </DialogDescription>
        </div>
        <slot />
        <DialogClose
          class="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring transition-opacity"
        >
          <X class="h-4 w-4" />
          <span class="sr-only">Close</span>
        </DialogClose>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
