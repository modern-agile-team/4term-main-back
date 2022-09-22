import { IsNotEmpty, IsNumber } from 'class-validator';
export class CreateBookmarkDto {
  @IsNotEmpty()
  @IsNumber()
  userNo: number;
}
