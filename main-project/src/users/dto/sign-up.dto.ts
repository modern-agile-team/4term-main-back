import { Type } from 'class-transformer';
import { IsBoolean, IsEmail, IsString } from 'class-validator';

export class SignUpDto {
  @IsString()
  nickname: string;

  @IsEmail()
  email: string;

  @Type(() => Boolean)
  @IsBoolean()
  gender: boolean;
}
