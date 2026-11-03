// Keeps the marked blocks of a project's AGENTS.md files current, and never touches anything else.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const BLOCK_NAMES = ['auto-invoke', 'available-skills'];
const FILES = [
  { path: 'AGENTS.md', template: 'AGENTS.root.template.md' },
  { path: 'apps/api/AGENTS.md', template: 'AGENTS.api.template.md' },
  { path: 'apps/client/AGENTS.md', template: 'AGENTS.client.template.md' },
];

const markerLines = (text, marker) => {
  const line = new RegExp(`^<!-- abraham-harness:${marker} -->\\r?$`, 'gm');
  return [...text.matchAll(line)].map((match) => ({ start: match.index, end: match.index + `<!-- abraham-harness:${marker} -->`.length }));
};

// Only a marker alone on its line counts, so a mention in prose can never select text to replace.
// Anything but one start line followed by one end line is broken, and the file stays untouched.
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
    blocks.push({ ...block, content: templateText.slice(source.start, source.end) });
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
