import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    if (!(exception instanceof HttpException)) {
      console.error('INTERNAL ERROR:', exception);
      require('fs').appendFileSync(
        '/tmp/backend-error.log',
        '\n[' + new Date().toISOString() + '] INTERNAL ERROR:\n' +
        (exception instanceof Error ? exception.stack : String(exception)) +
        '\n'
      );
    }
    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    response.status(status).json({
      code: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      error: message,
    });
  }
}
