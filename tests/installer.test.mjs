import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { chmodSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { delimiter, join } from 'node:path';

const BIN = new URL('../bin/abraham-harness.mjs', import.meta.url).pathname;
const SOURCE_SKILLS = new URL('../skills/', import.meta.url).pathname;
const SHARED_SKILL_NAMES = (await import('../lib/skills.mjs')).listSharedSkills(SOURCE_SKILLS);
const { release, repository } = await import('../lib/release.mjs');
const INSTALL_ARGS = `-y skills@${release.skillsCliVersion} add ${release.source} --skill * -a claude-code -a codex -a opencode -y`;

// Runs the installer against a fake npx that records its arguments and exits with `exitCode`.
function run(args, exitCode = 0, installedSkills = [], lock) {
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
    if (lock) writeFileSync(join(dir, 'skills-lock.json'), JSON.stringify({ version: 2, skills: lock }));
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
  assert.equal(run(['install', '--global']).called, `${INSTALL_ARGS} -g`);
});

test('update targets the same release as its role files and keeps untracked overrides', () => {
  const update = run(['update'], 0, ['api-domain', 'api-rest'], {
    'api-domain': { source: repository, ref: 'v0.26.0' },
    'api-rest': { source: 'someone/else', ref: 'v1.0.0' },
  });
  assert.equal(update.status, 0, update.stderr);
  assert.equal(update.calls.length, 1);
  assert.ok(update.called.includes(`add ${release.source} --skill`));
  assert.ok(update.called.split(' ').includes('api-domain'));
  assert.ok(update.called.split(' ').includes('api-repository'));
  assert.ok(!update.called.split(' ').includes('api-rest'));
});

test('check and doctor inspect files without invoking the skills CLI', () => {
  const check = run(['check']);
  assert.equal(check.status, 1);
  assert.deepEqual(check.calls, []);
  assert.match(check.stdout, /Harness skills to reconcile:/);

  const doctor = run(['doctor', '--json'], 0, ['api-domain'], {
    'api-domain': { source: repository, ref: release.ref },
  });
  assert.equal(doctor.status, 0, doctor.stderr);
  assert.deepEqual(doctor.calls, []);
  const report = JSON.parse(doctor.stdout);
  assert.deepEqual(report.release, release);
  const states = Object.fromEntries(report.installed.map(runtime => [
    runtime.runtime,
    runtime.skills.find(skill => skill.name === 'api-domain').state,
  ]));
  assert.deepEqual(states, { 'claude-code': 'missing', codex: 'present', opencode: 'present' });
  assert.ok(report.installed.every(runtime => runtime.capabilities === 'unverified'));
  assert.ok(report.names.includes('api-domain'));
});

test('update does not re-add untracked skills already installed', () => {
  const update = run(['update'], 0, SHARED_SKILL_NAMES);
  assert.equal(update.status, 0, update.stderr);
  assert.deepEqual(update.calls, []);
});

test('global update installs only missing skills into the global scope', () => {
  const update = run(['update', '--global'], 0, ['api-domain']);
  assert.equal(update.status, 0, update.stderr);
  assert.equal(update.calls.length, 1);
  assert.match(update.called, /-a claude-code -a codex -a opencode -y -g$/);
  assert.equal(update.called.split(' ').includes('api-domain'), false);
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
