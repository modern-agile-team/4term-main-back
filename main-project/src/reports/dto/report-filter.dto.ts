import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, Max, Min } from 'class-validator';

export class ReportFilterDto {
  @ApiProperty({
    example: '23',
    description: '페이지 번호',
    required: false,
  })
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  page: number;

  @ApiProperty({
    example: '1',
    description: '유저 / 게시글 신고내역 구별 (0: 게시글, 1:유저)',
    required: false,
  })
  @IsNumber()
  @Min(0)
  @Max(1)
  @Type(() => Number)
  @IsOptional()
  type: number;
}
