#!/usr/bin/env node
// Validates every skill so a release can never ship a broken or project-specific skill.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { ACCESS_LEVELS, loadRoles } from '../lib/agents.mjs';

const FORBIDDEN_TERMS = ['flashcard', 'ididntcatchthat', 'tfm', 'big-school', 'elevenlabs', 'deepseek', 'doppler'];
const FORBIDDEN = new RegExp(`\\b(${FORBIDDEN_TERMS.join('|')})\\b`, 'i');
const REQUIRED_FIELDS = ['name', 'description', 'license'];
const MOJIBAKE = /[\u00c3\u00c2][\u0080-\u00bf]|\u00e2\u20ac/;
const LINK = /\]\(([^)\s]+)\)/g;
const MAX_DESCRIPTION = 250;
const MAX_BODY = 4000; // Roughly the style guide's hard maximum of 1000 tokens.
const REQUIRED_SECTIONS = ['## Activation Contract', '## Hard Rules'];

const root = resolve(process.argv[2] ?? 'skills');
const agentsRoot = process.argv[3] ? resolve(process.argv[3]) : null;
const errors = [];
const label = (path) => relative(root, path).split(sep).join('/');

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

function parseFrontmatter(text) {
  const match = text.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;
  const fields = {};
  for (const line of match[1].split('\n')) {
    const field = line.match(/^(\w[\w-]*):\s*(.*)$/);
    if (field) fields[field[1]] = field[2].replace(/^["']|["']$/g, '');
  }
  return fields;
}

function checkBody(path, text) {
  const body = text.replace(/^---\n[\s\S]*?\n---\n/, '').trim();
  if (body.length > MAX_BODY) errors.push(`${label(path)}: body has ${body.length} characters, the budget is ${MAX_BODY}`);
  const lines = body.split('\n');
  const positions = REQUIRED_SECTIONS.map((section) => lines.indexOf(section));
  REQUIRED_SECTIONS.forEach((section, i) => {
    if (positions[i] === -1) errors.push(`${label(path)}: missing section "${section}"`);
  });
  if (positions.every((p) => p !== -1) && positions[0] > positions[1]) {
    errors.push(`${label(path)}: "${REQUIRED_SECTIONS[0]}" must come before "${REQUIRED_SECTIONS[1]}"`);
  }
}

function checkFrontmatter(skillDir, path) {
  const dirName = label(skillDir);
  const text = readFileSync(path, 'utf8');
  checkBody(path, text);
  const fields = parseFrontmatter(text);
  if (!fields) {
    errors.push(`${label(path)}: missing frontmatter`);
    return;
  }
  for (const field of REQUIRED_FIELDS) {
    if (!fields[field]) errors.push(`${label(path)}: missing field "${field}"`);
  }
  if (fields.name && fields.name !== dirName) {
    errors.push(`${label(path)}: name "${fields.name}" must match directory "${dirName}"`);
  }
  if (fields.description && fields.description.length > MAX_DESCRIPTION) {
    errors.push(`${label(path)}: description exceeds ${MAX_DESCRIPTION} characters`);
  }
  if (fields.description && !fields.description.includes('Trigger:')) {
    errors.push(`${label(path)}: description must include "Trigger:"`);
  }
}

// Installers copy one skill directory, so any link leaving it would break after install.
function checkMarkdown(skillDir, path) {
  const inTemplates = label(path).includes('/assets/');
  const lines = readFileSync(path, 'utf8').split('\n');
  lines.forEach((line, index) => {
    const term = line.match(FORBIDDEN);
    if (term) errors.push(`${label(path)}:${index + 1}: project-specific term "${term[1].toLowerCase()}"`);
    if (MOJIBAKE.test(line)) errors.push(`${label(path)}:${index + 1}: corrupted encoding`);
    if (inTemplates) return;
    for (const [, raw] of line.matchAll(LINK)) {
      if (/^(https?:|mailto:|#)/.test(raw) || raw.includes('{')) continue;
      const target = resolve(dirname(path), raw.split('#')[0]);
      const inside = target === skillDir || target.startsWith(skillDir + sep);
      if (!inside || !existsSync(target)) errors.push(`${label(path)}:${index + 1}: broken link "${raw}"`);
    }
  });
}

const skillDirs = readdirSync(root)
  .map((name) => join(root, name))
  .filter((path) => statSync(path).isDirectory());

for (const skillDir of skillDirs) {
  const skillFile = join(skillDir, 'SKILL.md');
  if (!existsSync(skillFile)) {
    errors.push(`${label(skillDir)}: missing SKILL.md`);
    continue;
  }
  checkFrontmatter(skillDir, skillFile);
  for (const path of walk(skillDir).filter((file) => file.endsWith('.md'))) checkMarkdown(skillDir, path);
}

if (agentsRoot) {
  for (const role of loadRoles(agentsRoot)) {
    if (!ACCESS_LEVELS.includes(role.access)) errors.push(`agents/${role.name}.md: unknown access "${role.access}"`);
    for (const skill of role.skills) {
      if (!existsSync(join(root, skill, 'SKILL.md'))) errors.push(`agents/${role.name}.md: unknown skill "${skill}"`);
    }
  }
}

if (errors.length > 0) {
  console.error(errors.join('\n'));
  console.error(`\n${errors.length} problem(s) found`);
  process.exit(1);
}
console.log(`${skillDirs.length} skills OK`);
