import { IsOptional, IsString, IsDate } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateMeetingDto {
  @IsOptional()
  @IsString()
  @ApiProperty({
    example: '경기도',
    description: '약속 장소',
  })
  location: string;

  @IsOptional()
  @IsDate()
  @ApiProperty({
    example: '2022-06-27 15:22:31',
    description: '약속 시간',
  })
  time: Date;
}
