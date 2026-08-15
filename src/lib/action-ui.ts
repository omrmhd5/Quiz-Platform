import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardPaste,
  Copy,
  DoorOpen,
  Eye,
  History,
  KeyRound,
  LogIn,
  LogOut,
  PanelRightOpen,
  Pencil,
  Plus,
  Radio,
  Rocket,
  Save,
  Square,
  Trash2,
  Upload,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import {
  buttonDangerClassName,
  buttonGhostClassName,
  buttonPrimaryClassName,
  buttonSecondaryClassName,
  buttonSuccessClassName,
} from "@/lib/utils";

export type ActionKey =
  | "history"
  | "edit"
  | "delete"
  | "view"
  | "launch"
  | "live"
  | "close"
  | "copy"
  | "save"
  | "cancel"
  | "signIn"
  | "join"
  | "signOut"
  | "add"
  | "import"
  | "createQuiz"
  | "manageStudents"
  | "manageQuizzes"
  | "submit"
  | "previous"
  | "next"
  | "back"
  | "continue"
  | "addOption"
  | "addQuestion"
  | "parse"
  | "answerKey"
  | "open";

type ActionPreset = {
  icon: LucideIcon;
  label: string;
  buttonClassName?: string;
  hideLabel?: boolean;
};

export const actionPresets: Record<ActionKey, ActionPreset> = {
  history: { icon: History, label: "History" },
  edit: { icon: Pencil, label: "Edit" },
  delete: {
    icon: Trash2,
    label: "Delete",
    buttonClassName: buttonDangerClassName,
  },
  view: { icon: Eye, label: "View" },
  launch: {
    icon: Rocket,
    label: "Launch",
    buttonClassName: buttonPrimaryClassName,
  },
  live: {
    icon: Radio,
    label: "Live",
    buttonClassName: buttonSuccessClassName,
  },
  close: { icon: Square, label: "Close session" },
  copy: { icon: Copy, label: "Copy link" },
  save: { icon: Save, label: "Save", buttonClassName: buttonPrimaryClassName },
  cancel: { icon: X, label: "Cancel" },
  signIn: {
    icon: LogIn,
    label: "Sign in",
    buttonClassName: buttonPrimaryClassName,
  },
  join: {
    icon: DoorOpen,
    label: "Join quiz",
    buttonClassName: buttonPrimaryClassName,
  },
  signOut: {
    icon: LogOut,
    label: "Sign out",
    buttonClassName: buttonGhostClassName,
  },
  add: {
    icon: UserPlus,
    label: "Add student",
    buttonClassName: buttonPrimaryClassName,
  },
  import: { icon: Upload, label: "Import", buttonClassName: buttonSecondaryClassName },
  createQuiz: {
    icon: Plus,
    label: "Create quiz",
    buttonClassName: buttonPrimaryClassName,
  },
  manageStudents: { icon: Users, label: "Manage students" },
  manageQuizzes: { icon: BookOpen, label: "Manage quizzes" },
  submit: {
    icon: CheckCircle2,
    label: "Submit quiz",
    buttonClassName: buttonPrimaryClassName,
  },
  previous: { icon: ChevronLeft, label: "Previous", hideLabel: true },
  next: { icon: ChevronRight, label: "Next", hideLabel: true },
  back: { icon: ChevronLeft, label: "Back" },
  continue: {
    icon: ArrowRight,
    label: "Continue",
    buttonClassName: buttonPrimaryClassName,
  },
  addOption: { icon: Plus, label: "Add option" },
  addQuestion: { icon: Plus, label: "Add question" },
  parse: {
    icon: ClipboardPaste,
    label: "Parse & continue",
    buttonClassName: buttonPrimaryClassName,
  },
  answerKey: { icon: KeyRound, label: "View answer key" },
  open: { icon: PanelRightOpen, label: "Open" },
};
