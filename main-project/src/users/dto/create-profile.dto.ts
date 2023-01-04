import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ToBoolean } from 'src/common/decorator/validateValue.decorator';

export class CreateProfileDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  userNo: number;

  @IsNotEmpty()
  @IsString()
  nickname: string;

  @IsNotEmpty()
  @ToBoolean()
  @IsBoolean()
  gender: boolean;

  @IsOptional()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsString()
  major: string;
}
