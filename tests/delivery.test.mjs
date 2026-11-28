import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const gate = fileURLToPath(new URL('../skills/factory-workflow/scripts/validate-review.mjs', import.meta.url));

test('a resumed feature keeps its remote first commit and reviews the accumulated candidate', () => {
  const scratch = mkdtempSync(join(tmpdir(), 'harness-delivery-'));
  try {
    const checkout = join(scratch, 'project');
    const remote = join(scratch, 'remote.git');
    const task = join(scratch, 'worker');
    const evidence = join(scratch, 'review.json');
    const git = (cwd, ...args) => execFileSync('git', args, {
      cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'],
    }).trim();
    const commit = (cwd, name) => {
      writeFileSync(join(cwd, name), name);
      git(cwd, 'add', '--', name);
      git(cwd, 'commit', '-m', name);
      return git(cwd, 'rev-parse', 'HEAD');
    };

    mkdirSync(checkout);
    git(scratch, 'init', '--bare', remote);
    git(checkout, 'init', '-b', 'main');
    git(checkout, 'config', 'user.name', 'Harness fixture');
    git(checkout, 'config', 'user.email', 'fixture@example.test');
    git(checkout, 'config', 'commit.gpgsign', 'false');
    git(checkout, 'config', 'core.hooksPath', join(scratch, 'empty-hooks'));
    const base = commit(checkout, 'base.txt');
    git(checkout, 'switch', '-c', 'feat/product');
    git(checkout, 'remote', 'add', 'origin', remote);
    const first = commit(checkout, 'product.txt');
    git(checkout, 'push', 'origin', 'HEAD:refs/heads/feat/product');

    // Reconstruct from Git after interruption before dispatching a dependent task.
    assert.equal(git(checkout, 'ls-remote', 'origin', 'refs/heads/feat/product'), `${first}\trefs/heads/feat/product`);
    git(checkout, 'worktree', 'add', '-b', 'task/contract', task, first);
    assert.equal(git(task, 'rev-parse', 'HEAD'), first);
    const candidate = commit(task, 'product-contract.txt');
    git(checkout, 'merge', '--ff-only', candidate);
    assert.deepEqual(git(checkout, 'diff', '--name-only', `${base}...${candidate}`).split('\n'),
      ['product-contract.txt', 'product.txt']);

    const record = {
      base, candidate, required: ['code-reviewer'], requiredChecks: ['contract'],
      checks: [{ command: 'contract', candidate, status: 'passed' }],
      verdicts: [{ role: 'code-reviewer', base, candidate, status: 'APPROVED', findings: [] }],
    };
    const review = () => spawnSync(process.execPath, [gate, evidence, checkout], { encoding: 'utf8' });
    writeFileSync(evidence, JSON.stringify(record));
    assert.equal(review().status, 0, review().stdout);
    git(checkout, 'push', 'origin', 'HEAD:refs/heads/feat/product');
    assert.equal(git(checkout, 'ls-remote', 'origin', 'refs/heads/feat/product'), `${candidate}\trefs/heads/feat/product`);

    writeFileSync(join(checkout, 'untracked.txt'), 'dirty');
    assert.match(review().stdout, /checkout is dirty/);
    rmSync(join(checkout, 'untracked.txt'));
    commit(checkout, 'later.txt');
    assert.match(review().stdout, /HEAD differs from the candidate/);
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
});
