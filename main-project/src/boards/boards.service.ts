import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateBoardDto } from './dto/create-board.dto';
import { Board } from './entity/board.entity';
import { BoardRepository } from './repository/board.repository';

@Injectable()
export class BoardsService {
  private logger = new Logger('BoardsController');

  constructor(
    @InjectRepository(BoardRepository)
    private boardRepository: BoardRepository,
  ) {}

  async createBoard(createBoardDto: CreateBoardDto): Promise<Board> {
    return this.boardRepository.createBoard(createBoardDto);
  }

  async getAllBoards(): Promise<Board[]> {
    return this.boardRepository.find();
  }

  async getBoardByNo(boardNo: number): Promise<Board> {
    const found = await this.boardRepository.findOne(boardNo);

    if (!found) {
      new NotFoundException(`Can't find Board with boardNo ${boardNo}`);
    }
    return found;
  }

  async deleteBoardByNo(boardNo: number): Promise<boolean> {
    const result = await this.boardRepository.delete(boardNo);

    if (result.affected === 0) {
      throw new NotFoundException(`Can't find Board with boardNo ${boardNo}`);
    }

    this.logger.debug(`Delete success :)`);
    return true;
  }
}
