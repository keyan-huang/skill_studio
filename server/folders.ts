import { readdir, stat } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import type { FolderEntry, FolderListing, ProjectGroup, RecentProject } from '../src/shared/types.ts';

const MAX_FOLDERS = 400;
const SKIPPED = new Set(['node_modules', 'Library', 'Applications', '$RECYCLE.BIN', 'System Volume Information']);
const PROJECT_MARKERS = ['.git', '.github', '.claude', '.agents', 'AGENTS.md', 'CLAUDE.md', 'package.json'];

/** Shows a path with the home folder as "~", so it's shorter and friendlier. */
export function displayPath(absolute: string): string {
  const home = os.homedir();
  if (absolute === home) return '~';
  return absolute.startsWith(home + path.sep) ? `~/${path.relative(home, absolute).split(path.sep).join('/')}` : absolute;
}

/** Turns what the user typed or pasted into a full path. */
export function resolveUserPath(input: string): string {
  let value = input.trim().replace(/^["']|["']$/g, '');
  if (value.startsWith('file://')) value = decodeURIComponent(new URL(value).pathname);
  if (value === '~') return os.homedir();
  if (value.startsWith('~/') || value.startsWith('~\\')) value = path.join(os.homedir(), value.slice(2));
  return path.resolve(value);
}

export class FolderProblem extends Error {}

export async function assertFolder(absolute: string): Promise<void> {
  let info;
  try {
    info = await stat(absolute);
  } catch {
    throw new FolderProblem(`Couldn't find ${displayPath(absolute)}. It may have been moved, renamed, or deleted.`);
  }
  if (!info.isDirectory()) {
    throw new FolderProblem(`${displayPath(absolute)} is a file, not a folder. Pick the folder that contains it.`);
  }
}

/** Lists the visible subfolders of a folder, for the in-app folder browser. Reads only. */
export async function listFolders(absolute: string): Promise<FolderListing> {
  await assertFolder(absolute);
  let entries;
  try {
    entries = await readdir(absolute, { withFileTypes: true });
  } catch {
    throw new FolderProblem(`Skill Studio isn't allowed to open ${displayPath(absolute)}.`);
  }

  const names = entries
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith('.') && !SKIPPED.has(entry.name))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));

  const folders: FolderEntry[] = await Promise.all(
    names.slice(0, MAX_FOLDERS).map(async (name) => {
      const full = path.join(absolute, name);
      return { name, path: full, looksLikeProject: await looksLikeProject(full) };
    }),
  );

  const parent = path.dirname(absolute);
  return {
    path: absolute,
    location: displayPath(absolute),
    parent: parent === absolute ? null : parent,
    folders,
    truncated: names.length > MAX_FOLDERS,
  };
}

async function looksLikeProject(folder: string): Promise<boolean> {
  for (const marker of PROJECT_MARKERS) {
    try {
      await stat(path.join(folder, marker));
      return true;
    } catch {
      // Keep checking the other markers.
    }
  }
  return false;
}

/**
 * The user's projects for the header's project picker: every project-looking
 * folder next to the open project and next to recent projects (for example,
 * everything in ~/Documents/Projects), plus recent projects kept elsewhere.
 */
export async function listProjectGroups(current: string | null, recent: RecentProject[]): Promise<ProjectGroup[]> {
  const parents = [...new Set([current, ...recent.map((entry) => entry.path)].filter(Boolean).map((p) => path.dirname(p as string)))];
  const groups: ProjectGroup[] = [];
  const listed = new Set<string>();

  for (const parent of parents) {
    try {
      const listing = await listFolders(parent);
      const projects = listing.folders
        .filter((folder) => folder.looksLikeProject || folder.path === current)
        .map((folder) => ({ name: folder.name, path: folder.path, location: displayPath(folder.path) }));
      projects.forEach((project) => listed.add(project.path));
      if (projects.length > 0) groups.push({ label: listing.location, projects });
    } catch {
      // The folder was moved or can't be read; skip it.
    }
  }

  const others = recent
    .filter((entry) => !listed.has(entry.path))
    .map(({ name, path: entryPath, location }) => ({ name, path: entryPath, location }));
  if (others.length > 0) groups.push({ label: 'Recent', projects: others });

  return groups;
}
