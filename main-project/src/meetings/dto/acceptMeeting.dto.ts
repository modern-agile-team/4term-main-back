import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';

export class AcceptMeetingDto {
  @IsNotEmpty()
  @IsInt()
  @ApiProperty({
    example: 4,
    description: '약속을 수락하는 유저',
    required: true,
  })
  userNo: number;
}
