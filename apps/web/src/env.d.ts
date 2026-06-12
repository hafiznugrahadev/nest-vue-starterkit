/// <reference types="vite/client" />

declare module 'vue3-apexcharts' {
  import type { Plugin, Component } from 'vue';
  const VueApexCharts: Component & Plugin;
  export default VueApexCharts;
}
