import { IsBoolean, IsString } from "class-validator";

export class CreateAnswerDto {
  @IsString()
  readonly statement: string;

  @IsBoolean()
  readonly isCorrect: boolean;
}
