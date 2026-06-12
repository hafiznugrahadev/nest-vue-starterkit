<script setup lang="ts">
import { computed } from 'vue';
import VueApexCharts from 'vue3-apexcharts';
import type { ApexOptions } from 'apexcharts';
import Card from '~/components/ui/Card.vue';
import CardHeader from '~/components/ui/CardHeader.vue';
import CardTitle from '~/components/ui/CardTitle.vue';
import CardContent from '~/components/ui/CardContent.vue';
import { useThemeStore } from '~/stores/theme.store';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const REVENUE_DATA = [
  31000, 40000, 28000, 51000, 42000, 109000, 100000, 72000, 91000, 125000, 111000, 145000,
];

const theme = useThemeStore();
const isDark = computed(() => theme.theme === 'dark');

const options = computed<ApexOptions>(() => {
  const textColor = isDark.value ? '#98a2b3' : '#667085';
  const gridColor = isDark.value ? '#2a3441' : '#e4e7ec';
  return {
    chart: {
      type: 'area',
      toolbar: { show: false },
      background: 'transparent',
      fontFamily: 'Outfit, sans-serif',
    },
    colors: ['#465fff', '#12b76a'],
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 2 },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.25,
        opacityTo: 0.02,
        stops: [0, 100],
      },
    },
    xaxis: {
      categories: MONTHS,
      labels: { style: { colors: textColor, fontSize: '12px' } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: { colors: textColor, fontSize: '12px' },
        formatter: (v: number) => `$${(v / 1000).toFixed(0)}k`,
      },
    },
    grid: {
      borderColor: gridColor,
      strokeDashArray: 4,
      xaxis: { lines: { show: false } },
    },
    tooltip: {
      theme: isDark.value ? 'dark' : 'light',
      y: { formatter: (v: number) => `$${v.toLocaleString()}` },
    },
    legend: {
      position: 'top',
      horizontalAlign: 'right',
      labels: { colors: textColor },
    },
  };
});

const series = [{ name: 'Revenue', data: REVENUE_DATA }];
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>Monthly Revenue</CardTitle>
    </CardHeader>
    <CardContent>
      <!-- Re-mount on theme flip so ApexCharts picks up rebuilt option colors -->
      <VueApexCharts
        :key="theme.theme"
        type="area"
        :height="280"
        :options="options"
        :series="series"
      />
    </CardContent>
  </Card>
</template>
