import { Global, Logger, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { REDIS_CLIENT, RedisService } from './redis.service';

/** SPEC DRY #10 — global Redis client + cache service. */
@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const logger = new Logger('RedisModule');
        const options = { maxRetriesPerRequest: 3, lazyConnect: false };
        // A connection string (REDIS_URL) takes precedence; ioredis parses it,
        // including rediss:// for TLS. Falls back to discrete host/port/password.
        const url = config.get<string>('redis.url');
        const client = url
          ? new Redis(url, options)
          : new Redis({
              host: config.get<string>('redis.host'),
              port: config.get<number>('redis.port'),
              password: config.get<string>('redis.password') || undefined,
              ...options,
            });
        // Without an 'error' listener ioredis logs an opaque "Unhandled error
        // event: undefined" on every connection failure. Surface the real cause
        // (bad host/URL, auth, network) so misconfig is diagnosable.
        const target = url
          ? new URL(url).host
          : `${config.get('redis.host')}:${config.get('redis.port')}`;
        client.on('error', (err: Error) =>
          logger.error(`Redis connection error (${target}): ${err?.message ?? err}`),
        );
        return client;
      },
    },
    RedisService,
  ],
  exports: [RedisService, REDIS_CLIENT],
})
export class RedisModule {}
