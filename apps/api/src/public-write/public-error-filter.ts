import type { ServerResponse } from 'node:http';

import type { ExceptionFilter } from '@nestjs/common';
import { ArgumentsHost, Catch, HttpException } from '@nestjs/common';

// Public-mode responses expose status only. In particular, parser failures may
// carry submitted JSON and controller exceptions may contain storage details.
@Catch()
export class PublicErrorFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<ServerResponse>();
    if (response.destroyed || response.writableEnded) return;
    if (response.headersSent) {
      response.destroy();
      return;
    }
    // Express body-parser uses http-errors rather than Nest HttpException.
    const parserStatus =
      exception && typeof exception === 'object' && 'statusCode' in exception
        ? exception.statusCode
        : undefined;
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : typeof parserStatus === 'number' &&
            Number.isInteger(parserStatus) &&
            parserStatus >= 400 &&
            parserStatus <= 599
          ? parserStatus
          : 500;
    response.setHeader('Cache-Control', 'no-store');
    response.writeHead(status).end();
  }
}
