import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersRepository } from 'src/users/repository/users.repository';
import { BoardsController } from './boards.controller';
import { BoardsService } from './boards.service';
import { BoardRepository } from './repository/board.repository';

@Module({
  imports: [TypeOrmModule.forFeature([BoardRepository, UsersRepository])],
  providers: [BoardsService, UsersRepository],
  controllers: [BoardsController],
})
export class BoardsModule {}
