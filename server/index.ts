// Skill Studio's local helper: serves the page and reads skill folders.
// It only listens on this computer (127.0.0.1) and never changes any files.

import { spawn } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer as createViteServer } from 'vite';
import type { ProjectView } from '../src/shared/types.ts';
import { PERSONAL_SKILL_FOLDERS, PROJECT_SKILL_FOLDERS, scanSpace, type SkillNotes } from './skills.ts';

const APP_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SAMPLE_ROOT = path.join(APP_ROOT, 'sample-data');
const HOST = '127.0.0.1';
const FIRST_PORT = Number(process.env['PORT'] ?? 5317);

async function sampleProjectView(): Promise<ProjectView> {
  const notesText = await readFile(path.join(SAMPLE_ROOT, 'studio-notes.json'), 'utf8');
  const notes = JSON.parse(notesText) as SkillNotes & { projectName: string };

  const [projectSpace, personalSpace] = await Promise.all([
    scanSpace({
      place: 'project',
      root: path.join(SAMPLE_ROOT, 'sample-project'),
      folders: PROJECT_SKILL_FOLDERS,
      displayRoot: 'sample-project',
      notes,
    }),
    scanSpace({
      place: 'personal',
      root: path.join(SAMPLE_ROOT, 'sample-personal'),
      folders: PERSONAL_SKILL_FOLDERS,
      displayRoot: 'sample-personal',
      notes,
    }),
  ]);

  return {
    project: { name: notes.projectName, location: 'sample-data/sample-project', isSample: true },
    spaces: [projectSpace, personalSpace],
    jobs: notes.jobs,
  };
}

function sendJson(res: http.ServerResponse, status: number, body: unknown): void {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(body));
}

// Blocks other websites from talking to the helper through the browser.
function isLocalHost(hostHeader: string | undefined, port: number): boolean {
  return hostHeader === `localhost:${port}` || hostHeader === `${HOST}:${port}`;
}

async function handleApi(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
  const url = new URL(req.url ?? '/', 'http://localhost');
  if (req.method === 'GET' && url.pathname === '/api/project') {
    sendJson(res, 200, await sampleProjectView());
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
      handleApi(req, res).catch((error: unknown) => {
        console.error(error);
        sendJson(res, 500, { error: 'Something went wrong while reading skills.' });
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
