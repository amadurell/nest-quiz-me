import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuestionsController } from './questions.controller';
import { QuestionsRepository } from './questions.repository';
import { QuestionsService } from './questions.service';
import { Answer } from './entities/answer.entity';
import { Question } from './entities/question.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Question, Answer])],
  controllers: [QuestionsController],
  providers: [QuestionsService, QuestionsRepository],
})
export class QuestionsModule {}
