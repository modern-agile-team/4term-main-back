import { OmitType } from '@nestjs/swagger';
import { CreateReportDto } from './create-reports.dto';

export class UpdateReportDto extends OmitType(CreateReportDto, [
  'reportingUserNo',
]) {}
