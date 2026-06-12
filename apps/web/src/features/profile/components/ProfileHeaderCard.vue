<script setup lang="ts">
import { computed, ref } from 'vue';
import { toast } from 'vue-sonner';
import { Upload } from 'lucide-vue-next';
import Card from '~/components/ui/Card.vue';
import CardContent from '~/components/ui/CardContent.vue';
import Avatar from '~/components/ui/Avatar.vue';
import Badge from '~/components/ui/Badge.vue';
import Button from '~/components/ui/Button.vue';
import { useProfileStore } from '../profile.store';
import { useUpload } from '~/composables/use-upload';

const profile = useProfileStore();
const { uploadFile } = useUpload();
const fileInputRef = ref<HTMLInputElement | null>(null);
const uploading = ref(false);

const initials = computed(() => {
  const name = profile.me?.name ?? '';
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
});

function roleBadgeVariant(role: string): 'default' | 'secondary' | 'muted' {
  if (role === 'SUPER_ADMIN') return 'default';
  if (role === 'ADMIN') return 'secondary';
  return 'muted';
}

async function handleFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  try {
    uploading.value = true;
    const uploaded = await uploadFile(file, 'avatars');
    // Persist the storage KEY (not the temporary presigned URL, which expires);
    // the API resolves it to a fresh signed URL on every read.
    await profile.updateProfile({ avatarUrl: uploaded.key });
  } catch (err) {
    toast.error(err instanceof Error ? err.message : 'Upload failed');
  } finally {
    uploading.value = false;
    if (fileInputRef.value) fileInputRef.value.value = '';
  }
}
</script>

<template>
  <Card v-if="profile.me">
    <CardContent class="flex flex-col items-center gap-4 py-8">
      <Avatar
        class="h-24 w-24"
        :src="profile.me.avatarUrl"
        :fallback="initials"
        fallback-class="text-2xl"
      />

      <div class="flex flex-col items-center gap-1 text-center">
        <p class="text-xl font-bold text-foreground">{{ profile.me.name }}</p>
        <p class="text-sm text-muted-foreground">{{ profile.me.email }}</p>
        <div class="flex flex-wrap justify-center gap-1.5 mt-2">
          <Badge v-for="role in profile.me.roles" :key="role" :variant="roleBadgeVariant(role)">
            {{ role.replace('_', ' ') }}
          </Badge>
        </div>
      </div>

      <Button
        variant="outline"
        size="sm"
        :disabled="uploading || profile.updating"
        @click="fileInputRef?.click()"
      >
        <Upload class="h-4 w-4" />
        {{ uploading ? 'Uploading…' : 'Upload Photo' }}
      </Button>
      <input
        ref="fileInputRef"
        type="file"
        accept="image/*"
        class="hidden"
        @change="handleFileChange"
      />
    </CardContent>
  </Card>
</template>
