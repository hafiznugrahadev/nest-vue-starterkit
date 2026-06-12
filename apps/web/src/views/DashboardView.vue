<script setup lang="ts">
import { Users, ShoppingCart, DollarSign, TrendingUp } from 'lucide-vue-next';
import { useI18n } from 'vue-i18n';
import MetricCard from '~/components/blocks/MetricCard.vue';
import MonthlySalesChart from '~/components/blocks/MonthlySalesChart.vue';
import MonthlyTarget from '~/components/blocks/MonthlyTarget.vue';
import PageBreadcrumb from '~/components/blocks/PageBreadcrumb.vue';

const { t } = useI18n();
</script>

<template>
  <div class="space-y-6">
    <PageBreadcrumb
      :items="[{ label: t('nav.dashboard') }]"
      :title="t('dashboard.title')"
      :description="t('dashboard.subtitle')"
    />

    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
      <MetricCard
        :title="t('dashboard.metrics.customers')"
        value="3,782"
        :change="11.01"
        change-label="vs last month"
        :icon="Users"
        trend="up"
      />
      <MetricCard
        :title="t('dashboard.metrics.orders')"
        value="5,359"
        :change="9.15"
        change-label="vs last month"
        :icon="ShoppingCart"
        trend="up"
      />
      <MetricCard
        :title="t('dashboard.metrics.revenue')"
        value="$45.2K"
        :change="-1.48"
        change-label="vs last month"
        :icon="DollarSign"
        trend="down"
      />
      <MetricCard
        :title="t('dashboard.metrics.growth')"
        value="8.21%"
        :change="4.35"
        change-label="vs last month"
        :icon="TrendingUp"
        trend="up"
      />
    </div>

    <div class="grid grid-cols-1 xl:grid-cols-3 gap-5">
      <div class="xl:col-span-2">
        <MonthlySalesChart />
      </div>
      <div>
        <MonthlyTarget :current="67" :target="100" />
      </div>
    </div>
  </div>
</template>
