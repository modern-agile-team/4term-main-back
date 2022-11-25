import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BoardRepository } from 'src/boards/repository/board.repository';
import { MannersRepository } from './repository/manners.repository';

@Injectable()
export class MannersService {
  constructor(
    @InjectRepository(MannersRepository)
    private readonly boardRepository: BoardRepository,
  ) {}

  async findBoardByNo(boardNo: number): Promise<any> {
    try {
      const board = await this.boardRepository.getBoardByNo(boardNo);

      if (!board) {
        throw new NotFoundException(
          `boardNo가 ${boardNo}인 약속을 찾지 못했습니다.`,
        );
      }
      return board;
    } catch (error) {
      throw error;
    }
  }
}
