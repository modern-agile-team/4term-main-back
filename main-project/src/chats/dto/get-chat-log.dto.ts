import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class GetChatLogDTO {
  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    example: 1,
  })
  userNo: number;

  @IsOptional()
  @IsNumber()
  @ApiProperty({
    example: 3,
  })
  currentChatLogNo: number;
}
