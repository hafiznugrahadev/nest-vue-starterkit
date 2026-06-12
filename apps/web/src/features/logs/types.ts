export const LOG_LEVELS = ['trace', 'debug', 'info', 'warn', 'error', 'fatal'] as const;
export type LogLevel = (typeof LOG_LEVELS)[number];

/** Metadata for one rotated log file (GET /logs/files). */
export interface LogFileMeta {
  name: string;
  date: string | null;
  sizeBytes: number;
  modifiedAt: string;
}

/** One parsed log entry (GET /logs/entries). */
export interface LogEntry {
  time: string;
  level: string;
  levelValue: number;
  msg: string;
  requestId?: string;
  context?: string;
  raw: Record<string, unknown>;
}

export interface LogEntriesParams extends Record<string, unknown> {
  file: string;
  page?: number;
  limit?: number;
  search?: string;
  level?: LogLevel;
}
