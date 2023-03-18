import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Socket } from 'socket.io';

@Catch()
export class WebSocketExceptionFilter implements ExceptionFilter {
  catch(exception, host: ArgumentsHost) {
    const ctx = host.switchToWs();
    const client = ctx.getClient<Socket>();

    client.emit('error', {
      error:
        exception instanceof Error
          ? exception.message
          : 'Internal server error',
      message: exception.response.message,
    });
  }
}
