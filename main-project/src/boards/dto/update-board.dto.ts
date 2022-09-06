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
  done: boolean;

  @IsString()
  location: string;

  @IsDate()
  time: Date;

  @IsNotEmpty()
  @IsNumber()
  male: number;

  @IsNotEmpty()
  @IsNumber()
  female: number;
}
