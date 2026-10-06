import type { Lesson } from '../types';
import { LESSONS_CORE } from './core';
import { LESSONS_MEMORY } from './memory';
import { LESSONS_TOOLS } from './tools';

export const LESSONS: Lesson[] = [...LESSONS_CORE, ...LESSONS_MEMORY, ...LESSONS_TOOLS];

export const lesson = (id: string) => LESSONS.find((l) => l.id === id);
export const lessonForSkill = (skill: string) => LESSONS.find((l) => l.skill === skill);
