import {
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';

export class UpdateBoardDto {
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
  meetingTime: Date;

  @IsNotEmpty()
  @IsNumber()
  male: number;

  @IsNotEmpty()
  @IsNumber()
  female: number;
}
