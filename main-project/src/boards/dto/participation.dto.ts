import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Length } from 'class-validator';

export class ParticipationDto {
  @ApiProperty({
    example: [3, 2, 98],
    description: 'guest_members_userNo',
  })
  @IsNumber({}, { each: true })
  @IsNotEmpty()
  guests: number[];

  @ApiProperty({
    example: '크리스마스는 혼자 였지만 이번엔 아닐거야ㅋㅋ',
    description: '여름 신청 제목',
  })
  @IsString()
  @Length(0, 255)
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: '화끈한 사람들 다수 대기 중',
    description: '여름 신청 내용',
  })
  @Length(0, 255)
  @IsString()
  @IsNotEmpty()
  description: string;
}
