<script setup lang="ts">
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { changePasswordSchema } from '@starterkit/schemas';
import { z } from 'zod';
import { useI18n } from 'vue-i18n';
import Card from '~/components/ui/Card.vue';
import CardHeader from '~/components/ui/CardHeader.vue';
import CardTitle from '~/components/ui/CardTitle.vue';
import CardDescription from '~/components/ui/CardDescription.vue';
import CardContent from '~/components/ui/CardContent.vue';
import Button from '~/components/ui/Button.vue';
import PasswordField from '~/components/fields/PasswordField.vue';
import { useProfileStore } from '../profile.store';

// Shared current/new-password rules; `confirmPassword` is a UI-only match check.
const schema = changePasswordSchema
  .extend({ confirmPassword: z.string().min(1, 'Required') })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

const { t } = useI18n();
const profile = useProfileStore();

const { handleSubmit, resetForm } = useForm({
  validationSchema: toTypedSchema(schema),
  initialValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
});

const onSubmit = handleSubmit(async (values) => {
  await profile.changePassword({
    currentPassword: values.currentPassword,
    newPassword: values.newPassword,
  });
  resetForm();
});
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>{{ t('profile.changePassword.title') }}</CardTitle>
      <CardDescription>{{ t('profile.changePassword.subtitle') }}</CardDescription>
    </CardHeader>
    <CardContent>
      <form class="flex flex-col gap-4" @submit.prevent.stop="onSubmit">
        <PasswordField
          name="currentPassword"
          :label="t('profile.changePassword.currentPassword')"
          required
        />
        <PasswordField
          name="newPassword"
          :label="t('profile.changePassword.newPassword')"
          required
        />
        <PasswordField
          name="confirmPassword"
          :label="t('profile.changePassword.confirmPassword')"
          required
        />
        <div class="flex justify-end">
          <Button type="submit" :disabled="profile.changingPassword">
            {{
              profile.changingPassword
                ? t('profile.changePassword.updating')
                : t('profile.changePassword.update')
            }}
          </Button>
        </div>
      </form>
    </CardContent>
  </Card>
</template>
