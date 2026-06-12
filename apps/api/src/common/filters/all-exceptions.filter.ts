import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { DatabaseError } from 'pg';
import type { Request, Response } from 'express';
import type { ApiErrorResponse } from '@starterkit/shared-types';

/**
 * Global filter producing the `{ success:false, ... }` error envelope. Maps known
 * Postgres errors (SQLSTATE) to sensible HTTP codes so the FE always sees a
 * consistent shape.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';
    let error = 'InternalServerError';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null) {
        const body = res as { message?: string | string[]; error?: string };
        message = body.message ?? exception.message;
        error = body.error ?? exception.name;
      }
    } else if (exception instanceof DatabaseError) {
      ({ status, message, error } = this.mapDatabaseError(exception));
    } else if (exception instanceof Error) {
      message = exception.message;
      error = exception.name;
    }

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `${request.method} ${request.url} → ${status}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    const body: ApiErrorResponse = {
      success: false,
      statusCode: status,
      message,
      error,
      path: request.url,
      timestamp: new Date().toISOString(),
    };

    response.status(status).json(body);
  }

  private mapDatabaseError(e: DatabaseError): {
    status: number;
    message: string;
    error: string;
  } {
    switch (e.code) {
      case '23505': // unique_violation
        return {
          status: HttpStatus.CONFLICT,
          message: `Unique constraint failed on: ${e.constraint ?? 'field'}`,
          error: 'Conflict',
        };
      case '23503': // foreign_key_violation
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Related record constraint failed',
          error: 'BadRequest',
        };
      case '23502': // not_null_violation
        return {
          status: HttpStatus.BAD_REQUEST,
          message: `Missing required field: ${e.column ?? 'field'}`,
          error: 'BadRequest',
        };
      default:
        return {
          status: HttpStatus.BAD_REQUEST,
          message: `Database error (${e.code})`,
          error: 'BadRequest',
        };
    }
  }
}
