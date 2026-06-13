<script setup lang="ts">
import { computed, watch } from 'vue';
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import type { User, UserRole } from '@starterkit/shared-types';
import Modal from '~/components/ui/Modal.vue';
import Button from '~/components/ui/Button.vue';
import TextField from '~/components/fields/TextField.vue';
import PasswordField from '~/components/fields/PasswordField.vue';
import SelectField from '~/components/fields/SelectField.vue';
import { useUserStore } from '../user.store';
import { createUserSchema, editUserSchema } from '../user.schema';

const props = defineProps<{ user?: User | null }>();
const open = defineModel<boolean>('open', { default: false });
const emit = defineEmits<{ success: [] }>();

const ROLE_OPTIONS = [
  { label: 'Super Admin', value: 'SUPER_ADMIN' },
  { label: 'Admin', value: 'ADMIN' },
  { label: 'User', value: 'USER' },
];

const users = useUserStore();
const isEdit = computed(() => !!props.user);

const validationSchema = computed(() =>
  toTypedSchema(isEdit.value ? editUserSchema : createUserSchema),
);

const { handleSubmit, resetForm, values } = useForm({
  validationSchema,
  initialValues: { email: '', name: '', password: '', roles: [] as UserRole[] },
});

watch(open, (isOpen) => {
  if (isOpen) {
    resetForm({
      values: {
        email: '',
        name: props.user?.name ?? '',
        password: '',
        roles: props.user ? ([...props.user.roles] as UserRole[]) : [],
      },
    });
  } else {
    // Closing (X / Cancel / overlay / Esc) blurs the active field, which would
    // otherwise fire blur-validation and flash an error during the close
    // animation. Reset clears errors + touched (so a late async validation can't
    // re-show: the field error is gated on `meta.touched`); keep current values
    // so the fields don't visibly empty out mid-fade.
    resetForm({ values: { ...values } });
  }
});

const onSubmit = handleSubmit(async (values) => {
  if (isEdit.value && props.user) {
    const body: { name: string; password?: string; roles: string[] } = {
      name: values.name,
      roles: values.roles,
    };
    if (values.password) body.password = values.password;
    await users.update(props.user.id, body);
  } else {
    await users.create({
      email: values.email ?? '',
      name: values.name,
      password: values.password,
      roles: values.roles as UserRole[],
    });
  }
  open.value = false;
  emit('success');
});
</script>

<template>
  <Modal
    v-model:open="open"
    :title="isEdit ? 'Edit user' : 'New user'"
    :description="
      isEdit ? 'Update account details and roles.' : 'Create an account and assign roles.'
    "
  >
    <form class="flex flex-col gap-4" @submit.prevent.stop="onSubmit">
      <TextField name="name" label="Full Name" required placeholder="Jane Doe" />
      <TextField
        v-if="!isEdit"
        name="email"
        label="Email"
        required
        type="email"
        placeholder="jane@starterkit.test"
      />
      <PasswordField
        name="password"
        :label="isEdit ? 'New Password (leave blank to keep)' : 'Password'"
        :required="!isEdit"
        placeholder="••••••••"
      />
      <SelectField name="roles" label="Roles" required multiple :options="ROLE_OPTIONS" />

      <div class="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" :disabled="users.saving" @click="open = false">
          Cancel
        </Button>
        <Button type="submit" :disabled="users.saving">
          {{ users.saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create User' }}
        </Button>
      </div>
    </form>
  </Modal>
</template>
