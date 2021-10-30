import { IsArray, IsString, ValidateNested } from 'class-validator';
import { Question } from './../entities/question.entity';

export class CreateQuizDto {

  @IsString()
  readonly name: string;

  @IsArray()
  @ValidateNested()
  readonly questions: Question[];
}
