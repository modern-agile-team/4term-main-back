import { Module } from '@nestjs/common';
import { MannersService } from './manners.service';
import { MannersController } from './manners.controller';

@Module({
  providers: [MannersService],
  controllers: [MannersController]
})
export class MannersModule {}
