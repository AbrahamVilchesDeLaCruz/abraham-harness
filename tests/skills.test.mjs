import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { findMissingSkills, listSharedSkills } from '../lib/skills.mjs';

function addSkill(root, name) {
  const path = join(root, name, 'SKILL.md');
  mkdirSync(join(path, '..'), { recursive: true });
  writeFileSync(path, `name: ${name}\n`);
}

test('shared skill inventory includes only installable skill directories in stable order', () => {
  const root = mkdtempSync(join(tmpdir(), 'harness-skills-source-'));
  try {
    addSkill(root, 'beta');
    addSkill(root, 'alpha');
    mkdirSync(join(root, 'not-a-skill'), { recursive: true });
    assert.deepEqual(listSharedSkills(root), ['alpha', 'beta']);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('new skill detection respects project and global scope and preserves existing names', () => {
  const root = mkdtempSync(join(tmpdir(), 'harness-skills-scope-'));
  try {
    const sourceDir = join(root, 'source');
    const project = join(root, 'project');
    const home = join(root, 'home');
    for (const name of ['alpha', 'beta', 'gamma']) addSkill(sourceDir, name);
    addSkill(join(project, '.agents/skills'), 'alpha');
    addSkill(join(project, 'skills'), 'gamma');
    addSkill(join(home, '.claude/skills'), 'beta');

    assert.deepEqual(findMissingSkills({ sourceDir, base: project }), ['beta']);
    assert.deepEqual(findMissingSkills({ sourceDir, base: home, isGlobal: true }), ['alpha', 'gamma']);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
