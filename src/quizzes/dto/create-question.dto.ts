import { ArrayMaxSize, ArrayMinSize, IsArray, IsString, ValidateNested } from 'class-validator';
import { Answer } from './../entities/answer.entity';

export class CreateQuestionDto {
  @IsString()
  readonly statement: string;
  
  @IsArray()
  @ArrayMinSize(4)
  @ArrayMaxSize(4)
  @ValidateNested()
  readonly answers: Answer[];
}
