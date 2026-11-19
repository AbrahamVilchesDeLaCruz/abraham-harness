import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const read = (path) => readFileSync(join(root, path), 'utf8');

test('planning proceeds with documented assumptions and only asks about consequential blockers', () => {
  const plan = read('skills/plan-create/SKILL.md');
  const writer = read('agents/spec-writer.md');
  const workflow = read('skills/factory-workflow/references/sdd.md');
  assert.match(plan, /without asking for a separate plan approval/);
  assert.match(plan, /consequential decision cannot be inferred/);
  assert.match(writer, /Do not require separate approval/);
  assert.match(workflow, /Assumptions recorded/);
});

test('workflow contracts require isolated task branches and a serial fallback', () => {
  const workflow = read('skills/factory-workflow/SKILL.md');
  const tasks = read('skills/factory-workflow/references/task-contract.md');
  const integration = read('skills/factory-workflow/references/integration.md');

  assert.match(workflow, /separate branches and worktrees/);
  assert.match(workflow, /integration into its existing working branch/);
  assert.match(workflow, /remote merge require user authorization/);
  for (const field of ['Dependencies', 'Base commit', 'Branch', 'Worktree', 'Authorized paths', 'Closing checks']) {
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
  assert.match(authorization, /Remote operations require user authorization/);
  assert.match(authorization, /Integrate task worktrees into the existing working branch/);
  assert.match(authorization, /Do not invent an issue link or size exception/);
  assert.match(authorization, /Merge only when the specific merge operation is authorized/);
  assert.match(integration, /Remote writes are opt-in/);
  assert.match(gitWorkflow, /Do not add agent Co-authored-by trailers/);
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
  assert.match(visual, /critique-loop\.md/);
  assert.match(read('skills/client-ui-design/references/critique-loop.md'), /At most three rounds/);
  assert.match(read('skills/client-ui-design/references/motion.md'), /prefers-reduced-motion/);
  assert.match(sources, /Taste/);
  assert.match(sources, /Impeccable/);
  assert.match(sources, /Figma MCP/);
  assert.match(ux, /flow-state-matrix\.md/);
  assert.match(accessibility, /Automated scans are necessary evidence/);
  assert.match(browser, /Visual and accessibility inspection/);
  assert.match(browser, /Do not create brittle pixel snapshots by default/);
});

test('task contract stages verification and builders close their processes', () => {
  const tasks = read('skills/factory-workflow/references/task-contract.md');
  const builder = read('agents/builder.md');
  const integration = read('skills/factory-workflow/references/integration.md');

  for (const field of ['Skills', 'Environment', 'Iteration checks', 'Early checks', 'Closing checks', 'Commit hooks']) {
    assert.match(tasks, new RegExp(`- ${field}:`));
  }
  assert.match(builder, /Stop every process you started/);
  assert.match(builder, /iteration checks/);
  assert.match(integration, /full slow suite exactly once/);
  assert.match(integration, /Prepare each worktree once/);
});

test('pre-spec discovery preserves the default engineering gate and an explicit frontend choice', () => {
  const workflow = read('skills/factory-workflow/SKILL.md');
  const discovery = read('skills/factory-workflow/references/discovery.md');
  const prototype = read('skills/factory-workflow/references/prototype.md');
  const sdd = read('skills/factory-workflow/references/sdd.md');
  const ftd = read('skills/factory-workflow/references/ftd.md');
  const contract = read('skills/factory-workflow/references/task-contract.md');
  const matrix = read('skills/factory-workflow/references/review-matrix.md');

  assert.match(workflow, /references\/discovery\.md/);
  assert.match(ftd, /discovery\.md/);
  assert.match(sdd, /discovery\.md/);
  assert.match(discovery, /ten questions, or fewer/);
  assert.match(discovery, /Never pad a batch/);
  assert.match(discovery, /silently submit A/);
  assert.match(discovery, /navigable HTML prototype or grant creative freedom/);
  assert.match(prototype, /prototype\/index\.html/);
  assert.match(prototype, /do not copy prototype markup/i);
  assert.match(contract, /- Discovery:/);
  assert.match(matrix, /`code-reviewer` is required for every code change/);
  assert.match(workflow, /separate branches and worktrees/);
  assert.doesNotMatch(workflow, /personal\/professional profile/i);
});

test('test-first applies to behavior while presentation-only UI retains visual checks', () => {
  const tdd = read('skills/tdd-workflow/SKILL.md');
  const builder = read('agents/builder.md');
  const visual = read('skills/client-ui-design/SKILL.md');

  assert.match(tdd, /new observable behavior/);
  assert.match(tdd, /presentation-only UI/);
  assert.match(builder, /presentation-only UI/);
  assert.match(visual, /critique-loop\.md/);
});
