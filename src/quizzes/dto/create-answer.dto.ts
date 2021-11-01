import { IsBoolean, IsNotEmpty, IsString } from "class-validator";

export class CreateAnswerDto {
  @IsNotEmpty()
  @IsString()
  readonly statement: string;

  @IsBoolean()
  readonly isCorrect: boolean;
}
