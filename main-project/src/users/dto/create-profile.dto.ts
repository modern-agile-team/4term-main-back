import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ToBoolean } from 'src/common/decorator/validateValue.decorator';

export class CreateProfileDto {
  @IsNumber()
  @Type(() => Number)
  @IsNotEmpty()
  @ApiProperty({
    description: '유저 넘버',
  })
  userNo: number;

  @MaxLength(45)
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: '유저 닉네임, 최대 길이 45',
    example: 'juhaa',
  })
  nickname: string;

  @IsBoolean()
  @ToBoolean()
  @IsNotEmpty()
  @ApiProperty({
    description: '유저 성별(여자 : 0, 남자 : 1)',
  })
  gender: boolean;

  @MaxLength(255)
  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    description: '유저 프로필 메시지, 최대 길이 255',
  })
  description: string;

  @MaxLength(45)
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: '재학 중인 학과, 최대 길이 45',
  })
  major: string;
}
