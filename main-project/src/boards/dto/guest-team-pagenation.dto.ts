import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, Min } from 'class-validator';

export class GuestTeamPagenationDto {
  @ApiProperty({
    example: 1,
    description: '페이지 번호',
    required: true,
  })
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  @IsNotEmpty()
  page: number;
}
