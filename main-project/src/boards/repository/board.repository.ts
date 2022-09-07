import { Logger } from '@nestjs/common';
import { EntityRepository, Repository } from 'typeorm';
import { CreateBoardDto } from '../dto/create-board.dto';
import { UpdateBoardDto } from '../dto/update-board.dto';
import { Board } from '../entity/board.entity';

//db관련 CRUD 작업 하는 파일
@EntityRepository(Board)
export class BoardRepository extends Repository<Board> {
  private logger = new Logger('BoardsRepository');

  /**게시글 생성 */
  async createBoard(createBoardDto: CreateBoardDto): Promise<Board> {
    try {
      const { title, description, isDone, location, time } = createBoardDto;

      const board = this.create({
        title,
        description,
        isDone,
        location,
        time,
      });

      await this.save(board);

      this.logger.debug(`creating new board success :)
    title : ${title}`);

      return board;
    } catch (error) {
      throw error;
    }
  }

  async updateBoard(
    dbData: Board,
    updateBoardDto: UpdateBoardDto,
  ): Promise<object> {
    try {
      const { title, description, isDone, location, time } = updateBoardDto;

      dbData.title = title;
      dbData.description = description;
      dbData.isDone = isDone;
      dbData.location = location;
      dbData.time = time;

      const save = await this.save(dbData);

      this.logger.debug(`updating board success :)`);
      return save;
    } catch (error) {
      throw error;
    }
  }
}
