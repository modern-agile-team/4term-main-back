import { IsNotEmpty, IsString, IsInt, IsDate } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateMeetingDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: '경기도',
    description: '약속 장소',
    required: true,
  })
  location: string;

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  @ApiProperty({
    example: '2022-06-27 15:22:31',
    description: '약속 시간',
    required: true,
  })
  time: Date;

  @IsNotEmpty()
  @IsInt()
  @ApiProperty({
    example: 1,
    description: '채팅방 번호',
    required: true,
  })
  chatRoomNo: number;
}
