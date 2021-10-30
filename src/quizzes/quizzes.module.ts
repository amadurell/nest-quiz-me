import { QuestionsRepository } from './questions.repository';
import { QuizzesRepository } from './quizzes.repository';
import { Module } from '@nestjs/common';
import { QuizzesService } from './quizzes.service';
import { QuizzesController } from './quizzes.controller';
import { QuestionsModule } from './questions.module';

@Module({
  controllers: [QuizzesController],
  providers: [QuizzesService, QuizzesRepository, QuestionsRepository],
  imports: [QuestionsModule]
})
export class QuizzesModule {}
