import { BadRequestException } from '@nestjs/common';
import { createZodValidationPipe } from 'nestjs-zod';
import { ZodError } from 'zod';

/**
 * SPEC DRY #7 — one global validation pipe governs every Zod DTO (replaces the old
 * class-validator ValidationPipe). Zod issues are mapped into the same
 * `{ statusCode, message: string[], error }` shape the old pipe produced, so
 * AllExceptionsFilter and the web client keep working unchanged.
 */
export const ZodValidationPipe = createZodValidationPipe({
  createValidationException: (error: unknown) => {
    if (error instanceof ZodError) {
      const message = error.issues.map((issue) =>
        issue.path.length ? `${issue.path.join('.')}: ${issue.message}` : issue.message,
      );
      return new BadRequestException({ statusCode: 400, message, error: 'Bad Request' });
    }
    return new BadRequestException('Validation failed');
  },
});
