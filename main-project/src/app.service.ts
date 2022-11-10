import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    const str = "Hello World!"+process.env.PORT
    return str;
  }
}
