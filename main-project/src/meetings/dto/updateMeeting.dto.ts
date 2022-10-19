import { IsInt, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateMeetingDto {
  //Param
  @IsNotEmpty()
  @IsInt()
  @ApiProperty({
    example: 1,
    description: '수정하려는 약속 번호',
  })
  meetingNo: number;

  //Body
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: '경기도',
    description: '약속 장소',
  })
  location: string;

  @IsNotEmpty()
  @Type(() => Date)
  @ApiProperty({
    example: '2022-06-27 15:22:31',
    description: '약속 시간',
  })
  time: Date;

  @IsNotEmpty()
  @IsInt()
  @ApiProperty({
    example: 1,
    description: '약속을 수정하려는 유저 번호',
  })
  userNo: number;
}
