import type { Quiz } from '../types';
import { QUIZ_BASICS } from './basics';
import { QUIZ_MEMORY } from './memory';
import { QUIZ_ADVANCED } from './advanced';

export const QUIZZES: Quiz[] = [...QUIZ_BASICS, ...QUIZ_MEMORY, ...QUIZ_ADVANCED];

export const quiz = (id: string) => QUIZZES.find((q) => q.id === id);
