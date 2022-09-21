import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';
export class CreateBoardDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsBoolean()
  @IsNotEmpty()
  isDone: boolean;

  @IsString()
  location: string;

  @IsDate()
  @Transform(({ value }) => new Date(value))
  meetingTime: Date;

  @IsNumber()
  @IsNotEmpty()
  male: number;

  @IsNumber()
  @IsNotEmpty()
  female: number;
}
