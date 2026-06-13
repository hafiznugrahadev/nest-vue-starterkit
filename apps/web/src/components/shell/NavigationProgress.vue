<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { useRouter } from 'vue-router';

// Thin top loading bar shown while the router resolves a navigation. Route
// components are lazy-loaded, so client navigations have real latency (chunk
// fetch) worth signalling. Self-contained: registers its own router hooks.
const router = useRouter();

const visible = ref(false);
const progress = ref(0); // 0..1

let trickle: ReturnType<typeof setInterval> | undefined;
let fadeTimer: ReturnType<typeof setTimeout> | undefined;
let resetTimer: ReturnType<typeof setTimeout> | undefined;

function clearTimers() {
  clearInterval(trickle);
  clearTimeout(fadeTimer);
  clearTimeout(resetTimer);
}

function start() {
  clearTimers();
  visible.value = true;
  progress.value = 0.08;
  // Creep toward 90%, slowing as it approaches — never finishes until done().
  trickle = setInterval(() => {
    const remaining = 0.9 - progress.value;
    if (remaining > 0.01) progress.value += remaining * 0.12;
  }, 200);
}

function done() {
  clearTimers();
  progress.value = 1;
  // Hold at 100%, fade out, then silently reset the width while invisible.
  fadeTimer = setTimeout(() => {
    visible.value = false;
    resetTimer = setTimeout(() => (progress.value = 0), 250);
  }, 200);
}

let stopHooks: Array<() => void> = [];

onMounted(() => {
  stopHooks = [
    router.beforeEach(() => {
      start();
    }),
    router.afterEach(() => done()),
    router.onError(() => done()),
  ];
});

onUnmounted(() => {
  stopHooks.forEach((stop) => stop());
  clearTimers();
});
</script>

<template>
  <div
    class="pointer-events-none fixed inset-x-0 top-0 z-100 h-0.75 transition-opacity duration-200"
    :class="visible ? 'opacity-100' : 'opacity-0'"
    aria-hidden="true"
  >
    <div
      class="h-full bg-primary shadow-[0_0_10px_rgba(70,95,255,0.7)] transition-[width] duration-200 ease-out"
      :style="{ width: `${progress * 100}%` }"
    />
  </div>
</template>
