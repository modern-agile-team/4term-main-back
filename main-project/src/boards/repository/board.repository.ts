import { InternalServerErrorException } from '@nestjs/common';
import { Meetings } from 'src/meetings/entity/meeting.entity';
import { Users } from 'src/users/entity/user.entity';
import { EntityRepository, InsertResult, Repository } from 'typeorm';
import { CreateBoardDto } from '../dto/create-board.dto';
import { UpdateBoardDto } from '../dto/update-board.dto';
import { Boards } from '../entity/board.entity';
import { BoardDetail, BoardResponse } from '../interface/boards.interface';

@EntityRepository(Boards)
export class BoardRepository extends Repository<Boards> {
  // async getBoardByNo(boardNo: number): Promise<Boards> {
  //   try {
  //     const board = await this.createQueryBuilder('boards').
  //     ;

  //     return board;
  //   } catch (error) {
  //     throw new InternalServerErrorException(
  //       `${error} getBoardByNo-repository: 알 수 없는 서버 에러입니다.`,
  //     );
  //   }
  // }

  async createBoard(
    user: Users,
    meeting: Meetings,
    createBoardDto: CreateBoardDto,
  ): Promise<BoardResponse> {
    try {
      const { title, location, description, meetingTime }: CreateBoardDto =
        createBoardDto;

      const { raw }: InsertResult = await this.createQueryBuilder('boards')
        .insert()
        .into(Boards)
        .values([
          {
            title,
            location,
            description,
            meetingTime,
          },
        ])
        .execute();

      return raw;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} createBoard-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async updateBoard(
    dbData: Boards,
    updateBoardDto: UpdateBoardDto,
  ): Promise<object> {
    try {
      const { title, description, isDone, location, meetingTime } =
        updateBoardDto;

      dbData.title = title;
      dbData.description = description;
      dbData.isDone = isDone;
      dbData.location = location;
      dbData.meetingTime = meetingTime;

      const save = await this.save(dbData);

      return save;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} updateBoard-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }
}
