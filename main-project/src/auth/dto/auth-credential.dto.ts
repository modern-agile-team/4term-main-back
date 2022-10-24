import { IsEmail, IsNotEmpty } from 'class-validator';

export class AuthCredentialsDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
