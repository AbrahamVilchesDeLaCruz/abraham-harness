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
    assert.match(outside, /\| Skill \| Trigger \| Description \|/, name);
  }
});

test('client bootstrap routes brand, visual design, UX and accessibility to distinct skills', () => {
  const client = template('client');
  const root = template('root');

  assert.match(client, /brand identity, visual tokens[^\n]+`client-branding`/);
  assert.match(client, /visual hierarchy, spacing, density[^\n]+`client-ui-design`/);
  assert.match(client, /user journeys, navigation, forms[^\n]+`client-ux`/);
  assert.match(client, /keyboard, screen-reader, contrast[^\n]+`client-accessibility`/);
  assert.match(client, /\| `client-ui-design` \|/);
  assert.match(client, /\| `client-ux` \|/);
  assert.match(client, /\| `client-accessibility` \|/);
  assert.match(root, /\| `client-ui-design`[\s|]+client/);
  assert.match(root, /\| `client-ux`[\s|]+client/);
  assert.match(root, /\| `client-accessibility`[\s|]+client/);
});

test('API bootstrap routes repository ports and adapters through api-repository', () => {
  const api = template('api');
  const root = template('root');

  assert.match(api, /repository port or persistence adapter \| `api-repository`/);
  assert.match(api, /controllers, persistence entities or framework modules \| `api-infrastructure`/);
  assert.match(api, /\| `api-repository`\s+\| api\s+\|/);
  assert.match(root, /\| `api-repository`\s+\| api\s+\|/);
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

test('install leaves AGENTS.md alone, and reports nothing about it', () => {
  withProject(({ project, run }) => {
    const stale = staleBlock(template('root'));
    write(project, 'AGENTS.md', stale);
    const r = run('install');
    assert.equal(r.status, 0);
    assert.equal(read(project, 'AGENTS.md'), stale);
    assert.doesNotMatch(r.stdout, /skills tables/);
    write(project, 'AGENTS.md', '# Mine\n');
    assert.doesNotMatch(run('install').stderr, /Skipped AGENTS\.md/);
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
    assert.match(r.stdout, /Installing \d+ new harness skill\(s\)/);
    assert.doesNotMatch(r.stdout, /Refreshed the skills tables/);
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

const START = '<!-- abraham-harness:auto-invoke:start -->';
const END = '<!-- abraham-harness:auto-invoke:end -->';

for (const [name, text] of [
  ['a start marker quoted in prose', `The docs mention \`${START}\` here.\n\nMY RULES\n\n${START}\nOLD\n${END}\n`],
  ['two start markers', `${START}\nMY RULES\n${START}\nOLD\n${END}\n`],
  ['a start marker quoted on its own line in a code fence', `\`\`\`\n${START}\n\`\`\`\nMY RULES\n${START}\nOLD\n${END}\n`],
]) {
  test(`${name} keeps the user's text`, () => {
    withProject(({ project, run }) => {
      write(project, 'AGENTS.md', text);
      const r = run('update');
      assert.equal(r.status, 0);
      if (name.includes('prose')) {
        const result = read(project, 'AGENTS.md');
        assert.match(result, /MY RULES/);
        assert.match(result, /The docs mention/);
        assert.doesNotMatch(result, /\nOLD\n/);
      } else {
        assert.equal(read(project, 'AGENTS.md'), text);
        assert.match(r.stderr, /Skipped AGENTS\.md: broken abraham-harness block "auto-invoke"/);
      }
    });
  });
}

test('both markers quoted in prose never receive the table', () => {
  withProject(({ project, run }) => {
    const text = `Between \`${START}\` and \`${END}\` lives the table.\n`;
    write(project, 'AGENTS.md', text);
    const r = run('update');
    assert.equal(read(project, 'AGENTS.md'), text);
    assert.match(r.stderr, /no abraham-harness blocks/);
  });
});

test('markers with CRLF line endings still work', () => {
  withProject(({ project, run }) => {
    write(project, 'AGENTS.md', `Mine\r\n${START}\r\nOLD\r\n${END}\r\nAfter\r\n`);
    assert.equal(run('update').status, 0);
    const result = read(project, 'AGENTS.md');
    assert.doesNotMatch(result, /OLD/);
    assert.match(result, /^Mine\r\n/);
    assert.match(result, /After\r\n$/);
  });
});

test('a file that cannot be processed is reported, and the next file still is', () => {
  withProject(({ project, run }) => {
    mkdirSync(join(project, 'AGENTS.md'));
    write(project, 'apps/api/AGENTS.md', staleBlock(template('api')));
    const r = run('update');
    assert.equal(r.status, 0);
    assert.match(r.stderr, /Skipped AGENTS\.md: /);
    assert.doesNotMatch(read(project, 'apps/api/AGENTS.md'), /\nstale\n/);
  });
});

test('a file that is not UTF-8 is kept byte for byte and reported', () => {
  withProject(({ project, run }) => {
    const bytes = Buffer.concat([Buffer.from(`${START}\nOLD\n${END}\nCaf`), Buffer.from([0xe9]), Buffer.from('\n')]);
    mkdirSync(project, { recursive: true });
    writeFileSync(join(project, 'AGENTS.md'), bytes);
    const r = run('update');
    assert.equal(r.status, 0);
    assert.ok(readFileSync(join(project, 'AGENTS.md')).equals(bytes));
    assert.match(r.stderr, /Skipped AGENTS\.md: /);
  });
});
