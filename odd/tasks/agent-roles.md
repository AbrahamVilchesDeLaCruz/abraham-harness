Objective: install role agents for Claude Code, Codex and OpenCode that use the harness skills and gate approval on four reviewers. Branch: feat/agent-roles (stacked on feat/skill-quality).
Delivery: single-pr. Test runner: node --test.

## Specs

- S1. "me gustaría los roles de IA factory cómo tienen en: https://github.com/ericrisco/rsc-harness (spec-writter / planner, builder, security, UX, UI, code-reviewer, estos últimos 4 deben estar positivos para que el approver de cómo buena)"
- S2. "que usen estas skills para programar, plantear y corregir testear"
- S3. Assumption: "spec-writter / planner" is one role, `spec-planner`. rsc-harness has no such roles, so the user's description is the specification.
- S4. The installer writes the agents for the three tools, and never overwrites a file it did not generate.

## Tasks

- [x] T1 S1-S4 role definitions, renderer, installer and workflow skill. Route: inline, no writer reason.

## Log

- L1 (2026-11-02): "También había pensado en crear el agentes específicos para los diferentes roles del sw y que usen estas skills para programar, plantear y corregir testear"
- L2 (2026-11-02): the S1 quote above. Engram mirror pending: no Engram tool is available in this session.
- L3: Independent verification (risk item 5) found 4 blockers: the --global test wrote to the real home because it inherited HOME; --help, --list and --dry-run wrote agents; update created agents and missed global ones; -gy and --global=true were not detected as global. All corrected with tests. Also corrected: base commit stays fixed across review rounds, exact marker line matching, access validation, and clear write errors.
