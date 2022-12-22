import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
} from 'class-validator';

export class ApplicationDto {
  @ApiProperty({
    example: [3, 2, 98],
    description: 'guest_members_userNo',
  })
  @IsNumber({}, { each: true })
  @IsNotEmpty()
  guests: number[];
}
