import assert from 'node:assert/strict';
import { mkdtemp, readdir, readFile, rm, mkdir, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, test } from 'node:test';
import { CatalogProblem, installSkill, NameTaken } from './catalog.ts';

let skillsFolder: string;

beforeEach(async () => {
  skillsFolder = await mkdtemp(path.join(os.tmpdir(), 'skill-studio-test-'));
});

afterEach(async () => {
  await rm(skillsFolder, { recursive: true, force: true });
});

const skillFile = (name: string) => Buffer.from(`---\nname: ${name}\ndescription: Test skill.\n---\n\n# ${name}\n`);

test('never overwrites or changes a skill that already exists', async () => {
  const existing = path.join(skillsFolder, 'pdf');
  await mkdir(existing);
  await writeFile(path.join(existing, 'SKILL.md'), 'original');

  await assert.rejects(
    installSkill({ skillsFolder, name: 'pdf', originalName: 'pdf', files: [{ path: 'SKILL.md', data: skillFile('pdf') }] }),
    (error: unknown) => error instanceof NameTaken && error.suggestion === 'pdf-2',
  );
  assert.equal(await readFile(path.join(existing, 'SKILL.md'), 'utf8'), 'original');
  assert.deepEqual(await readdir(skillsFolder), ['pdf']);
});

test('a renamed download updates the name in its header to match the folder', async () => {
  await installSkill({
    skillsFolder,
    name: 'pdf-2',
    originalName: 'pdf',
    files: [{ path: 'SKILL.md', data: skillFile('pdf') }],
  });
  const text = await readFile(path.join(skillsFolder, 'pdf-2', 'SKILL.md'), 'utf8');
  assert.match(text, /^---\nname: pdf-2\n/);
});

test('rejects files that would land outside the skill folder and leaves nothing behind', async () => {
  await assert.rejects(
    installSkill({
      skillsFolder,
      name: 'sneaky',
      originalName: 'sneaky',
      files: [
        { path: 'SKILL.md', data: skillFile('sneaky') },
        { path: '../outside.txt', data: Buffer.from('nope') },
      ],
    }),
    CatalogProblem,
  );
  assert.deepEqual(await readdir(skillsFolder), []);
});
