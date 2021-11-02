import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AnswersRepository } from './answers.repository';
import { QuestionsRepository } from './questions.repository';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { Answer } from './entities/answer.entity';
import { Question } from './entities/question.entity';

@Injectable()
export class QuestionsService {
  constructor(
    @InjectRepository(Question)
    private readonly questionsRepository: QuestionsRepository,
    @InjectRepository(Answer)
    private readonly answersRepository: AnswersRepository,
  ) {}

  async create(createQuestionDto: CreateQuestionDto) {
    const question = this.questionsRepository.create(createQuestionDto);
    return this.questionsRepository.save(question);
  }

  async findAll() {
    return this.questionsRepository.find({
      relations: ['answers'],
    });
  }

  async findOne(id: string) {
    const question = await this.questionsRepository.findOne(id);
    if (!question) {
      throw new NotFoundException(
        `No question with id “${id}” exists in the collection.`,
      );
    }
    return question;
  }

  async update(id: string, updateQuestionDto: UpdateQuestionDto) {
    // // Let's make sure id matches the one within the update object
    // if (!!updateQuestionDto['id'] && id !== updateQuestionDto['id']) {
    //   throw new BadRequestException(
    //     `Quiz id “${id}” doesn't match the update object's id “${updateQuestionDto['id']}”.`,
    //   );
    // }
    // Let's fetch the old value first
    const question = await this.questionsRepository.preload({
      id,
      ...updateQuestionDto,
    });

    if (!question) {
      throw new NotFoundException(
        `No question with id “${id}” exists in the collection.`,
      );
    }

    return this.questionsRepository.save(question);
  }

  async remove(id: string) {
    const question = await this.findOne(id);
    return this.questionsRepository.remove(question);
  }
}
