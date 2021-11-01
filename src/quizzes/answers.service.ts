import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AnswersRepository } from './answers.repository';
import { CreateAnswerDto } from './dto/create-answer.dto';
import { UpdateAnswerDto } from './dto/update-answer.dto';
import { Answer } from './entities/answer.entity';

@Injectable()
export class AnswersService {
  constructor(
    @InjectRepository(Answer)
    private readonly answersRepository: AnswersRepository
  ) {}

  async create(createAnswerDto: CreateAnswerDto) {
    const answer = this.answersRepository.create(createAnswerDto);
    return this.answersRepository.save(answer);
  }

  async findAll() {
    return this.answersRepository.find();
  }

  async findOne(id: string) {
    const answer = await this.answersRepository.findOne(id);
    if (!answer) {
      throw new NotFoundException(`No answer with id “${id}” exists in the collection.`);
    }
    return answer;
  }

  async update(id: string, updateAnswerDto: UpdateAnswerDto) {
    const answer = await this.answersRepository.preload({
      id,
      ...updateAnswerDto
    });

    if (!answer) {
      throw new NotFoundException(`No answer with id “${id}” exists in the collection.`);
    }
    return this.answersRepository.save(answer);
  }

  async remove(id: string) {
    const answer = await this.findOne(id);
    return this.answersRepository.remove(answer);
  }
}
