import { Injectable, PipeTransform, Type } from '@nestjs/common';

@Injectable()
export class GetTransactionManagerPipe implements PipeTransform {
  transform(socket: any) {
    return socket.handshake.manager;
  }
}
