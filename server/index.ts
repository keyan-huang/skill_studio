// Skill Studio's local helper: serves the page and reads skill folders.
// It only listens on this computer (127.0.0.1) and never changes any files.

import { spawn } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer as createViteServer } from 'vite';
import type { AgentId, ProjectView, StartInfo } from '../src/shared/types.ts';
import { AGENTS, skillFoldersFor } from './agents.ts';
import { CatalogProblem, downloadSkill, isValidSkillName, loadCatalog, NameTaken, previewSkill } from './catalog.ts';
import { assertFolder, displayPath, FolderProblem, listFolders, listProjectGroups, resolveUserPath } from './folders.ts';
import { buildProjectView, projectName } from './project.ts';
import { forgetProject, readSettings, rememberProject, saveAgentChoice, setAiApproval } from './settings.ts';
import { AgentProblem, askAgent } from './agent-runner.ts';
import { comparePrompt, mixPrompt, readCompare, readMix } from './ai.ts';
import type { SkillNotes } from './skills.ts';

const APP_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SAMPLE_ROOT = path.join(APP_ROOT, 'sample-data');
const HOST = '127.0.0.1';
const FIRST_PORT = Number(process.env['PORT'] ?? 5317);
const MAX_BODY_BYTES = 64 * 1024;

class RequestProblem extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function sampleProjectView(agent: AgentId | undefined): Promise<ProjectView> {
  const notesText = await readFile(path.join(SAMPLE_ROOT, 'studio-notes.json'), 'utf8');
  const notes = JSON.parse(notesText) as SkillNotes & { projectName: string };
  return buildProjectView({
    name: notes.projectName,
    root: path.join(SAMPLE_ROOT, 'sample-project'),
    home: path.join(SAMPLE_ROOT, 'sample-personal'),
    displayRoot: 'sample-project',
    displayHome: 'sample-personal',
    isSample: true,
    notes,
    savedAgent: agent,
  });
}

async function realProjectView(root: string, agent: AgentId | undefined): Promise<ProjectView> {
  await assertFolder(root);
  if (agent) await saveAgentChoice(root, agent);
  const settings = await readSettings();
  return buildProjectView({
    name: projectName(root),
    root,
    home: os.homedir(),
    displayRoot: displayPath(root),
    displayHome: '~',
    isSample: false,
    savedAgent: settings.agentChoice[root],
  });
}

type Target = { sample: true } | { path: string };

function readTarget(body: Record<string, unknown>): Target {
  if (body['sample'] === true) return { sample: true };
  if (typeof body['path'] !== 'string' || body['path'].trim() === '') {
    throw new RequestProblem(400, 'Choose a project folder first.');
  }
  return { path: resolveUserPath(body['path']) };
}

function approvalKey(target: Target): string {
  return 'sample' in target ? 'sample' : target.path;
}

async function viewFor(target: Target, agent?: AgentId): Promise<ProjectView> {
  const view = 'sample' in target ? await sampleProjectView(agent) : await realProjectView(target.path, agent);
  view.aiApproved = (await readSettings()).aiApproved[approvalKey(target)] === true;
  return view;
}

/** AI actions only run for connected projects, and only after the user approved. */
async function checkAiRequest(target: Target, body: Record<string, unknown>): Promise<void> {
  const settings = await readSettings();
  if ('path' in target && !settings.recent.some((entry) => entry.path === target.path)) {
    throw new RequestProblem(403, 'Connect this project in Skill Studio first.');
  }
  const key = approvalKey(target);
  if (body['approved'] === true) {
    if (body['remember'] === true) await setAiApproval(key, true);
    return;
  }
  if (!settings.aiApproved[key]) throw new RequestProblem(428, 'Approve sending this to the agent first.');
}

function agentFor(view: ProjectView) {
  const agent = view.agents.detected.find((candidate) => candidate.id === view.agents.selected);
  if (!agent) throw new RequestProblem(409, 'No AI agent found for this project. Install GitHub Copilot, Claude Code, or Codex.');
  if (!agent.installed) {
    throw new RequestProblem(409, `${agent.label}'s command-line tool isn't installed, so Skill Studio can't ask it.`);
  }
  return agent;
}

/** Stops the agent if the person cancels or closes the page. */
function abortOnClose(res: http.ServerResponse): AbortSignal {
  const controller = new AbortController();
  res.on('close', () => {
    if (!res.writableEnded) controller.abort();
  });
  return controller.signal;
}

function sendJson(res: http.ServerResponse, status: number, body: unknown): void {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(body));
}

// Blocks other websites from talking to the helper through the browser.
function isLocalHost(hostHeader: string | undefined, port: number): boolean {
  return hostHeader === `localhost:${port}` || hostHeader === `${HOST}:${port}`;
}

function isLocalOrigin(origin: string | undefined, port: number): boolean {
  return origin === undefined || origin === `http://localhost:${port}` || origin === `http://${HOST}:${port}`;
}

async function readJsonBody(req: http.IncomingMessage): Promise<Record<string, unknown>> {
  if (!req.headers['content-type']?.startsWith('application/json')) {
    throw new RequestProblem(415, 'Expected JSON.');
  }
  let size = 0;
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    size += (chunk as Buffer).length;
    if (size > MAX_BODY_BYTES) throw new RequestProblem(413, 'Request is too large.');
    chunks.push(chunk as Buffer);
  }
  try {
    const data: unknown = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
    if (typeof data !== 'object' || data === null) throw new Error('not an object');
    return data as Record<string, unknown>;
  } catch {
    throw new RequestProblem(400, 'Request body is not valid JSON.');
  }
}

function readAgent(value: unknown): AgentId | undefined {
  return AGENTS.some((agent) => agent.id === value) ? (value as AgentId) : undefined;
}

async function handleApi(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
  const url = new URL(req.url ?? '/', 'http://localhost');
  const route = `${req.method} ${url.pathname}`;

  if (route === 'GET /api/start') {
    const settings = await readSettings();
    const info: StartInfo = {
      recent: settings.recent,
      lastProject: settings.recent[0]?.path ?? null,
      home: os.homedir(),
    };
    sendJson(res, 200, info);
    return;
  }

  if (route === 'GET /api/projects') {
    const current = url.searchParams.get('current');
    const settings = await readSettings();
    sendJson(res, 200, await listProjectGroups(current ? resolveUserPath(current) : null, settings.recent));
    return;
  }

  if (route === 'GET /api/folders') {
    const requested = url.searchParams.get('path');
    sendJson(res, 200, await listFolders(requested ? resolveUserPath(requested) : os.homedir()));
    return;
  }

  if (route === 'POST /api/connect') {
    const body = await readJsonBody(req);
    const agent = readAgent(body['agent']);
    const target = readTarget(body);
    const view = await viewFor(target, agent);
    if ('path' in target) {
      await rememberProject({ name: view.project.name, path: target.path, location: view.project.location });
    }
    sendJson(res, 200, view);
    return;
  }

  if (route === 'GET /api/catalog') {
    sendJson(res, 200, await loadCatalog(url.searchParams.get('refresh') === '1'));
    return;
  }

  if (route === 'GET /api/catalog/skill') {
    sendJson(res, 200, await previewSkill(url.searchParams.get('id') ?? ''));
    return;
  }

  if (route === 'POST /api/download') {
    const body = await readJsonBody(req);
    const projectPath = typeof body['projectPath'] === 'string' ? body['projectPath'] : '';
    const settings = await readSettings();
    if (!settings.recent.some((entry) => entry.path === projectPath)) {
      throw new RequestProblem(403, 'Connect this project in Skill Studio before downloading into it.');
    }
    const newName = typeof body['newName'] === 'string' ? body['newName'].trim() : undefined;
    if (newName !== undefined && !isValidSkillName(newName)) {
      throw new RequestProblem(400, 'Use only lowercase letters, numbers, and hyphens, up to 64 characters.');
    }
    const folder = skillFoldersFor(readAgent(body['agent']) ?? 'copilot', 'project')?.[0] ?? '.github/skills';
    const result = await downloadSkill({
      id: typeof body['id'] === 'string' ? body['id'] : '',
      skillsFolder: path.join(projectPath, folder),
      newName,
    });
    sendJson(res, 200, { name: result.name, location: displayPath(result.folder) });
    return;
  }

  if (route === 'POST /api/ai/compare') {
    const body = await readJsonBody(req);
    const target = readTarget(body);
    await checkAiRequest(target, body);
    const view = await viewFor(target);
    const agent = agentFor(view);
    const skills = view.spaces.flatMap((space) => space.skills);
    const a = skills.find((skill) => skill.id === body['a']);
    const b = skills.find((skill) => skill.id === body['b']);
    if (!a || !b) throw new RequestProblem(404, "Couldn't find one of those skills. Click Check again and retry.");
    if (a.id === b.id) throw new RequestProblem(400, 'Pick two different skills to compare.');
    const output = await askAgent(agent.id, comparePrompt(a, b), abortOnClose(res));
    sendJson(res, 200, readCompare(output, a, b, agent.label));
    return;
  }

  if (route === 'POST /api/ai/mix') {
    const body = await readJsonBody(req);
    const target = readTarget(body);
    const task = typeof body['task'] === 'string' ? body['task'].trim() : '';
    if (!task) throw new RequestProblem(400, 'Describe the task first.');
    if (task.length > 2000) throw new RequestProblem(400, 'Keep the task under 2,000 characters.');
    await checkAiRequest(target, body);
    const view = await viewFor(target);
    const agent = agentFor(view);
    const loaded = view.spaces.flatMap((space) => space.skills).filter((skill) => skill.loaded);
    if (loaded.length === 0) throw new RequestProblem(400, 'This project has no loaded skills to combine yet.');
    // Same name in two places: keep one entry, preferring the project's copy.
    const unique = loaded.filter((skill, index) => loaded.findIndex((other) => other.name === skill.name) === index);
    const output = await askAgent(agent.id, mixPrompt(task, unique), abortOnClose(res));
    sendJson(res, 200, readMix(output, task, unique, agent.label));
    return;
  }

  if (route === 'POST /api/ai/approval') {
    const body = await readJsonBody(req);
    await setAiApproval(approvalKey(readTarget(body)), body['approved'] === true);
    sendJson(res, 200, { ok: true });
    return;
  }

  if (route === 'POST /api/forget') {
    const body = await readJsonBody(req);
    if (typeof body['path'] === 'string') await forgetProject(body['path']);
    sendJson(res, 200, { ok: true });
    return;
  }

  sendJson(res, 404, { error: 'Not found' });
}

function listen(server: http.Server, port: number, attemptsLeft = 10): Promise<number> {
  return new Promise((resolve, reject) => {
    const onError = (error: NodeJS.ErrnoException) => {
      server.off('listening', onListening);
      if (error.code === 'EADDRINUSE' && attemptsLeft > 0) {
        resolve(listen(server, port + 1, attemptsLeft - 1));
      } else {
        reject(error);
      }
    };
    const onListening = () => {
      server.off('error', onError);
      resolve(port);
    };
    server.once('error', onError);
    server.once('listening', onListening);
    server.listen(port, HOST);
  });
}

function openBrowser(url: string): void {
  if (process.env['SKILL_STUDIO_NO_OPEN']) return;
  const command = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'explorer' : 'xdg-open';
  spawn(command, [url], { stdio: 'ignore', detached: true }).on('error', () => {}).unref();
}

async function main(): Promise<void> {
  let port = FIRST_PORT;
  const server = http.createServer();
  const vite = await createViteServer({
    root: APP_ROOT,
    appType: 'spa',
    server: { middlewareMode: true, hmr: { server } },
  });

  server.on('request', (req, res) => {
    if (!isLocalHost(req.headers.host, port)) {
      res.writeHead(403).end('Skill Studio only accepts requests from this computer.');
      return;
    }
    if (req.url?.startsWith('/api/')) {
      if (req.method !== 'GET' && !isLocalOrigin(req.headers.origin, port)) {
        sendJson(res, 403, { error: 'Skill Studio only accepts requests from its own page.' });
        return;
      }
      handleApi(req, res).catch((error: unknown) => {
        if (error instanceof FolderProblem) {
          sendJson(res, 404, { error: error.message });
        } else if (error instanceof NameTaken) {
          sendJson(res, 409, { error: error.message, suggestion: error.suggestion });
        } else if (error instanceof CatalogProblem || error instanceof AgentProblem) {
          if (!res.writableEnded && !res.destroyed) sendJson(res, 502, { error: error.message });
        } else if (error instanceof RequestProblem) {
          sendJson(res, error.status, { error: error.message });
        } else {
          console.error(error);
          sendJson(res, 500, { error: 'Something went wrong while reading skills.' });
        }
      });
      return;
    }
    vite.middlewares(req, res);
  });

  port = await listen(server, FIRST_PORT);
  const url = `http://localhost:${port}`;
  console.log(`\n  Skill Studio is running at ${url}\n  Press Ctrl+C to stop.\n`);
  openBrowser(url);
}

main().catch((error: unknown) => {
  console.error('Skill Studio could not start:', error);
  process.exit(1);
});
