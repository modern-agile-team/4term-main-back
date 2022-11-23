import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class UpdateMannerTemperatureDto {
  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    example: '4.5',
    description: '후기에서 받은 매너온도 평가',
  })
  mannerTemperature: number;
}
