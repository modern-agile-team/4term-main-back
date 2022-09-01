import { Module } from '@nestjs/common';
import { MeetingsService } from './meetings.service';
import { MeetingsController } from './meetings.controller';
import {
  MeetingInfoRepository,
  MeetingRepository,
} from './repository/meeting.repository';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([MeetingRepository, MeetingInfoRepository]),
  ],
  providers: [MeetingsService],
  controllers: [MeetingsController],
})
export class MeetingsModule {}
