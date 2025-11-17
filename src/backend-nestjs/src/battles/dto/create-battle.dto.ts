import { IsString, IsNumber, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class QuestionDto {
  @IsString()
  question: string;

  @IsArray()
  options: string[];

  @IsString()
  correctAnswer: string;

  @IsNumber()
  points: number;
}

export class CreateBattleDto {
  @IsString()
  name: string;

  @IsNumber()
  questionCount: number;

  @IsNumber()
  groupCount: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionDto)
  questions: QuestionDto[];
}
