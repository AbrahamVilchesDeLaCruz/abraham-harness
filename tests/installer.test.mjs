import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { chmodSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { delimiter, join } from 'node:path';

const BIN = new URL('../bin/abraham-harness.mjs', import.meta.url).pathname;
const INSTALL_ARGS =
  "-y skills@latest add AbrahamVilchesDeLaCruz/abraham-harness --skill * -a claude-code -a codex -a opencode -y";

// Runs the installer against a fake npx that records its arguments and exits with `exitCode`.
function run(args, exitCode = 0) {
  const dir = mkdtempSync(join(tmpdir(), 'harness-bin-'));
  try {
    const log = join(dir, 'args.log');
    const fake = join(dir, 'npx');
    writeFileSync(fake, `#!/bin/sh\nset -f\necho "$*" > "${log}"\nexit ${exitCode}\n`);
    chmodSync(fake, 0o755);
    const env = { ...process.env, PATH: `${dir}${delimiter}${process.env.PATH}` };
    const result = spawnSync(process.execPath, [BIN, ...args], { encoding: 'utf8', env });
    let called = null;
    try {
      called = readFileSync(log, 'utf8').trim();
    } catch {}
    return { ...result, called };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

test('installs every skill for Claude Code, Codex and OpenCode by default', () => {
  const r = run([]);
  assert.equal(r.status, 0, r.stderr);
  assert.equal(r.called, INSTALL_ARGS);
});

test('install is an explicit alias of the default command', () => {
  assert.equal(run(['install']).called, INSTALL_ARGS);
});

test('forwards extra options such as --global', () => {
  assert.equal(run(['install', '--global']).called, `${INSTALL_ARGS} --global`);
});

test('update and check run the matching skills command', () => {
  assert.equal(run(['update']).called, '-y skills@latest update -y');
  assert.equal(run(['check']).called, '-y skills@latest check');
});

test('propagates the exit code of the skills CLI', () => {
  assert.equal(run([], 3).status, 3);
});

test('rejects an unknown command without running anything', () => {
  const r = run(['nope']);
  assert.equal(r.status, 1);
  assert.equal(r.called, null);
  assert.match(r.stderr, /Unknown command "nope"/);
  assert.match(r.stderr, /Usage: abraham-harness/);
});

test('prints the usage for --help without running anything', () => {
  const r = run(['--help']);
  assert.equal(r.status, 0);
  assert.equal(r.called, null);
  assert.match(r.stdout, /Usage: abraham-harness/);
});
