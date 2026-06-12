<script setup lang="ts">
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { z } from 'zod';
import { toast } from 'vue-sonner';
import { Boxes } from 'lucide-vue-next';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import Button from '~/components/ui/Button.vue';
import TextField from '~/components/fields/TextField.vue';
import PasswordField from '~/components/fields/PasswordField.vue';
import { useAuthStore } from '~/stores/auth.store';
import { APP_NAME } from '~/lib/constants';

const REGISTRATION_ENABLED = import.meta.env['VITE_REGISTRATION_ENABLED'] === 'true';

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});

const { t } = useI18n();
const router = useRouter();
const auth = useAuthStore();

const { handleSubmit, isSubmitting } = useForm({
  validationSchema: toTypedSchema(schema),
  initialValues: { name: '', email: '', password: '' },
});

const onSubmit = handleSubmit(async (values) => {
  try {
    await auth.register(values.name, values.email, values.password);
    toast.success(t('auth.welcomeAboard'));
    router.push({ name: 'dashboard' });
  } catch (e) {
    toast.error(e instanceof Error ? e.message : t('auth.createAccountError'));
  }
});
</script>

<template>
  <div v-if="!REGISTRATION_ENABLED" class="space-y-6">
    <div class="flex items-center gap-2 mb-6">
      <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
        <Boxes class="h-5 w-5 text-white" />
      </div>
      <span class="font-bold text-xl">{{ APP_NAME }}</span>
    </div>
    <div
      class="rounded-lg border border-border bg-muted/40 px-4 py-5 text-sm text-muted-foreground"
    >
      {{ t('auth.registrationDisabled') }}
    </div>
    <p class="text-center text-sm text-muted-foreground">
      <RouterLink to="/login" class="text-primary hover:underline font-medium">
        {{ t('auth.backToSignIn') }}
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
      <h1 class="text-2xl font-bold">{{ t('auth.registerTitle') }}</h1>
      <p class="text-muted-foreground text-sm">{{ t('auth.registerSubtitle') }}</p>
    </div>

    <form class="space-y-4" @submit="onSubmit">
      <TextField name="name" :label="t('auth.fullName')" required placeholder="John Doe" />
      <TextField
        name="email"
        :label="t('auth.email')"
        required
        type="email"
        placeholder="you@example.com"
      />
      <PasswordField name="password" :label="t('auth.password')" required />
      <Button type="submit" class="w-full" :disabled="isSubmitting">
        {{ isSubmitting ? t('auth.creatingAccount') : t('auth.createAccount') }}
      </Button>
    </form>

    <p class="text-center text-sm text-muted-foreground">
      {{ t('auth.haveAccount') }}
      <RouterLink to="/login" class="text-primary hover:underline font-medium">
        {{ t('auth.signIn') }}
      </RouterLink>
    </p>
  </div>
</template>
