import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { Boards } from './entity/board.entity';
import { BoardMemberDetail, BoardResponse } from './interface/boards.interface';
import { BoardRepository } from './repository/board.repository';

@Injectable()
export class BoardsService {
  constructor(
    @InjectRepository(BoardRepository)
    private readonly boardRepository: BoardRepository,
  ) {}

  // 게시글 생성 관련
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

  async setBoardMember(boardMemberDetail: BoardMemberDetail): Promise<void> {
    try {
      const { affectedRows, insertId }: BoardResponse =
        await this.boardRepository.createBoardMember(boardMemberDetail);

      if (!(affectedRows && insertId)) {
        throw new InternalServerErrorException(`board-member 생성 오류입니다.`);
      }
    } catch (error) {
      throw error;
    }
  }

  async createBoard(createBoardDto: CreateBoardDto): Promise<number> {
    try {
      const boardNo: number = await this.setBoard(createBoardDto);

      const { male, female }: CreateBoardDto = createBoardDto;
      const boardMemberDetail: BoardMemberDetail = {
        boardNo,
        male,
        female,
      };

      await this.setBoardMember(boardMemberDetail);

      return boardNo;
    } catch (error) {
      throw error;
    }
  }

  // 게시글 조회 관련
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

  //게시글 수정 관련
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

  //게시글 삭제 관련
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
