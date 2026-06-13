import { registerAs } from '@nestjs/config';

export const databaseConfig = registerAs('database', () => ({
  url: process.env.DATABASE_URL,
}));

export const redisConfig = registerAs('redis', () => ({
  // REDIS_URL (e.g. redis://:pass@host:6379, rediss:// for TLS) wins when set —
  // managed providers hand you a single connection string. Otherwise the discrete
  // host/port/password fields are used.
  url: process.env.REDIS_URL || undefined,
  host: process.env.REDIS_HOST ?? 'localhost',
  port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
  password: process.env.REDIS_PASSWORD || undefined,
}));
