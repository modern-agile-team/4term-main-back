import { Controller, Get } from '@nestjs/common';
import { get } from 'http';
import { MannersService } from './manners.service';

@Controller('manners')
export class MannersController {
  constructor(private mannerService: MannersService) {}

  // @Get()
}
