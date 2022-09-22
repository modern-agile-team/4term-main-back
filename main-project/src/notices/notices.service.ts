import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NoticesRepository } from './repository/notices.repository';

@Injectable()
export class NoticesService {
  constructor(
    @InjectRepository(NoticesRepository)
    private readonly noticeRepository: NoticesRepository,
  ) {}
}
