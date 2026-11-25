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
  unknown: 'Not known yet',
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

const PLACE_SHORT: Record<Place, string> = {
  project: 'this project',
  personal: 'your personal folder',
};

export function duplicateText(alsoIn: Place[]): string {
  const places = [...new Set(alsoIn)];
  if (places.length === 1 && alsoIn.length === 1) return `Duplicate: also in ${PLACE_SHORT[places[0] ?? 'project']}`;
  return `Duplicate: ${alsoIn.length + 1} copies loaded`;
}
