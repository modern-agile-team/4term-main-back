import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';

export class ApplyForMeetingDto {
  //Param
  @IsNotEmpty()
  @IsInt()
  @ApiProperty({
    example: 1,
    description: '참여 요청을 보내려는 약속',
    required: true,
  })
  meetingNo: number;

  //Body
  @IsNotEmpty()
  @ApiProperty({
    example: [4, 5, 6],
    description:
      '약속에 참여하려는 유저 목록, guest[0]은 참여 요청을 보낸 유저',
    required: true,
  })
  guest: number[];

  @IsNotEmpty()
  @IsInt()
  @ApiProperty({
    example: 4,
    description: '참여 요청을 보낸 유저',
    required: true,
  })
  userNo: number;
}
