import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class AuthDto {
  @IsString()
  @IsOptional()
  email: string;

  @IsOptional()
  @IsString()
  nickname: string;
}
