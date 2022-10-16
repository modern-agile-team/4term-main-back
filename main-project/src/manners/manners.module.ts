import { Module } from '@nestjs/common';
import { MannersController } from './manners.controller';
import { MannersService } from './manners.service';

@Module({
  controllers: [MannersController],
  providers: [MannersService]
})
export class MannersModule {}
