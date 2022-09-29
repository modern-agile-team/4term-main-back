import { IsBoolean, IsEmpty, IsNumber, IsString } from 'class-validator';

export class UserProfileDto {
  @IsNumber()
  no: number;

  @IsString()
  @IsEmpty()
  description?: string;

  @IsNumber()
  majorNo: number;

  @IsNumber()
  universityNo: number;

  @IsString()
  nickname: string;

  @IsBoolean()
  gender: boolean;
}
