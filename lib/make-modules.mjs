// Keeps the shared make modules current in a project, and keeps any module edited by hand.
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

export const MANAGED_MODULES = ['local.mk', 'dev.mk', 'prod.mk', 'code.mk'];
const STAMP = /^# Managed by abraham-harness, sha256=([0-9a-f]{64})\. Put your own targets in make\/project\.mk\.\n/;

const sha256 = (text) => createHash('sha256').update(text).digest('hex');

export function stampModule(text) {
  const body = text.replace(STAMP, '');
  return `# Managed by abraham-harness, sha256=${sha256(body)}. Put your own targets in make/project.mk.\n${body}`;
}

// A stamp that does not match its own body means someone changed the file after it was generated.
function checkStamp(text) {
  const match = text.match(STAMP);
  if (!match) return 'no abraham-harness stamp. Run /project-bootstrap to replace it, or keep it as yours';
  if (sha256(text.slice(match[0].length)) !== match[1]) return 'edited by hand. Move your change to make/project.mk';
  return null;
}

export function refreshMakeModules({ base, modulesDir }) {
  let refreshed = 0;
  const skipped = [];
  for (const name of MANAGED_MODULES) {
    const path = `make/${name}`;
    const target = join(base, path);
    if (!existsSync(target)) continue;
    try {
      const text = new TextDecoder('utf-8', { fatal: true }).decode(readFileSync(target));
      const problem = checkStamp(text);
      if (problem) {
        skipped.push(`${path}: ${problem}`);
        continue;
      }
      const latest = readFileSync(join(modulesDir, name), 'utf8');
      if (latest !== text) {
        writeFileSync(target, latest);
        refreshed += 1;
      }
    } catch (error) {
      skipped.push(`${path}: ${error.message}`);
    }
  }
  return { refreshed, skipped };
}
