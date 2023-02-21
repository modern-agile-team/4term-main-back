import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, Max, Min } from 'class-validator';

export class ReportFilterDto {
  @ApiProperty({
    example: 2,
    description: '페이지 번호',
    required: true,
  })
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  @IsNotEmpty()
  page: number;

  @ApiProperty({
    example: 1,
    description:
      '유저 / 게시글 신고내역 구별 (null:전체조회, ,0: 유저, 1: 게시글)',
    required: false,
  })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  type: number;
}
