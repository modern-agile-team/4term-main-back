import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';
import { ValidateAnnouncement } from 'src/common/decorator/validateType.decorator';
export class AnnouncesFilterDto {
  @ApiProperty({
    example: '김민호 경사 공지 :)',
    description: '공지사항 제목',
  })
  @IsNumber()
  @ValidateAnnouncement()
  @IsOptional()
  type?: number;
}
