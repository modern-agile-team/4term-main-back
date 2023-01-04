import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateProfileDto {
  @IsNotEmpty()
  @IsNumber()
  userNo: number;

  @IsOptional()
  @IsString()
  nickname?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
