<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { AvatarRoot, AvatarImage, AvatarFallback } from 'reka-ui';
import { cn } from '~/lib/utils';

const props = defineProps<{
  src?: string | null;
  alt?: string;
  fallback?: string;
  class?: HTMLAttributes['class'];
  fallbackClass?: HTMLAttributes['class'];
}>();
</script>

<template>
  <AvatarRoot
    :class="cn('relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full', props.class)"
  >
    <AvatarImage
      v-if="props.src"
      :src="props.src"
      :alt="props.alt ?? 'Avatar'"
      class="h-full w-full object-cover"
    />
    <AvatarFallback
      :class="
        cn(
          'flex h-full w-full items-center justify-center rounded-full bg-muted text-muted-foreground text-sm font-medium',
          props.fallbackClass,
        )
      "
    >
      {{ props.fallback ?? '?' }}
    </AvatarFallback>
  </AvatarRoot>
</template>
