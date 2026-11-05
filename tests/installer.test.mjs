import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { chmodSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { delimiter, join } from 'node:path';

const BIN = new URL('../bin/abraham-harness.mjs', import.meta.url).pathname;
const SOURCE_SKILLS = new URL('../skills/', import.meta.url).pathname;
const SHARED_SKILL_NAMES = (await import('../lib/skills.mjs')).listSharedSkills(SOURCE_SKILLS);
const INSTALL_ARGS =
  "-y skills@latest add AbrahamVilchesDeLaCruz/abraham-harness --skill * -a claude-code -a codex -a opencode -y";

// Runs the installer against a fake npx that records its arguments and exits with `exitCode`.
function run(args, exitCode = 0, installedSkills = []) {
  const dir = mkdtempSync(join(tmpdir(), 'harness-bin-'));
  try {
    const log = join(dir, 'args.log');
    const fake = join(dir, 'npx');
    writeFileSync(fake, `#!/bin/sh\nset -f\nprintf '%s\\n' "$*" >> "${log}"\nexit ${exitCode}\n`);
    chmodSync(fake, 0o755);
    for (const name of installedSkills) {
      const path = join(dir, '.agents/skills', name, 'SKILL.md');
      mkdirSync(join(path, '..'), { recursive: true });
      writeFileSync(path, `name: ${name}\n`);
    }
    const env = { ...process.env, HOME: dir, PATH: `${dir}${delimiter}${process.env.PATH}` };
    const result = spawnSync(process.execPath, [BIN, ...args], { cwd: dir, encoding: 'utf8', env });
    let calls = [];
    try {
      calls = readFileSync(log, 'utf8').trim().split('\n');
    } catch {}
    return { ...result, calls, called: calls[0] ?? null };
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
  const update = run(['update'], 0, ['api-domain']);
  assert.equal(update.status, 0, update.stderr);
  assert.equal(update.calls[0], '-y skills@latest update -p -y');
  assert.match(update.calls[1], /-y skills@latest add AbrahamVilchesDeLaCruz\/abraham-harness --skill/);
  assert.match(update.calls[1], /api-repository/);
  assert.equal(update.calls[1].split(' ').includes('api-domain'), false);

  const check = run(['check']);
  assert.equal(check.status, 1);
  assert.equal(check.calls.length, 1);
  assert.equal(check.called, '-y skills@latest check -p');
  assert.match(check.stdout, /New harness skills available:/);
});

test('update does not re-add shared skills that are already installed', () => {
  const update = run(['update'], 0, SHARED_SKILL_NAMES);
  assert.equal(update.status, 0, update.stderr);
  assert.deepEqual(update.calls, ['-y skills@latest update -p -y']);
});

test('global update installs only missing skills into the global scope', () => {
  const update = run(['update', '--global'], 0, ['api-domain']);
  assert.equal(update.status, 0, update.stderr);
  assert.equal(update.calls[0], '-y skills@latest update -g -y');
  assert.match(update.calls[1], /-a claude-code -a codex -a opencode -y -g$/);
  assert.equal(update.calls[1].split(' ').includes('api-domain'), false);
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
