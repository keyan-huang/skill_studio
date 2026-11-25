// Public skill catalogs on GitHub: search list, preview, and download.

import { randomBytes } from 'node:crypto';
import { mkdir, readFile, rename, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { CatalogEntry, CatalogFile, CatalogList, CatalogPreview, Source } from '../src/shared/types.ts';
import { studioFolder } from './settings.ts';
import { readHeader } from './skills.ts';

interface CatalogDefinition {
  id: string;
  label: string;
  owner: string;
  repo: string;
  branch: string;
  skillsDir: string;
  source: Source;
  /** License of the whole collection, used when a skill has no license of its own. */
  repoLicense: string | null;
  /** A file that lists every skill with its description, if the catalog has one. */
  indexFile?: string;
}

export const CATALOGS: CatalogDefinition[] = [
  {
    id: 'awesome-copilot',
    label: 'Awesome Copilot',
    owner: 'github',
    repo: 'awesome-copilot',
    branch: 'main',
    skillsDir: 'skills',
    source: 'community',
    repoLicense: 'MIT',
    indexFile: 'docs/README.skills.md',
  },
  {
    id: 'anthropic',
    label: "Anthropic's skills",
    owner: 'anthropics',
    repo: 'skills',
    branch: 'main',
    skillsDir: 'skills',
    source: 'official',
    repoLicense: null,
  },
];

const CACHE_HOURS = 24;
const MAX_DOWNLOAD_FILES = 200;
const MAX_DOWNLOAD_BYTES = 25 * 1024 * 1024;
const SCRIPT_EXTENSIONS = new Set(['.sh', '.bash', '.zsh', '.ps1', '.bat', '.cmd', '.py', '.js', '.mjs', '.cjs', '.ts', '.rb', '.pl']);
const VALID_NAME = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

interface CachedCatalog {
  fetchedAt: string;
  entries: CatalogEntry[];
  files: Record<string, CatalogFile[]>;
}

export class CatalogProblem extends Error {}

export class NameTaken extends Error {
  suggestion: string;
  constructor(name: string, suggestion: string) {
    super(`This project already has a skill called ${name}.`);
    this.suggestion = suggestion;
  }
}

// ---------- Search list ----------

let memoryCache: CachedCatalog | null = null;

function cacheFile(): string {
  return path.join(studioFolder(), 'catalog.json');
}

async function readCache(): Promise<CachedCatalog | null> {
  if (memoryCache) return memoryCache;
  try {
    memoryCache = JSON.parse(await readFile(cacheFile(), 'utf8')) as CachedCatalog;
    return memoryCache;
  } catch {
    return null;
  }
}

async function writeCache(cache: CachedCatalog): Promise<void> {
  memoryCache = cache;
  await mkdir(studioFolder(), { recursive: true });
  const temp = `${cacheFile()}.tmp`;
  await writeFile(temp, JSON.stringify(cache), 'utf8');
  await rename(temp, cacheFile());
}

/** Returns the search list, refreshing it from GitHub at most once a day unless asked. */
export async function loadCatalog(force = false): Promise<CatalogList> {
  const cached = await readCache();
  const fresh = cached && Date.now() - Date.parse(cached.fetchedAt) < CACHE_HOURS * 3600_000;
  if (cached && fresh && !force) return { entries: cached.entries, fetchedAt: cached.fetchedAt, stale: false };

  try {
    const next = await fetchAllCatalogs();
    await writeCache(next);
    return { entries: next.entries, fetchedAt: next.fetchedAt, stale: false };
  } catch (error) {
    console.error('Catalog refresh failed:', error);
    if (cached) return { entries: cached.entries, fetchedAt: cached.fetchedAt, stale: true };
    throw new CatalogProblem("Couldn't reach GitHub to load online skills. Check your internet connection, then try again.");
  }
}

async function fetchAllCatalogs(): Promise<CachedCatalog> {
  const entries: CatalogEntry[] = [];
  const files: Record<string, CatalogFile[]> = {};

  for (const catalog of CATALOGS) {
    const tree = await fetchTree(catalog);
    const descriptions = catalog.indexFile
      ? parseIndex(await fetchText(rawUrl(catalog, catalog.indexFile)))
      : await fetchDescriptions(catalog, [...tree.keys()]);

    for (const [name, skillFiles] of tree) {
      const id = `${catalog.id}:${name}`;
      files[id] = skillFiles;
      entries.push({
        id,
        catalog: catalog.id,
        catalogLabel: catalog.label,
        name,
        description: descriptions.get(name) ?? '',
        source: catalog.source,
        fileCount: skillFiles.length,
        hasScripts: skillFiles.some((file) => isScript(file.path)),
        url: `https://github.com/${catalog.owner}/${catalog.repo}/tree/${catalog.branch}/${catalog.skillsDir}/${name}`,
      });
    }
  }

  entries.sort((a, b) => a.name.localeCompare(b.name));
  return { fetchedAt: new Date().toISOString(), entries, files };
}

/** One GitHub API call per catalog: every skill folder and its files. */
async function fetchTree(catalog: CatalogDefinition): Promise<Map<string, CatalogFile[]>> {
  const url = `https://api.github.com/repos/${catalog.owner}/${catalog.repo}/git/trees/${catalog.branch}?recursive=1`;
  const data = (await fetchJson(url)) as { tree?: { path: string; type: string; size?: number }[] };
  const prefix = `${catalog.skillsDir}/`;
  const skills = new Map<string, CatalogFile[]>();
  const withSkillFile = new Set<string>();

  for (const item of data.tree ?? []) {
    if (item.type !== 'blob' || !item.path.startsWith(prefix)) continue;
    const rest = item.path.slice(prefix.length);
    const slash = rest.indexOf('/');
    if (slash < 0) continue;
    const name = rest.slice(0, slash);
    const filePath = rest.slice(slash + 1);
    if (filePath === 'SKILL.md') withSkillFile.add(name);
    skills.set(name, [...(skills.get(name) ?? []), { path: filePath, size: item.size ?? 0 }]);
  }

  for (const name of [...skills.keys()]) if (!withSkillFile.has(name)) skills.delete(name);
  return skills;
}

/** Reads the skill table in a catalog's index file: "| [name](../skills/name/SKILL.md)… | description | … |". */
export function parseIndex(markdown: string): Map<string, string> {
  const result = new Map<string, string>();
  for (const line of markdown.split('\n')) {
    const match = /^\|\s*\[[^\]]*\]\(\.\.\/skills\/([^/)]+)\/SKILL\.md\)/.exec(line);
    if (!match?.[1]) continue;
    const cells = line.split(/(?<!\\)\|/).map((cell) => cell.trim());
    const description = (cells[2] ?? '').replace(/<br\s*\/?>/g, ' ').replace(/\\\|/g, '|').trim();
    result.set(match[1], description);
  }
  return result;
}

async function fetchDescriptions(catalog: CatalogDefinition, names: string[]): Promise<Map<string, string>> {
  const result = new Map<string, string>();
  await inBatches(names, 8, async (name) => {
    try {
      const text = await fetchText(rawUrl(catalog, `${catalog.skillsDir}/${name}/SKILL.md`));
      result.set(name, readHeader(text).description ?? '');
    } catch {
      result.set(name, '');
    }
  });
  return result;
}

// ---------- Preview ----------

export async function previewSkill(id: string): Promise<CatalogPreview> {
  const { catalog, entry, files } = await findEntry(id);
  const base = `${catalog.skillsDir}/${entry.name}`;
  const raw = await fetchText(rawUrl(catalog, `${base}/SKILL.md`));
  const header = readHeader(raw);
  const licenseFile = files.find((file) => /^licen[cs]e(\.(md|txt))?$/i.test(file.path));
  let license = catalog.repoLicense ? `${catalog.repoLicense} (covers the whole collection)` : 'Not stated';
  if (licenseFile) {
    try {
      license = summarizeLicense(await fetchText(rawUrl(catalog, `${base}/${licenseFile.path}`)));
    } catch {
      license = `See ${licenseFile.path} in the skill`;
    }
  }

  return {
    ...entry,
    description: header.description ?? entry.description,
    raw,
    files,
    scripts: files.filter((file) => isScript(file.path)).map((file) => file.path),
    license,
    licenseFile: licenseFile?.path ?? null,
  };
}

export function summarizeLicense(text: string): string {
  const firstLine = text.split('\n').map((line) => line.trim()).find(Boolean) ?? '';
  if (/apache license/i.test(text) && /version 2\.0/i.test(text)) return 'Apache 2.0 (open source)';
  if (/^mit license/i.test(firstLine) || /permission is hereby granted, free of charge/i.test(text)) return 'MIT (open source)';
  return 'Source-available: you can read it, but reuse is limited. Check the license before sharing.';
}

// ---------- Download ----------

export function isValidSkillName(name: string): boolean {
  return name.length > 0 && name.length <= 64 && VALID_NAME.test(name);
}

/** Downloads a catalog skill into a project's skill folder. Never overwrites anything. */
export async function downloadSkill(args: {
  id: string;
  skillsFolder: string;
  newName?: string | undefined;
}): Promise<{ name: string; folder: string }> {
  const { catalog, entry, files } = await findEntry(args.id);
  const name = args.newName ?? entry.name;
  await assertNameFree(args.skillsFolder, name);

  if (files.length > MAX_DOWNLOAD_FILES) {
    throw new CatalogProblem(`This skill has ${files.length} files, more than Skill Studio downloads at once.`);
  }
  if (files.reduce((sum, file) => sum + file.size, 0) > MAX_DOWNLOAD_BYTES) {
    throw new CatalogProblem('This skill is larger than 25 MB, too big to download here.');
  }

  const contents: { path: string; data: Buffer }[] = [];
  await inBatches(files, 8, async (file) => {
    const response = await request(rawUrl(catalog, `${catalog.skillsDir}/${entry.name}/${file.path}`));
    contents.push({ path: file.path, data: Buffer.from(await response.arrayBuffer()) });
  });

  const folder = await installSkill({ skillsFolder: args.skillsFolder, name, originalName: entry.name, files: contents });
  return { name, folder };
}

/**
 * Writes a skill's files into `<skillsFolder>/<name>`. Refuses if anything is
 * already there, and writes to a temporary folder first so a failed download
 * never leaves a half-written skill behind.
 */
export async function installSkill(args: {
  skillsFolder: string;
  name: string;
  originalName: string;
  files: { path: string; data: Buffer }[];
}): Promise<string> {
  const { skillsFolder, name, originalName, files } = args;
  if (!isValidSkillName(name)) {
    throw new CatalogProblem('Skill names can only use lowercase letters, numbers, and hyphens, up to 64 characters.');
  }
  await assertNameFree(skillsFolder, name);

  const target = path.join(skillsFolder, name);
  const temp = path.join(skillsFolder, `.${name}.skill-studio-${randomBytes(4).toString('hex')}`);
  await mkdir(temp, { recursive: true });

  try {
    for (const file of files) {
      const destination = path.resolve(temp, file.path);
      if (!destination.startsWith(temp + path.sep)) throw new CatalogProblem('This skill has a file in an unsafe location.');
      await mkdir(path.dirname(destination), { recursive: true });
      let data = file.data;
      if (file.path === 'SKILL.md' && name !== originalName) data = Buffer.from(renameInHeader(data.toString('utf8'), name));
      await writeFile(destination, data, { flag: 'wx' });
    }
    // Check again right before moving into place, in case something appeared meanwhile.
    await assertNameFree(skillsFolder, name);
    await rename(temp, target);
  } catch (error) {
    await rm(temp, { recursive: true, force: true });
    throw error;
  }
  return target;
}

/** VS Code needs the header name to match the folder name, so a renamed download updates it. */
export function renameInHeader(text: string, name: string): string {
  const match = /^(---\r?\n)([\s\S]*?)(\r?\n---)/.exec(text);
  if (!match) return text;
  const header = /^name:.*$/m.test(match[2] ?? '')
    ? (match[2] ?? '').replace(/^name:.*$/m, `name: ${name}`)
    : `name: ${name}\n${match[2] ?? ''}`;
  return `${match[1]}${header}${match[3]}${text.slice(match[0].length)}`;
}

async function assertNameFree(skillsFolder: string, name: string): Promise<void> {
  if (!(await exists(path.join(skillsFolder, name)))) return;
  let counter = 2;
  while (await exists(path.join(skillsFolder, `${name}-${counter}`))) counter += 1;
  throw new NameTaken(name, `${name}-${counter}`);
}

// ---------- Helpers ----------

async function findEntry(id: string) {
  const cache = (await readCache()) ?? (await loadCatalog().then(() => readCache()));
  const entry = cache?.entries.find((candidate) => candidate.id === id);
  const catalog = CATALOGS.find((candidate) => candidate.id === entry?.catalog);
  const files = cache?.files[id];
  if (!entry || !catalog || !files) throw new CatalogProblem("Couldn't find that skill. Refresh the online list and try again.");
  return { catalog, entry, files };
}

function isScript(filePath: string): boolean {
  return SCRIPT_EXTENSIONS.has(path.extname(filePath).toLowerCase());
}

function rawUrl(catalog: CatalogDefinition, filePath: string): string {
  const encoded = filePath.split('/').map(encodeURIComponent).join('/');
  return `https://raw.githubusercontent.com/${catalog.owner}/${catalog.repo}/${catalog.branch}/${encoded}`;
}

async function request(url: string): Promise<Response> {
  const headers: Record<string, string> = { 'User-Agent': 'skill-studio' };
  const token = process.env['GITHUB_TOKEN'];
  if (token && url.startsWith('https://api.github.com/')) headers['Authorization'] = `Bearer ${token}`;
  const response = await fetch(url, { headers, signal: AbortSignal.timeout(20_000) });
  if (response.status === 403 || response.status === 429) {
    throw new CatalogProblem('GitHub is limiting requests right now. Try again in an hour.');
  }
  if (!response.ok) throw new CatalogProblem(`GitHub answered ${response.status} for ${url}`);
  return response;
}

async function fetchJson(url: string): Promise<unknown> {
  return (await request(url)).json();
}

async function fetchText(url: string): Promise<string> {
  return (await request(url)).text();
}

async function inBatches<T>(items: T[], size: number, work: (item: T) => Promise<void>): Promise<void> {
  for (let index = 0; index < items.length; index += size) {
    await Promise.all(items.slice(index, index + size).map(work));
  }
}

async function exists(target: string): Promise<boolean> {
  try {
    await stat(target);
    return true;
  } catch {
    return false;
  }
}
