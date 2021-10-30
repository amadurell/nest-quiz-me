import { QuizzesRepository } from './quizzes.repository';
import { Injectable } from '@nestjs/common';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { Quiz } from './entities/quiz.entity';

@Injectable()
export class QuizzesService {
  constructor(
    private quizzesRepository: QuizzesRepository,
  ) {}

  async create(createQuizDto: CreateQuizDto): Promise<Quiz> {
    return this.quizzesRepository.create(createQuizDto);
  }

  async findAll(): Promise<Quiz[]> {
    return this.quizzesRepository.findAll();
  }

  async findOne(id: string): Promise<Quiz> {
    return this.quizzesRepository.findOne(id);
  }

  async update(id: string, updateQuizDto: UpdateQuizDto): Promise<Quiz> {
    return this.quizzesRepository.update(id, updateQuizDto);
  }

  async remove(id: string) {
    return this.quizzesRepository.remove(id);
  }
}
