import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { open, readdir, stat } from 'node:fs/promises';
import { join, resolve, sep } from 'node:path';
import { computeSkip } from '@starterkit/schemas';
import {
  buildPaginationMeta,
  type PaginatedResult,
} from '@common/interfaces/paginated-result.interface';
import { LogEntry, LogFileMeta } from './dto/log-file.dto';
import { QueryLogsDto } from './dto/query-logs.dto';

// Matches the pino-roll rotation pattern: app.<YYYY-MM-DD>.<index>.log
// The capture group is the date segment. The strict shape (no slashes, no `..`)
// is itself the first line of defence against path traversal.
const LOG_FILE_RE = /^app\.(\d{4}-\d{2}-\d{2})\.\d+\.log$/;

// Never read a whole log file — tail at most this many bytes, and parse at most
// this many lines, so memory/CPU stay bounded regardless of how noisy a day was.
const MAX_TAIL_BYTES = 5 * 1024 * 1024; // 5 MB
const MAX_LINES = 50_000;

const LEVEL_LABELS: Record<number, string> = {
  10: 'trace',
  20: 'debug',
  30: 'info',
  40: 'warn',
  50: 'error',
  60: 'fatal',
};
const LEVEL_VALUES: Record<string, number> = {
  trace: 10,
  debug: 20,
  info: 30,
  warn: 40,
  error: 50,
  fatal: 60,
};

/**
 * Reads the daily-rotated JSON-lines log files written by pino-roll (see
 * app.module.ts). Read-only; all access is confined to the configured log dir.
 */
@Injectable()
export class LogsService {
  private readonly baseDir: string;

  constructor(private readonly config: ConfigService) {
    this.baseDir = resolve(this.config.get<string>('app.logging.dir') ?? './storage/logs');
  }

  /** List rotated log files, newest first. Tolerates a not-yet-created dir. */
  async listFiles(): Promise<LogFileMeta[]> {
    let names: string[];
    try {
      names = await readdir(this.baseDir);
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === 'ENOENT') return [];
      throw err;
    }

    const metas = await Promise.all(
      names
        .filter((n) => LOG_FILE_RE.test(n))
        .map(async (name) => {
          const s = await stat(join(this.baseDir, name));
          return {
            name,
            date: LOG_FILE_RE.exec(name)?.[1] ?? null,
            sizeBytes: s.size,
            modifiedAt: s.mtime.toISOString(),
          } satisfies LogFileMeta;
        }),
    );

    // Filenames sort lexicographically by date then index, so reverse → newest first.
    return metas.sort((a, b) => (a.name < b.name ? 1 : a.name > b.name ? -1 : 0));
  }

  /** Tail + parse + filter + paginate one file's entries (newest first). */
  async readEntries(query: QueryLogsDto): Promise<PaginatedResult<LogEntry>> {
    const full = this.resolveSafe(query.file);

    let size: number;
    try {
      size = (await stat(full)).size;
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
        throw new NotFoundException('Log file not found');
      }
      throw err;
    }

    const text = await this.tail(full, size);
    let lines = text.split('\n').filter((l) => l.trim().length > 0);
    if (lines.length > MAX_LINES) lines = lines.slice(lines.length - MAX_LINES);

    const search = query.search?.toLowerCase();
    const level = query.level;

    const entries: LogEntry[] = [];
    for (const line of lines) {
      const entry = this.parseLine(line);
      if (!entry) continue; // skip non-JSON / partial lines
      if (level && entry.level !== level) continue;
      if (search && !`${entry.msg} ${JSON.stringify(entry.raw)}`.toLowerCase().includes(search)) {
        continue;
      }
      entries.push(entry);
    }

    entries.reverse(); // file is oldest-first; viewer wants newest-first

    const total = entries.length;
    const skip = computeSkip(query);
    const data = entries.slice(skip, skip + query.limit);
    return { data, meta: buildPaginationMeta(total, query.page, query.limit) };
  }

  /** Validate the requested file and confirm it exists; returns its absolute path. */
  async getDownloadPath(file: string): Promise<string> {
    const full = this.resolveSafe(file);
    try {
      await stat(full);
    } catch {
      throw new NotFoundException('Log file not found');
    }
    return full;
  }

  /** Allow-list the filename and confine the resolved path to the log dir. */
  private resolveSafe(file: string): string {
    if (!file || !LOG_FILE_RE.test(file)) {
      throw new BadRequestException('Invalid log file name');
    }
    const full = resolve(this.baseDir, file);
    if (!full.startsWith(this.baseDir + sep)) {
      throw new BadRequestException('Invalid log file path');
    }
    return full;
  }

  /** Read at most MAX_TAIL_BYTES from the end of the file, dropping a partial head line. */
  private async tail(path: string, size: number): Promise<string> {
    const start = Math.max(0, size - MAX_TAIL_BYTES);
    const length = size - start;
    if (length === 0) return '';

    const fh = await open(path, 'r');
    try {
      const buf = Buffer.alloc(length);
      await fh.read(buf, 0, length, start);
      let text = buf.toString('utf8');
      if (start > 0) {
        const nl = text.indexOf('\n');
        text = nl >= 0 ? text.slice(nl + 1) : text;
      }
      return text;
    } finally {
      await fh.close();
    }
  }

  /** Parse one pino JSON line into a typed entry, or null if it isn't valid JSON. */
  private parseLine(line: string): LogEntry | null {
    let obj: Record<string, unknown>;
    try {
      obj = JSON.parse(line) as Record<string, unknown>;
    } catch {
      return null;
    }

    const levelValue =
      typeof obj.level === 'number' ? obj.level : (LEVEL_VALUES[String(obj.level)] ?? 30);
    const level = LEVEL_LABELS[levelValue] ?? String(obj.level ?? 'info');
    const timeMs = typeof obj.time === 'number' ? obj.time : Date.parse(String(obj.time));
    const time = Number.isFinite(timeMs)
      ? new Date(timeMs).toISOString()
      : new Date(0).toISOString();

    return {
      time,
      level,
      levelValue,
      msg: typeof obj.msg === 'string' ? obj.msg : '',
      requestId: typeof obj.requestId === 'string' ? obj.requestId : undefined,
      context: typeof obj.context === 'string' ? obj.context : undefined,
      raw: obj,
    };
  }
}
