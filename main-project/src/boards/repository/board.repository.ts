import { Logger } from '@nestjs/common';
import { EntityRepository, Repository } from 'typeorm';
import { CreateBoardDto } from '../dto/create-board.dto';
import { Board } from '../entity/board.entity';

//db관련 CRUD 작업 하는 파일
@EntityRepository(Board)
export class BoardRepository extends Repository<Board> {
  private logger = new Logger('BoardsRepository');

  /**게시글 생성 */
  async createBoard(createBoardDto: CreateBoardDto): Promise<Board> {
    const { title, description, done, location, time } = createBoardDto;

    const board = this.create({
      // 이미 repository에 들어왔으니 this는 class를 호출하는 것
      title,
      description,
      done,
      location,
      time,
    });

    await this.save(board);

    this.logger.debug(`creating new board success :)
    title : ${title}`);

    return board;
  }
}
