import { Global, Module } from '@nestjs/common';
import { DrizzleService } from './drizzle.service';

/** SPEC DRY #10 — global so feature modules never re-import it. */
@Global()
@Module({
  providers: [DrizzleService],
  exports: [DrizzleService],
})
export class DrizzleModule {}
