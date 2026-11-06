import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const read = (path) => readFileSync(join(root, path), 'utf8');

test('workflow contracts require isolated task branches and a serial fallback', () => {
  const workflow = read('skills/factory-workflow/SKILL.md');
  const tasks = read('skills/factory-workflow/references/task-contract.md');
  const integration = read('skills/factory-workflow/references/integration.md');

  assert.match(workflow, /separate branches and worktrees/);
  assert.match(workflow, /Push, PR creation, parent-branch integration and PR merge are not authorized by default/);
  assert.match(workflow, /specifically authorized by the user/);
  for (const field of ['Dependencies', 'Base commit', 'Branch', 'Worktree', 'Authorized paths', 'Checks']) {
    assert.match(tasks, new RegExp(`- ${field}:`));
  }
  assert.match(integration, /Builders commit completed work locally/);
  assert.match(integration, /do not launch concurrent builders in the same checkout/);
  assert.match(integration, /seam checks/);
});

test('project policy and scoped user authorization govern worktree integration and publication', () => {
  const authorization = read('skills/factory-workflow/references/publication-authorization.md');
  const gitWorkflow = read('skills/git-workflow/SKILL.md');
  const rootTemplate = read('skills/project-bootstrap/assets/AGENTS.root.template.md');
  const integration = read('skills/factory-workflow/references/integration.md');

  assert.match(rootTemplate, /Project-specific `AGENTS\.md`, `docs\/`, CI and branch\/PR policy take precedence/);
  assert.match(authorization, /authorizes only the operations it names/);
  assert.match(authorization, /Integrate a task worktree into a feature\/fix parent only when/);
  assert.match(authorization, /Do not invent an issue link or size exception/);
  assert.match(authorization, /Merge only when the specific merge operation is authorized/);
  assert.match(integration, /Remote writes are opt-in/);
  assert.match(gitWorkflow, /A task\/worktree branch may target a feature\/fix parent/);
});

test('review selection is contextual and approval binds all selected verdicts to one commit', () => {
  const matrix = read('skills/factory-workflow/references/review-matrix.md');
  const gate = read('skills/factory-workflow/references/gate.md');
  const approver = read('agents/approver.md');

  assert.match(matrix, /`code-reviewer` is required for every code change/);
  assert.match(matrix, /take the union/);
  assert.match(gate, /same base and candidate commit SHAs/);
  assert.match(approver, /every required reviewer in the selected set/);
  assert.match(approver, /git rev-parse HEAD/);
});

test('runtime-specific capability and model details stay outside common workflow rules', () => {
  const adapters = read('skills/factory-workflow/references/adapters/README.md');
  const workflow = read('skills/factory-workflow/SKILL.md');

  assert.match(adapters, /Do not put model assignments in common workflow rules/);
  for (const runtime of ['claude-code.md', 'codex.md', 'opencode.md']) {
    assert.match(adapters, new RegExp(runtime.replace('.', '\\.')));
    assert.match(read(`skills/factory-workflow/references/adapters/${runtime}`), /serial fallback/);
  }
  assert.match(workflow, /roles responsibility-neutral/);
});

test('visual, UX and accessibility concepts delegate to the relevant optional tools', () => {
  const visual = read('skills/client-ui-design/SKILL.md');
  const sources = read('skills/client-ui-design/references/design-sources.md');
  const ux = read('skills/client-ux/SKILL.md');
  const accessibility = read('skills/client-accessibility/SKILL.md');
  const browser = read('skills/stack-vitest/references/client-testing.md');

  assert.match(visual, /spacing scale/);
  assert.match(sources, /Taste/);
  assert.match(sources, /Impeccable/);
  assert.match(sources, /Figma MCP/);
  assert.match(ux, /flow-state-matrix\.md/);
  assert.match(accessibility, /Automated scans are necessary evidence/);
  assert.match(browser, /Visual and accessibility inspection/);
  assert.match(browser, /Do not create brittle pixel snapshots by default/);
});
