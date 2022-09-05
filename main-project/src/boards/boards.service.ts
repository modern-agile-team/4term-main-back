import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateBoardDto } from './dto/create-board.dto';
import { Board } from './entity/board.entity';
import { BoardRepository } from './repository/board.repository';

@Injectable()
export class BoardsService {
  constructor(
    @InjectRepository(BoardRepository)
    private boardRepository: BoardRepository,
  ) {}

  async createBoard(createBoardDto: CreateBoardDto): Promise<Board> {
    try {
      return this.boardRepository.createBoard(createBoardDto);
    } catch (error) {
      throw error;
    }
  }

  async getAllBoards(): Promise<Board[]> {
    try {
      return this.boardRepository.find();
    } catch (error) {
      throw error;
    }
  }

  async getBoardByNo(boardNo: number): Promise<Board> {
    try {
      const found = await this.boardRepository.findOne(boardNo);

      if (!found) {
        throw new NotFoundException(`Can't find Board with boardNo ${boardNo}`);
      }

      return found;
    } catch (error) {
      throw error;
    }
  }

  async deleteBoardByNo(boardNo: number): Promise<boolean> {
    try {
      const result = await this.boardRepository.delete(boardNo);

      if (result.affected === 0) {
        throw new NotFoundException(`Can't find Board with boardNo ${boardNo}`);
      }

      return true;
    } catch (error) {
      throw error;
    }
  }
}
