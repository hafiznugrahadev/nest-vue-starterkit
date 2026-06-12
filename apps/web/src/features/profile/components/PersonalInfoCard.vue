<script setup lang="ts">
import { watch } from 'vue';
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { z } from 'zod';
import { useI18n } from 'vue-i18n';
import Card from '~/components/ui/Card.vue';
import CardHeader from '~/components/ui/CardHeader.vue';
import CardTitle from '~/components/ui/CardTitle.vue';
import CardContent from '~/components/ui/CardContent.vue';
import Button from '~/components/ui/Button.vue';
import TextField from '~/components/fields/TextField.vue';
import { useProfileStore } from '../profile.store';

const editProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

const { t } = useI18n();
const profile = useProfileStore();

const { handleSubmit, resetForm } = useForm({
  validationSchema: toTypedSchema(editProfileSchema),
  initialValues: { name: profile.me?.name ?? '' },
});

watch(
  () => profile.me?.name,
  (name) => {
    if (name) resetForm({ values: { name } });
  },
);

const onSubmit = handleSubmit(async (values) => {
  await profile.updateProfile({ name: values.name });
});
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>{{ t('profile.personalInfo.title') }}</CardTitle>
    </CardHeader>
    <CardContent>
      <form class="flex flex-col gap-4" @submit.prevent.stop="onSubmit">
        <TextField name="name" :label="t('profile.personalInfo.fullName')" required />
        <div class="flex justify-end">
          <Button type="submit" :disabled="profile.updating">
            {{
              profile.updating
                ? t('profile.personalInfo.saving')
                : t('profile.personalInfo.saveChanges')
            }}
          </Button>
        </div>
      </form>
    </CardContent>
  </Card>
</template>
