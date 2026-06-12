import { getApiBase } from '~/lib/api-client';
import { pinia } from '~/stores/pinia';
import { useAuthStore } from '~/stores/auth.store';

export interface UploadedFile {
  key: string;
  url: string;
  mimeType: string;
  size: number;
}

export function useUpload() {
  async function uploadFile(file: File, folder = 'uploads'): Promise<UploadedFile> {
    const form = new FormData();
    form.append('file', file);

    const auth = useAuthStore(pinia);
    const token = auth.accessToken;

    const res = await fetch(`${getApiBase()}/files?folder=${encodeURIComponent(folder)}`, {
      method: 'POST',
      credentials: 'include',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    });

    if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
    const body = (await res.json()) as { success: boolean; message?: string; data?: UploadedFile };
    if (!body.success || !body.data) throw new Error(body.message ?? 'Upload failed');
    return body.data;
  }

  return { uploadFile };
}
