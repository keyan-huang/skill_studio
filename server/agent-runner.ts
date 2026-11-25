// Runs the project's own AI agent in a read-only, no-questions mode.
// The agent only sees the text Skill Studio sends; it can't edit files or run commands.

import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import type { AgentId } from '../src/shared/types.ts';
import { agentLabel } from './agents.ts';
import { studioFolder } from './settings.ts';

const TIMEOUT_MS = 180_000;
const MAX_OUTPUT_CHARS = 200_000;

export class AgentProblem extends Error {}

// Read-only options come from each agent's command-line help or documentation
// (checked 2026-11-24). Only GitHub Copilot was available to test.
function commandFor(agent: AgentId, prompt: string): { command: string; args: string[] } {
  switch (agent) {
    case 'copilot':
      return {
        command: 'copilot',
        args: [
          '-p',
          prompt,
          '--silent',
          '--no-color',
          '--no-ask-user',
          '--no-custom-instructions',
          '--disable-builtin-mcps',
          // An empty tool list: the agent can only read the prompt and reply.
          '--available-tools=',
        ],
      };
    case 'claude':
      return {
        command: 'claude',
        args: [
          '-p',
          prompt,
          '--output-format',
          'text',
          '--permission-mode',
          'dontAsk',
          '--disallowedTools',
          'Bash,Edit,Write,MultiEdit,NotebookEdit,WebFetch,WebSearch',
        ],
      };
    case 'codex':
      return { command: 'codex', args: ['exec', '--sandbox', 'read-only', '--skip-git-repo-check', prompt] };
  }
}

/** Sends a prompt to the agent and returns its reply. */
export async function askAgent(agent: AgentId, prompt: string, signal: AbortSignal): Promise<string> {
  // An empty folder, so the agent has no project files or instructions to pick up.
  const room = path.join(studioFolder(), 'agent-room');
  await mkdir(room, { recursive: true });
  const { command, args } = commandFor(agent, prompt);
  const label = agentLabel(agent);

  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd: room, stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    let settled = false;

    const finish = (error: Error | null, value = '') => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      signal.removeEventListener('abort', onAbort);
      if (error) reject(error);
      else resolve(value);
    };
    const stop = () => {
      if (child.exitCode === null) child.kill('SIGTERM');
    };
    const onAbort = () => {
      stop();
      finish(new AgentProblem('Stopped.'));
    };
    const timer = setTimeout(() => {
      stop();
      finish(new AgentProblem(`${label} took too long to answer. Try again, or try a shorter task.`));
    }, TIMEOUT_MS);
    signal.addEventListener('abort', onAbort);

    child.stdout.on('data', (chunk: Buffer) => {
      if (stdout.length < MAX_OUTPUT_CHARS) stdout += chunk.toString('utf8');
    });
    child.stderr.on('data', (chunk: Buffer) => {
      if (stderr.length < 20_000) stderr += chunk.toString('utf8');
    });
    child.on('error', (error: NodeJS.ErrnoException) => {
      finish(
        new AgentProblem(
          error.code === 'ENOENT'
            ? `${label}'s command-line tool isn't installed, so Skill Studio can't ask it.`
            : `Couldn't start ${label}.`,
        ),
      );
    });
    child.on('close', (code) => {
      if (code === 0) {
        finish(null, stdout);
        return;
      }
      console.error(`${command} exited with ${code}:`, stderr.slice(0, 2000));
      finish(new AgentProblem(explainFailure(label, command, stderr)));
    });
  });
}

function explainFailure(label: string, command: string, stderr: string): string {
  if (/log ?in|sign ?in|auth|unauthori[sz]ed|credential|token/i.test(stderr)) {
    return `${label} needs you to sign in. Open a terminal, run ${command}, sign in, then try again.`;
  }
  if (/rate limit|quota|credits|premium request/i.test(stderr)) {
    return `${label} says you've reached your usage limit for now. Try again later.`;
  }
  return `${label} couldn't answer this time. Try again in a moment.`;
}
