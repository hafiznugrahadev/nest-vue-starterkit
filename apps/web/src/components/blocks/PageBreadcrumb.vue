<script setup lang="ts">
import Breadcrumb, { type BreadcrumbItem } from '~/components/ui/Breadcrumb.vue';

const props = defineProps<{
  items: BreadcrumbItem[];
  title?: string;
  description?: string;
}>();
</script>

<template>
  <div class="mb-6 space-y-1">
    <Breadcrumb :items="props.items" />
    <h1 v-if="props.title" class="text-2xl font-bold text-foreground">{{ props.title }}</h1>
    <p v-if="props.description" class="text-sm text-muted-foreground">{{ props.description }}</p>
  </div>
</template>
