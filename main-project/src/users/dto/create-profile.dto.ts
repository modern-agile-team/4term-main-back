import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateProfileDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  userNo: number;

  @IsNotEmpty()
  @IsString()
  nickname: string;

  @IsNotEmpty()
  @Type(() => Boolean)
  @IsBoolean()
  gender: boolean;

  @IsOptional()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsString()
  major: string;
}
