import { Controller, Get, Post, Patch, Body, Param, UseGuards, Request } from '@nestjs/common';
import { BattlesService } from './battles.service';
import { CreateBattleDto } from './dto/create-battle.dto';
import { JoinBattleDto } from './dto/join-battle.dto';
import { SubmitAnswerDto } from './dto/submit-answer.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('battles')
export class BattlesController {
  constructor(private battlesService: BattlesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createBattle(@Request() req, @Body() createBattleDto: CreateBattleDto) {
    return this.battlesService.createBattle(req.user.id, createBattleDto);
  }

  @Get('active')
  async getActiveBattles() {
    return this.battlesService.getActiveBattles();
  }

  @UseGuards(JwtAuthGuard)
  @Get('teacher')
  async getTeacherBattles(@Request() req) {
    return this.battlesService.getTeacherBattles(req.user.id);
  }

  @Get(':battleId')
  async getBattle(@Param('battleId') battleId: string) {
    return this.battlesService.getBattleById(battleId);
  }

  @Get(':battleId/groups')
  async getBattleGroups(@Param('battleId') battleId: string) {
    return this.battlesService.getBattleGroups(battleId);
  }

  @Get(':battleId/questions')
  async getBattleQuestions(@Param('battleId') battleId: string) {
    return this.battlesService.getBattleQuestions(battleId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':battleId/join')
  async joinBattle(
    @Request() req,
    @Param('battleId') battleId: string,
    @Body() joinBattleDto: JoinBattleDto,
  ) {
    return this.battlesService.joinGroup(req.user.id, req.user.name, {
      ...joinBattleDto,
      battleId,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post(':battleId/start')
  async startBattle(@Param('battleId') battleId: string) {
    return this.battlesService.startBattle(battleId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':battleId/answer')
  async submitAnswer(
    @Request() req,
    @Param('battleId') battleId: string,
    @Body() submitAnswerDto: SubmitAnswerDto,
  ) {
    return this.battlesService.submitAnswer(req.user.id, battleId, submitAnswerDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':battleId/end')
  async endBattle(@Param('battleId') battleId: string) {
    return this.battlesService.endBattle(battleId);
  }
}
