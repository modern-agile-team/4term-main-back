import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { ValidateGender } from 'src/common/decorator/validateGender.decorator';

export class GetBoardByUserDto {
  @ApiProperty({
    example: 1,
    description:
      '게시글 조회 시 유저가 포함된 항목에 따른 조회시를 수행. 1: 작성자로 등록된 게시글, 2: 호스트멤버로 등록된 게시글, 3: 게스트로 등록된 게시글',
    required: true,
  })
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  readonly type: number;
}
