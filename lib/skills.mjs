import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const PROJECT_SKILL_DIRS = ['.agents/skills', '.claude/skills', '.codex/skills', '.opencode/skills'];
const GLOBAL_SKILL_DIRS = [
  '.agents/skills',
  '.claude/skills',
  '.codex/skills',
  '.opencode/skills',
  '.config/opencode/skills',
];

export function listSharedSkills(sourceDir) {
  return readdirSync(sourceDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && existsSync(join(sourceDir, entry.name, 'SKILL.md')))
    .map((entry) => entry.name)
    .sort();
}

export function findMissingSkills({ sourceDir, base, isGlobal = false }) {
  const roots = isGlobal ? GLOBAL_SKILL_DIRS : [...PROJECT_SKILL_DIRS, 'skills'];
  const installed = new Set();

  for (const root of roots) {
    for (const name of listInstalledSkillNames(join(base, root))) installed.add(name);
  }

  return listSharedSkills(sourceDir).filter((name) => !installed.has(name));
}

function listInstalledSkillNames(root) {
  if (!existsSync(root)) return [];
  return readdirSync(root, { withFileTypes: true })
    .filter((entry) => existsSync(join(root, entry.name, 'SKILL.md')))
    .map((entry) => entry.name);
}
