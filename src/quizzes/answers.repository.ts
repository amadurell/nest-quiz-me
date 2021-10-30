import { UpdateAnswerDto } from './dto/update-answer.dto';
import { CreateAnswerDto } from './dto/create-answer.dto';
import { readFile, writeFile } from 'fs/promises';
import { randomUUID } from 'crypto';
import { Answer } from './entities/answer.entity';
import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

/*
  This class will be decorated with @EntityRepository(Answer)
  and made it extend Repository<Answer> when refactoring for ORM
  For now I'll just make it @Injectable
  All operations shall cascade through ORM as well, but we'll add
  all this code manually.
*/
@Injectable()
export class AnswersRepository {
  async create(createAnswerDto: CreateAnswerDto): Promise<Answer> {
      /* 
        Might be a bit excessive here, but I'm planning on 
        using uuid when introducing ORM, so I'll start generating 
        the id manually here. This message shall be erased with 
        that refactor anyways
      */
      const id = randomUUID();

      let answer = {
        id,
        ...createAnswerDto,
      };

      return Promise.resolve(answer as Answer);
  }

  async findAll(): Promise<Answer[]> {
    
    try {
      const file = await readFile('Answers.json', 'utf8');
      const Answers = JSON.parse(file);

      return Promise.resolve(Answers as Answer[]);
    } catch (err) {
      throw new NotFoundException(err.errno);
    }
  }

  async findOne(id: string): Promise<Answer> {
    let Answer: Answer;
    try {
      const file = await readFile('Answers.json', 'utf8');
      const Answers = JSON.parse(file);
      Answer = Answers[id] as Answer;
    } catch (err) {
      throw new NotFoundException(err.errno);
    }

    if (!Answer) {
      throw new NotFoundException(
        `No Answer with id ${id} exists in the collection.`,
      );
    }

    return Promise.resolve(Answer);
  }

  async update(id: string, updateAnswerDto: UpdateAnswerDto) {
    return `This action updates a #${id} Answer`;
  }

  async remove(id: string) {
    return `This action removes a #${id} Answer`;
  }
}
