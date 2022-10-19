import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';

export class InviteGuestDto {
  //Param
  @IsNotEmpty()
  @IsInt()
  @ApiProperty({
    example: 3,
    description: '초대하려는 약속',
    required: true,
  })
  meetingNo: number;

  //Body
  @IsNotEmpty()
  @IsInt()
  @ApiProperty({
    example: 1,
    description: '초대를 보낸 유저',
    required: true,
  })
  userNo: number;

  @IsNotEmpty()
  @IsInt()
  @ApiProperty({
    example: 4,
    description: '초대 요청을 받는 유저',
    required: true,
  })
  invitedUserNo: number;
}
