import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { parse as parseYaml } from 'yaml';
import type { Job, Place, Skill, Source, Space } from '../src/shared/types.ts';

/** Skill folders VS Code reads inside a project. */
export const PROJECT_SKILL_FOLDERS = ['.github/skills', '.claude/skills', '.agents/skills'];

/** Skill folders VS Code reads in the user's home folder. */
export const PERSONAL_SKILL_FOLDERS = ['.copilot/skills', '.claude/skills', '.agents/skills'];

const MAX_FILES_LISTED = 50;
const MAX_RAW_CHARS = 200_000;

export interface SkillNotes {
  jobs: Job[];
  skills: Record<string, { jobs?: string[]; source?: Source }>;
}

interface ScanOptions {
  place: Place;
  /** The folder the skill folders are relative to (project root or home). */
  root: string;
  folders: string[];
  /** How `root` is shown to the user, e.g. "~" for the home folder. */
  displayRoot: string;
  notes?: SkillNotes | undefined;
}

export async function scanSpace(options: ScanOptions): Promise<Space> {
  const { place, root, folders, displayRoot, notes } = options;
  const skills: Skill[] = [];

  for (const folder of folders) {
    const base = path.join(root, folder);
    let entries;
    try {
      entries = await readdir(base, { withFileTypes: true });
    } catch {
      continue; // Most people only have some of these folders.
    }

    for (const entry of entries) {
      if (!entry.isDirectory() || entry.name.startsWith('.')) continue;
      const skillDir = path.join(base, entry.name);
      const skillFile = path.join(skillDir, 'SKILL.md');
      if (!(await isFile(skillFile))) continue;

      const location = `${displayRoot}/${folder}/${entry.name}`;
      skills.push(await readSkill({ skillDir, skillFile, folderName: entry.name, place, location, notes }));
    }
  }

  skills.sort((a, b) => a.name.localeCompare(b.name));
  return { place, folders, skills };
}

async function readSkill(args: {
  skillDir: string;
  skillFile: string;
  folderName: string;
  place: Place;
  location: string;
  notes?: SkillNotes | undefined;
}): Promise<Skill> {
  const { skillDir, skillFile, folderName, place, location, notes } = args;
  const text = await readFile(skillFile, 'utf8');
  const header = readHeader(text);
  const name = header.name ?? folderName;
  const { files, more } = await listFiles(skillDir);
  const note = notes?.skills[name];
  const jobId = note?.jobs?.[0];

  return {
    id: `${place}:${location}`,
    name,
    description: header.description ?? '',
    place,
    location,
    files,
    moreFiles: more,
    raw: text.length > MAX_RAW_CHARS ? `${text.slice(0, MAX_RAW_CHARS)}\n…` : text,
    job: notes?.jobs.find((job) => job.id === jobId) ?? null,
    source: note?.source ?? 'unknown',
    problem: header.problem,
  };
}

/** Reads the YAML header ("frontmatter") at the top of a SKILL.md file. */
export function readHeader(text: string): { name?: string; description?: string; problem: string | null } {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\s*(?:\r?\n|$)/.exec(text);
  if (!match) {
    return { problem: 'This skill is missing its header (the name and description at the top).' };
  }
  try {
    const data: unknown = parseYaml(match[1] ?? '');
    const record = typeof data === 'object' && data !== null ? (data as Record<string, unknown>) : {};
    const name = typeof record['name'] === 'string' ? record['name'] : undefined;
    const description = typeof record['description'] === 'string' ? record['description'].trim() : undefined;
    const problem = !name ? 'This skill has no name.' : !description ? 'This skill has no description.' : null;
    return {
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
      problem,
    };
  } catch {
    return { problem: "This skill's header couldn't be read. It may have a typo." };
  }
}

async function listFiles(dir: string): Promise<{ files: string[]; more: number }> {
  const files: string[] = [];
  let total = 0;

  async function walk(current: string): Promise<void> {
    const entries = await readdir(current, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name.startsWith('.')) continue;
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        await walk(full);
      } else if (entry.isFile()) {
        total += 1;
        if (files.length < MAX_FILES_LISTED) files.push(path.relative(dir, full).split(path.sep).join('/'));
      }
    }
  }

  await walk(dir);
  files.sort((a, b) => (a === 'SKILL.md' ? -1 : b === 'SKILL.md' ? 1 : a.localeCompare(b)));
  return { files, more: total - files.length };
}

async function isFile(filePath: string): Promise<boolean> {
  try {
    return (await stat(filePath)).isFile();
  } catch {
    return false;
  }
}
