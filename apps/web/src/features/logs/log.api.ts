import { apiFetch, apiFetchRaw, getApiBase, unwrapPaginated } from '~/lib/api-client';
import type { Paginated } from '@starterkit/shared-types';
import { pinia } from '~/stores/pinia';
import { useAuthStore } from '~/stores/auth.store';
import type { LogEntriesParams, LogEntry, LogFileMeta } from './types';

export const logApi = {
  listFiles(): Promise<LogFileMeta[]> {
    return apiFetch<LogFileMeta[]>('/logs/files');
  },

  async entries(params: LogEntriesParams): Promise<Paginated<LogEntry>> {
    const res = await apiFetchRaw<LogEntry[]>('/logs/entries', {
      query: params as Record<string, string | number | boolean | string[] | undefined>,
    });
    return unwrapPaginated(res);
  },

  /**
   * Download a raw log file. The API guards the route with a Bearer token, so a
   * plain <a href> won't authenticate — fetch the blob with the token, then
   * trigger a client-side download.
   */
  async download(file: string): Promise<void> {
    const auth = useAuthStore(pinia);
    const token = auth.accessToken;
    const url = `${getApiBase()}/logs/download?file=${encodeURIComponent(file)}`;
    const res = await fetch(url, {
      credentials: 'include',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) throw new Error(`Download failed (HTTP ${res.status})`);

    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = objectUrl;
    a.download = file;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(objectUrl);
  },
};
