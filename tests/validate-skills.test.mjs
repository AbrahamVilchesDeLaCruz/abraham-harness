import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const SCRIPT = new URL('../scripts/validate-skills.mjs', import.meta.url).pathname;
const GOOD = `---
name: demo
description: "Demo skill. Trigger: when testing."
license: Apache-2.0
metadata:
  author: AbrahamVilchesDeLaCruz
  version: "1.0"
---

## Activation Contract

Use this skill when testing.

## Hard Rules

- Read [the guide](references/guide.md).
`;

function run(files, agents = null) {
  const root = mkdtempSync(join(tmpdir(), 'harness-validate-'));
  const agentsRoot = mkdtempSync(join(tmpdir(), 'harness-validate-agents-'));
  try {
    for (const [name, content] of Object.entries(agents ?? {})) {
      mkdirSync(join(agentsRoot, name, '..'), { recursive: true });
      writeFileSync(join(agentsRoot, name), content);
    }
    for (const [path, content] of Object.entries(files)) {
      const full = join(root, path);
      mkdirSync(join(full, '..'), { recursive: true });
      writeFileSync(full, content);
    }
    const args = agents ? [SCRIPT, root, agentsRoot] : [SCRIPT, root];
    return spawnSync(process.execPath, args, { encoding: 'utf8' });
  } finally {
    rmSync(root, { recursive: true, force: true });
    rmSync(agentsRoot, { recursive: true, force: true });
  }
}

test('accepts a well-formed skill', () => {
  const r = run({ 'demo/SKILL.md': GOOD, 'demo/references/guide.md': '# Guide\n' });
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /1 skills OK/);
});

test('rejects a name that differs from its directory', () => {
  const r = run({ 'other/SKILL.md': GOOD, 'other/references/guide.md': '' });
  assert.equal(r.status, 1);
  assert.match(r.stderr, /other\/SKILL\.md: name "demo" must match directory "other"/);
});

test('rejects a description without a trigger', () => {
  const r = run({ 'demo/SKILL.md': GOOD.replace(' Trigger: when testing.', ''), 'demo/references/guide.md': '' });
  assert.equal(r.status, 1);
  assert.match(r.stderr, /description must include "Trigger:"/);
});

test('rejects a relative link that does not resolve inside the skill', () => {
  const r = run({ 'demo/SKILL.md': GOOD.replace('references/guide.md', '../../docs/adr/001.md') });
  assert.equal(r.status, 1);
  assert.match(r.stderr, /broken link "\.\.\/\.\.\/docs\/adr\/001\.md"/);
});

test('rejects terms leaked from a source project', () => {
  const r = run({ 'demo/SKILL.md': GOOD, 'demo/references/guide.md': 'A flashcard example\n' });
  assert.equal(r.status, 1);
  assert.match(r.stderr, /demo\/references\/guide\.md:1: project-specific term "flashcard"/);
});

test('rejects a description longer than 250 characters', () => {
  const long = 'x'.repeat(240);
  const r = run({ 'demo/SKILL.md': GOOD.replace('Demo skill.', long), 'demo/references/guide.md': '' });
  assert.equal(r.status, 1);
  assert.match(r.stderr, /description exceeds 250 characters/);
});

test('rejects a missing required section', () => {
  const r = run({ 'demo/SKILL.md': GOOD.replace('## Hard Rules\n', ''), 'demo/references/guide.md': '' });
  assert.equal(r.status, 1);
  assert.match(r.stderr, /missing section "## Hard Rules"/);
});

test('rejects required sections in the wrong order', () => {
  const swapped = GOOD.replace('## Activation Contract', '## TEMP').replace('## Hard Rules', '## Activation Contract').replace('## TEMP', '## Hard Rules');
  const r = run({ 'demo/SKILL.md': swapped, 'demo/references/guide.md': '' });
  assert.equal(r.status, 1);
  assert.match(r.stderr, /"## Activation Contract" must come before "## Hard Rules"/);
});

test('rejects a body over the 4000 character budget', () => {
  const r = run({ 'demo/SKILL.md': `${GOOD}\n${'y'.repeat(4001)}\n`, 'demo/references/guide.md': '' });
  assert.equal(r.status, 1);
  assert.match(r.stderr, /body has \d+ characters, the budget is 4000/);
});

test('rejects corrupted encoding', () => {
  const r = run({ 'demo/SKILL.md': GOOD, 'demo/references/guide.md': 'Las 3 seÃ±ales\n' });
  assert.equal(r.status, 1);
  assert.match(r.stderr, /demo\/references\/guide\.md:1: corrupted encoding/);
});

test('rejects an agent role that names a skill that does not exist', () => {
  const role = '---\nname: demo\ndescription: "Demo."\naccess: read-only\nskills: missing-skill\n---\n\nBody.\n';
  const r = run({ 'demo/SKILL.md': GOOD, 'demo/references/guide.md': '' }, { 'demo.md': role, 'shared/review-contract.md': 'Contract\n', 'shared/brain.md': 'Brain\n' });
  assert.equal(r.status, 1);
  assert.match(r.stderr, /agents\/demo\.md: unknown skill "missing-skill"/);
});

test('rejects an agent role with an unknown access level', () => {
  const role = '---\nname: demo\ndescription: "Demo."\naccess: readonly\n---\n\nBody.\n';
  const r = run({ 'demo/SKILL.md': GOOD, 'demo/references/guide.md': '' }, { 'demo.md': role, 'shared/review-contract.md': 'Contract\n', 'shared/brain.md': 'Brain\n' });
  assert.equal(r.status, 1);
  assert.match(r.stderr, /agents\/demo\.md: unknown access "readonly"/);
});

const concept = (body) => ({
  'api-demo/SKILL.md': GOOD.replace('name: demo', 'name: api-demo'),
  'api-demo/references/guide.md': body,
});

test('rejects a framework name in a concept skill', () => {
  const r = run(concept('Register the use case in a NestJS module.\n'));
  assert.equal(r.status, 1);
  assert.match(r.stderr, /api-demo\/references\/guide\.md:1: concept skill names framework "NestJS"/);
});

test('rejects a framework name in the code of a concept skill', () => {
  const r = run(concept('```typescript\nimport { Injectable } from "@nestjs/common";\n```\n'));
  assert.equal(r.status, 1);
  assert.match(r.stderr, /concept skill names framework "@nestjs"/);
});

test('allows a framework name in a stack skill', () => {
  const r = run({
    'stack-demo/SKILL.md': GOOD.replace('name: demo', 'name: stack-demo'),
    'stack-demo/references/guide.md': 'Register the use case in a NestJS module.\n',
  });
  assert.equal(r.status, 0, r.stderr);
});

test('rejects text that is not in English', () => {
  const r = run(concept('Siempre usa una clase para los casos de uso cuando el dominio lo necesita y nunca desde la capa de infraestructura con los modelos.\n'));
  assert.equal(r.status, 1);
  assert.match(r.stderr, /api-demo\/references\/guide\.md: text is not in English/);
});

test('does not read Spanish strings in code as text', () => {
  const r = run(concept('```typescript\nconst a = "que para los las una del con cuando debe nunca siempre desde como";\n```\n'));
  assert.equal(r.status, 0, r.stderr);
});

test('rejects a pinned library version', () => {
  const r = run({
    'stack-demo/SKILL.md': GOOD.replace('name: demo', 'name: stack-demo'),
    'stack-demo/references/guide.md': 'See Faker.js v9 for details.\n',
  });
  assert.equal(r.status, 1);
  assert.match(r.stderr, /stack-demo\/references\/guide\.md:1: pinned version "Faker\.js v9"/);
});

for (const term of ['queryRunner', 'mutationFn', 'staleTime', 'Container.tsx', 'mock<Repo>', 'migrationsRun', 'qb.andWhere', 'repo.mock.calls', 'auth.module.ts', '@CurrentUser']) {
  test(`rejects the framework API name ${term} in a concept skill`, () => {
    const r = run(concept(`Example: ${term}\n`));
    assert.equal(r.status, 1);
    assert.match(r.stderr, /concept skill names framework/);
  });
}

test('allows a concept skill to name a stack skill', () => {
  const r = run(concept('Load `stack-typeorm` and read its reference.\n'));
  assert.equal(r.status, 0, r.stderr);
});
