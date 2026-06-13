<script setup lang="ts">
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { loginSchema } from '@starterkit/schemas';
import { toast } from 'vue-sonner';
import { Boxes } from 'lucide-vue-next';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import Button from '~/components/ui/Button.vue';
import TextField from '~/components/fields/TextField.vue';
import PasswordField from '~/components/fields/PasswordField.vue';
import { useAuthStore } from '~/stores/auth.store';
import { APP_NAME } from '~/lib/constants';

const REGISTRATION_ENABLED = import.meta.env['VITE_REGISTRATION_ENABLED'] === 'true';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

const { handleSubmit, isSubmitting } = useForm({
  validationSchema: toTypedSchema(loginSchema),
  initialValues: { email: '', password: '' },
});

const onSubmit = handleSubmit(async (values) => {
  try {
    await auth.login(values.email, values.password);
    toast.success(t('auth.welcomeBack'));
    const redirect = route.query['redirect'];
    const target =
      typeof redirect === 'string' && redirect.startsWith('/') ? redirect : '/dashboard';
    router.push(target);
  } catch (e) {
    toast.error(e instanceof Error ? e.message : t('auth.invalidCredentials'));
  }
});
</script>

<template>
  <div class="space-y-6">
    <div class="space-y-2">
      <div class="flex items-center gap-2 mb-6">
        <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
          <Boxes class="h-5 w-5 text-white" />
        </div>
        <span class="font-bold text-xl">{{ APP_NAME }}</span>
      </div>
      <h1 class="text-2xl font-bold">{{ t('auth.signIn') }}</h1>
      <p class="text-muted-foreground text-sm">{{ t('auth.signInSubtitle') }}</p>
    </div>

    <div
      class="rounded-lg bg-muted/60 border border-border px-4 py-3 text-xs text-muted-foreground"
    >
      Demo: <span class="font-mono">superadmin@starterkit.test</span> /
      <span class="font-mono">super1234</span>
    </div>

    <form class="space-y-4" @submit="onSubmit">
      <TextField
        name="email"
        :label="t('auth.email')"
        required
        type="email"
        autoComplete="username"
        placeholder="you@example.com"
      />
      <PasswordField name="password" :label="t('auth.password')" required />
      <div class="flex items-center justify-end">
        <RouterLink to="/forgot-password" class="text-sm text-primary hover:underline">
          {{ t('auth.forgotPassword') }}
        </RouterLink>
      </div>
      <Button type="submit" class="w-full" :disabled="isSubmitting">
        {{ isSubmitting ? t('auth.signingIn') : t('auth.signIn') }}
      </Button>
    </form>

    <p v-if="REGISTRATION_ENABLED" class="text-center text-sm text-muted-foreground">
      {{ t('auth.noAccount') }}
      <RouterLink to="/register" class="text-primary hover:underline font-medium">
        {{ t('auth.signUp') }}
      </RouterLink>
    </p>
  </div>
</template>
