import { extname } from 'node:path';
import { randomUUID } from 'node:crypto';
import type { StorageDriver, StoredFile, UploadInput } from '../storage.types';

export interface S3DriverOptions {
  /** Custom endpoint for S3-compatible stores (e.g. MinIO http://localhost:9000). */
  endpoint?: string;
  region: string;
  bucket: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  /** Path-style addressing — required by MinIO and most self-hosted stores. */
  forcePathStyle: boolean;
  /** Optional CDN/public base URL fronting the bucket. */
  publicBaseUrl?: string;
}

/** Structural view of the bits of `@aws-sdk/client-s3` this driver uses. */
interface S3ClientLike {
  send(command: unknown): Promise<unknown>;
}
interface S3Module {
  S3Client: new (config: unknown) => S3ClientLike;
  PutObjectCommand: new (input: unknown) => unknown;
  DeleteObjectCommand: new (input: unknown) => unknown;
  GetObjectCommand: new (input: unknown) => unknown;
}
interface PresignerModule {
  getSignedUrl: (client: unknown, command: unknown, opts: { expiresIn: number }) => Promise<string>;
}

// Held as `string` (not literals) so the TS compiler treats the AWS SDK as a
// runtime-only, OPTIONAL dependency: deployments on the `local` driver never need
// these installed or resolvable. They are imported lazily only when S3 is active.
const S3_SDK: string = '@aws-sdk/client-s3';
const S3_PRESIGNER: string = '@aws-sdk/s3-request-presigner';

/**
 * S3-compatible driver (AWS S3, MinIO, RustFS, …). The AWS SDK is loaded lazily
 * (see S3_SDK). Returned URLs assume the bucket/prefix is publicly readable, or
 * that a CDN fronts it via S3_PUBLIC_BASE_URL — swap to presigned GETs for private
 * objects.
 */
export class S3StorageDriver implements StorageDriver {
  private readonly bucket: string;
  private readonly endpoint?: string;
  private readonly region: string;
  private readonly publicBaseUrl?: string;
  // Public origin used to SIGN GET URLs so the browser can fetch them directly
  // (e.g. https://rustfs.example.com). Falls back to the internal endpoint. The
  // SigV4 signature covers the host, so it must be signed for the host the browser
  // actually hits — not the server-to-server endpoint.
  private readonly signEndpoint?: string;
  private clientPromise?: Promise<S3ClientLike>;
  private signClientPromise?: Promise<S3ClientLike>;

  constructor(private readonly opts: S3DriverOptions) {
    this.bucket = opts.bucket;
    this.endpoint = opts.endpoint?.replace(/\/+$/, '');
    this.region = opts.region;
    this.publicBaseUrl = opts.publicBaseUrl?.replace(/\/+$/, '');
    this.signEndpoint = this.publicBaseUrl ? new URL(this.publicBaseUrl).origin : this.endpoint;
  }

  private async sdk(): Promise<S3Module> {
    try {
      return (await import(S3_SDK)) as S3Module;
    } catch {
      throw new Error(
        'STORAGE_DRIVER=s3 requires the "@aws-sdk/client-s3" package. Run: bun add @aws-sdk/client-s3',
      );
    }
  }

  private async presigner(): Promise<PresignerModule> {
    try {
      return (await import(S3_PRESIGNER)) as PresignerModule;
    } catch {
      throw new Error(
        'STORAGE_DRIVER=s3 requires "@aws-sdk/s3-request-presigner". Run: bun add @aws-sdk/s3-request-presigner',
      );
    }
  }

  private get credentials() {
    return this.opts.accessKeyId && this.opts.secretAccessKey
      ? { accessKeyId: this.opts.accessKeyId, secretAccessKey: this.opts.secretAccessKey }
      : undefined;
  }

  private client(): Promise<S3ClientLike> {
    if (!this.clientPromise) {
      this.clientPromise = this.sdk().then(
        ({ S3Client }) =>
          new S3Client({
            region: this.opts.region,
            endpoint: this.opts.endpoint,
            forcePathStyle: this.opts.forcePathStyle,
            credentials: this.credentials,
          }),
      );
    }
    return this.clientPromise;
  }

  /** Separate client pinned to the PUBLIC origin — used only for presigning GETs. */
  private signClient(): Promise<S3ClientLike> {
    if (!this.signClientPromise) {
      this.signClientPromise = this.sdk().then(
        ({ S3Client }) =>
          new S3Client({
            region: this.opts.region,
            endpoint: this.signEndpoint,
            forcePathStyle: this.opts.forcePathStyle,
            credentials: this.credentials,
          }),
      );
    }
    return this.signClientPromise;
  }

  async upload(input: UploadInput): Promise<StoredFile> {
    const { PutObjectCommand } = await this.sdk();
    const client = await this.client();
    const ext = extname(input.originalName)
      .toLowerCase()
      .replace(/[^.a-z0-9]/g, '');
    const key = `${input.folder}/${randomUUID()}${ext}`;
    await client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: input.buffer,
        ContentType: input.mimeType,
      }),
    );
    return { key, url: this.url(key), mimeType: input.mimeType, size: input.size };
  }

  async delete(key: string): Promise<void> {
    const { DeleteObjectCommand } = await this.sdk();
    const client = await this.client();
    await client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
  }

  url(key: string): string {
    if (this.publicBaseUrl) return `${this.publicBaseUrl}/${key}`;
    // Path-style for custom endpoints (MinIO); virtual-hosted for real AWS S3.
    if (this.endpoint) return `${this.endpoint}/${this.bucket}/${key}`;
    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
  }

  /** Presigned GET URL — lets the browser fetch a private object for `expiresIn`s. */
  async signedUrl(key: string, expiresInSeconds: number): Promise<string> {
    const { GetObjectCommand } = await this.sdk();
    const { getSignedUrl } = await this.presigner();
    const client = await this.signClient();
    return getSignedUrl(client, new GetObjectCommand({ Bucket: this.bucket, Key: key }), {
      expiresIn: expiresInSeconds,
    });
  }
}
