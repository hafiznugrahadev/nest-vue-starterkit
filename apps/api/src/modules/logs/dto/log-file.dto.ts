import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/** Metadata for one rotated log file on disk (returned by GET /logs/files). */
export class LogFileMeta {
  @ApiProperty({ example: 'app.2026-06-11.1.log' }) name!: string;
  @ApiProperty({
    nullable: true,
    example: '2026-06-11',
    description: 'Date parsed from the filename',
  })
  date!: string | null;
  @ApiProperty({ example: 10240, description: 'File size in bytes' }) sizeBytes!: number;
  @ApiProperty({ example: '2026-06-11T08:15:00.000Z' }) modifiedAt!: string;
}

/** One parsed pino JSON log line (returned by GET /logs/entries). */
export class LogEntry {
  @ApiProperty({ example: '2026-06-11T08:15:00.000Z', description: 'ISO timestamp' }) time!: string;
  @ApiProperty({ example: 'info', description: 'Level label (trace…fatal)' }) level!: string;
  @ApiProperty({ example: 30, description: 'Raw pino numeric level' }) levelValue!: number;
  @ApiProperty({ example: 'request completed' }) msg!: string;
  @ApiPropertyOptional({ description: 'x-request-id correlation id, if present' })
  requestId?: string;
  @ApiPropertyOptional({ description: 'Nest logger context, if present' }) context?: string;
  @ApiProperty({
    type: 'object',
    additionalProperties: true,
    description: 'Full parsed log object (for the detail view)',
  })
  raw!: Record<string, unknown>;
}
