import { IsBoolean, IsNumber, IsString } from 'class-validator';

export class CreateUserDto {
  @IsString()
  nickname: string;

  @IsString()
  description: string;

  @IsNumber()
  majorNo: number;

  @IsNumber()
  universityNo: number;
}
