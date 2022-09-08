import { Module } from '@nestjs/common';
import { MeetingsService } from './meetings.service';
import { MeetingsController } from './meetings.controller';
import { MeetingRepository } from './repository/meeting.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MeetingInfoRepository } from './repository/meeting-info.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([MeetingRepository, MeetingInfoRepository]),
  ],
  providers: [MeetingsService],
  controllers: [MeetingsController],
})
export class MeetingsModule {}
