import { Module } from '@nestjs/common';
import { MeetingsService } from './meetings.service';
import { MeetingsController } from './meetings.controller';
import { MeetingRepository } from './repository/meeting.repository';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([MeetingRepository])],
  providers: [MeetingsService],
  controllers: [MeetingsController],
})
export class MeetingsModule {}
