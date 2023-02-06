import { Injectable } from '@nestjs/common';
import { MannersRepository } from './repository/manners.repository';

@Injectable()
export class MannersService {
  constructor(private readonly mannersRepository: MannersRepository) {}
}
