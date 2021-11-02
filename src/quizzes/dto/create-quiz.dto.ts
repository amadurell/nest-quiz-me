import { IsString, IsArray, IsNotEmpty, ValidateNested } from 'class-validator';
import { Question } from './../entities/question.entity';

export class CreateQuizDto {
  @IsNotEmpty()
  @IsString()
  readonly name: string;

  @IsArray()
  readonly questions: Question[];
}
