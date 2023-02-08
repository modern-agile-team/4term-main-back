import { OmitType } from '@nestjs/swagger';
import { CreateReportBoardDto } from './create-report-board.dto';

export class UpdateReportBoardDto extends OmitType(CreateReportBoardDto, []) {}
