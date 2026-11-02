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

Read [the guide](references/guide.md).
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
