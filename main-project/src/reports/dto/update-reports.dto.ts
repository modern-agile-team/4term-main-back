import { OmitType } from '@nestjs/swagger';
import { CreateReportBoardDto } from './create-reports.dto';

export class UpdateReportBoardDto extends OmitType(CreateReportBoardDto, []) {}
