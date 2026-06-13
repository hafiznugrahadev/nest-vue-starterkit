import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import { AppModule } from '../../src/app.module';
import { ResponseInterceptor } from '../../src/common/interceptors/response.interceptor';
import { AllExceptionsFilter } from '../../src/common/filters/all-exceptions.filter';
import { Database, DrizzleService } from '../../src/infrastructure/database/drizzle.service';

export async function createTestApp(): Promise<INestApplication> {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleRef.createNestApplication({ logger: false });

  app.use(cookieParser());
  app.setGlobalPrefix('api');
  // The global ZodValidationPipe is registered in AppModule via APP_PIPE, so it
  // applies here without manual wiring (mirrors production main.ts).
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter());

  await app.init();
  return app;
}

export async function getDb(app: INestApplication): Promise<Database> {
  return app.get(DrizzleService).db;
}

/** Extract access token from a login response body. */
export function extractAccessToken(body: { data?: { accessToken?: string } }): string {
  return body?.data?.accessToken ?? '';
}

/** Extract the Set-Cookie header value for the refresh token. */
export function extractRefreshCookie(headers: Record<string, string | string[]>): string {
  const raw = headers['set-cookie'];
  if (!raw) return '';
  const cookies = Array.isArray(raw) ? raw : [raw];
  return cookies.find((c) => c.startsWith('refresh_token=')) ?? '';
}

/** Unique e2e-only email so tests never clash with seeded users. */
export const E2E_PREFIX = 'e2e-test-';

export const SEED_USERS = {
  superAdmin: { email: 'superadmin@starterkit.test', password: 'super1234' },
  admin: { email: 'admin@starterkit.test', password: 'admin123' },
  user: { email: 'user@starterkit.test', password: 'user1234' },
} as const;
