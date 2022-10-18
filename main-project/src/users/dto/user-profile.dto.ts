import {
  IsBoolean,
  IsEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class UserProfileDto {
  @IsOptional()
  @IsNumber()
  no: number;

  @IsOptional()
  @IsString()
  @IsEmpty()
  description?: string;

  @IsOptional()
  @IsNumber()
  majorNo: number;

  @IsOptional()
  @IsNumber()
  universityNo: number;

  @IsOptional()
  @IsString()
  nickname: string;

  @IsOptional()
  @IsBoolean()
  gender: boolean;
}
