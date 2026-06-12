<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import Card from '~/components/ui/Card.vue';
import CardHeader from '~/components/ui/CardHeader.vue';
import CardTitle from '~/components/ui/CardTitle.vue';
import CardDescription from '~/components/ui/CardDescription.vue';
import CardContent from '~/components/ui/CardContent.vue';
import PageBreadcrumb from '~/components/blocks/PageBreadcrumb.vue';
import LogViewer from '~/features/logs/components/LogViewer.vue';

const { t } = useI18n();
</script>

<template>
  <div class="space-y-6">
    <PageBreadcrumb
      :items="[{ label: t('nav.dashboard'), to: '/dashboard' }, { label: t('nav.logs') }]"
      :title="t('logs.title')"
      :description="t('logs.subtitle')"
    />

    <Card>
      <CardHeader>
        <CardTitle>{{ t('logs.card') }}</CardTitle>
        <CardDescription class="mt-1">{{ t('logs.cardDesc') }}</CardDescription>
      </CardHeader>
      <CardContent>
        <LogViewer />
      </CardContent>
    </Card>
  </div>
</template>
