import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';

export class AcceptInvitaionDto {
  @ApiProperty({
    example: 4,
    description: '참여를 수락한 유저',
    required: true,
  })
  @IsNotEmpty()
  @IsInt()
  userNo: number;
}
