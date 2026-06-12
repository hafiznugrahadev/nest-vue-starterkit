<script setup lang="ts">
import { computed } from 'vue';
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { z } from 'zod';
import { toast } from 'vue-sonner';
import { Boxes, Link as LinkIcon } from 'lucide-vue-next';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import Button from '~/components/ui/Button.vue';
import PasswordField from '~/components/fields/PasswordField.vue';
import { useAuthStore } from '~/stores/auth.store';
import { APP_NAME } from '~/lib/constants';

const schema = z
  .object({
    newPassword: z.string().min(8),
    confirmPassword: z.string().min(8),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

const token = computed(() =>
  typeof route.query['token'] === 'string' ? route.query['token'] : undefined,
);

const { handleSubmit, isSubmitting } = useForm({
  validationSchema: toTypedSchema(schema),
  initialValues: { newPassword: '', confirmPassword: '' },
});

const onSubmit = handleSubmit(async (values) => {
  try {
    await auth.resetPassword(token.value!, values.newPassword);
    toast.success(t('auth.resetSuccess'));
    router.push({ name: 'login' });
  } catch (e) {
    toast.error(e instanceof Error ? e.message : t('auth.resetInvalidExpired'));
  }
});
</script>

<template>
  <div v-if="!token" class="space-y-6">
    <div class="flex items-center gap-2 mb-6">
      <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
        <Boxes class="h-5 w-5 text-white" />
      </div>
      <span class="font-bold text-xl">{{ APP_NAME }}</span>
    </div>
    <div class="flex flex-col items-center gap-4 py-4 text-center">
      <div class="flex h-16 w-16 items-center justify-center rounded-full bg-error-50">
        <LinkIcon class="h-8 w-8 text-error-500" />
      </div>
      <div>
        <h2 class="text-xl font-bold">{{ t('auth.resetTitle') }}</h2>
        <p class="mt-2 text-sm text-muted-foreground">{{ t('auth.resetInvalidLink') }}</p>
      </div>
    </div>
    <p class="text-center text-sm text-muted-foreground">
      <RouterLink to="/forgot-password" class="text-primary hover:underline font-medium">
        {{ t('auth.requestNewLink') }}
      </RouterLink>
    </p>
  </div>

  <div v-else class="space-y-6">
    <div class="space-y-2">
      <div class="flex items-center gap-2 mb-6">
        <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
          <Boxes class="h-5 w-5 text-white" />
        </div>
        <span class="font-bold text-xl">{{ APP_NAME }}</span>
      </div>
      <h1 class="text-2xl font-bold">{{ t('auth.resetTitle') }}</h1>
      <p class="text-muted-foreground text-sm">{{ t('auth.resetSubtitle') }}</p>
    </div>

    <form class="space-y-4" @submit="onSubmit">
      <PasswordField name="newPassword" :label="t('auth.newPassword')" required />
      <PasswordField name="confirmPassword" :label="t('auth.confirmPassword')" required />
      <Button type="submit" class="w-full" :disabled="isSubmitting">
        {{ isSubmitting ? t('auth.resetting') : t('auth.resetPassword') }}
      </Button>
    </form>

    <p class="text-center text-sm text-muted-foreground">
      <RouterLink to="/login" class="text-primary hover:underline font-medium">
        {{ t('auth.backToSignIn') }}
      </RouterLink>
    </p>
  </div>
</template>
