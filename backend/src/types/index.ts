export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

export interface CreateBattleDTO {
  name: string;
  questionCount: number;
  groupCount: number;
  questions: {
    text: string;
    answers: string[];
    correctIndex: number;
  }[];
}

export interface JoinGroupDTO {
  groupCode: string;
  studentId: string;
  studentName: string;
}

export interface SubmitAnswerDTO {
  battleId: string;
  groupId: string;
  questionId: string;
  answerIndex: number;
  responseTimeMs: number;
}

export interface WSMessage {
  type: string;
  payload: any;
}

export interface BattleUpdatePayload {
  battleId: string;
  status?: string;
  currentQuestionIndex?: number;
}

export interface GroupUpdatePayload {
  battleId: string;
  groupId: string;
  score?: number;
  correctAnswers?: number;
}
