import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class VerifyEmailDto {
  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({
    description: '회원 가입 시 사용자 이메일',
    example: '123@naver.com',
  })
  email: string;

  @IsNotEmpty()
  @ApiProperty({
    description: '암호화된 사용자 비밀번호',
  })
  password: string;

  @IsNotEmpty()
  @ApiProperty({
    description: '이메일로 전송된 사용자 인증 코드',
  })
  code: string;
}
