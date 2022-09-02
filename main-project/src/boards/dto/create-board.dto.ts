import { IsDate, IsNotEmpty, IsNumber, IsString } from 'class-validator';
export class CreateBoardDto {
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  description: string;

  @IsNumber()
  done: boolean;

  @IsString()
  location: string;

  @IsDate()
  time: Date;
}
