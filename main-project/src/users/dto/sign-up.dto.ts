import { IsEmail, IsNotEmpty } from 'class-validator';

export class SignUpDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;
}