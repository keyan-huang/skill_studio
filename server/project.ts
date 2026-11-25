import path from 'node:path';
import type { AgentId, Place, ProjectView, Space } from '../src/shared/types.ts';
import { ALL_PERSONAL_SKILL_FOLDERS, ALL_PROJECT_SKILL_FOLDERS, detectAgents, skillFoldersFor } from './agents.ts';
import { scanSpace, type SkillNotes } from './skills.ts';

interface BuildArgs {
  name: string;
  /** The project folder. */
  root: string;
  /** The folder treated as home (the real home folder, or the sample's). */
  home: string;
  /** How `root` and `home` are shown to the user. */
  displayRoot: string;
  displayHome: string;
  isSample: boolean;
  notes?: SkillNotes | undefined;
  savedAgent?: AgentId | undefined;
}

/**
 * Everything loaded for a project: skills in the project's own skill folders
 * and, automatically, in the personal skill folders, since those load in
 * every project. Reads only.
 */
export async function buildProjectView(args: BuildArgs): Promise<ProjectView> {
  const { name, root, home, displayRoot, displayHome, isSample, notes, savedAgent } = args;

  const [projectSpace, personalSpace, agents] = await Promise.all([
    scanSpace({ place: 'project', root, folders: ALL_PROJECT_SKILL_FOLDERS, displayRoot, notes }),
    scanSpace({ place: 'personal', root: home, folders: ALL_PERSONAL_SKILL_FOLDERS, displayRoot: displayHome, notes }),
    detectAgents({ projectRoot: root, home, savedChoice: savedAgent }),
  ]);

  const spaces = [projectSpace, personalSpace];
  markLoaded(spaces, agents.selected);
  markDuplicates(spaces);

  return {
    project: { name, path: isSample ? '' : root, location: displayRoot, isSample },
    spaces,
    jobs: notes?.jobs ?? [],
    agents,
  };
}

export function projectName(root: string): string {
  return path.basename(root) || root;
}

function markLoaded(spaces: Space[], agent: AgentId | null): void {
  for (const space of spaces) {
    const folders = skillFoldersFor(agent, space.place);
    for (const skill of space.skills) {
      skill.loaded = folders === null || folders.includes(skill.folder);
    }
  }
}

/** Flags skills with the same name loaded in more than one folder. */
function markDuplicates(spaces: Space[]): void {
  const placesByName = new Map<string, Place[]>();
  for (const space of spaces) {
    for (const skill of space.skills) {
      if (!skill.loaded) continue;
      placesByName.set(skill.name, [...(placesByName.get(skill.name) ?? []), space.place]);
    }
  }
  for (const space of spaces) {
    for (const skill of space.skills) {
      if (!skill.loaded) continue;
      const places = [...(placesByName.get(skill.name) ?? [])];
      places.splice(places.indexOf(space.place), 1);
      skill.alsoIn = places;
    }
  }
}
