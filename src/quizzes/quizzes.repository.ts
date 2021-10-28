import {
  BadRequestException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { randomUUID } from 'crypto';
import { Quiz } from './entities/quiz.entity';
import { Question } from './entities/question.entity';
import { Answer } from './entities/answer.entity';
import { readFileSync } from 'fs';

/*
  I have two options here:
  1. Handle all entities and validations right here (quick & dirty)
  2. Handle each one in its right place (separate classes, a lot of
    coding that will be refactored with Chapter 2 anyway)
  Since the assignment speaks only of API calls to quizzes (and not 
    questions or answers on their own), and I know I'll refactor it
    shortly, I'll go the quick & dirty route for now, so as to minimize 
    the amount of changes implied.
  This class will be decorated with @EntityRepository(Quiz)
  and made it extend Repository<Quiz> when refactoring for ORM
  For now I'll just make it @Injectable
*/
@Injectable()
export class QuizzesRepository {
  private quizzes: Quiz[];

  constructor() {
    // Just to provide it with some data, let's load some quiz into the on-memory array
    // This will be refactored too when ORM comes to town
    try {
      const file = readFileSync('quizzes.json', 'utf8');
      this.quizzes = JSON.parse(file) as Quiz[];
    } catch (err) {
      // Just output it in the console.log, it won't hurt the ability of the endpoints to work
      console.log(err);
    }
  }

  // This hurts my eyes, but... for now, let's just place a big bulky
  //  all-in validation function for both create and update methods
  validateInput(providedQuizDto: CreateQuizDto | UpdateQuizDto): Quiz {
    // Make sure there's at least one question in that Dto
    const questions = providedQuizDto.questions;
    if (!questions || questions.length < 1) {
      throw new BadRequestException(
        `The provided Quiz ${providedQuizDto.name} should contain at least one question.`,
      );
    }
    // Now, make sure each question contains exactly 4 valid answers
    // This control will be refactored into its own QuestionsRepository class
    for (let question of questions) {
      let answers = question.answers;
      if (!answers || answers.length !== 4) {
        throw new BadRequestException(
          `The provided Quiz's question “${question.statement}” should contain exactly 4 answers.`,
        );
      }
      // The + in +answer.isCorrect is that nice casting trick from boolean to number (true->1, false ->0)
      //  so, the reduce running sum should be 1 (only one correct answer, i.e. one true value)
      let thereCanBeOnlyOne = answers
        .map((answer) => +answer.isCorrect)
        .reduce((previous, current) => previous + current);
      if (thereCanBeOnlyOne !== 1) {
        throw new BadRequestException(
          `The provided Quiz's question: “${question.statement}” must contain 1 and only 1 true answer.`,
        );
      }
      // My eyes! My eeeyes!! But the ORM refactor will fix this too
      for (let answer of answers) {
        answer.id = randomUUID(); // Let's give each answer an id
      }

      question.id = randomUUID(); // Let's give this question an id too...
      question.answers = answers; // ... and update its answers set, now with ids
    }

    // And now update the quiz's question with their ids, and an id of its own
    const validQuiz = {
      id: randomUUID(),
      ...providedQuizDto,
      questions,
    } as Quiz;

    return validQuiz;
  }

  async create(createQuizDto: CreateQuizDto): Promise<Quiz> {
    let newQuiz = this.validateInput(createQuizDto);
    // Don't forget to add it to the on-memory collection, and return it... as promised
    this.quizzes[newQuiz.id] = newQuiz;
    return Promise.resolve(newQuiz);
  }

  async findAll(): Promise<Quiz[]> {
    return Promise.resolve(this.quizzes as Quiz[]);
  }

  async findOne(id: string): Promise<Quiz> {
    let quiz = this.quizzes[id] as Quiz;

    if (!quiz) {
      throw new NotFoundException(
        `No quiz with id ${id} exists in the collection.`,
      );
    }

    return Promise.resolve(quiz);
  }

  async update(id: string, updateQuizDto: UpdateQuizDto) {
    // By wrapping the this.findOne call in a try catch we can throw a 400 Bad Request
    //  instead of the 404 Not Found triggered by the findOne function itself, or other
    //  messages if it's any validation step that fails instead
    try {
      let oldQuiz = await this.findOne(id);
      // It's a patch, not a put, so we accept a simple { "name": "Example quiz" } as request body.
      // Still, for the validation function to work, we need to pass the entire Quiz, not just its
      //  patched properties and values. If the patch doesn't contain a modified set of questions,
      //  it will keep its previous one.
      // But if it contains a modified set of questions, it shall replace the previous one at face 
      //  value (i.e., if a previous question is missing, we assume the user wants to delete it,
      //  not leave it as it was before the patch request, and the same goes for their answers). 
      let updatedQuiz = this.validateInput({
        ...oldQuiz,
        ...updateQuizDto
      } as UpdateQuizDto);
      // Update the in-memory collection
      this.quizzes[updatedQuiz.id] = updatedQuiz;
      return Promise.resolve(updatedQuiz);
    } catch (err) {
      let msg:string;
      switch(err.response.statusCode) {
        case HttpStatus.NOT_FOUND:
          msg = `Quiz id ${id} doesn't match any existing record. Please verify the provided update data.`;
          break;
        default:
          msg = err.response.message;
      }
      throw new BadRequestException(msg);
    }
  }

  async remove(id: string) {
    // By wrapping the this.findOne call in a try catch we can throw the proper 400 Bad Request
    //  instead of the 404 Not Found triggered by the findOne function itself
    try {
      let oldQuiz = await this.findOne(id);
      // Remove quiz from the in-memory collection
      delete this.quizzes[oldQuiz.id];
      return;
    } catch (err) {
      throw new BadRequestException(
        `Can't delete a record which doesn't exist. Please verify and fix the id ${id}.`,
      );
    }
  }
}
