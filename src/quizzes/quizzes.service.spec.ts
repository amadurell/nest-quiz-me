import { ConfigModule } from '@nestjs/config';
import { QuestionsRepository } from './questions.repository';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { CreateQuizDto } from './dto/create-quiz.dto';
import {
  BadRequestException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { Quiz } from './entities/quiz.entity';
import { QuizzesRepository } from './quizzes.repository';
import { QuizzesService } from './quizzes.service';
import { createConnection, Connection, Repository, getConnection } from 'typeorm';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';

/*
  NOTE: Since we're not using ORM yet, and the repository is only faking async responses,
        the repository here is the real deal, not a mock one. The purpose is to actually
        test whether the repository refactor actually works. Should any of these tests 
        fail, we'll know where some work still needs to be done.
        And once the refactor is complete and working, we will probably want to modify
        these tests replaciong the actual QuizzesRepository with a mock one.
*/

// type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;
// const createMockRepository = <T = any>(): MockRepository<T> => ({
//   create: jest.fn(),
//   findAll: jest.fn()[],
//   findOne: jest.fn(),
//   update: jest.fn(),
//   remove: jest.fn(),
// })

describe('QuizzesService', () => {
  const quizDto = {
    name: 'Ultimate life quiz',
    questions: [
      {
        statement: 'How many roads must a man walk down?',
        answers: [
          {
            statement: 'Does a road really need to be walked down?',
            isCorrect: false,
          },
          {
            statement: 'None',
            isCorrect: false,
          },
          {
            statement: '42',
            isCorrect: true,
          },
          {
            statement: '69.000.000',
            isCorrect: false,
          },
        ],
      },
    ],
  } as CreateQuizDto;

  let badDto: Object;
  let quiz: Quiz;
  let connection: Connection;
  let repository: QuizzesRepository;
  let service: QuizzesService;

  afterAll(async () => {
    await getConnection('testConnection').close();
  });

  beforeAll(async () => {
    connection = await createConnection({
      type: 'postgres', //process.env.DATABASE_TYPE as any,
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'Caput Draconis',
      database: 'postgres',
      entities: [Quiz],
      name: 'testConnection',
    });

    const module: TestingModule = await Test.createTestingModule({
      imports: [TypeOrmModule.forFeature([Quiz])],
      providers: [
        QuizzesService,
        { provide: Connection, useValue: connection },
        { provide: getRepositoryToken(Quiz), useClass: QuizzesRepository },
      ],
    }).compile();

    repository = connection.getCustomRepository(QuizzesRepository);
    // service = module.get<QuizzesService>(QuizzesService);
    service = new QuizzesService(repository);

    return connection;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // describe('create', () => {
  //   describe('a valid quiz', () => {
  //     it('should return the new quiz', async () => {
  //       quiz = await service.create(quizDto);
  //       expect(quiz.name).toEqual(quizDto.name);
  //     });
  //   });
  //   /* 
  //     A BadRequestException for a quiz with no name should not be tested here, but in the controller,
  //     because of the validation pipe and entities decorators, hence, validating this in the repository
  //     is not implemented, so a create request thrown from here would fly even without a name.
  //   */
  //   describe('with potentially malicious data in it', () => {
  //     it('should throw a "BadRequestException"', async () => {
  //       const badDto = { ...quizDto, id: `105 OR 1=1` };
  //       try {
  //         await service.create(badDto as CreateQuizDto);
  //         fail(`We shouldn't be here!`);
  //       } catch (err) {
  //         expect(err).toBeInstanceOf(BadRequestException);
  //         expect(err.message).toEqual(
  //           `A new quiz shouldn't already have an id. Were you trying to update Quiz with id “${badDto['id']}”?`,
  //         );
  //         expect(err.response.statusCode).toEqual(HttpStatus.BAD_REQUEST);
  //       }
  //     });
  //   });
  //   describe('with non whitelisted data in it', () => {
  //     it('should throw a "BadRequestException"', async () => {
  //       const badDto = { ...quizDto, poteito: `potato` };
  //       try {
  //         await service.create(badDto as CreateQuizDto);
  //         fail(`We shouldn't be here!`);
  //       } catch (err) {
  //         expect(err).toBeInstanceOf(BadRequestException);
  //         expect(err.message).toEqual(
  //           `Malformed data. Please verify the parameters sent in the request body.`,
  //         );
  //         expect(err.response.statusCode).toEqual(HttpStatus.BAD_REQUEST);
  //       }
  //     });
  //   });
  //   describe('a quiz with no questions', () => {
  //     it('should throw a "BadRequestException"', async () => {
  //       try {
  //         badDto = { name: quizDto.name };
  //         await service.create(badDto as CreateQuizDto);
  //         fail(`We shouldn't be here!`);
  //       } catch (err) {
  //         expect(err).toBeInstanceOf(BadRequestException);
  //         expect(err.message).toEqual(
  //           `The provided Quiz “${quizDto.name}” should contain at least one question.`,
  //         );
  //         expect(err.response.statusCode).toEqual(HttpStatus.BAD_REQUEST);
  //       }
  //     });
  //   });
  //   describe('a quiz with no answers', () => {
  //     it('should throw a "BadRequestException"', async () => {
  //       try {
  //         badDto = {
  //           name: quizDto.name,
  //           questions: [{ statement: quizDto.questions[0].statement }],
  //         };
  //         await service.create(badDto as CreateQuizDto);
  //         fail(`We shouldn't be here!`);
  //       } catch (err) {
  //         expect(err).toBeInstanceOf(BadRequestException);
  //         expect(err.message).toEqual(
  //           `The provided Quiz's question “${quizDto.questions[0].statement}” should contain exactly 4 answers.`,
  //         );
  //         expect(err.response.statusCode).toEqual(HttpStatus.BAD_REQUEST);
  //       }
  //     });
  //   });
  //   describe('a quiz with more than one true answer', () => {
  //     it('should throw a "BadRequestException"', async () => {
  //       try {
  //         badDto = {
  //           name: quizDto.name,
  //           questions: [
  //             {
  //               statement: quizDto.questions[0].statement,
  //               answers: [
  //                 { ...quizDto.questions[0].answers[0], isCorrect: true },
  //                 quizDto.questions[0].answers[1],
  //                 quizDto.questions[0].answers[2],
  //                 quizDto.questions[0].answers[3],
  //               ],
  //             },
  //           ],
  //         };
  //         await service.create(badDto as CreateQuizDto);
  //         fail(`We shouldn't be here!`);
  //       } catch (err) {
  //         expect(err).toBeInstanceOf(BadRequestException);
  //         expect(err.message).toEqual(
  //           `The provided Quiz's question “${quizDto.questions[0].statement}” must contain 1 and only 1 true answer.`,
  //         );
  //         expect(err.response.statusCode).toEqual(HttpStatus.BAD_REQUEST);
  //       }
  //     });
  //   });
  //   describe('a quiz with no true answer', () => {
  //     it('should throw a "BadRequestException"', async () => {
  //       try {
  //         badDto = {
  //           name: quizDto.name,
  //           questions: [
  //             {
  //               statement: quizDto.questions[0].statement,
  //               answers: [
  //                 quizDto.questions[0].answers[0],
  //                 quizDto.questions[0].answers[1],
  //                 { ...quizDto.questions[0].answers[2], isCorrect: false },
  //                 quizDto.questions[0].answers[3],
  //               ],
  //             },
  //           ],
  //         };
  //         await service.create(badDto as CreateQuizDto);
  //         fail(`We shouldn't be here!`);
  //       } catch (err) {
  //         expect(err).toBeInstanceOf(BadRequestException);
  //         expect(err.message).toEqual(
  //           `The provided Quiz's question “${quizDto.questions[0].statement}” must contain 1 and only 1 true answer.`,
  //         );
  //         expect(err.response.statusCode).toEqual(HttpStatus.BAD_REQUEST);
  //       }
  //     });
  //   });
  // });

  // describe('findAll', () => {
  //   it('should return all quizzes', async () => {
  //     const result = await service.findAll();
  //     expect(result[quiz.id].name).toEqual(quizDto.name);
  //   });
  // });

  // describe(`findOne`, () => {
  //   describe(`when quiz with provided id exists`, () => {
  //     it(`should return the quiz object`, async () => {
  //       const foundQuiz = await service.findOne(quiz.id);
  //       expect(foundQuiz).toEqual(quiz);
  //     });
  //   });
  //   describe(`when quiz with provided id doesn't exist`, () => {
  //     it(`should throw a "NotFoundException"`, async () => {
  //       try {
  //         await service.findOne(`NOT${quiz.id}`);
  //       } catch (err) {
  //         expect(err).toBeInstanceOf(NotFoundException);
  //         expect(err.message).toEqual(
  //           `No quiz with id “NOT${quiz.id}” exists in the collection.`,
  //         );
  //         expect(err.response.statusCode).toEqual(HttpStatus.NOT_FOUND);
  //       }
  //     });
  //   });
  // });

  // describe('update', () => {
  //   describe('with a name patch', () => {
  //     it('should return the updated quiz', async () => {
  //       const updatedName = `Ultimate quiz of life`;
  //       quiz = await service.update(quiz.id, {
  //         name: updatedName,
  //       } as UpdateQuizDto);
  //       expect(quiz.name).toEqual(updatedName);
  //     });
  //   });
  //   describe('with a questions patch', () => {
  //     it('should return the updated quiz', async () => {
  //       const updatedQuestions = [
  //         {
  //           ...quizDto.questions[0],
  //           statement: `The answer to the ultimate question of life, the universe, and everything.`,
  //         },
  //       ];
  //       quiz = await service.update(quiz.id, {
  //         ...quizDto,
  //         questions: updatedQuestions,
  //       } as UpdateQuizDto);
  //       expect(quiz.questions).toEqual(updatedQuestions);
  //     });
  //   });
  //   describe('with potentially malicious data in it', () => {
  //     it('should throw a "BadRequestException"', async () => {
  //       try {
  //         badDto = { ...quizDto, id: `105 OR 1=1` };
  //         await service.update(quiz.id, badDto as UpdateQuizDto);
  //         fail(`We shouldn't be here!`);
  //       } catch (err) {
  //         expect(err).toBeInstanceOf(BadRequestException);
  //         expect(err.message).toEqual(
  //           `Quiz id “${quiz.id}” doesn't match the update object's id “${badDto['id']}”.`,
  //         );
  //         expect(err.response.statusCode).toEqual(HttpStatus.BAD_REQUEST);
  //       }
  //     });
  //   });
  //   describe('with non whitelisted data in it', () => {
  //     it('should throw a "BadRequestException"', async () => {
  //       try {
  //         badDto = { ...quizDto, poteito: `potato` };
  //         await service.update(quiz.id, badDto as UpdateQuizDto);
  //         fail(`We shouldn't be here!`);
  //       } catch (err) {
  //         expect(err).toBeInstanceOf(BadRequestException);
  //         expect(err.message).toEqual(
  //           `Malformed data. Please verify the parameters sent in the request body.`,
  //         );
  //         expect(err.response.statusCode).toEqual(HttpStatus.BAD_REQUEST);
  //       }
  //     });
  //   });
  //   describe('with a quiz with no answers', () => {
  //     it('should throw a "BadRequestException"', async () => {
  //       try {
  //         badDto = {
  //           name: quizDto.name,
  //           questions: [{ statement: quizDto.questions[0].statement }],
  //         };
  //         await service.update(quiz.id, badDto as UpdateQuizDto);
  //         fail(`We shouldn't be here!`);
  //       } catch (err) {
  //         expect(err).toBeInstanceOf(BadRequestException);
  //         expect(err.message).toEqual(
  //           `The provided Quiz's question “${quizDto.questions[0].statement}” should contain exactly 4 answers.`,
  //         );
  //         expect(err.response.statusCode).toEqual(HttpStatus.BAD_REQUEST);
  //       }
  //     });
  //   });
  //   describe('with a quiz with more than one true answer', () => {
  //     it('should throw a "BadRequestException"', async () => {
  //       try {
  //         badDto = {
  //           name: quizDto.name,
  //           questions: [
  //             {
  //               statement: quizDto.questions[0].statement,
  //               answers: [
  //                 { ...quizDto.questions[0].answers[0], isCorrect: true },
  //                 quizDto.questions[0].answers[1],
  //                 quizDto.questions[0].answers[2],
  //                 quizDto.questions[0].answers[3],
  //               ],
  //             },
  //           ],
  //         };
  //         await service.update(quiz.id, badDto as UpdateQuizDto);
  //         fail(`We shouldn't be here!`);
  //       } catch (err) {
  //         expect(err).toBeInstanceOf(BadRequestException);
  //         expect(err.message).toEqual(
  //           `The provided Quiz's question “${quizDto.questions[0].statement}” must contain 1 and only 1 true answer.`,
  //         );
  //         expect(err.response.statusCode).toEqual(HttpStatus.BAD_REQUEST);
  //       }
  //     });
  //   });
  //   describe('with a quiz with no true answer', () => {
  //     it('should throw a "BadRequestException"', async () => {
  //       try {
  //         badDto = {
  //           name: quizDto.name,
  //           questions: [
  //             {
  //               statement: quizDto.questions[0].statement,
  //               answers: [
  //                 quizDto.questions[0].answers[0],
  //                 quizDto.questions[0].answers[1],
  //                 { ...quizDto.questions[0].answers[2], isCorrect: false },
  //                 quizDto.questions[0].answers[3],
  //               ],
  //             },
  //           ],
  //         };
  //         await service.update(quiz.id, badDto as UpdateQuizDto);
  //         fail(`We shouldn't be here!`);
  //       } catch (err) {
  //         expect(err).toBeInstanceOf(BadRequestException);
  //         expect(err.message).toEqual(
  //           `The provided Quiz's question “${quizDto.questions[0].statement}” must contain 1 and only 1 true answer.`,
  //         );
  //         expect(err.response.statusCode).toEqual(HttpStatus.BAD_REQUEST);
  //       }
  //     });
  //   });
  //   describe('with a valid quiz patch but the wrong id', () => {
  //     it('should throw a "BadRequestException"', async () => {
  //       try {
  //         await service.update(quiz.id + quiz.id, quizDto);
  //         fail(`We shouldn't be here!`);
  //       } catch (err) {
  //         expect(err).toBeInstanceOf(BadRequestException);
  //         expect(err.message).toEqual(
  //           `Quiz id “${
  //             quiz.id + quiz.id
  //           }” doesn't match any existing record. Please verify the provided update data.`,
  //         );
  //         expect(err.response.statusCode).toEqual(HttpStatus.BAD_REQUEST);
  //       }
  //     });
  //   });
  // });

  // describe(`delete`, () => {
  //   describe(`when quiz with provided id exists`, () => {
  //     it(`should return void`, async () => {
  //       await service.remove(quiz.id);
  //       try {
  //         await service.findOne(quiz.id);
  //         fail(`We shouldn't be here!`);
  //       } catch (err) {
  //         expect(err).toBeInstanceOf(NotFoundException);
  //         expect(err.message).toEqual(
  //           `No quiz with id “${quiz.id}” exists in the collection.`,
  //         );
  //         expect(err.response.statusCode).toEqual(HttpStatus.NOT_FOUND);
  //       }
  //     });
  //   });
  //   describe(`when quiz with provided id doesn't exist`, () => {
  //     it(`should throw a "BadRequestException"`, async () => {
  //       try {
  //         await service.remove(`NOT${quiz.id}`);
  //       } catch (err) {
  //         expect(err).toBeInstanceOf(BadRequestException);
  //         expect(err.message).toEqual(
  //           `Can't delete a record which doesn't exist. Please verify and fix the id “NOT${quiz.id}”.`,
  //         );
  //         expect(err.response.statusCode).toEqual(HttpStatus.BAD_REQUEST);
  //       }
  //     });
  //   });
  // });
});
