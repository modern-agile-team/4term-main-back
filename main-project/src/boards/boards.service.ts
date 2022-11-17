import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import {
  BoardMemberDetail,
  BoardCreateResponse,
  BookmarkDetail,
  BoardReadResponse,
  BoardDetail,
} from './interface/boards.interface';
import { BoardRepository } from './repository/board.repository';

@Injectable()
export class BoardsService {
  constructor(
    @InjectRepository(BoardRepository)
    private readonly boardRepository: BoardRepository,
  ) {}

  // 게시글 생성 관련
  private async setBoard(createBoardDto: CreateBoardDto): Promise<number> {
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

  private async setBoardMember(
    boardMemberDetail: BoardMemberDetail,
  ): Promise<void> {
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
      const boardNo: number = await this.setBoard(createBoardDto); // user_no 추가 필요 -> 작성자

      const boardMemberDetail: BoardMemberDetail = {
        ...createBoardDto,
        boardNo,
      };

      await this.setBoardMember(boardMemberDetail);

      return boardNo;
    } catch (error) {
      throw error;
    }
  }

  async createBookmark(bookmarkDetail: BookmarkDetail): Promise<number> {
    try {
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
  async editBoard(
    boardNo: number,
    { male, female, ...boardDetail }: UpdateBoardDto,
  ): Promise<string> {
    try {
      await this.getBoardByNo(boardNo);

      const boardMember: BoardMemberDetail = {
        male,
        female,
      };

      await this.updateBoard(boardNo, boardDetail);
      await this.updateBoardMember(boardNo, boardMember);

      return `${boardNo}번 게시글이 수정되었습니다.`;
    } catch (error) {
      throw error;
    }
  }

  private async updateBoard(
    boardNo: number,
    boardDetail: BoardDetail,
  ): Promise<void> {
    try {
      const updateBoard = await this.boardRepository.updateBoard(
        boardNo,
        boardDetail,
      );

      if (!updateBoard) {
        throw new NotFoundException(
          `${boardNo}번 게시글 수정 에러 updateBoard-service`,
        );
      }
    } catch (error) {
      throw error;
    }
  }

  private async updateBoardMember(
    boardNo: number,
    boardMember: BoardMemberDetail,
  ): Promise<void> {
    try {
      const updateBoardMember = await this.boardRepository.updateBoardMember(
        boardNo,
        boardMember,
      );

      if (!updateBoardMember) {
        throw new NotFoundException(
          `${boardNo}번 게시글 수정 에러 updateBoardMember-service`,
        );
      }
    } catch (error) {
      throw error;
    }
  }

  //게시글 삭제 관련
  async deleteBoardByNo(boardNo: number): Promise<string> {
    try {
      await this.getBoardByNo(boardNo);

      const board: number = await this.boardRepository.deleteBoard(boardNo);

      if (!board) {
        throw new NotFoundException(
          `${boardNo}번 게시글 삭제 에러 deleteBoardByNo-service`,
        );
      }
      return `${boardNo}번 게시글 삭제 성공`;
    } catch (error) {
      throw error;
    }
  }

  async cancelBookmark(boardNo: number, userNo: number): Promise<string> {
    try {
      await this.getBoardByNo(boardNo);
      await this.boardRepository.cancelBookmark(boardNo, userNo);

      return `${boardNo}번 게시글 ${userNo}번 user 북마크 삭제 성공 :)`;
    } catch (error) {
      throw error;
    }
  }
}
