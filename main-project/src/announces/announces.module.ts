import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnnouncesController } from './announces.controller';
import { AnnouncesService } from './announces.service';
import { AnnouncesRepository } from './repository/announce.repository';

@Module({
  imports: [TypeOrmModule.forFeature([AnnouncesRepository])],
  controllers: [AnnouncesController],
  providers: [AnnouncesService],
})
export class AnnouncesModule {}
