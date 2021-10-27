import { Module } from '@nestjs/common';
import { QuizzesService } from './quizzes.service';
import { QuizzesController } from './quizzes.controller';
import { QuestionsModule } from './questions.module';

@Module({
  controllers: [QuizzesController],
  providers: [QuizzesService],
  imports: [QuestionsModule]
})
export class QuizzesModule {}
