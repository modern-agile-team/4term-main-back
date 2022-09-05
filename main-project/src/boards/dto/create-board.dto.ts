import { IsBoolean, IsDate, IsNotEmpty, IsString } from 'class-validator';
export class CreateBoardDto {
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
}
