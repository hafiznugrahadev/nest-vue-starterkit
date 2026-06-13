import { createZodDto } from 'nestjs-zod';
import { baseQuerySchema } from '@starterkit/schemas';
import { z } from 'zod';

/** Log levels the viewer can filter by (mirrors pino's numeric levels). */
export const LOG_LEVELS = ['trace', 'debug', 'info', 'warn', 'error', 'fatal'] as const;
export type LogLevel = (typeof LOG_LEVELS)[number];

/**
 * Query for GET /logs/entries. BE-only, so its schema stays local — it extends the
 * shared `baseQuerySchema` (page/limit/search) with the log file + level filters.
 */
const queryLogsSchema = baseQuerySchema.extend({
  file: z.string().min(1),
  level: z.enum(LOG_LEVELS).optional(),
});

export class QueryLogsDto extends createZodDto(queryLogsSchema) {}
