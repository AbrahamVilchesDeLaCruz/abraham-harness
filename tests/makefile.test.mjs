import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { chmodSync, cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { delimiter, join } from 'node:path';

const ASSETS = new URL('../skills/makefile/assets/', import.meta.url).pathname;
const ENVIRONMENTS = ['local', 'dev', 'prod'];
const ACTIONS = ['', '-down', '-logs', '-status'];

function stub(bin, name, body) {
  writeFileSync(join(bin, name), `#!/bin/sh\n${body}\n`);
  chmodSync(join(bin, name), 0o755);
}

// Runs the template with stubs that record every command, so no real Docker is touched.
function withProject(fn, { dockerUp = true } = {}) {
  const root = mkdtempSync(join(tmpdir(), 'harness-make-'));
  try {
    const project = join(root, 'project');
    const bin = join(root, 'bin');
    const log = join(root, 'calls.log');
    cpSync(ASSETS, project, { recursive: true });
    mkdirSync(bin);
    writeFileSync(log, '');
    stub(bin, 'docker', `if [ "$1" = "info" ]; then exit ${dockerUp ? 0 : 1}; fi\necho "docker $*" >> "${log}"`);
    for (const name of ['pnpm', 'npm', 'doppler', 'open', 'sudo']) stub(bin, name, `echo "${name} $*" >> "${log}"`);
    stub(bin, 'sleep', 'exit 0');
    const make = (...args) => {
      const r = spawnSync('make', ['PROJECT=demo', ...args], {
        cwd: project,
        encoding: 'utf8',
        env: { ...process.env, PATH: `${bin}${delimiter}${process.env.PATH}` },
      });
      const stdout = r.stdout.replace(/\x1b\[[0-9;]*m/g, '');
      return { ...r, stdout, calls: readFileSync(log, 'utf8').trim().split('\n').filter(Boolean) };
    };
    return fn({ project, make, clear: () => writeFileSync(log, '') });
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

test('make with no target prints the help, and lists every standard target', () => {
  withProject(({ make }) => {
    const r = make();
    assert.equal(r.status, 0, r.stderr);
    for (const env of ENVIRONMENTS) for (const action of ACTIONS) assert.match(r.stdout, new RegExp(`\\b${env}${action}\\s`), `${env}${action}`);
    for (const target of ['help', 'setup', 'local-reset', 'test', 'test-e2e', 'lint', 'format', 'typecheck']) {
      assert.match(r.stdout, new RegExp(`\\b${target}\\s`), target);
    }
    assert.equal(r.calls.length, 0);
  });
});

test('every environment starts and stops its own compose project and file', () => {
  withProject(({ make, clear }) => {
    for (const env of ENVIRONMENTS) {
      clear();
      assert.equal(make(env).status, 0, env);
      const prefix = `compose --project-directory . -p demo-${env} -f infra/docker-compose.${env}.yml`;
      assert.ok(make(env).calls.includes(`docker ${prefix} up -d --build --wait`), env);
      clear();
      assert.deepEqual(make(`${env}-down`).calls, [`docker ${prefix} down`]);
      clear();
      assert.deepEqual(make(`${env}-logs`).calls, [`docker ${prefix} logs -f --tail=100`]);
      clear();
      assert.deepEqual(make(`${env}-status`).calls, [`docker ${prefix} ps`]);
    }
  });
});

test('a secrets command wraps only the environment it is set for', () => {
  withProject(({ make, clear }) => {
    const r = make('dev-status', 'SECRETS_DEV=doppler run --config dev --');
    assert.deepEqual(r.calls, ['doppler run --config dev -- docker compose --project-directory . -p demo-dev -f infra/docker-compose.dev.yml ps']);
    clear();
    assert.match(make('local-status', 'SECRETS_DEV=doppler run --').calls[0], /^docker compose/);
  });
});

test('setup copies env examples and never overwrites an existing file', () => {
  withProject(({ project, make }) => {
    mkdirSync(join(project, 'apps/api'), { recursive: true });
    mkdirSync(join(project, 'apps/client'), { recursive: true });
    writeFileSync(join(project, 'apps/api/.env.example'), 'NEW=1\n');
    writeFileSync(join(project, 'apps/client/.env.example'), 'NEW=1\n');
    writeFileSync(join(project, 'apps/client/.env.local'), 'MINE=1\n');
    assert.equal(make('setup').status, 0);
    assert.equal(readFileSync(join(project, 'apps/api/.env.local'), 'utf8'), 'NEW=1\n');
    assert.equal(readFileSync(join(project, 'apps/client/.env.local'), 'utf8'), 'MINE=1\n');
  });
});

test('setup works in a project with no apps yet', () => {
  withProject(({ make }) => assert.equal(make('setup').status, 0));
});

test('local-reset refuses to delete volumes without confirmation', () => {
  withProject(({ make }) => {
    const r = make('local-reset');
    assert.notEqual(r.status, 0);
    assert.match(r.stdout + r.stderr, /CONFIRM=yes/);
    assert.equal(r.calls.length, 0);
  });
});

test('local-reset deletes the volumes and starts again when confirmed', () => {
  withProject(({ make }) => {
    const { status, calls } = make('local-reset', 'CONFIRM=yes');
    assert.equal(status, 0);
    assert.ok(calls.some((c) => c.endsWith('-f infra/docker-compose.local.yml down -v')));
    assert.ok(calls.at(-1).endsWith('up -d --build --wait'));
  });
});

test('code targets use the package manager, which can be changed', () => {
  withProject(({ make, clear }) => {
    for (const [target, script] of [['test', 'test'], ['test-e2e', 'test:e2e'], ['lint', 'lint'], ['format', 'format'], ['typecheck', 'typecheck']]) {
      clear();
      assert.deepEqual(make(target).calls, [`pnpm run ${script}`], target);
    }
    clear();
    const r = make('test', 'PM=npm');
    assert.equal(r.calls.filter((c) => c.startsWith('pnpm')).length, 0);
  });
});

test('every code target works with npm, which needs the run command', () => {
  withProject(({ make, clear }) => {
    for (const [target, script] of [['test', 'test'], ['test-e2e', 'test:e2e'], ['lint', 'lint'], ['format', 'format'], ['typecheck', 'typecheck']]) {
      clear();
      const r = make(target, 'PM=npm');
      assert.equal(r.status, 0, r.stderr);
      assert.deepEqual(r.calls, [`npm run ${script}`], target);
    }
  });
});

test('a docker command fails clearly when Docker cannot start', () => {
  withProject(({ make }) => {
    const r = make('local-status');
    assert.notEqual(r.status, 0);
    assert.match(r.stdout + r.stderr, /Docker/);
    assert.equal(r.calls.filter((c) => c.startsWith('docker')).length, 0);
  }, { dockerUp: false });
});

test('a project module adds targets to the help, and is optional', () => {
  withProject(({ project, make }) => {
    assert.ok(!existsSync(join(project, 'make/project.mk')));
    writeFileSync(join(project, 'make/project.mk'), 'seed: ## Load demo data\n\t@echo seeded\n');
    const r = make();
    assert.match(r.stdout, /\bseed\s+Load demo data/);
    assert.match(make('seed').stdout, /seeded/);
  });
});

test('the skill documents the targets, and the templates pass with GNU Make 3.81 syntax', () => {
  const skill = readFileSync(new URL('../skills/makefile/SKILL.md', import.meta.url), 'utf8');
  for (const target of ['make local', 'make dev', 'make prod', 'make help']) assert.ok(skill.includes(target), target);
  assert.doesNotMatch(readFileSync(join(ASSETS, 'Makefile'), 'utf8'), /\.ONESHELL/);
});
