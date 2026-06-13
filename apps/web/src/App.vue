<script setup lang="ts">
import { Toaster } from 'vue-sonner';
import NavigationProgress from '~/components/shell/NavigationProgress.vue';
</script>

<template>
  <NavigationProgress />
  <RouterView />
  <Toaster rich-colors position="top-right" />
</template>
