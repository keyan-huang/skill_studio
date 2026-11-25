// Skill Studio's own private settings, kept on this computer only.

import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import type { AgentId, RecentProject } from '../src/shared/types.ts';

const MAX_RECENT = 8;

interface Settings {
  recent: RecentProject[];
  /** The agent the user picked, per project path. */
  agentChoice: Record<string, AgentId>;
  /** Projects where the user said "Don't ask again" before AI actions. Keyed by path, or "sample". */
  aiApproved: Record<string, boolean>;
}

export function studioFolder(): string {
  return process.env['SKILL_STUDIO_HOME'] ?? path.join(os.homedir(), '.skill-studio');
}

function settingsFile(): string {
  return path.join(studioFolder(), 'settings.json');
}

export async function readSettings(): Promise<Settings> {
  try {
    const data = JSON.parse(await readFile(settingsFile(), 'utf8')) as Partial<Settings>;
    return {
      recent: Array.isArray(data.recent) ? data.recent : [],
      agentChoice: typeof data.agentChoice === 'object' && data.agentChoice !== null ? data.agentChoice : {},
      aiApproved: typeof data.aiApproved === 'object' && data.aiApproved !== null ? data.aiApproved : {},
    };
  } catch {
    return { recent: [], agentChoice: {}, aiApproved: {} };
  }
}

async function writeSettings(settings: Settings): Promise<void> {
  await mkdir(studioFolder(), { recursive: true });
  // Write to a temporary file first so a crash never leaves a half-written file.
  const temp = `${settingsFile()}.tmp`;
  await writeFile(temp, `${JSON.stringify(settings, null, 2)}\n`, 'utf8');
  await rename(temp, settingsFile());
}

export async function rememberProject(project: Omit<RecentProject, 'lastOpened'>): Promise<void> {
  const settings = await readSettings();
  const others = settings.recent.filter((entry) => entry.path !== project.path);
  settings.recent = [{ ...project, lastOpened: new Date().toISOString() }, ...others].slice(0, MAX_RECENT);
  await writeSettings(settings);
}

export async function forgetProject(projectPath: string): Promise<void> {
  const settings = await readSettings();
  settings.recent = settings.recent.filter((entry) => entry.path !== projectPath);
  await writeSettings(settings);
}

export async function saveAgentChoice(projectPath: string, agent: AgentId): Promise<void> {
  const settings = await readSettings();
  settings.agentChoice[projectPath] = agent;
  await writeSettings(settings);
}

export async function setAiApproval(key: string, approved: boolean): Promise<void> {
  const settings = await readSettings();
  if (approved) settings.aiApproved[key] = true;
  else delete settings.aiApproved[key];
  await writeSettings(settings);
}
