<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import Card from '~/components/ui/Card.vue';
import CardHeader from '~/components/ui/CardHeader.vue';
import CardTitle from '~/components/ui/CardTitle.vue';
import CardDescription from '~/components/ui/CardDescription.vue';
import CardContent from '~/components/ui/CardContent.vue';
import PageBreadcrumb from '~/components/blocks/PageBreadcrumb.vue';
import UserTable from '~/features/user/components/UserTable.vue';
import { useAuthStore } from '~/stores/auth.store';

const { t } = useI18n();
// Only SUPER_ADMIN can create / edit / delete users.
const auth = useAuthStore();
</script>

<template>
  <div class="space-y-6">
    <PageBreadcrumb
      :items="[{ label: t('nav.dashboard'), to: '/dashboard' }, { label: t('nav.users') }]"
      :title="t('users.title')"
      :description="t('users.subtitle')"
    />

    <Card>
      <CardHeader>
        <div class="flex items-center justify-between">
          <div>
            <CardTitle>{{ t('users.allAccounts') }}</CardTitle>
            <CardDescription class="mt-1">{{ t('users.subtitle') }}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <UserTable :can-manage="auth.isSuperAdmin" />
      </CardContent>
    </Card>
  </div>
</template>
