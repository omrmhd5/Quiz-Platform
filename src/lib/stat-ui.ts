import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  CalendarDays,
  Check,
  CheckCircle2,
  CircleX,
  Loader,
  Minus,
  Target,
  TrendingDown,
  TrendingUp,
  UserCheck,
  Users,
  X,
} from "lucide-react";

export type StatTone =
  | "neutral"
  | "info"
  | "success"
  | "warning"
  | "danger"
  | "progress";

export type StatPreset = {
  icon: LucideIcon;
  tone: StatTone;
};

export const statPresets = {
  students: { icon: Users, tone: "neutral" },
  quizzes: { icon: BookOpen, tone: "info" },
  sessions: { icon: CalendarDays, tone: "neutral" },
  joined: { icon: UserCheck, tone: "info" },
  submitted: { icon: CheckCircle2, tone: "success" },
  inProgress: { icon: Loader, tone: "progress" },
  didntFinish: { icon: CircleX, tone: "danger" },
  averageScore: { icon: Target, tone: "info" },
  highestScore: { icon: TrendingUp, tone: "success" },
  lowestScore: { icon: TrendingDown, tone: "danger" },
  correct: { icon: Check, tone: "success" },
  wrong: { icon: X, tone: "danger" },
  skipped: { icon: Minus, tone: "neutral" },
} satisfies Record<string, StatPreset>;
