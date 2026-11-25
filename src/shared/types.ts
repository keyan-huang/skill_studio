// Shapes shared by the local helper (server/) and the browser page (src/).

export type Place = 'project' | 'personal';

export type Source = 'you' | 'team' | 'official' | 'community' | 'unknown';

export type AgentId = 'copilot' | 'claude' | 'codex';

export interface Job {
  id: string;
  label: string;
}

export interface Skill {
  /** Unique within a project view, e.g. "project:~/app/.github/skills/brand-voice". */
  id: string;
  name: string;
  description: string;
  place: Place;
  /** The skill folder it sits in, relative to the project or home, e.g. ".github/skills". */
  folder: string;
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
  /** False when the connected agent doesn't read this skill's folder. */
  loaded: boolean;
  /** Other places where a skill with the same name is loaded. */
  alsoIn: Place[];
}

export interface SkillFolder {
  /** Relative to the project or home, e.g. ".copilot/skills". */
  folder: string;
  /** Shown to the user, e.g. "~/.copilot/skills". */
  display: string;
  exists: boolean;
  readBy: AgentId[];
}

export interface Space {
  place: Place;
  folders: SkillFolder[];
  skills: Skill[];
}

export interface AgentInfo {
  id: AgentId;
  label: string;
  /** Whether the agent's command-line tool is installed on this computer. */
  installed: boolean;
  /** Plain-language clues, written to follow "Skill Studio found X: ", e.g. "the project has .github/skills". */
  clues: string[];
  /** True when the project folder itself has clues for this agent. */
  projectClues: boolean;
}

export interface AgentState {
  /** Agents with any clue or an installed tool, best match first. */
  detected: AgentInfo[];
  selected: AgentId | null;
  /** True when the user picked the agent rather than Skill Studio suggesting it. */
  chosenByUser: boolean;
  /** True when several agents have clues in the project and the user hasn't picked one. */
  needsChoice: boolean;
}

export interface ProjectView {
  project: {
    name: string;
    /** Absolute path, used to reconnect. Empty for the sample. */
    path: string;
    /** Shown to the user (home folder as "~"). */
    location: string;
    isSample: boolean;
  };
  spaces: Space[];
  jobs: Job[];
  agents: AgentState;
}

export interface RecentProject {
  name: string;
  path: string;
  location: string;
  lastOpened: string;
}

export interface FolderEntry {
  name: string;
  path: string;
  /** Has a .git folder, skill folders, or agent instruction files. */
  looksLikeProject: boolean;
}

export interface FolderListing {
  path: string;
  location: string;
  parent: string | null;
  folders: FolderEntry[];
  /** Set when the folder has more subfolders than are listed. */
  truncated: boolean;
}

export interface StartInfo {
  recent: RecentProject[];
  lastProject: string | null;
  home: string;
}

export interface ProjectChoice {
  name: string;
  path: string;
  location: string;
}

export interface ProjectGroup {
  /** Shown to the user, e.g. "~/Documents/Projects" or "Recent". */
  label: string;
  projects: ProjectChoice[];
}

export interface ApiError {
  error: string;
}
