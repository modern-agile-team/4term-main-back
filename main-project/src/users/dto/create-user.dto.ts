import { IsBoolean, IsNumber, IsString } from 'class-validator';

export class CreateUserDto {
  @IsNumber()
  userNo: number;

  @IsString()
  nickname: string;

  @IsBoolean()
  gender: boolean;

  @IsString()
  major: string;

  @IsString()
  university: string;
}
