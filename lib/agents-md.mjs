// Keeps the marked blocks of a project's AGENTS.md files current, and never touches anything else.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const BLOCK_NAMES = ['auto-invoke', 'available-skills'];
const FILES = [
  { path: 'AGENTS.md', template: 'AGENTS.root.template.md' },
  { path: 'apps/api/AGENTS.md', template: 'AGENTS.api.template.md' },
  { path: 'apps/client/AGENTS.md', template: 'AGENTS.client.template.md' },
];

function markerLines(text, marker) {
  const label = `<!-- abraham-harness:${marker} -->`;
  const matches = [];
  let fence;
  for (const line of text.matchAll(/^[^\r\n]*/gm)) {
    const delimiter = line[0].match(/^ {0,3}(`{3,}|~{3,})(.*)$/);
    if (fence) {
      if (delimiter && delimiter[1][0] === fence[0] && delimiter[1].length >= fence.length && !delimiter[2].trim()) {
        fence = undefined;
      }
    } else if (delimiter && (delimiter[1][0] === '~' || !delimiter[2].includes('`'))) {
      fence = delimiter[1];
    } else if (line[0] === label) {
      matches.push({ start: line.index, end: line.index + label.length });
    }
  }
  return matches;
}

// A marker must be alone on a line outside fenced examples.
function findBlock(text, name) {
  const starts = markerLines(text, `${name}:start`);
  const ends = markerLines(text, `${name}:end`);
  if (starts.length === 0 && ends.length === 0) return { state: 'missing' };
  if (starts.length !== 1 || ends.length !== 1 || ends[0].start < starts[0].end) return { state: 'broken' };
  return { state: 'found', start: starts[0].start, end: ends[0].end };
}

function refreshFile(text, templateText) {
  const blocks = [];
  for (const name of BLOCK_NAMES) {
    const block = findBlock(text, name);
    if (block.state === 'broken') return { problem: `broken abraham-harness block "${name}"` };
    if (block.state === 'missing') continue;
    const source = findBlock(templateText, name);
    if (source.state !== 'found') return { problem: `the template has no valid block "${name}"` };
    const newline = text.slice(block.start, block.end).includes('\r\n') ? '\r\n' : '\n';
    const content = templateText.slice(source.start, source.end).replace(/\r?\n/g, newline);
    blocks.push({ ...block, content });
  }
  if (blocks.length === 0) return { problem: 'no abraham-harness blocks. Run /project-bootstrap to add them' };
  const ordered = blocks.sort((a, b) => a.start - b.start);
  for (let i = 1; i < ordered.length; i += 1) {
    if (ordered[i].start < ordered[i - 1].end) return { problem: 'overlapping abraham-harness blocks' };
  }
  let result = text;
  for (const block of ordered.reverse()) {
    result = result.slice(0, block.start) + block.content + result.slice(block.end);
  }
  return { result };
}

export function refreshAgentsMd({ base, templatesDir }) {
  let refreshed = 0;
  const skipped = [];
  for (const { path, template } of FILES) {
    const target = join(base, path);
    if (!existsSync(target)) continue;
    try {
      // A fatal decoder rejects other encodings, which a plain read would silently damage on write.
      const text = new TextDecoder('utf-8', { fatal: true }).decode(readFileSync(target));
      const { result, problem } = refreshFile(text, readFileSync(join(templatesDir, template), 'utf8'));
      if (problem) {
        skipped.push(`${path}: ${problem}`);
      } else if (result !== text) {
        writeFileSync(target, result);
        refreshed += 1;
      }
    } catch (error) {
      skipped.push(`${path}: ${error.message}`);
    }
  }
  return { refreshed, skipped };
}
