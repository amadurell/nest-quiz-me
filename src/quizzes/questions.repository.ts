import { UpdateQuestionDto } from './dto/update-question.dto';
import { CreateQuestionDto } from './dto/create-question.dto';
import { readFile, writeFile } from 'fs/promises';
import { randomUUID } from 'crypto';
import { Question } from './entities/question.entity';
import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

/*
  This class will be decorated with @EntityRepository(Question)
  and made it extend Repository<Question> when refactoring for ORM
  For now I'll just make it @Injectable
  All operations shall cascade through ORM as well, but we'll add
  all this code manually.
*/
@Injectable()
export class QuestionsRepository {
  async create(createQuestionDto: CreateQuestionDto): Promise<Question> {
      /* 
        I'm planning on using uuid when introducing ORM
        so I'll start generating the id manually here. This
        message shall be erased with that refactor anyways
      */
      const id = randomUUID();

      let question = {
        id,
        ...createQuestionDto,
      };

      return Promise.resolve(question as Question);
  }

  async findAll(): Promise<Question[]> {
    try {
      const file = await readFile('questions.json', 'utf8');
      const questions = JSON.parse(file);

      return Promise.resolve(questions as Question[]);
    } catch (err) {
      throw new NotFoundException(err.errno);
    }
  }

  async findOne(id: string): Promise<Question> {
    let question: Question;
    try {
      const file = await readFile('questions.json', 'utf8');
      const questions = JSON.parse(file);
      question = questions[id] as Question;
    } catch (err) {
      throw new NotFoundException(err.errno);
    }

    if (!question) {
      throw new NotFoundException(
        `No question with id ${id} exists in the collection.`,
      );
    }

    return Promise.resolve(question);
  }

  async update(id: string, updateQuestionDto: UpdateQuestionDto) {
    return `This action updates a #${id} question`;
  }

  async remove(id: string) {
    return `This action removes a #${id} question`;
  }
}
