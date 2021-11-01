import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsDefined,
  IsNotEmpty,
  IsString,
} from 'class-validator';
import { Answer } from './../entities/answer.entity';

export class CreateQuestionDto {
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  readonly statement: string;

  @IsArray()
  @ArrayMinSize(4)
  @ArrayMaxSize(4)
  readonly answers: Answer[];
}
