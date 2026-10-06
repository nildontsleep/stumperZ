// Content model. Everything pedagogical is data, validated by tools/validate-content.ts.

export type DayId = 'd01' | 'd02' | 'd03' | 'd04' | 'd05' | 'd06' | 'd07' | 'd08' | 'd09' | 'd10' | 'd11' | 'd12';

/** Reference to a place in one of the PDFs ("Day04 — Task 05, p. 3"). */
export interface SourceRef {
  day: DayId;
  /** Section title exactly as in the PDF, e.g. "Task 05 - my_getnbr". */
  section: string;
  /** Printed page number (the number at the bottom of the PDF page). */
  page: number;
}

export interface PdfTask {
  section: string;
  page: number;
  delivery?: string;
  prototype?: string;
  summary: string;
  skills: SkillId[];
  /** Local exercise reproducing or preparing this task, if any. */
  exercise?: string;
}

export interface PdfDay {
  id: DayId;
  file: string;
  title: string;
  subtitle: string;
  version: string;
  pages: number;
  language: string;
  rules: { text: string; page: number }[];
  allowed: string;
  compile?: string;
  tasks: PdfTask[];
  /** Characters badly recognised during extraction, and what the PDF really means. */
  extractionNotes?: string[];
}

export type SkillId =
  | 'shell' | 'git' | 'compile' | 'structure' | 'vars' | 'chars' | 'cond' | 'loops' | 'functions'
  | 'putnbr' | 'pointers' | 'strings' | 'arrays' | 'getnbr' | 'recursion' | 'strfuncs' | 'tests'
  | 'bases' | 'argv' | 'libmy' | 'malloc' | 'wordarray' | 'structs' | 'makefile' | 'errors84'
  | 'funcptr' | 'lists' | 'fd' | 'method';

export interface Skill {
  id: SkillId;
  title: string;
  short: string;
  prereqs: SkillId[];
  days: DayId[];
  /** 3 = indispensable for a 1-hour C exam, 2 = useful, 1 = secondary, 0 = not C. */
  stumper: 0 | 1 | 2 | 3;
}

/** Rich-text blocks used by lessons, hints and corrections. Text uses a tiny markdown: `code`, **bold**. */
export type Block =
  | { t: 'p'; text: string }
  | { t: 'list'; items: string[] }
  | { t: 'code'; code: string; caption?: string; lang?: 'c' | 'sh' | 'text' | 'make' }
  | { t: 'note'; kind: 'info' | 'warn' | 'pdf' | 'extra'; text: string }
  | { t: 'memory'; caption?: string; cells: MemCell[]; arrows?: { from: string; to: string }[] }
  | { t: 'trace'; caption?: string; columns: string[]; rows: string[][] }
  | { t: 'error'; message: string; meaning: string; cause: string; fix: string };

export interface MemCell {
  id: string;
  addr?: string;
  name?: string;
  value: string;
  kind?: 'var' | 'char' | 'nul' | 'ptr' | 'heap' | 'unknown';
}

export interface LessonSection {
  title: string;
  blocks: Block[];
}

export interface Lesson {
  id: string;
  skill: SkillId;
  title: string;
  minutes: number;
  sources: SourceRef[];
  /** true when the notion is not taught in the PDFs but needed as a prerequisite. */
  complement?: boolean;
  why: Block[];
  how: Block[];
  example: { code: string; explain: Block[] };
  pitfall: Block[];
  guided?: string;
  solo?: string;
  check: string[];
  videos?: string[];
}

export type QuizKind = 'mcq' | 'multi' | 'output' | 'bug' | 'order' | 'fill' | 'tests';

export interface QuizOption {
  text: string;
  correct?: boolean;
  /** Why someone picks this wrong answer, and what to remember. */
  why?: string;
}

export interface Quiz {
  id: string;
  skill: SkillId;
  level: 1 | 2 | 3;
  kind: QuizKind;
  prompt: string;
  code?: string;
  options?: QuizOption[];
  /** For 'order': lines in the correct order (shuffled at display time). */
  lines?: string[];
  /** For 'fill': accepted answers (whitespace-insensitive). */
  answers?: string[];
  explain: string;
  /** Misconception tag recorded when the answer is wrong. */
  gap?: string;
  source?: SourceRef;
  prereqs?: SkillId[];
}

export interface TestCase {
  name: string;
  /** For function exercises: C statements run by the hidden main. */
  code?: string;
  /** For program exercises. */
  args?: string[];
  stdin?: string;
  files?: Record<string, string>;
  denied?: string[];
  /** Check the exit code too (programs). */
  checkExit?: boolean;
  /** Check stderr is non empty / empty instead of exact match. */
  stderr?: 'any' | 'empty' | 'ignore';
  kind?: 'normal' | 'limit' | 'empty' | 'error';
}

export interface CodeExercise {
  id: string;
  title: string;
  skills: SkillId[];
  level: 1 | 2 | 3;
  kind: 'function' | 'program';
  source?: SourceRef;
  /** "reproduces" = same task as the PDF; "inspired" = original exercise on the same skill. */
  relation: 'reproduces' | 'inspired' | 'complement';
  minutes: number;
  statement: Block[];
  file: string;
  prototype?: string;
  /** Functions the student may call (checked statically). */
  allowed: string[];
  /** Day03 rule: no arrays, no string literals. */
  noArrays?: boolean;
  /** Provide my_putchar in the hidden harness (Days 03-06 style). */
  providesPutchar?: boolean;
  /** Extra C code compiled with the student's file (helpers, struct definitions). */
  support?: string;
  /** Extra header given to the student (shown read-only), e.g. linked list struct. */
  header?: { name: string; code: string };
  starter: string;
  tests: TestCase[];
  hints: [string, string, string, string];
  solution: string;
  solutionNotes: Block[];
  pitfalls: string[];
  prereqs: SkillId[];
}

export interface ExamStep {
  title: string;
  points: number;
  statement: Block[];
  tests: TestCase[];
  skills: SkillId[];
}

export interface ExamSubject {
  id: string;
  title: string;
  binary: string;
  file: string;
  intro: Block[];
  rules: string[];
  allowed: string[];
  steps: ExamStep[];
  starter: string;
  correction: { step: number; blocks: Block[] }[];
  solution: string;
  followUp: string[];
}

export interface Video {
  id: string;
  title: string;
  author: string;
  url: string;
  youtubeId?: string;
  /** What was verified and how. */
  verified: string;
  duration?: string;
  skills: SkillId[];
  days: DayId[];
  learn: string[];
  caveat?: string;
  quiz: string[];
  exercise?: string;
}
