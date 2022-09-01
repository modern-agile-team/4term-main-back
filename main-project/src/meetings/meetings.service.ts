import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MeetingRepository } from './repository/meeting.repository';

@Injectable()
export class MeetingsService {
  constructor(
    @InjectRepository(MeetingRepository)
    private readonly meetingRepository: MeetingRepository,
  ) {}
}
