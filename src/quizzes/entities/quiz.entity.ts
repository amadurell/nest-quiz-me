import { Question } from './question.entity';

export class Quiz {
  id: string;
  name: string;
  questions: Question[];
}
