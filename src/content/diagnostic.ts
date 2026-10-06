import type { SkillId } from './types';

/**
 * Short adaptive diagnostic (~10-15 min). Items are asked in order; an item is skipped
 * when one of the skills in `requires` was answered wrong ("prérequis fragile"),
 * so a beginner is not flooded with questions on notions built on top of a gap.
 */
export interface DiagItem {
  quiz: string;
  skill: SkillId;
  requires: SkillId[];
  /** Code item: an exercise solved in the editor instead of a quiz. */
  code?: boolean;
}

export const DIAGNOSTIC: DiagItem[] = [
  { quiz: 'q_struct_1', skill: 'structure', requires: [] },
  { quiz: 'q_compile_3', skill: 'compile', requires: [] },
  { quiz: 'q_vars_1', skill: 'vars', requires: [] },
  { quiz: 'q_chars_1', skill: 'chars', requires: [] },
  { quiz: 'q_cond_1', skill: 'cond', requires: [] },
  { quiz: 'q_loops_1', skill: 'loops', requires: ['cond'] },
  { quiz: 'q_func_1', skill: 'functions', requires: [] },
  { quiz: 'q_loops_4', skill: 'loops', requires: ['loops'] },
  { quiz: 'q_putnbr_1', skill: 'putnbr', requires: ['vars'] },
  { quiz: 'q_ptr_1', skill: 'pointers', requires: [] },
  { quiz: 'q_str_2', skill: 'strings', requires: ['chars'] },
  { quiz: 'q_str_3', skill: 'strings', requires: ['strings', 'loops'] },
  { quiz: 'q_arr_1', skill: 'arrays', requires: [] },
  { quiz: 'q_argv_1', skill: 'argv', requires: [] },
  { quiz: 'q_getnbr_2', skill: 'getnbr', requires: ['chars'] },
  { quiz: 'q_err_1', skill: 'errors84', requires: [] },
  { quiz: 'q_malloc_1', skill: 'malloc', requires: ['strings'] },
  { quiz: 'q_rec_2', skill: 'recursion', requires: ['functions'] },
  { quiz: 'ex_strlen', skill: 'strings', requires: ['strings', 'loops'], code: true },
];
