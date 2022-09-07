import { IsDate, IsNotEmpty, IsString, IsObject } from 'class-validator';

export class CreateMeetingDto {
  @IsNotEmpty()
  @IsObject()
  host: object;

  @IsNotEmpty()
  @IsString()
  location: string;

  @IsNotEmpty()
  @IsDate()
  time: Date;
}
