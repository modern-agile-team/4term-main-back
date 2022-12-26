import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class SignInDto {
  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({
    description: '회원으로 가입할 사용자의 이메일',
    example: '123@naver.com',
  })
  email: string;
}
