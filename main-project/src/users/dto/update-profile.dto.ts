import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateProfileDto {
  @MaxLength(45)
  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    description: '유저 닉네임, 최대 길이 45',
    example: 'juhaa',
  })
  nickname?: string;

  @MaxLength(255)
  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    description: '유저 프로필 메시지, 최대 길이 255',
  })
  description?: string;
}
