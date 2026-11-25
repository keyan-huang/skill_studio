import type { Job, Place, Source } from './shared/types.ts';

export const PLACE_LABEL: Record<Place, string> = {
  project: 'In this project',
  personal: 'From your personal folder',
};

export const PLACE_NOTE: Record<Place, string> = {
  project: 'Only loads when this project is open.',
  personal: 'Loads in all your projects.',
};

export const SOURCE_LABEL: Record<Source, string> = {
  you: 'Made by you',
  team: 'Your team',
  official: 'Official',
  community: 'Community',
  unknown: 'Source unknown',
};

// Channel colors, tuned for the dark console. Always shown with a text label.
const JOB_COLORS = ['#7DB3FF', '#F4B860', '#74D3AE', '#E59BD8', '#C3A6FF', '#6FD6E6', '#D9C38A', '#FF9C85'];
export const NO_JOB_COLOR = '#8A93A3';

export function jobColor(job: Job | null, jobs: Job[]): string {
  if (!job) return NO_JOB_COLOR;
  const index = jobs.findIndex((candidate) => candidate.id === job.id);
  return index < 0 ? NO_JOB_COLOR : (JOB_COLORS[index % JOB_COLORS.length] ?? NO_JOB_COLOR);
}

export function plural(count: number, one: string, many = `${one}s`): string {
  return `${count} ${count === 1 ? one : many}`;
}
