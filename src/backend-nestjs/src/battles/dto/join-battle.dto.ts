import { IsString, IsNumber } from 'class-validator';

export class JoinBattleDto {
  @IsString()
  battleId: string;

  @IsNumber()
  groupNumber: number;
}
