<script setup lang="ts">
import { computed, ref } from 'vue';
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { z } from 'zod';
import { toast } from 'vue-sonner';
import { useI18n } from 'vue-i18n';
import Card from '~/components/ui/Card.vue';
import CardHeader from '~/components/ui/CardHeader.vue';
import CardTitle from '~/components/ui/CardTitle.vue';
import CardContent from '~/components/ui/CardContent.vue';
import Button from '~/components/ui/Button.vue';
import PageBreadcrumb from '~/components/blocks/PageBreadcrumb.vue';
import TextField from '~/components/fields/TextField.vue';
import PasswordField from '~/components/fields/PasswordField.vue';
import TextareaField from '~/components/fields/TextareaField.vue';
import SelectField from '~/components/fields/SelectField.vue';
import CheckboxField from '~/components/fields/CheckboxField.vue';
import SwitchField from '~/components/fields/SwitchField.vue';
import SliderField from '~/components/fields/SliderField.vue';
import DateField from '~/components/fields/DateField.vue';
import RadioGroupField from '~/components/fields/RadioGroupField.vue';
import TagInputField from '~/components/fields/TagInputField.vue';
import FileField from '~/components/fields/FileField.vue';
import { useUpload } from '~/composables/use-upload';

const ROLE_OPTIONS = [
  { label: 'Admin', value: 'admin' },
  { label: 'User', value: 'user' },
  { label: 'Super Admin', value: 'super_admin' },
];

const PRIORITY_OPTIONS = [
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
];

const schema = z.object({
  text: z.string().min(1),
  password: z.string().min(6),
  textarea: z.string(),
  select: z.string(),
  multiSelect: z.array(z.string()),
  checkbox: z.boolean(),
  toggle: z.boolean(),
  slider: z.number().min(0).max(100),
  date: z.string(),
  radio: z.string(),
  tags: z.array(z.string()),
  file: z.instanceof(File).nullable(),
});

const { t } = useI18n();
const { uploadFile } = useUpload();
const uploadedUrl = ref<string | null>(null);
const submittedValues = ref<Record<string, unknown> | null>(null);

const { handleSubmit, isSubmitting, values } = useForm({
  validationSchema: toTypedSchema(schema),
  initialValues: {
    text: '',
    password: '',
    textarea: '',
    select: '',
    multiSelect: [] as string[],
    checkbox: false,
    toggle: false,
    slider: 50,
    date: '',
    radio: '',
    tags: [] as string[],
    file: null as File | null,
  },
});

const liveValues = computed(() => ({
  ...values,
  file: values.file?.name ?? null,
}));

const onSubmit = handleSubmit(async (value) => {
  const result: Record<string, unknown> = {
    ...value,
    file: value.file ? value.file.name : null,
  };

  if (value.file instanceof File) {
    try {
      const uploaded = await uploadFile(value.file, 'demo');
      uploadedUrl.value = uploaded.url;
      result['uploadedUrl'] = uploaded.url;
    } catch {
      toast.error('Upload failed');
    }
  }

  submittedValues.value = result;
  toast.success('Form submitted!');
});
</script>

<template>
  <div class="space-y-6">
    <PageBreadcrumb
      :items="[{ label: t('nav.dashboard'), to: '/dashboard' }, { label: t('nav.fieldsDemo') }]"
      :title="t('nav.fieldsDemo')"
      description="All 11 form field components demonstrated"
    />

    <div class="grid grid-cols-1 xl:grid-cols-3 gap-5">
      <div class="xl:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Field Components</CardTitle>
          </CardHeader>
          <CardContent>
            <form class="space-y-5" @submit="onSubmit">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                <TextField name="text" label="Text field" required placeholder="Enter some text…" />
                <PasswordField
                  name="password"
                  label="Password field"
                  required
                  placeholder="At least 6 characters"
                />
              </div>

              <TextareaField
                name="textarea"
                label="Textarea field"
                placeholder="Write something longer…"
                :rows="3"
              />

              <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                <SelectField
                  name="select"
                  label="Select (single)"
                  placeholder="Pick one…"
                  :options="ROLE_OPTIONS"
                />
                <SelectField
                  name="multiSelect"
                  label="Select (multi)"
                  placeholder="Pick many…"
                  :options="ROLE_OPTIONS"
                  multiple
                />
              </div>

              <RadioGroupField name="radio" label="Radio group" :options="PRIORITY_OPTIONS" />

              <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                <CheckboxField name="checkbox" label="Checkbox field" />
                <SwitchField name="toggle" label="Switch / toggle" />
              </div>

              <SliderField name="slider" label="Slider field" :min="0" :max="100" :step="1" />

              <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                <DateField name="date" label="Date field" />
                <FileField name="file" label="File field" accept="image/*,.pdf" />
              </div>

              <TagInputField
                name="tags"
                label="Tag input field"
                placeholder="Type and press Enter…"
              />

              <div
                v-if="uploadedUrl"
                class="rounded-lg bg-success-50 border border-success-500/30 px-4 py-3 text-sm text-success-600"
              >
                Uploaded:
                <a :href="uploadedUrl" class="underline" target="_blank" rel="noreferrer">
                  {{ uploadedUrl }}
                </a>
              </div>

              <div class="flex justify-end pt-2">
                <Button type="submit" :disabled="isSubmitting">
                  {{ isSubmitting ? 'Submitting…' : 'Submit form' }}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <div>
        <Card>
          <CardHeader>
            <CardTitle class="text-sm">Live Values</CardTitle>
          </CardHeader>
          <CardContent>
            <pre
              class="overflow-x-auto text-xs text-muted-foreground rounded-lg bg-muted p-3 leading-relaxed"
              >{{ JSON.stringify(liveValues, null, 2) }}</pre
            >
            <div v-if="submittedValues" class="mt-4">
              <p class="text-xs font-semibold text-muted-foreground mb-2">Last Submitted</p>
              <pre
                class="overflow-x-auto text-xs text-success-600 rounded-lg bg-success-50 p-3 leading-relaxed"
                >{{ JSON.stringify(submittedValues, null, 2) }}</pre
              >
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>
