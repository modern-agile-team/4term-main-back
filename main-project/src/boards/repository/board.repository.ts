import { InternalServerErrorException } from '@nestjs/common';
import { Users } from 'src/users/entity/user.entity';
import { UsersRepository } from 'src/users/repository/users.repository';
import {
  DeleteResult,
  EntityRepository,
  In,
  InsertResult,
  Repository,
  UpdateResult,
} from 'typeorm';
import { BoardFilterDto } from '../dto/board-filter.dto';
import { BoardDto } from '../dto/board.dto';
import { Boards } from '../entity/board.entity';
import { Board } from '../interface/boards.interface';

@EntityRepository(Boards)
export class BoardRepository extends Repository<Boards> {
  // 게시글 조회 관련
  async checkDeadline(): Promise<{ no: string }> {
    try {
      const thunders = await this.createQueryBuilder('boards')
        .select(['JSON_ARRAYAGG(no) AS no'])
        .where('isDone = :isDone', { isDone: false })
        .andWhere('isThunder = :isThunder', { isThunder: true })
        .andWhere('TIMESTAMPDIFF(hour, boards.createdDate, NOW()) >= 24')
        .getRawOne();

      return thunders;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} checkDeadline-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async getBoardByNo(boardNo: number): Promise<Board> {
    try {
      const board = await this.createQueryBuilder('boards')
        .leftJoin('boards.userNo', 'users')
        .leftJoin('users.userProfileNo', 'profile')
        .leftJoin('boards.hosts', 'hosts')
        .leftJoin('hosts.userNo', 'hostUsers')
        .leftJoin('hostUsers.userProfileNo', 'hostProfile')
        .select([
          'boards.no AS no',
          'boards.userNo AS userNo',
          'profile.nickname AS nickname',
          'boards.title AS title',
          'boards.description AS description',
          'boards.location AS location',
          'boards.meetingTime AS meetingTime',
          'boards.isDone AS isDone',
          'boards.male AS male',
          'boards.female AS female',
          'boards.isThunder AS isThunder',
          'GROUP_CONCAT(hosts.userNo) AS hostUserNums',
          'GROUP_CONCAT(hostProfile.nickname) AS hostNicknames',
        ])
        .where('boards.no = :boardNo', { boardNo })
        .where('hosts.boardNo = :boardNo', { boardNo })
        .getRawOne();

      return board;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} getBoardByNo-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async getBoards(filters?: BoardFilterDto): Promise<Board[]> {
    try {
      const boards = await this.createQueryBuilder('boards')
        .leftJoin('boards.userNo', 'users')
        .select([
          'boards.no AS no',
          'boards.userNo AS user_no',
          'boards.title AS title',
          'boards.description AS description',
          'boards.location AS location',
          'boards.meetingTime AS meeting_time',
          'boards.isDone AS isDone',
          'boards.isThunder AS isThunder',
          'boards.male AS male',
          'boards.female AS female',
        ])
        .orderBy('boards.no', 'DESC');

      if (filters) {
        for (let el in filters) {
          switch (el) {
            case 'gender':
              boards.andWhere(`boards.${filters[el]} = :${filters[el]}`, {
                [filters[el]]: 0,
              });

              break;

            case 'people':
              boards.andWhere('boards.male + boards.female = :people', {
                people: filters[el],
              });

              break;

            case 'isDone':
              boards.andWhere(`boards.${el} = :${el}`, { [el]: filters[el] });

              break;

            case 'isThunder':
              boards.andWhere(`boards.${el} = :${el}`, { [el]: filters[el] });

              break;

            default:
              break;
          }
        }
      }

      return boards.getRawMany();
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} getAllBoards-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  //게시글 생성 관련
  async createBoard(
    userNo: number,
    newBoard: Partial<BoardDto>,
  ): Promise<number> {
    try {
      const { raw }: InsertResult = await this.createQueryBuilder('boards')
        .insert()
        .into(Boards)
        .values({ userNo, ...newBoard })
        .execute();

      return raw.insertId;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} createBoard-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  //게시글 수정 관련
  async updateBoard(
    boardNo: number,
    newBoard: Partial<BoardDto>,
  ): Promise<number> {
    try {
      const { affected }: UpdateResult = await this.createQueryBuilder('boards')
        .update(Boards)
        .set(newBoard)
        .where('no = :boardNo', { boardNo })
        .execute();

      return affected;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} updateBoard-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async closeBoard(no: number[]): Promise<UpdateResult> {
    try {
      const deadline = await this.createQueryBuilder('boards')
        .update(Boards)
        .set({ isDone: true })
        .where('no IN (:no)', { no });

      return deadline.execute();
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} updateBoard-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  // 게시글 삭제 관련
  async deleteBoard(boardNo: number): Promise<number> {
    try {
      const { affected }: DeleteResult = await this.createQueryBuilder('boards')
        .delete()
        .from(Boards)
        .where('no = :boardNo', { boardNo })
        .execute();

      return affected;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} deleteBoard-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async getUserListByBoardNo(boardNo: number) {
    try {
      const userList = await this.createQueryBuilder('boards')
        .leftJoin('boards.hosts', 'hostList')
        .leftJoin('boards.teamNo', 'guestParticipation')
        .leftJoin('guestParticipation.boardGuest', 'guestList')
        .leftJoin('hostList.userNo', 'hostUser')
        .leftJoin('guestList.userNo', 'guestUser')
        .leftJoin('hostUser.userProfileNo', 'hostProfile')
        .leftJoin('guestUser.userProfileNo', 'guestProfile')
        .select([
          'GROUP_CONCAT(DISTINCT hostProfile.nickname) AS hostNickname',
          'GROUP_CONCAT(DISTINCT guestProfile.nickname) AS guestNickname',
          'GROUP_CONCAT(DISTINCT hostList.user_no) AS hostUserNo',
          'GROUP_CONCAT(DISTINCT guestList.user_no) AS guestUserNo',
        ])
        .where('boards.no = :boardNo', { boardNo })
        .getRawOne();

      return userList;
    } catch (error) {}
  }
}
