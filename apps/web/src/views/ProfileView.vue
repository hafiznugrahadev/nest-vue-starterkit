<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import PageBreadcrumb from '~/components/blocks/PageBreadcrumb.vue';
import ProfileHeaderCard from '~/features/profile/components/ProfileHeaderCard.vue';
import PersonalInfoCard from '~/features/profile/components/PersonalInfoCard.vue';
import ChangePasswordCard from '~/features/profile/components/ChangePasswordCard.vue';
import { useProfileStore } from '~/features/profile/profile.store';

const { t } = useI18n();
const profile = useProfileStore();

onMounted(() => {
  void profile.fetchMe();
});
</script>

<template>
  <div class="space-y-6">
    <PageBreadcrumb
      :items="[{ label: t('nav.dashboard'), to: '/dashboard' }, { label: t('profile.title') }]"
      :title="t('profile.title')"
    />

    <div class="space-y-5">
      <ProfileHeaderCard />
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <PersonalInfoCard />
        <ChangePasswordCard />
      </div>
    </div>
  </div>
</template>
