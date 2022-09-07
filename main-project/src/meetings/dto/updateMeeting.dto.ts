import { IsOptional, IsString, IsDate, IsNotEmpty } from 'class-validator';
import { Meeting } from '../entity/meeting.entity';

export class UpdateMeetingDto {
  @IsNotEmpty()
  meetingNo: Meeting;

  @IsOptional()
  @IsString()
  location: string;

  @IsOptional()
  @IsDate()
  time: Date;
}
