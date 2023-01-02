import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class MannerDto {
  @IsNumber()
  @IsNotEmpty()
  chatUserNo: number;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ example: 1, description: '채팅방 번호' })
  chatRoomNo: number;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ example: 1, description: '상대방 유저번호' })
  chatTargetUserNo: number;

  @IsNumber()
  @ApiProperty({ example: 'A+', description: '매너 평점' })
  grade: number;
}
