import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';

export class AcceptMeetingDto {
  //Param
  @IsNotEmpty()
  @IsInt()
  @ApiProperty({
    example: 1,
    description: '수락된 약속',
    required: true,
  })
  meetingNo: number;

  //Body
  @IsNotEmpty()
  @IsInt()
  @ApiProperty({
    example: 4,
    description: '약속을 수락하려는 유저',
    required: true,
  })
  userNo: number;
}
