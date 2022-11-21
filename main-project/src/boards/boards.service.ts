import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { async } from 'rxjs';
import { UsersRepository } from 'src/users/repository/users.repository';
import { BoardDto } from './dto/board.dto';
import {
  BoardMemberDetail,
  CreateResponse,
  BookmarkDetail,
  BoardReadResponse,
  BoardDetail,
  CreateHostMembers,
} from './interface/boards.interface';
import { BoardRepository } from './repository/board.repository';

@Injectable()
export class BoardsService {
  constructor(
    @InjectRepository(BoardRepository)
    private readonly boardRepository: BoardRepository,
    @InjectRepository(UsersRepository)
    private readonly usersRepository: UsersRepository,
  ) {}

  // 게시글 생성 관련
  private async setBoard(boardInfo: BoardDetail): Promise<number> {
    try {
      const { affectedRows, insertId }: CreateResponse =
        await this.boardRepository.createBoard(boardInfo);

      if (!(affectedRows && insertId)) {
        throw new InternalServerErrorException(`board 생성 오류입니다.`);
      }

      return insertId;
    } catch (error) {
      throw error;
    }
  }

  private async setHostMembers(
    boardNo: number,
    hostMembers: [],
  ): Promise<void> {
    try {
      for (let el in hostMembers) {
        const user = await this.usersRepository.getUserByNickname(
          hostMembers[el],
        );
        if (!user) {
          throw new NotFoundException(`해당 유저가 없습니다.`);
        }

        const hostMember: CreateHostMembers = { boardNo, userNo: user.no };

        const { affectedRows, insertId }: CreateResponse =
          await this.boardRepository.createHostMember(hostMember);

        if (!(affectedRows && insertId)) {
          throw new InternalServerErrorException(
            `host-member 생성 오류입니다.`,
          );
        }
      }
    } catch (error) {
      throw error;
    }
  }

  private async setBoardMember(
    boardMemberDetail: BoardMemberDetail,
  ): Promise<void> {
    try {
      const { affectedRows, insertId }: CreateResponse =
        await this.boardRepository.createBoardMember(boardMemberDetail);

      if (!(affectedRows && insertId)) {
        throw new InternalServerErrorException(`board-member 생성 오류입니다.`);
      }
    } catch (error) {
      throw error;
    }
  }

  async createBoard({ hostMembers, ...boardInfo }: BoardDto): Promise<number> {
    try {
      const boardNo: number = await this.setBoard(boardInfo); // user_no 추가 필요 -> 작성자 / transaction
      await this.setHostMembers(boardNo, hostMembers); // transaction

      const boardMemberDetail: BoardMemberDetail = {
        ...boardInfo,
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
      const { affectedRows, insertId }: CreateResponse =
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

  // async getHostMembers(boardNo: number): Promise<[]> {
  //   try {
  //     await this.getBoardByNo(boardNo);

  //     if (!board) {
  //       throw new NotFoundException(`${boardNo}번 게시글을 찾을 수 없습니다.`);
  //     }

  //     return board;
  //   } catch (error) {
  //     throw error;
  //   }
  // }

  //게시글 수정 관련
  async editBoard(
    boardNo: number,
    { male, female, hostMembers, ...boardDetail }: BoardDto,
  ): Promise<string> {
    try {
      await this.getBoardByNo(boardNo);

      const boardMember: BoardMemberDetail = {
        male,
        female,
      };

      await this.updateBoard(boardNo, boardDetail);
      await this.updateBoardMember(boardNo, boardMember);
      await this.updateHostMember(boardNo, hostMembers);
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

  private async updateHostMember(
    boardNo: number,
    hostMembers: [],
  ): Promise<void> {
    try {
      for (let member in hostMembers) {
        const updateHostMember = await this.boardRepository.updateHostMember(
          boardNo,
          hostMembers[member],
        );

        if (!updateHostMember) {
          throw new NotFoundException(
            `${boardNo}번 게시글 수정 에러 updateBoardMember-service`,
          );
        }
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
