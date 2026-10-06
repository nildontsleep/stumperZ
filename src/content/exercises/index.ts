import type { CodeExercise } from '../types';
import { BASICS } from './basics';
import { DAY04_05 } from './day04_05';
import { DAY06 } from './day06';
import { DAY07_08 } from './day07_08';
import { DAY09_12 } from './day09_12';

export const EXERCISES: CodeExercise[] = [...BASICS, ...DAY04_05, ...DAY06, ...DAY07_08, ...DAY09_12];

export const exercise = (id: string) => EXERCISES.find((e) => e.id === id);
