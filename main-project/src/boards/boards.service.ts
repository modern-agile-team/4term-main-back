import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { Boards } from './entity/board.entity';
import { BoardRepository } from './repository/board.repository';

@Injectable()
export class BoardsService {
  constructor(
    @InjectRepository(BoardRepository)
    private boardRepository: BoardRepository,
  ) {}

  async getAllBoards(): Promise<Boards[]> {
    try {
      const found = await this.boardRepository.find();

      return found;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} getAllBoards-service: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async getBoardByNo(boardNo: number): Promise<Boards> {
    try {
      const found = await this.boardRepository.findOne(boardNo);

      if (!found) {
        throw new NotFoundException(
          `Can't find Boards with boardNo ${boardNo}`,
        );
      }

      return found;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} getBoardByNo-service: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async createBoard(createBoardDto: CreateBoardDto): Promise<Boards> {
    try {
      const board = await this.boardRepository.createBoard(createBoardDto);

      return board;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} createBoard-service: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async updateBoard(
    boardNo: number,
    updateBoardDto: UpdateBoardDto,
  ): Promise<object> {
    try {
      const dbData = await this.getBoardByNo(boardNo);
      const reqData = await this.boardRepository.updateBoard(
        dbData,
        updateBoardDto,
      );

      return reqData;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} updateBoard-service: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async deleteBoardByNo(boardNo: number): Promise<boolean> {
    try {
      const result = await this.boardRepository.delete(boardNo);

      if (result.affected === 0) {
        throw new NotFoundException(
          `Can't find Boards with boardNo ${boardNo}`,
        );
      }

      return true;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} deleteBoardByNo-service: 알 수 없는 서버 에러입니다.`,
      );
    }
  }
}
