export type Role = "STUDENT" | "PARENT";
export type Level = "FLUENCY" | "SKILL" | "DEPTH";
export type QuestionType = "MCQ" | "FILL_BLANK" | "ORDER" | "TRUE_FALSE";

export interface QuestionOption {
  label: string;
  value: string;
}

export interface TopicWithStats {
  id: string;
  title: string;
  lo: string;
  order: number;
  isAssigned: boolean;
  completionPct: number;
  avgScore: number;
  attempts: number;
  lastAttempt?: string;
}

export interface BadgeInfo {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedAt?: string;
}

export const LEVEL_ORDER: Level[] = ["FLUENCY", "SKILL", "DEPTH"];
export const LEVEL_LABELS: Record<Level, string> = {
  FLUENCY: "Warm-Up",
  SKILL: "Match Day",
  DEPTH: "Champions League",
};

export const XP_THRESHOLDS = {
  STARTER: 0,
  PRO: 200,
  ELITE: 600,
  GOAT: 1200,
};

export function getLevel(xp: number): string {
  if (xp >= XP_THRESHOLDS.GOAT) return "GOAT";
  if (xp >= XP_THRESHOLDS.ELITE) return "Elite";
  if (xp >= XP_THRESHOLDS.PRO) return "Pro";
  return "Starter";
}
