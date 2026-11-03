#!/usr/bin/env node
// Run this after changing a module in skills/makefile/assets/make/, so that update can detect hand edits.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { MANAGED_MODULES, stampModule } from '../lib/make-modules.mjs';

const dir = fileURLToPath(new URL('../skills/makefile/assets/make', import.meta.url));
for (const name of MANAGED_MODULES) {
  const path = join(dir, name);
  writeFileSync(path, stampModule(readFileSync(path, 'utf8')));
}
console.log(`Stamped ${MANAGED_MODULES.length} modules`);
