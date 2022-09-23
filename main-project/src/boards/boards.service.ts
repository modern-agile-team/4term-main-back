import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateBoardDto } from './dto/create-board.dto';
import { CreateBookmarkDto } from './dto/create-bookmark.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { Boards } from './entity/board.entity';
import {
  BoardMemberDetail,
  BoardCreateResponse,
  BookmarkDetail,
  BoardReadResponse,
} from './interface/boards.interface';
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
      const { affectedRows, insertId }: BoardCreateResponse =
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
      const { affectedRows, insertId }: BoardCreateResponse =
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

  async createBookmark(
    boardNo: number,
    createBookmarkDto: CreateBookmarkDto,
  ): Promise<number> {
    try {
      const bookmarkDetail: BookmarkDetail = {
        ...createBookmarkDto,
        boardNo,
      };
      const { affectedRows, insertId }: BoardCreateResponse =
        await this.boardRepository.createBookmark(bookmarkDetail);

      if (!(affectedRows && insertId)) {
        throw new InternalServerErrorException(`bookmark 생성 오류입니다.`);
      }

      return insertId;
    } catch (error) {
      throw error;
    }
  }

  // 게시글 조회 관련
  async getAllBoards(): Promise<BoardReadResponse[]> {
    try {
      const boards: BoardReadResponse[] =
        await this.boardRepository.getAllBoards();

      if (!boards) {
        throw new NotFoundException(`전체 게시글의 조회를 실패 했습니다.`);
      }

      return boards;
    } catch (error) {
      throw error;
    }
  }

  async getBoardByNo(boardNo: number): Promise<BoardReadResponse> {
    try {
      const board: BoardReadResponse = await this.boardRepository.getBoardByNo(
        boardNo,
      );

      if (!board) {
        throw new NotFoundException(`${boardNo}번 게시글을 찾을 수 없습니다.`);
      }

      return board;
    } catch (error) {
      throw error;
    }
  }

  //게시글 수정 관련
  async updateBoard(
    boardNo: number,
    updateBoardDto: UpdateBoardDto,
  ): Promise<void> {
    try {
      const board: BoardReadResponse = await this.getBoardByNo(boardNo);

      if (!board) {
        throw new NotFoundException(`${boardNo}번 게시글을 찾을 수 없습니다.`);
      }
      const boardMember = {
        male: updateBoardDto.male,
        female: updateBoardDto.female,
      };

      delete updateBoardDto.male;
      delete updateBoardDto.female;

      await this.boardRepository.updateBoard(boardNo, updateBoardDto);
      await this.boardRepository.updateBoardMember(boardNo, boardMember);
    } catch (error) {
      throw error;
    }
  }

  //게시글 삭제 관련
  async deleteBoardByNo(boardNo: number): Promise<string> {
    try {
      const board: BoardReadResponse = await this.getBoardByNo(boardNo);

      if (!board) {
        throw new NotFoundException(`${boardNo}번 게시글을 찾을 수 없습니다.`);
      }

      await this.boardRepository.deleteBoardMember(boardNo);
      await this.boardRepository.deleteBoard(boardNo);

      return `${boardNo}번 게시글 삭제 성공 :)`;
    } catch (error) {
      throw error;
    }
  }
}
