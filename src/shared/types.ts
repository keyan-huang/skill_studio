// Shapes shared by the local helper (server/) and the browser page (src/).

export type Place = 'project' | 'personal';

export type Source = 'you' | 'team' | 'official' | 'community' | 'unknown';

export interface Job {
  id: string;
  label: string;
}

export interface Skill {
  /** Unique within a project view, e.g. "project:./.github/skills/brand-voice". */
  id: string;
  name: string;
  description: string;
  place: Place;
  /** Where the skill folder lives, shown to the user (home folder as "~"). */
  location: string;
  files: string[];
  /** Number of files left out of `files` when a skill has very many. */
  moreFiles: number;
  /** The full SKILL.md text, shown behind "Show details". */
  raw: string;
  job: Job | null;
  source: Source;
  /** Set when the folder isn't a valid skill (for example, a broken header). */
  problem: string | null;
}

export interface Space {
  place: Place;
  /** Skill folders checked for this place, e.g. ".github/skills". */
  folders: string[];
  skills: Skill[];
}

export interface ProjectView {
  project: {
    name: string;
    location: string;
    isSample: boolean;
  };
  spaces: Space[];
  jobs: Job[];
}
