<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Loader2,
  RefreshCw,
  Search,
} from 'lucide-vue-next';
import { useI18n } from 'vue-i18n';
import { toast } from 'vue-sonner';
import Button from '~/components/ui/Button.vue';
import Input from '~/components/ui/Input.vue';
import Badge from '~/components/ui/Badge.vue';
import { cn } from '~/lib/utils';
import { logApi } from '../log.api';
import { useLogsStore } from '../logs.store';
import { LOG_LEVELS } from '../types';

const { t } = useI18n();
const logs = useLogsStore();

const search = ref('');
const expandedIndex = ref<number | null>(null);
const downloading = ref(false);

let searchTimer: ReturnType<typeof setTimeout> | undefined;
watch(search, (value) => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    logs.setSearch(value);
    expandedIndex.value = null;
  }, 300);
});

onMounted(() => {
  void logs.fetchFiles();
  if (logs.selectedFile) void logs.fetchEntries(true);
});
onUnmounted(() => clearTimeout(searchTimer));

watch(
  () => [logs.page, logs.level, logs.selectedFile],
  () => {
    expandedIndex.value = null;
  },
);

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline' | 'muted';

function levelBadgeVariant(level: string): BadgeVariant {
  switch (level) {
    case 'fatal':
    case 'error':
      return 'destructive';
    case 'warn':
      return 'secondary';
    case 'info':
      return 'default';
    case 'debug':
      return 'muted';
    default:
      return 'outline';
  }
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString();
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function onFileChange(e: Event) {
  logs.selectFile((e.target as HTMLSelectElement).value);
}

async function handleDownload() {
  if (!logs.selectedFile) return;
  downloading.value = true;
  try {
    await logApi.download(logs.selectedFile);
  } catch (e) {
    toast.error((e as Error).message);
  } finally {
    downloading.value = false;
  }
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <!-- Controls: file picker + download + refresh -->
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div class="flex items-center gap-2">
        <label class="text-sm font-medium text-muted-foreground">{{ t('logs.file') }}</label>
        <select
          :value="logs.selectedFile"
          :disabled="logs.filesLoading || logs.files.length === 0"
          class="h-9 rounded-lg border border-border bg-card px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
          @change="onFileChange"
        >
          <option v-if="logs.files.length === 0" value="">{{ t('logs.noFiles') }}</option>
          <option v-for="f in logs.files" :key="f.name" :value="f.name">
            {{ f.date ?? f.name }} ({{ formatBytes(f.sizeBytes) }})
          </option>
        </select>
      </div>

      <div class="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          :disabled="!logs.selectedFile"
          @click="
            logs.fetchFiles();
            logs.fetchEntries();
          "
        >
          <RefreshCw :class="cn('h-4 w-4', logs.fetching && 'animate-spin')" />
          {{ t('state.retry') }}
        </Button>
        <Button size="sm" :disabled="!logs.selectedFile || downloading" @click="handleDownload">
          <Loader2 v-if="downloading" class="h-4 w-4 animate-spin" />
          <Download v-else class="h-4 w-4" />
          {{ downloading ? t('logs.downloading') : t('logs.download') }}
        </Button>
      </div>
    </div>

    <!-- Filters: level group + search -->
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div class="flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          :variant="logs.level === null ? 'default' : 'outline'"
          @click="logs.selectLevel(null)"
        >
          {{ t('logs.levels.all') }}
        </Button>
        <Button
          v-for="lvl in LOG_LEVELS"
          :key="lvl"
          size="sm"
          :variant="logs.level === lvl ? 'default' : 'outline'"
          class="uppercase"
          @click="logs.selectLevel(lvl)"
        >
          {{ lvl }}
        </Button>
      </div>

      <div class="relative">
        <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input v-model="search" :placeholder="t('logs.search')" class="w-56 pl-9" />
      </div>
    </div>

    <!-- Table -->
    <div class="overflow-hidden rounded-xl border border-border bg-card">
      <div
        v-if="logs.loading"
        class="flex items-center justify-center gap-2 py-20 text-muted-foreground"
      >
        <Loader2 class="h-5 w-5 animate-spin" />
        <span>{{ t('state.loading') }}</span>
      </div>
      <div v-else-if="logs.error" class="flex flex-col items-center justify-center gap-3 py-20">
        <p class="text-sm text-muted-foreground">{{ t('state.error') }}</p>
        <Button variant="outline" size="sm" @click="logs.fetchEntries()">
          {{ t('state.retry') }}
        </Button>
      </div>
      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-border bg-muted/40">
              <th class="px-4 py-3 w-8" />
              <th
                class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground whitespace-nowrap"
              >
                {{ t('logs.columns.time') }}
              </th>
              <th
                class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground whitespace-nowrap"
              >
                {{ t('logs.columns.level') }}
              </th>
              <th
                class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground whitespace-nowrap"
              >
                {{ t('logs.columns.context') }}
              </th>
              <th
                class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground whitespace-nowrap"
              >
                {{ t('logs.columns.message') }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="logs.entries.length === 0">
              <td colspan="5" class="px-4 py-16 text-center text-muted-foreground">
                <p class="font-medium">{{ t('logs.noResults') }}</p>
                <p class="mt-1 text-xs">{{ t('logs.noResultsHint') }}</p>
              </td>
            </tr>
            <template v-for="(entry, index) in logs.entries" v-else :key="index">
              <tr
                class="cursor-pointer border-b border-border transition-colors last:border-0 hover:bg-muted/30"
                @click="expandedIndex = expandedIndex === index ? null : index"
              >
                <td class="px-4 py-3 align-top">
                  <ChevronDown
                    v-if="expandedIndex === index"
                    class="h-4 w-4 text-muted-foreground"
                  />
                  <ChevronRight v-else class="h-4 w-4 text-muted-foreground" />
                </td>
                <td class="px-4 py-3 align-top">
                  <span class="whitespace-nowrap font-mono text-xs text-muted-foreground">
                    {{ formatTime(entry.time) }}
                  </span>
                </td>
                <td class="px-4 py-3 align-top">
                  <Badge :variant="levelBadgeVariant(entry.level)" class="uppercase">
                    {{ entry.level }}
                  </Badge>
                </td>
                <td class="px-4 py-3 align-top">
                  <span class="whitespace-nowrap text-xs text-muted-foreground">
                    {{ entry.context ?? '—' }}
                  </span>
                </td>
                <td class="px-4 py-3 align-top">
                  <span class="block max-w-[48ch] truncate text-sm" :title="entry.msg">
                    {{ entry.msg || '—' }}
                  </span>
                </td>
              </tr>
              <tr
                v-if="expandedIndex === index"
                class="border-b border-border bg-muted/20 last:border-0"
              >
                <td colspan="5" class="px-4 py-3">
                  <pre class="max-h-96 overflow-auto rounded-lg bg-background p-3 text-xs">{{
                    JSON.stringify(entry.raw, null, 2)
                  }}</pre>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Pagination -->
    <div
      v-if="!logs.loading && !logs.error && logs.total > 0"
      class="flex items-center justify-between text-sm text-muted-foreground"
    >
      <span>{{ t('logs.pagination.total', { n: logs.total }) }}</span>
      <div class="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          :disabled="logs.page <= 1"
          @click="logs.setPage(Math.max(1, logs.page - 1))"
        >
          <ChevronLeft class="h-4 w-4" />
          {{ t('logs.pagination.prev') }}
        </Button>
        <span class="px-2">
          {{ t('logs.pagination.page') }} {{ logs.page }} {{ t('logs.pagination.of') }}
          {{ logs.totalPages }}
        </span>
        <Button
          variant="outline"
          size="sm"
          :disabled="logs.page >= logs.totalPages"
          @click="logs.setPage(Math.min(logs.totalPages, logs.page + 1))"
        >
          {{ t('logs.pagination.next') }}
          <ChevronRight class="h-4 w-4" />
        </Button>
      </div>
    </div>
  </div>
</template>
