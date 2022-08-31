import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT;

  await app.listen(port);

  Logger.debug(`서버 연결 port : ${port}`);
}
bootstrap();
