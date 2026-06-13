import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD, APP_PIPE } from '@nestjs/core';
import { join, resolve } from 'node:path';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { LoggerModule } from 'nestjs-pino';
import { validateEnv } from '@config/env.validation';
import { appConfig } from '@config/app.config';
import { databaseConfig, redisConfig } from '@config/database.config';
import { storageConfig } from '@config/storage.config';
import { mailConfig } from '@config/mail.config';
import { RequestIdMiddleware } from '@common/middleware/request-id.middleware';
import { ZodValidationPipe } from '@common/pipes/zod-validation.pipe';
import { DrizzleModule } from '@infrastructure/database/drizzle.module';
import { RedisModule } from '@infrastructure/redis/redis.module';
import { StorageModule } from '@infrastructure/storage/storage.module';
import { MailModule } from '@infrastructure/mail/mail.module';
import { AuthModule } from '@modules/auth/auth.module';
import { UsersModule } from '@modules/users/users.module';
import { FilesModule } from '@modules/files/files.module';
import { HealthModule } from '@modules/health/health.module';
import { NotificationsModule } from '@modules/notifications/notifications.module';
import { LogsModule } from '@modules/logs/logs.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      // Single source of truth: the monorepo-root .env (cwd is apps/api at runtime).
      // Real env vars (e.g. from docker-compose) still take precedence.
      envFilePath: ['../../.env'],
      validate: validateEnv,
      load: [appConfig, databaseConfig, redisConfig, storageConfig, mailConfig],
    }),
    // Logger config flows from ConfigService (.env → app.config → here).
    // Logs fan out to two sinks: the console (raw JSON in prod for `docker logs`,
    // pretty in dev) and a daily-rotated file on disk (pino-roll) with N-day
    // retention. The file is plain JSON-lines — what the /logs viewer parses.
    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const isProd = config.get<string>('app.env') === 'production';
        const logDir = resolve(config.get<string>('app.logging.dir') ?? './storage/logs');
        const retentionDays = config.get<number>('app.logging.retentionDays') ?? 7;
        const fileEnabled = config.get<boolean>('app.logging.fileEnabled') ?? true;

        const consoleTarget = isProd
          ? { target: 'pino/file', options: { destination: 1 } } // raw JSON → stdout
          : { target: 'pino-pretty', options: { singleLine: true } };

        const fileTarget = {
          target: 'pino-roll',
          options: {
            file: join(logDir, 'app'),
            frequency: 'daily',
            dateFormat: 'yyyy-MM-dd',
            mkdir: true,
            extension: '.log',
            // retentionDays files total = (retentionDays - 1) rotated + 1 active.
            // removeOtherLogFiles also prunes files left by prior container runs.
            limit: { count: Math.max(retentionDays - 1, 1), removeOtherLogFiles: true },
          },
        };

        return {
          pinoHttp: {
            level: config.get<string>('app.logLevel') ?? 'info',
            transport: { targets: fileEnabled ? [consoleTarget, fileTarget] : [consoleTarget] },
            customProps: (req) => ({ requestId: req.headers['x-request-id'] }),
          },
        };
      },
    }),
    // Global rate limiting (config-driven); per-route overrides via @Throttle.
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        throttlers: [
          {
            name: 'default',
            ttl: config.get<number>('app.throttle.ttl') ?? 60_000,
            limit: config.get<number>('app.throttle.limit') ?? 100,
          },
        ],
        // Config-driven kill switch (THROTTLE_DISABLED=true) for dev/E2E/load tests.
        skipIf: () => config.get<boolean>('app.throttle.disabled') ?? false,
      }),
    }),
    DrizzleModule,
    RedisModule,
    StorageModule,
    MailModule,
    AuthModule,
    UsersModule,
    FilesModule,
    HealthModule,
    NotificationsModule,
    LogsModule,
  ],
  providers: [
    // SPEC DRY #7 — one global Zod validation pipe governs every DTO.
    { provide: APP_PIPE, useClass: ZodValidationPipe },
    // Apply rate limiting across every route by default.
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}
