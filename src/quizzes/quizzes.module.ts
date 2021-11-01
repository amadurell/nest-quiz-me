import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuizzesController } from './quizzes.controller';
import { QuizzesRepository } from './quizzes.repository';
import { QuizzesService } from './quizzes.service';
import { Answer } from './entities/answer.entity';
import { Question } from './entities/question.entity';
import { Quiz } from './entities/quiz.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Quiz, Question, Answer])],
  controllers: [QuizzesController],
  providers: [QuizzesService, QuizzesRepository],
})
export class QuizzesModule {}
