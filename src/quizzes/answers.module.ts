import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnswersController } from './answers.controller';
import { AnswersRepository } from './answers.repository';
import { AnswersService } from './answers.service';
import { Answer } from './entities/answer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Answer])],
  controllers: [AnswersController],
  providers: [AnswersService, AnswersRepository]
})
export class AnswersModule {}
