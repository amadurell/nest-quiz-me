import { Test, TestingModule } from '@nestjs/testing';
import { QuizzesController } from './quizzes.controller';
import { QuizzesRepository } from './quizzes.repository';
import { QuizzesService } from './quizzes.service';

describe('QuizzesController', () => {
  let controller: QuizzesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuizzesController],
      providers: [QuizzesService, QuizzesRepository],
    }).compile();

    controller = module.get<QuizzesController>(QuizzesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
