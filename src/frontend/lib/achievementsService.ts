import { supabase } from './supabase';

export interface UnlockAchievementParams {
  studentId: string;
  unlockCondition: string;
  matchesPlayed?: number;
  pointsEarned?: number;
  levelAchieved?: number;
}

export const achievementsService = {
  async unlockAchievement(params: UnlockAchievementParams) {
    try {
      const { data, error } = await supabase.rpc('check_and_unlock_achievement', {
        p_student_id: params.studentId,
        p_unlock_condition: params.unlockCondition,
        p_matches_played: params.matchesPlayed || 0,
        p_points_earned: params.pointsEarned || 0,
        p_level_achieved: params.levelAchieved || 0,
      });

      if (error) {
        console.error('Error unlocking achievement:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in unlockAchievement:', error);
      return null;
    }
  },

  async checkFirstBattle(studentId: string, matchesPlayed: number) {
    if (matchesPlayed === 1) {
      return await this.unlockAchievement({
        studentId,
        unlockCondition: 'primera_batalla',
        matchesPlayed: 1,
        pointsEarned: 0,
        levelAchieved: 1,
      });
    }
    return null;
  },

  async checkPerfectScore(studentId: string, correctAnswers: number, totalQuestions: number, matchesPlayed: number, totalPoints: number, level: number) {
    if (correctAnswers === totalQuestions && totalQuestions > 0) {
      return await this.unlockAchievement({
        studentId,
        unlockCondition: 'puntuacion_perfecta',
        matchesPlayed,
        pointsEarned: totalPoints,
        levelAchieved: level,
      });
    }
    return null;
  },

  async checkSpeedLight(studentId: string, averageTime: number, matchesPlayed: number, totalPoints: number, level: number) {
    if (averageTime < 5) {
      return await this.unlockAchievement({
        studentId,
        unlockCondition: 'velocidad_luz',
        matchesPlayed,
        pointsEarned: totalPoints,
        levelAchieved: level,
      });
    }
    return null;
  },

  async checkWinStreak(studentId: string, winStreak: number, matchesPlayed: number, totalPoints: number, level: number) {
    if (winStreak === 5) {
      await this.unlockAchievement({
        studentId,
        unlockCondition: 'racha_5',
        matchesPlayed,
        pointsEarned: totalPoints,
        levelAchieved: level,
      });
    }

    if (winStreak === 10) {
      await this.unlockAchievement({
        studentId,
        unlockCondition: 'racha_10',
        matchesPlayed,
        pointsEarned: totalPoints,
        levelAchieved: level,
      });
    }
  },

  async checkAllForAllWin(studentId: string, position: number, accuracy: number, matchesPlayed: number, totalPoints: number, level: number) {
    if (position === 1 && accuracy >= 80) {
      return await this.unlockAchievement({
        studentId,
        unlockCondition: 'maestro_estratega',
        matchesPlayed,
        pointsEarned: totalPoints,
        levelAchieved: level,
      });
    }
    return null;
  },

  async checkTotalBattles(studentId: string, matchesPlayed: number, totalPoints: number, level: number) {
    if (matchesPlayed === 20) {
      return await this.unlockAchievement({
        studentId,
        unlockCondition: 'batallas_20',
        matchesPlayed,
        pointsEarned: totalPoints,
        levelAchieved: level,
      });
    }
    return null;
  },

  async checkAllCardsUnlocked(studentId: string, unlockedCards: number, totalCards: number, matchesPlayed: number, totalPoints: number, level: number) {
    if (unlockedCards === totalCards && totalCards > 0) {
      return await this.unlockAchievement({
        studentId,
        unlockCondition: 'todas_cartas',
        matchesPlayed,
        pointsEarned: totalPoints,
        levelAchieved: level,
      });
    }
    return null;
  },

  async checkAllAchievements(
    studentId: string,
    gameData: {
      matchesPlayed: number;
      totalPoints: number;
      level: number;
      winStreak?: number;
      correctAnswers?: number;
      totalQuestions?: number;
      averageTime?: number;
      allForAllPosition?: number;
      allForAllAccuracy?: number;
      unlockedCards?: number;
      totalCards?: number;
    }
  ) {
    const promises = [];

    promises.push(this.checkFirstBattle(studentId, gameData.matchesPlayed));

    if (gameData.correctAnswers !== undefined && gameData.totalQuestions !== undefined) {
      promises.push(
        this.checkPerfectScore(
          studentId,
          gameData.correctAnswers,
          gameData.totalQuestions,
          gameData.matchesPlayed,
          gameData.totalPoints,
          gameData.level
        )
      );
    }

    if (gameData.averageTime !== undefined) {
      promises.push(
        this.checkSpeedLight(
          studentId,
          gameData.averageTime,
          gameData.matchesPlayed,
          gameData.totalPoints,
          gameData.level
        )
      );
    }

    if (gameData.winStreak !== undefined) {
      promises.push(
        this.checkWinStreak(
          studentId,
          gameData.winStreak,
          gameData.matchesPlayed,
          gameData.totalPoints,
          gameData.level
        )
      );
    }

    if (gameData.allForAllPosition !== undefined && gameData.allForAllAccuracy !== undefined) {
      promises.push(
        this.checkAllForAllWin(
          studentId,
          gameData.allForAllPosition,
          gameData.allForAllAccuracy,
          gameData.matchesPlayed,
          gameData.totalPoints,
          gameData.level
        )
      );
    }

    promises.push(
      this.checkTotalBattles(studentId, gameData.matchesPlayed, gameData.totalPoints, gameData.level)
    );

    if (gameData.unlockedCards !== undefined && gameData.totalCards !== undefined) {
      promises.push(
        this.checkAllCardsUnlocked(
          studentId,
          gameData.unlockedCards,
          gameData.totalCards,
          gameData.matchesPlayed,
          gameData.totalPoints,
          gameData.level
        )
      );
    }

    await Promise.all(promises);
  },
};
