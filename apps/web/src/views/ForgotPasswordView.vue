<script setup lang="ts">
import { ref } from 'vue';
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { z } from 'zod';
import { Boxes, MailCheck } from 'lucide-vue-next';
import { useI18n } from 'vue-i18n';
import Button from '~/components/ui/Button.vue';
import TextField from '~/components/fields/TextField.vue';
import { useAuthStore } from '~/stores/auth.store';
import { APP_NAME } from '~/lib/constants';

const schema = z.object({ email: z.string().email() });

const { t } = useI18n();
const auth = useAuthStore();
const sent = ref(false);

const { handleSubmit, isSubmitting } = useForm({
  validationSchema: toTypedSchema(schema),
  initialValues: { email: '' },
});

const onSubmit = handleSubmit(async (values) => {
  try {
    await auth.forgotPassword(values.email);
  } catch {
    /* account-enumeration safe: always show success */
  }
  sent.value = true;
});
</script>

<template>
  <div v-if="sent" class="space-y-6">
    <div class="flex items-center gap-2 mb-6">
      <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
        <Boxes class="h-5 w-5 text-white" />
      </div>
      <span class="font-bold text-xl">{{ APP_NAME }}</span>
    </div>
    <div class="flex flex-col items-center gap-4 py-4 text-center">
      <div class="flex h-16 w-16 items-center justify-center rounded-full bg-success-50">
        <MailCheck class="h-8 w-8 text-success-600" />
      </div>
      <div>
        <h2 class="text-xl font-bold">{{ t('auth.forgotTitle') }}</h2>
        <p class="mt-2 text-sm text-muted-foreground max-w-xs">{{ t('auth.resetLinkSent') }}</p>
      </div>
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
      <h1 class="text-2xl font-bold">{{ t('auth.forgotTitle') }}</h1>
      <p class="text-muted-foreground text-sm">{{ t('auth.forgotSubtitle') }}</p>
    </div>

    <form class="space-y-4" @submit="onSubmit">
      <TextField
        name="email"
        :label="t('auth.email')"
        required
        type="email"
        placeholder="you@example.com"
      />
      <Button type="submit" class="w-full" :disabled="isSubmitting">
        {{ isSubmitting ? t('auth.sending') : t('auth.sendResetLink') }}
      </Button>
    </form>

    <p class="text-center text-sm text-muted-foreground">
      {{ t('auth.rememberedIt') }}
      <RouterLink to="/login" class="text-primary hover:underline font-medium">
        {{ t('auth.signIn') }}
      </RouterLink>
    </p>
  </div>
</template>
