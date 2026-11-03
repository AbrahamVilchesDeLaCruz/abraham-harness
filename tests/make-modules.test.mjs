import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { chmodSync, cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { delimiter, join } from 'node:path';
import { createHash } from 'node:crypto';

const BIN = new URL('../bin/abraham-harness.mjs', import.meta.url).pathname;
const ASSETS = new URL('../skills/makefile/assets/', import.meta.url).pathname;
const MODULES = ['local.mk', 'dev.mk', 'prod.mk', 'code.mk'];
const asset = (name) => readFileSync(join(ASSETS, 'make', name), 'utf8');

function stamped(body) {
  const hash = createHash('sha256').update(body).digest('hex');
  return `# Managed by abraham-harness, sha256=${hash}. Put your own targets in make/project.mk.\n${body}`;
}

function withProject(fn, exitCode = 0) {
  const root = mkdtempSync(join(tmpdir(), 'harness-modules-'));
  try {
    const project = join(root, 'project');
    const bin = join(root, 'bin');
    mkdirSync(project);
    mkdirSync(bin);
    writeFileSync(join(bin, 'npx'), `#!/bin/sh\nexit ${exitCode}\n`);
    chmodSync(join(bin, 'npx'), 0o755);
    const run = (...args) =>
      spawnSync(process.execPath, [BIN, ...args], {
        cwd: project,
        encoding: 'utf8',
        env: { ...process.env, HOME: root, PATH: `${bin}${delimiter}${process.env.PATH}` },
      });
    return fn({ project, run });
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

const install = (project) => cpSync(ASSETS, project, { recursive: true });
const read = (project, path) => readFileSync(join(project, path), 'utf8');

test('every shared module carries a valid stamp, and the root Makefile and project module do not', () => {
  for (const name of MODULES) {
    const [first, ...rest] = asset(name).split('\n');
    const expected = createHash('sha256').update(rest.join('\n')).digest('hex');
    assert.ok(first.includes(`sha256=${expected}`), `${name} has a stale stamp: run node scripts/stamp-make.mjs`);
  }
  assert.doesNotMatch(readFileSync(join(ASSETS, 'Makefile'), 'utf8'), /sha256=/);
  assert.ok(!existsSync(join(ASSETS, 'make/project.mk')));
});

test('update refreshes an old unedited module', () => {
  withProject(({ project, run }) => {
    install(project);
    const old = stamped('# An older version\nold-target:\n');
    writeFileSync(join(project, 'make/local.mk'), old);
    const r = run('update');
    assert.equal(r.status, 0, r.stderr);
    assert.equal(read(project, 'make/local.mk'), asset('local.mk'));
    assert.match(r.stdout, /Refreshed 1 make module/);
  });
});

test('update keeps a module edited by hand, and reports it', () => {
  withProject(({ project, run }) => {
    install(project);
    const edited = `${asset('dev.mk')}\nmine: ## Mine\n\t@echo mine\n`;
    writeFileSync(join(project, 'make/dev.mk'), edited);
    const r = run('update');
    assert.equal(r.status, 0);
    assert.equal(read(project, 'make/dev.mk'), edited);
    assert.match(r.stderr, /Skipped make\/dev\.mk: edited by hand\. Move your change to make\/project\.mk/);
  });
});

test('update keeps a module with a note on its stamp line, and reports it', () => {
  withProject(({ project, run }) => {
    install(project);
    const noted = asset('dev.mk').replace('make/project.mk.\n', 'make/project.mk. Keep this: staging only.\n');
    assert.notEqual(noted, asset('dev.mk'));
    writeFileSync(join(project, 'make/dev.mk'), noted);
    const r = run('update');
    assert.equal(r.status, 0);
    assert.equal(read(project, 'make/dev.mk'), noted);
    assert.match(r.stderr, /Skipped make\/dev\.mk: /);
  });
});

test('update keeps a module without a stamp, and reports it', () => {
  withProject(({ project, run }) => {
    install(project);
    writeFileSync(join(project, 'make/code.mk'), 'mine:\n');
    const r = run('update');
    assert.equal(read(project, 'make/code.mk'), 'mine:\n');
    assert.match(r.stderr, /Skipped make\/code\.mk: /);
  });
});

test('update never touches the root Makefile or the project module', () => {
  withProject(({ project, run }) => {
    install(project);
    writeFileSync(join(project, 'Makefile'), 'PROJECT = mine\n');
    writeFileSync(join(project, 'make/project.mk'), 'seed:\n');
    run('update');
    assert.equal(read(project, 'Makefile'), 'PROJECT = mine\n');
    assert.equal(read(project, 'make/project.mk'), 'seed:\n');
  });
});

test('update stays quiet when the modules are current, and creates nothing in a project without them', () => {
  withProject(({ project, run }) => {
    let r = run('update');
    assert.equal(r.stdout, '');
    assert.ok(!existsSync(join(project, 'make')));
    install(project);
    r = run('update');
    assert.equal(r.stdout, '');
    assert.equal(r.stderr, '');
  });
});

for (const args of [['install'], ['check'], ['update', '--help'], ['update', '--global']]) {
  test(`${args.join(' ')} leaves the modules alone`, () => {
    withProject(({ project, run }) => {
      install(project);
      const old = stamped('# An older version\n');
      writeFileSync(join(project, 'make/local.mk'), old);
      run(...args);
      assert.equal(read(project, 'make/local.mk'), old);
    });
  });
}

test('a failing skills CLI leaves the modules alone', () => {
  withProject(({ project, run }) => {
    install(project);
    const old = stamped('# An older version\n');
    writeFileSync(join(project, 'make/local.mk'), old);
    assert.equal(run('update').status, 3);
    assert.equal(read(project, 'make/local.mk'), old);
  }, 3);
});

test('a module that cannot be processed is reported, and the next one still is', () => {
  withProject(({ project, run }) => {
    install(project);
    rmSync(join(project, 'make/code.mk'));
    mkdirSync(join(project, 'make/code.mk'));
    writeFileSync(join(project, 'make/dev.mk'), stamped('# An older version\n'));
    const r = run('update');
    assert.equal(r.status, 0);
    assert.match(r.stderr, /Skipped make\/code\.mk: /);
    assert.equal(read(project, 'make/dev.mk'), asset('dev.mk'));
  });
});

test('a stamped module still works with make', () => {
  withProject(({ project }) => {
    install(project);
    const r = spawnSync('make', ['PROJECT=demo', 'help'], { cwd: project, encoding: 'utf8' });
    assert.equal(r.status, 0, r.stderr);
    assert.match(r.stdout, /local-down/);
    assert.doesNotMatch(r.stdout, /sha256/);
  });
});
