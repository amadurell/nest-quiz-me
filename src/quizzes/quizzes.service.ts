import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QuestionsRepository } from './questions.repository';
import { QuizzesRepository } from './quizzes.repository';
import { CreateQuestionDto } from './dto/create-question.dto';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { Question } from './entities/question.entity';
import { Quiz } from './entities/quiz.entity';
import {
  isArray,
  isDefined,
  isNotEmpty,
  isString,
  validate,
} from 'class-validator';

@Injectable()
export class QuizzesService {
  constructor(
    @InjectRepository(Quiz)
    private readonly quizzesRepository: QuizzesRepository,
    @InjectRepository(Question)
    private readonly questionsRepository: QuestionsRepository,
  ) {}

  /*
    Applying a @ValidateNested() decorator to the questions property 
      in the CreateQuizDto didn't work as expected. Instead of preventing
      requests where questions didn't adhere to its expected structure,
      it prevented valid requests as well, with messages such as:
        "questions.0.property statement should not exist",
        "questions.0.property answers should not exist"
    For sake of timing, let's validate the request manually with this
      private method called within the create and update methods, but this
      part should be refactored to a custom validator.
    And let's throw a BadRequestException as soon as one of the questions
      fails the test.   
  */
  private validateCascadingEntity(createQuestionDto: CreateQuestionDto) {
    const isValid =
      isDefined(createQuestionDto.statement) &&
      isNotEmpty(createQuestionDto.statement) &&
      isString(createQuestionDto.statement) &&
      isArray(createQuestionDto.answers) &&
      createQuestionDto.answers.length === 4 &&
      createQuestionDto.answers
        .map((answer) => +(answer.isCorrect && answer.statement !== ''))
        .reduce((a, b) => a + b) === 1;

    if (!isValid) {
      throw new BadRequestException(
        `At least one question in this quiz doesn't conform to the required structure.`,
      );
    }
    return isValid;
  }

  async create(createQuizDto: CreateQuizDto) {
    // Let's validate each question before it throws a 500 internal server error
    //   exception because we couldn't use the @ValidateNested decorator on the
    //   questions array (and a property is missing in one of the questions)
    const areQuestionsValid = await Promise.all(
      createQuizDto.questions.map((question) =>
        this.validateCascadingEntity(question as CreateQuestionDto),
      ),
    );

    const quiz = this.quizzesRepository.create(createQuizDto);

    return await this.quizzesRepository.save(quiz);
  }

  async findAll() {
    return this.quizzesRepository.find({
      relations: ['questions', 'questions.answers'],
    });
  }

  async findOne(id: string) {
    const quiz = await this.quizzesRepository.findOne(id);
    if (!quiz) {
      throw new NotFoundException(
        `No quiz with id “${id}” exists in the collection.`,
      );
    }
    return quiz;
  }

  async update(id: string, updateQuizDto: UpdateQuizDto) {
    // First things first, let's make sure we're attempting to update the
    //  correct record here...
    let quiz = await this.quizzesRepository.findOne(id);
    if (!quiz) {
      throw new NotFoundException(
        `No quiz with id “${id}” exists in the collection.`,
      );
    }

    // Let's validate each question before it throws a 500 internal server error
    //   exception because we couldn't use the @ValidateNested decorator on the
    //   questions array (and a property is missing in one of the questions)
    if (!!updateQuizDto.questions) {
      const areQuestionsValid = await Promise.all(
        updateQuizDto.questions.map((question) =>
          this.validateCascadingEntity(question as CreateQuestionDto),
        ),
      );
      // Now that we know a new set of valid questions is sent...
      //  we'll assume it needs to replace the previous one, so a
      //  cascading deletion needs to be triggered
      await Promise.all(
        quiz.questions.map((question) =>
          this.questionsRepository.remove(question),
        ),
      );
    }

    quiz = await this.quizzesRepository.preload({
      id,
      ...updateQuizDto,
    });

    return this.quizzesRepository.save(quiz);
  }

  async remove(id: string) {
    const quiz = await this.findOne(id);
    return this.quizzesRepository.remove(quiz);
  }
}
