export type AnswerMap = Record<string, any>;

export type Condition =
  | { anyOf: string[] }
  | { allOf: string[] }
  | { eq: [key: string, value: any] }
  | { in: [key: string, values: any[]] }
  | { gte: [key: string, n: number] }
  | { lte: [key: string, n: number] }
  | { regex: [key: string, pattern: string] };

export type Choice = { label: string; value: string };

export type Question = {
  id: string;
  prompt: string;
  type: "text" | "number" | "choice" | "multichoice" | "yesno" | "date";
  choices?: Choice[];
  required?: boolean;
  validate?(value: any): string | null;
  showIf?: Condition;
  next?: (answers: AnswerMap) => string | null; // allows branching or navigation hooks
};

export type Module = {
  id: string;
  title: string;
  entryIf?: Condition;   // include this module only if true
  questions: Question[];
};

export type TriageRule = {
  id: string;
  description: string;
  severity: "emergent" | "urgent" | "routine";
  if: Condition;
  action: { route: "EMERGENCY" | "CLINIC" | "SELF_CARE"; message: string };
};
