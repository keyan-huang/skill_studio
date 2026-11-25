import { access, constants, stat } from 'node:fs/promises';
import path from 'node:path';
import type { AgentId, AgentInfo, AgentState } from '../src/shared/types.ts';

interface AgentDefinition {
  id: AgentId;
  label: string;
  /** Command-line tool Skill Studio would use to talk to the agent (step 5). */
  command: string;
  /** Files or folders in a project that suggest this agent. */
  projectClues: string[];
  /** Folders in the home folder that suggest this agent. */
  personalClues: string[];
  /** Skill folders the agent reads, relative to the project and to home. */
  projectSkillFolders: string[];
  personalSkillFolders: string[];
}

// Skill folders per agent come from each agent's documentation (checked
// 2026-11-24). Re-check them when building new steps; they change often.
export const AGENTS: AgentDefinition[] = [
  {
    id: 'copilot',
    label: 'GitHub Copilot',
    command: 'copilot',
    projectClues: [
      '.github/skills',
      '.github/copilot-instructions.md',
      '.github/agents',
      '.github/instructions',
      '.github/prompts',
    ],
    personalClues: ['.copilot'],
    projectSkillFolders: ['.github/skills', '.claude/skills', '.agents/skills'],
    personalSkillFolders: ['.copilot/skills', '.agents/skills'],
  },
  {
    id: 'claude',
    label: 'Claude Code',
    command: 'claude',
    projectClues: ['.claude', 'CLAUDE.md'],
    personalClues: ['.claude'],
    projectSkillFolders: ['.claude/skills'],
    personalSkillFolders: ['.claude/skills'],
  },
  {
    id: 'codex',
    label: 'Codex',
    command: 'codex',
    projectClues: ['.agents', '.codex'],
    personalClues: ['.codex', '.agents'],
    projectSkillFolders: ['.agents/skills'],
    personalSkillFolders: ['.agents/skills'],
  },
];

/** Every skill folder any supported agent reads, in a stable order. */
export const ALL_PROJECT_SKILL_FOLDERS = unique(AGENTS.flatMap((agent) => agent.projectSkillFolders));
export const ALL_PERSONAL_SKILL_FOLDERS = unique(AGENTS.flatMap((agent) => agent.personalSkillFolders));

export function agentLabel(id: AgentId): string {
  return AGENTS.find((agent) => agent.id === id)?.label ?? id;
}

export function agentsReading(place: 'project' | 'personal', folder: string): AgentId[] {
  return AGENTS.filter((agent) =>
    (place === 'project' ? agent.projectSkillFolders : agent.personalSkillFolders).includes(folder),
  ).map((agent) => agent.id);
}

/**
 * Works out which AI agents a project uses, from clues in the project folder,
 * the home folder, and which agent tools are installed. Reads only; nothing is
 * sent to any agent.
 */
export async function detectAgents(args: {
  projectRoot: string;
  home: string;
  savedChoice: AgentId | undefined;
}): Promise<AgentState> {
  const { projectRoot, home, savedChoice } = args;
  const scored: { info: AgentInfo; score: number }[] = [];

  for (const agent of AGENTS) {
    const clues: string[] = [];
    let score = 0;
    let projectClues = false;

    for (const clue of agent.projectClues) {
      if (await exists(path.join(projectRoot, clue))) {
        clues.push(`the project has ${clue}`);
        projectClues = true;
        score += 3;
      }
    }
    for (const clue of agent.personalClues) {
      if (await exists(path.join(home, clue))) {
        clues.push(`your home folder has ~/${clue}`);
        score += 1;
      }
    }
    const installed = await isInstalled(agent.command);
    if (installed) {
      clues.push(`the ${agent.command} tool is installed`);
      score += 2;
    }

    if (score > 0) {
      scored.push({ info: { id: agent.id, label: agent.label, installed, clues, projectClues }, score });
    }
  }

  scored.sort((a, b) => b.score - a.score);
  const detected = scored.map((entry) => entry.info);
  const saved = savedChoice && detected.some((agent) => agent.id === savedChoice) ? savedChoice : undefined;
  const withProjectClues = detected.filter((agent) => agent.projectClues).length;

  return {
    detected,
    selected: saved ?? detected[0]?.id ?? null,
    chosenByUser: saved !== undefined,
    needsChoice: saved === undefined && withProjectClues > 1,
  };
}

export function skillFoldersFor(agentId: AgentId | null, place: 'project' | 'personal'): string[] | null {
  if (!agentId) return null;
  const agent = AGENTS.find((candidate) => candidate.id === agentId);
  if (!agent) return null;
  return place === 'project' ? agent.projectSkillFolders : agent.personalSkillFolders;
}

async function isInstalled(command: string): Promise<boolean> {
  const dirs = (process.env['PATH'] ?? '').split(path.delimiter).filter(Boolean);
  const names = process.platform === 'win32' ? [`${command}.exe`, `${command}.cmd`, `${command}.bat`] : [command];
  for (const dir of dirs) {
    for (const name of names) {
      try {
        const full = path.join(dir, name);
        if ((await stat(full)).isFile()) {
          if (process.platform !== 'win32') await access(full, constants.X_OK);
          return true;
        }
      } catch {
        // Not in this folder; keep looking.
      }
    }
  }
  return false;
}

async function exists(target: string): Promise<boolean> {
  try {
    await stat(target);
    return true;
  } catch {
    return false;
  }
}

function unique(values: string[]): string[] {
  return [...new Set(values)];
}
