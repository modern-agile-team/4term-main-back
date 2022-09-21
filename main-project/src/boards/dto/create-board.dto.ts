import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';
export class CreateBoardDto {
  @IsNotEmpty()
  @IsNumber()
  userNo: number;

  @IsNotEmpty()
  @IsNumber()
  meetingNo: number;

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  location: string;

  @IsBoolean()
  isDone: boolean;

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
