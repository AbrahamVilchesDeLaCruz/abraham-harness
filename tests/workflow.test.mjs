import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateReview } from '../skills/factory-workflow/scripts/validate-review.mjs';

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

  assert.match(workflow, /verified isolated workspaces/);
  assert.match(workflow, /integration into its existing working branch/);
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
  assert.match(authorization, /first push, subsequent pushes and PR creation together/);
  assert.match(authorization, /first verified commit lands on the feature branch/);
  assert.match(authorization, /open or update one PR to the configured base/);
  assert.match(authorization, /Merge, publishing into a protected branch, deployment and deletion require their own authorization/);
  assert.match(integration, /Remote writes are opt-in/);
  assert.match(gitWorkflow, /Do not add agent Co-authored-by trailers/);
});

test('review selection is contextual and approval binds all selected verdicts to one commit', () => {
  const matrix = read('skills/factory-workflow/references/review-matrix.md');
  const gate = read('skills/factory-workflow/references/gate.md');

  assert.match(matrix, /`code-reviewer` is required for every code change/);
  assert.match(matrix, /take the union/);
  assert.match(gate, /original feature base and accumulated diff/);

  const base = 'a'.repeat(40);
  const candidate = 'b'.repeat(40);
  const required = ['code-reviewer', 'security'];
  const verdicts = required.map(role => ({ role, base, candidate, status: 'APPROVED', findings: [] }));
  const checks = [{ command: 'npm test', candidate, status: 'passed' }];
  const record = { base, candidate, required, requiredChecks: ['npm test'], checks, verdicts };
  assert.deepEqual(validateReview(record), []);
  assert.match(validateReview({ ...record, verdicts: verdicts.slice(0, 1) }).join(), /Missing verdict: security/);
  assert.match(validateReview({ ...record, verdicts: [...verdicts, verdicts[0]] }).join(), /duplicate/);
  assert.match(validateReview({ ...record, checks: [{ ...checks[0], status: 'pending' }] }).join(), /passing result/);
  assert.match(validateReview({ ...record, checks: [] }).join(), /passing result/);
  assert.match(validateReview({ ...record, verdicts: [verdicts[0], { ...verdicts[1], findings: [{ severity: 'blocker' }] }] }).join(), /Unresolved blocker/);
  for (const status of ['BLOCKED', 'CHANGES_REQUESTED']) {
    assert.match(validateReview({ ...record, verdicts: [verdicts[0], { ...verdicts[1], status }] }).join(), /Missing approval/);
  }
  assert.match(validateReview({ ...record, verdicts: [verdicts[0], { ...verdicts[1], candidate: base }] }).join(), /Missing approval/);
});

test('runtime-specific capability and model details stay outside common workflow rules', () => {
  const adapters = read('skills/factory-workflow/references/adapters/README.md');
  const workflow = read('skills/factory-workflow/SKILL.md');

  assert.match(adapters, /Keep optional model assignments in runtime configuration/);
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
  assert.match(integration, /final feature candidate/);
  assert.match(integration, /independently published phase/);
  assert.match(integration, /high-risk phase/);
  assert.match(integration, /phase check ledger/);
  assert.match(integration, /full unit suite locally/);
  assert.match(integration, /E2E.*CI/);
  assert.match(integration, /project.*verification policy/i);
  assert.match(integration, /whole requested feature/);
  assert.match(integration, /reserves full suites for CI/);
  assert.match(read('skills/factory-workflow/references/gate.md'), /project.*verification policy/i);
  assert.match(read('skills/plan-create/SKILL.md'), /project's verification policy/);
  assert.match(read('skills/plan-phase-implement/SKILL.md'), /project's verification policy/);
  assert.match(builder, /project's verification policy/);
  assert.doesNotMatch(integration, /full unit and slow E2E suites once before freezing/);
  assert.doesNotMatch(integration, /all task checks on the combined tree/);
  assert.match(read('agents/code-reviewer.md'), /focused tests/);
  assert.match(integration, /Prepare each worktree once/);
});

test('root E2E script orchestrates the run reached by the shared Makefile', () => {
  const make = read('skills/makefile/assets/make/code.mk');
  const bootstrap = read('skills/project-bootstrap/SKILL.md');
  const testing = read('skills/engineering-conventions/references/testing.md');

  assert.match(make, /\$\(PM\) run test:e2e/);
  assert.match(bootstrap, /root `test:e2e` script/);
  assert.match(testing, /root `test:e2e` script/);
  assert.match(testing, /API package `test:e2e`/);
  assert.match(testing, /routine E2E runs in CI/i);
  assert.match(read('skills/factory-workflow/references/publication-authorization.md'), /Pending, failed, stale or missing CI blocks a required merge or deployment/);
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
  assert.match(contract, /Verify access before launch/);
  assert.match(discovery, /Do not pass a path that only exists in the coordinator's checkout/);
  assert.match(read('skills/factory-workflow/references/integration.md'), /readable discovery\/prototype snapshots/);
  assert.match(matrix, /`code-reviewer` is required for every code change/);
  assert.match(workflow, /verified isolated workspaces/);
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

test('domain review and lean PR verification are explicit workflow contracts', () => {
  const discovery = read('skills/factory-workflow/references/discovery.md');
  const model = read('skills/factory-workflow/references/domain-model.md');
  const testing = read('skills/engineering-conventions/references/testing.md');
  const runtime = read('skills/project-bootstrap/references/test-runtime.md');
  const client = read('skills/client-testing/SKILL.md');
  const domain = read('skills/api-domain/SKILL.md');

  assert.match(discovery, /tell the owner briefly what changes and ask whether they want a domain diagram/);
  assert.match(discovery, /Do not invoke `architect` or start the diagram before an explicit yes/);
  assert.match(model, /Do not draft HTML, invoke `architect` or perform diagram-specific research before an explicit yes/);
  assert.match(model, /If the owner says no, record the choice and continue/);
  assert.match(model, /domain-model\/index\.html/);
  assert.match(domain, /explicit domain type/);
  assert.match(testing, /80% each for branches, functions, lines and statements/);
  assert.match(runtime, /pull requests only/);
  assert.match(runtime, /Do not add a routine push trigger/);
  assert.match(client, /choose one primary level per risk/);
  assert.match(client, /desktop and phone sizes/);
});
