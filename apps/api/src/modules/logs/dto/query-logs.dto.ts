import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';
import { BaseQueryDto } from '@common/dto/base-query.dto';

/** Log levels the viewer can filter by (mirrors pino's numeric levels). */
export const LOG_LEVELS = ['trace', 'debug', 'info', 'warn', 'error', 'fatal'] as const;
export type LogLevel = (typeof LOG_LEVELS)[number];

/**
 * Query for GET /logs/entries. Inherits page/limit/search from BaseQueryDto;
 * `search` is the free-text filter applied across msg + the raw record.
 */
export class QueryLogsDto extends BaseQueryDto {
  @ApiProperty({
    description: 'Log file name (from GET /logs/files)',
    example: 'app.2026-06-11.1.log',
  })
  @IsString()
  file!: string;

  @ApiPropertyOptional({ enum: LOG_LEVELS, description: 'Filter by exact log level' })
  @IsOptional()
  @IsIn(LOG_LEVELS as unknown as string[])
  level?: LogLevel;
}
