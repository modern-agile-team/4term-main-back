import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';

export class InviteMemberDto {
  @IsNotEmpty()
  @IsInt()
  @ApiProperty({
    example: 1,
    description:
      '초대를 보낸 유저(해당 유저가 약속 게스트면 요청을 받은 유저도 게스트로 참여)',
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
