import { Controller } from '@nestjs/common';
import { MannersService } from './manners.service';

@Controller('manners')
export class MannersController {
  constructor(private mannersService: MannersService) {}
}
