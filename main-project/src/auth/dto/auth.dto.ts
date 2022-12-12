import { Type } from 'class-transformer';
import { IsBoolean, IsEmail } from 'class-validator';

export class SignInDto {
  @IsEmail()
  email: string;

  @Type(() => Boolean)
  @IsBoolean()
  gender: boolean;
}
