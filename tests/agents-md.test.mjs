import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { delimiter, join } from 'node:path';

const BIN = new URL('../bin/abraham-harness.mjs', import.meta.url).pathname;
const assets = new URL('../skills/project-bootstrap/assets/', import.meta.url).pathname;
const template = (name) => readFileSync(join(assets, `AGENTS.${name}.template.md`), 'utf8');
const BLOCK = /<!-- abraham-harness:auto-invoke:start -->[\s\S]*?<!-- abraham-harness:auto-invoke:end -->/;
const staleBlock = (text) => text.replace(BLOCK, '<!-- abraham-harness:auto-invoke:start -->\nstale\n<!-- abraham-harness:auto-invoke:end -->');

function withProject(fn, exitCode = 0) {
  const root = mkdtempSync(join(tmpdir(), 'harness-agentsmd-'));
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

function write(project, path, text) {
  mkdirSync(join(project, path, '..'), { recursive: true });
  writeFileSync(join(project, path), text);
}
const read = (project, path) => readFileSync(join(project, path), 'utf8');

test('every template has the managed blocks and a project skills section outside them', () => {
  for (const name of ['root', 'api', 'client']) {
    const text = template(name);
    for (const block of ['auto-invoke', 'available-skills']) {
      assert.equal(text.split(`<!-- abraham-harness:${block}:start -->`).length, 2, `${name} ${block} start`);
      assert.equal(text.split(`<!-- abraham-harness:${block}:end -->`).length, 2, `${name} ${block} end`);
    }
    const outside = text.replace(/<!-- abraham-harness:([a-z-]+):start -->[\s\S]*?<!-- abraham-harness:\1:end -->/g, '');
    assert.match(outside, /## Project Skills/, name);
  }
});

for (const [path, name] of [['AGENTS.md', 'root'], ['apps/api/AGENTS.md', 'api'], ['apps/client/AGENTS.md', 'client']]) {
  test(`update refreshes the blocks of ${path} and keeps everything else`, () => {
    withProject(({ project, run }) => {
      const mine = `${staleBlock(template(name))}\n| \`my-rule\` | project | Mine |\n\nMy own stack notes.\n`;
      write(project, path, mine);
      const r = run('update');
      assert.equal(r.status, 0, r.stderr);
      const result = read(project, path);
      assert.doesNotMatch(result, /\nstale\n/);
      assert.equal(result.match(BLOCK)[0], template(name).match(BLOCK)[0]);
      assert.match(result, /\| `my-rule` \| project \| Mine \|/);
      assert.match(result, /My own stack notes\./);
      assert.match(r.stdout, /Refreshed the skills tables in 1 AGENTS\.md file/);
    });
  });
}

test('install refreshes the blocks too', () => {
  withProject(({ project, run }) => {
    write(project, 'AGENTS.md', staleBlock(template('root')));
    assert.equal(run('install').status, 0);
    assert.doesNotMatch(read(project, 'AGENTS.md'), /\nstale\n/);
  });
});

test('a second update changes nothing and reports nothing about the tables', () => {
  withProject(({ project, run }) => {
    write(project, 'AGENTS.md', template('root'));
    const r = run('update');
    assert.equal(read(project, 'AGENTS.md'), template('root'));
    assert.doesNotMatch(r.stdout, /skills tables/);
  });
});

test('no AGENTS.md is created in a project without one', () => {
  withProject(({ project, run }) => {
    const r = run('update');
    assert.equal(r.status, 0);
    assert.ok(!existsSync(join(project, 'AGENTS.md')));
    assert.equal(r.stdout, '');
    assert.equal(r.stderr, '');
  });
});

test('an AGENTS.md without blocks is kept and reported', () => {
  withProject(({ project, run }) => {
    write(project, 'AGENTS.md', '# Mine\n');
    const r = run('update');
    assert.equal(r.status, 0);
    assert.equal(read(project, 'AGENTS.md'), '# Mine\n');
    assert.match(r.stderr, /Skipped AGENTS\.md: no abraham-harness blocks/);
  });
});

test('an AGENTS.md with a broken block is kept and reported', () => {
  withProject(({ project, run }) => {
    const broken = '<!-- abraham-harness:auto-invoke:start -->\nmine\n';
    write(project, 'AGENTS.md', broken);
    const r = run('update');
    assert.equal(r.status, 0);
    assert.equal(read(project, 'AGENTS.md'), broken);
    assert.match(r.stderr, /Skipped AGENTS\.md: broken abraham-harness block "auto-invoke"/);
  });
});

for (const args of [['check'], ['update', '--help'], ['update', '--global']]) {
  test(`${args.join(' ')} leaves AGENTS.md alone`, () => {
    withProject(({ project, run }) => {
      const stale = staleBlock(template('root'));
      write(project, 'AGENTS.md', stale);
      run(...args);
      assert.equal(read(project, 'AGENTS.md'), stale);
    });
  });
}

test('a failing skills CLI leaves AGENTS.md alone', () => {
  withProject(({ project, run }) => {
    const stale = staleBlock(template('root'));
    write(project, 'AGENTS.md', stale);
    assert.equal(run('update').status, 3);
    assert.equal(read(project, 'AGENTS.md'), stale);
  }, 3);
});
