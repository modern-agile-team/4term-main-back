import { Module } from '@nestjs/common';
import { MannersService } from './manners.service';
import { MannersController } from './manners.controller';
import { MannersRepository } from './repository/manners.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BoardRepository } from 'src/boards/repository/board.repository';

@Module({
  imports: [TypeOrmModule.forFeature([MannersRepository, BoardRepository])],
  providers: [MannersService],
  controllers: [MannersController],
})
export class MannersModule {}
