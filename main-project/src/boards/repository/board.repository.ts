import { InternalServerErrorException, Logger } from '@nestjs/common';
import { EntityRepository, Repository } from 'typeorm';
import { CreateBoardDto } from '../dto/create-board.dto';
import { UpdateBoardDto } from '../dto/update-board.dto';
import { Boards } from '../entity/board.entity';

//db관련 CRUD 작업 하는 파일
@EntityRepository(Boards)
export class BoardRepository extends Repository<Boards> {
  private logger = new Logger('BoardsRepository');

  /**게시글 생성 */
  async createBoard(createBoardDto: CreateBoardDto): Promise<Boards> {
    try {
      const { title, description, isDone, location, meetingTime } =
        createBoardDto;

      const board = this.create({
        title,
        description,
        isDone,
        location,
        meetingTime,
      });

      await this.save(board);

      this.logger.debug(`creating new board success :)
    title : ${title}`);

      return board;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} createBoard: 알 수 없는 서버 에러입니다.`,
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

      this.logger.debug(`updating board success :)`);
      return save;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} updateBoard: 알 수 없는 서버 에러입니다.`,
      );
    }
  }
}
