import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';

export class AcceptInvitaionDto {
  //Param
  @IsNotEmpty()
  @IsInt()
  @ApiProperty({
    example: 1,
    description: '수락한 초대 요청 알림',
    required: true,
  })
  noticeNo: number;

  //Body
  @IsNotEmpty()
  @IsInt()
  @ApiProperty({
    example: 4,
    description: '참여를 수락한 유저',
    required: true,
  })
  userNo: number;
}
