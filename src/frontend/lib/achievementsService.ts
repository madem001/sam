// ARCHIVO DESHABILITADO - Reemplazar con backend local
// Ver GUIA_CONEXION_BACKEND.md para implementar con API REST

export interface UnlockAchievementParams {
  studentId: string;
  unlockCondition: string;
}

export const unlockAchievement = async (params: UnlockAchievementParams) => {
  console.warn('⚠️ achievementsService está deshabilitado. Implementar con backend local.');
  console.log('Ver GUIA_CONEXION_BACKEND.md');
  return null;
};

export const checkAndUnlockAchievements = async (studentId: string) => {
  console.warn('⚠️ achievementsService está deshabilitado. Implementar con backend local.');
  return null;
};
