import { defineStore } from 'pinia';
import type { PaginationMeta } from '@starterkit/shared-types';
import { logApi } from './log.api';
import type { LogEntry, LogFileMeta, LogLevel } from './types';

const PAGE_SIZE = 50;

export const useLogsStore = defineStore('logs', {
  state: () => ({
    files: [] as LogFileMeta[],
    filesLoading: false,
    selectedFile: '',
    entries: [] as LogEntry[],
    meta: null as PaginationMeta | null,
    page: 1,
    search: '',
    level: null as LogLevel | null,
    loading: false,
    fetching: false,
    error: false,
  }),
  getters: {
    totalPages: (s) => s.meta?.totalPages ?? 1,
    total: (s) => s.meta?.total ?? 0,
  },
  actions: {
    async fetchFiles() {
      this.filesLoading = true;
      try {
        this.files = await logApi.listFiles();
        // Default to the newest file once the list loads.
        if (!this.selectedFile && this.files.length > 0) {
          this.selectedFile = this.files[0]!.name;
          await this.fetchEntries();
        }
      } catch {
        /* surfaced via empty file list */
      } finally {
        this.filesLoading = false;
      }
    },
    async fetchEntries(initial = false) {
      if (!this.selectedFile) return;
      if (initial) this.loading = true;
      this.fetching = true;
      this.error = false;
      try {
        const res = await logApi.entries({
          file: this.selectedFile,
          page: this.page,
          limit: PAGE_SIZE,
          ...(this.search ? { search: this.search } : {}),
          ...(this.level ? { level: this.level } : {}),
        });
        this.entries = res.data;
        this.meta = res.meta;
      } catch {
        this.error = true;
      } finally {
        this.loading = false;
        this.fetching = false;
      }
    },
    selectFile(name: string) {
      this.selectedFile = name;
      this.page = 1;
      void this.fetchEntries(true);
    },
    selectLevel(level: LogLevel | null) {
      this.level = level;
      this.page = 1;
      void this.fetchEntries();
    },
    setSearch(search: string) {
      this.search = search;
      this.page = 1;
      void this.fetchEntries();
    },
    setPage(page: number) {
      this.page = page;
      void this.fetchEntries();
    },
  },
});
