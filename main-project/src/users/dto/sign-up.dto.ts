import { IsEmail } from 'class-validator';

export class SignUpDto {
  @IsEmail()
  email: string;
}
