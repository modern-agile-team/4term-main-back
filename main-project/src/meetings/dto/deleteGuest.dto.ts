import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class DeleteGuestDto {
  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    example: 1,
    description: '삭제하려는 게스트',
    required: true,
  })
  userNo: number;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    example: 1,
    description:
      '해당 유저가 약속에서 삭제된 후 설정할 게스트 대표(유저가 게스트 대표가 아닌 경우는 적용 안 됨)',
    required: true,
  })
  newAdminGuest: number;
}
