import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { Boards } from './entity/board.entity';
import { BoardDetail, BoardResponse } from './interface/boards.interface';
import { BoardRepository } from './repository/board.repository';

@Injectable()
export class BoardsService {
  constructor(
    @InjectRepository(BoardRepository)
    private readonly boardRepository: BoardRepository,
  ) {}

  async setBoard(createBoardDto: CreateBoardDto): Promise<number> {
    try {
      const { affectedRows, insertId }: BoardResponse =
        await this.boardRepository.createBoard(createBoardDto);

      if (!(affectedRows && insertId)) {
        throw new InternalServerErrorException(`board 생성 오류입니다.`);
      }

      return insertId;
    } catch (error) {
      throw error;
    }
  }

  async getAllBoards(): Promise<Boards[]> {
    try {
      const found = await this.boardRepository.find();

      return found;
    } catch (error) {
      throw error;
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
      throw error;
    }
  }

  async createBoard(createBoardDto: CreateBoardDto): Promise<number> {
    try {
      // const {
      //   userNo,
      //   meetingNo,
      //   title,
      //   location,
      //   description,
      //   meetingTime,
      // }: CreateBoardDto = createBoardDto;

      // const userConfirm = await this.userReoisitory.findOne(userNo);

      const boardNo: number = await this.setBoard(createBoardDto);

      return boardNo;
    } catch (error) {
      throw error;
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
      throw error;
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
      throw error;
    }
  }
}
