import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export type { ClassValue };

/** Joins class values and resolves Tailwind conflicts: the last utility wins (`cn('p-2', 'p-4')` -> `p-4`). */
export function cn(...inputs: ClassValue[]): string {
	return twMerge(clsx(inputs));
}
