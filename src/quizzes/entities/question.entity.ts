import { Answer } from './answer.entity';

export class Question {
  id: string;
  statement: string;
  answers: Answer[];
}
