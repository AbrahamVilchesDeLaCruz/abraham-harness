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

function run(files) {
  const root = mkdtempSync(join(tmpdir(), 'harness-validate-'));
  try {
    for (const [path, content] of Object.entries(files)) {
      const full = join(root, path);
      mkdirSync(join(full, '..'), { recursive: true });
      writeFileSync(full, content);
    }
    return spawnSync(process.execPath, [SCRIPT, root], { encoding: 'utf8' });
  } finally {
    rmSync(root, { recursive: true, force: true });
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
