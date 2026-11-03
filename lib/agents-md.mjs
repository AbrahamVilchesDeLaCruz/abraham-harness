// Keeps the marked blocks of a project's AGENTS.md files current, and never touches anything else.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const BLOCK_NAMES = ['auto-invoke', 'available-skills'];
const FILES = [
  { path: 'AGENTS.md', template: 'AGENTS.root.template.md' },
  { path: 'apps/api/AGENTS.md', template: 'AGENTS.api.template.md' },
  { path: 'apps/client/AGENTS.md', template: 'AGENTS.client.template.md' },
];

const startMarker = (name) => `<!-- abraham-harness:${name}:start -->`;
const endMarker = (name) => `<!-- abraham-harness:${name}:end -->`;

function findBlock(text, name) {
  const start = text.indexOf(startMarker(name));
  const end = text.indexOf(endMarker(name));
  if (start === -1 && end === -1) return { state: 'missing' };
  if (start === -1 || end === -1 || end < start) return { state: 'broken' };
  return { state: 'found', start, end: end + endMarker(name).length };
}

function refreshFile(text, templateText) {
  let result = text;
  let found = 0;
  for (const name of BLOCK_NAMES) {
    const block = findBlock(result, name);
    if (block.state === 'broken') return { problem: `broken abraham-harness block "${name}"` };
    if (block.state === 'missing') continue;
    found += 1;
    const source = findBlock(templateText, name);
    result = result.slice(0, block.start) + templateText.slice(source.start, source.end) + result.slice(block.end);
  }
  return found === 0 ? { problem: 'no abraham-harness blocks' } : { result };
}

export function refreshAgentsMd({ base, templatesDir }) {
  let refreshed = 0;
  const skipped = [];
  for (const { path, template } of FILES) {
    const target = join(base, path);
    if (!existsSync(target)) continue;
    const text = readFileSync(target, 'utf8');
    const { result, problem } = refreshFile(text, readFileSync(join(templatesDir, template), 'utf8'));
    if (problem) {
      skipped.push(`${path}: ${problem}`);
    } else if (result !== text) {
      writeFileSync(target, result);
      refreshed += 1;
    }
  }
  return { refreshed, skipped };
}
