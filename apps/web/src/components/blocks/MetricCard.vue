<script setup lang="ts">
import { computed, type Component } from 'vue';
import { TrendingDown, TrendingUp } from 'lucide-vue-next';
import Card from '~/components/ui/Card.vue';
import CardContent from '~/components/ui/CardContent.vue';
import { cn } from '~/lib/utils';

const props = defineProps<{
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: Component;
  trend?: 'up' | 'down' | 'neutral';
}>();

const isPositive = computed(
  () => props.trend === 'up' || (props.change !== undefined && props.change > 0),
);
const isNegative = computed(
  () => props.trend === 'down' || (props.change !== undefined && props.change < 0),
);
</script>

<template>
  <Card class="p-6">
    <CardContent class="p-0">
      <div class="flex items-start justify-between gap-4">
        <div class="space-y-1 min-w-0">
          <p class="text-sm text-muted-foreground font-medium">{{ props.title }}</p>
          <p class="text-3xl font-bold text-foreground">{{ props.value }}</p>
          <div
            v-if="props.change !== undefined || props.changeLabel"
            class="flex items-center gap-1.5"
          >
            <span
              v-if="props.change !== undefined"
              :class="
                cn(
                  'flex items-center gap-0.5 text-xs font-semibold',
                  isPositive && 'text-success-600',
                  isNegative && 'text-error-500',
                  !isPositive && !isNegative && 'text-muted-foreground',
                )
              "
            >
              <TrendingUp v-if="isPositive" class="h-3.5 w-3.5" />
              <TrendingDown v-if="isNegative" class="h-3.5 w-3.5" />
              {{ props.change > 0 ? '+' : '' }}{{ props.change }}%
            </span>
            <span v-if="props.changeLabel" class="text-xs text-muted-foreground">
              {{ props.changeLabel }}
            </span>
          </div>
        </div>
        <div
          v-if="props.icon"
          class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"
        >
          <component :is="props.icon" class="h-6 w-6" />
        </div>
      </div>
    </CardContent>
  </Card>
</template>
