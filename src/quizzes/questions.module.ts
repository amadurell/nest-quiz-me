import { Module } from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { QuestionsController } from './questions.controller';
import { AnswersModule } from './answers.module';

@Module({
  controllers: [QuestionsController],
  providers: [QuestionsService],
  imports: [AnswersModule]
})
export class QuestionsModule {}
