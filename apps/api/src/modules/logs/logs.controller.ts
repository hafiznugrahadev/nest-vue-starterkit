import { Controller, Get, Query, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { createReadStream } from 'node:fs';
import { basename } from 'node:path';
import { UserRole } from '@starterkit/shared-types';
import { Roles } from '@common/decorators/roles.decorator';
import { ApiPaginatedResponse } from '@common/decorators/api-paginated.decorator';
import { LogsService } from './logs.service';
import { QueryLogsDto } from './dto/query-logs.dto';
import { LogEntry, LogFileMeta } from './dto/log-file.dto';

/**
 * In-app log viewer — SUPER_ADMIN only. The global JwtAuthGuard enforces auth and
 * the class-level @Roles makes RolesGuard return 403 for everyone else.
 */
@ApiTags('logs')
@ApiBearerAuth()
@Roles(UserRole.SUPER_ADMIN)
@Controller('logs')
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  @Get('files')
  @ApiOperation({ summary: 'List available log files (super admin)' })
  listFiles(): Promise<LogFileMeta[]> {
    return this.logsService.listFiles();
  }

  @Get('entries')
  @ApiOperation({ summary: 'Read parsed log entries from a file, newest first (super admin)' })
  @ApiPaginatedResponse(LogEntry)
  readEntries(@Query() query: QueryLogsDto) {
    return this.logsService.readEntries(query);
  }

  @Get('download')
  @ApiOperation({ summary: 'Download a raw log file (super admin)' })
  async download(@Query('file') file: string, @Res() res: Response): Promise<void> {
    // Validates the name + existence before any bytes are sent (throws → 400/404).
    const path = await this.logsService.getDownloadPath(file);
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${basename(path)}"`);
    const stream = createReadStream(path);
    stream.on('error', () => {
      if (!res.headersSent) res.status(500).end();
    });
    stream.pipe(res);
  }
}
