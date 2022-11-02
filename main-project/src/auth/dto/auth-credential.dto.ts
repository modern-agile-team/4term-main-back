import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsNumber } from 'class-validator';

export class AuthCredentialsDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  // @IsNumber()
  // @ApiProperty({
  //   example: 0,
  //   description:
  //     '처음 로그인하는 유저 : 0, 이미 회원가입 되어 있지만 학적이 인증되지 않은 유저 : 1 회원가입과 학적이 인증된 유저 : 2',
  // })
  // status: number;

  // @IsBoolean()
  // gender: boolean;

  // @IsBoolean()
  // admin: boolean;
}
