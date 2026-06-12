import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  PayloadTooLargeException,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '@infrastructure/redis/redis.service';
import { STORAGE_DRIVER, type StorageDriver, type StoredFile } from './storage.types';

/** Minimal shape of a Multer memory-storage file (avoids needing @types/multer). */
export interface UploadedFile {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
}

const SIGNED_CACHE_PREFIX = 'storage:signed:';

/**
 * Public storage facade (mirrors RedisService). Enforces the configured size +
 * MIME guardrails, delegates to the active driver (local | s3), and resolves
 * stored keys to time-limited (presigned) URLs — cached in Redis so a private
 * bucket never needs public read access. Inject anywhere; StorageModule is @Global.
 */
@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly maxBytes: number;
  private readonly allowedMime: string[];
  private readonly signedUrlTtl: number;
  private readonly cacheTtl: number;
  /** Known URL prefixes that legacy rows may carry, so we can recover the key. */
  private readonly keyPrefixes: string[];

  constructor(
    @Inject(STORAGE_DRIVER) private readonly driver: StorageDriver,
    private readonly redis: RedisService,
    config: ConfigService,
  ) {
    this.maxBytes = config.get<number>('storage.maxFileSizeBytes') ?? 5 * 1024 * 1024;
    this.allowedMime = config.get<string[]>('storage.allowedMimeTypes') ?? [];
    this.signedUrlTtl = config.get<number>('storage.signedUrlTtlSeconds') ?? 3600;
    // Cache a generated URL for a bit less than its lifetime so a cached hit always
    // has comfortable validity remaining.
    this.cacheTtl = Math.max(60, this.signedUrlTtl - 300);

    const s3Public = config.get<string>('storage.s3.publicBaseUrl');
    const s3Endpoint = config.get<string>('storage.s3.endpoint');
    const s3Bucket = config.get<string>('storage.s3.bucket');
    const localPublic = config.get<string>('storage.local.publicBaseUrl');
    this.keyPrefixes = [
      s3Public,
      s3Endpoint && s3Bucket ? `${s3Endpoint.replace(/\/+$/, '')}/${s3Bucket}` : undefined,
      localPublic ? `${localPublic.replace(/\/+$/, '')}/uploads` : undefined,
    ]
      .filter((p): p is string => !!p)
      .map((p) => p.replace(/\/+$/, ''));
  }

  async upload(file: UploadedFile | undefined, folder?: string): Promise<StoredFile> {
    if (!file?.buffer) throw new BadRequestException('No file provided (field "file")');
    if (file.size > this.maxBytes) {
      throw new PayloadTooLargeException(
        `File exceeds the ${Math.round(this.maxBytes / 1024 / 1024)}MB limit`,
      );
    }
    if (this.allowedMime.length && !this.allowedMime.includes(file.mimetype)) {
      throw new UnsupportedMediaTypeException(`Unsupported file type: ${file.mimetype}`);
    }
    const stored = await this.driver.upload({
      buffer: file.buffer,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      folder: this.sanitizeFolder(folder),
    });
    // Hand back a ready-to-use (presigned) URL for an immediate preview; callers
    // persist `key`, not this URL — it expires.
    const url = (await this.signedUrl(stored.key)) ?? stored.url;
    return { ...stored, url };
  }

  async delete(key: string): Promise<void> {
    await this.invalidateUrl(key);
    await this.driver.delete(key);
  }

  url(key: string): string {
    return this.driver.url(key);
  }

  /**
   * Resolve a stored avatar reference (a storage key — or a legacy full URL) to a
   * fresh, time-limited URL. The result is cached in Redis for ~1h so repeated
   * reads (every login/refresh/profile fetch) don't re-sign on each call.
   */
  async signedUrl(stored: string | null | undefined): Promise<string | null> {
    if (!stored) return null;
    const key = this.toKey(stored);
    // Unknown external URL (not ours) — pass through untouched.
    if (key === null) return stored;

    const cacheKey = `${SIGNED_CACHE_PREFIX}${key}`;
    const cached = await this.safe(() => this.redis.get<string>(cacheKey));
    if (cached) return cached;

    const url = await this.driver.signedUrl(key, this.signedUrlTtl);
    await this.safe(() => this.redis.set(cacheKey, url, this.cacheTtl));
    return url;
  }

  /** Drop a cached signed URL — call when the underlying object changes/is removed. */
  async invalidateUrl(stored: string | null | undefined): Promise<void> {
    if (!stored) return;
    const key = this.toKey(stored);
    if (key) await this.safe(() => this.redis.del(`${SIGNED_CACHE_PREFIX}${key}`));
  }

  /**
   * Normalise a stored value to an object key. New rows store the key directly;
   * legacy rows may hold a full URL (from before private buckets) — strip the known
   * prefix and any query string to recover the key. Returns null for an unrelated
   * external URL so the caller leaves it as-is.
   */
  private toKey(stored: string): string | null {
    if (!/^https?:\/\//i.test(stored)) return stored; // already a key
    const noQuery = stored.split('?')[0];
    for (const prefix of this.keyPrefixes) {
      if (noQuery.startsWith(prefix)) return noQuery.slice(prefix.length).replace(/^\/+/, '');
    }
    return null;
  }

  /** Restrict folders to a safe slug — prevents path traversal and odd keys. */
  private sanitizeFolder(folder?: string): string {
    const clean = (folder ?? 'uploads').toLowerCase().replace(/[^a-z0-9_-]/g, '');
    return clean || 'uploads';
  }

  /** Run a Redis op, swallowing errors so the cache is never a hard dependency. */
  private async safe<R>(fn: () => Promise<R>): Promise<R | null> {
    try {
      return await fn();
    } catch (err) {
      this.logger.warn(`Redis cache unavailable: ${(err as Error).message}`);
      return null;
    }
  }
}
