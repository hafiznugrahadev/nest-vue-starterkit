import { Module } from '@nestjs/common';
import { LogsController } from './logs.controller';
import { LogsService } from './logs.service';

/** Log viewer API (super-admin only). ConfigService is global, so no imports. */
@Module({
  controllers: [LogsController],
  providers: [LogsService],
})
export class LogsModule {}
