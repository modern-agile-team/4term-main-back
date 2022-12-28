import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class BoardFilterDto {
  @ApiProperty({
    example: '0',
    description: '모집 성별 필터/ 0:남 1:여',
  })
  @IsString()
  @IsOptional()
  gender: string;

  @ApiProperty({
    example: '23',
    description: '모집 인원',
  })
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  people: number;

  @ApiProperty({
    example: '0',
    description: '모집 성별 필터/ 0:남 1:여',
  })
  @IsString()
  @IsOptional()
  isDone: string;

  @ApiProperty({
    example: '0',
    description: '번개글 :1, 일반 과팅이면 작성 X',
  })
  @IsString()
  @IsOptional()
  isThunder: string;
}
