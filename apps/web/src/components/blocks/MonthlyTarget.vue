<script setup lang="ts">
import { computed } from 'vue';
import VueApexCharts from 'vue3-apexcharts';
import type { ApexOptions } from 'apexcharts';
import Card from '~/components/ui/Card.vue';
import CardHeader from '~/components/ui/CardHeader.vue';
import CardTitle from '~/components/ui/CardTitle.vue';
import CardContent from '~/components/ui/CardContent.vue';
import { useThemeStore } from '~/stores/theme.store';

const props = withDefaults(defineProps<{ current?: number; target?: number }>(), {
  current: 67,
  target: 100,
});

const theme = useThemeStore();
const isDark = computed(() => theme.theme === 'dark');
const pct = computed(() => Math.round((props.current / props.target) * 100));

const options = computed<ApexOptions>(() => {
  const textColor = isDark.value ? '#98a2b3' : '#667085';
  return {
    chart: {
      type: 'radialBar',
      background: 'transparent',
      fontFamily: 'Outfit, sans-serif',
    },
    colors: ['#465fff'],
    plotOptions: {
      radialBar: {
        startAngle: -135,
        endAngle: 135,
        hollow: { size: '65%' },
        track: { background: isDark.value ? '#2a3441' : '#e4e7ec', strokeWidth: '100%' },
        dataLabels: {
          name: {
            show: true,
            color: textColor,
            fontSize: '13px',
            offsetY: 20,
          },
          value: {
            show: true,
            color: isDark.value ? '#e4e7ec' : '#1d2939',
            fontSize: '28px',
            fontWeight: 700,
            offsetY: -15,
            formatter: (v: number) => `${v}%`,
          },
        },
      },
    },
    labels: ['Achievement'],
    stroke: { lineCap: 'round' },
  };
});
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>Monthly Target</CardTitle>
    </CardHeader>
    <CardContent>
      <VueApexCharts
        :key="theme.theme"
        type="radialBar"
        :height="280"
        :options="options"
        :series="[pct]"
      />
      <div class="flex items-center justify-between px-4 -mt-4">
        <div class="text-center">
          <p class="text-2xl font-bold">${{ props.current.toLocaleString() }}k</p>
          <p class="text-xs text-muted-foreground mt-0.5">Current</p>
        </div>
        <div class="h-8 w-px bg-border" />
        <div class="text-center">
          <p class="text-2xl font-bold">${{ props.target.toLocaleString() }}k</p>
          <p class="text-xs text-muted-foreground mt-0.5">Target</p>
        </div>
      </div>
    </CardContent>
  </Card>
</template>
