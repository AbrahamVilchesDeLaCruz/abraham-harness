#!/usr/bin/env node
// Thin wrapper over the skills CLI: it fixes the source and the target agents for every project.
import { spawnSync } from 'node:child_process';

const SOURCE = 'AbrahamVilchesDeLaCruz/abraham-harness';
const AGENTS = ['claude-code', 'codex', 'opencode'];
const SKILLS_CLI = ['-y', 'skills@latest'];

const USAGE = `Usage: abraham-harness [command] [options]

Commands:
  install   Install every skill for ${AGENTS.join(', ')} (default)
  update    Update the installed skills
  check     Check for updates (exits with code 1 when one is available)

Options are forwarded to the skills CLI, for example: abraham-harness install --global
`;

const COMMANDS = {
  install: ['add', SOURCE, '--skill', '*', ...AGENTS.flatMap((agent) => ['-a', agent]), '-y'],
  update: ['update', '-y'],
  check: ['check'],
};

const argv = process.argv.slice(2);
if (argv[0] === '--help' || argv[0] === '-h') {
  process.stdout.write(USAGE);
  process.exit(0);
}

const hasCommand = argv.length > 0 && !argv[0].startsWith('-');
const command = hasCommand ? argv[0] : 'install';
const options = hasCommand ? argv.slice(1) : argv;

if (!Object.hasOwn(COMMANDS, command)) {
  process.stderr.write(`Unknown command "${command}"\n\n${USAGE}`);
  process.exit(1);
}

const isWindows = process.platform === 'win32';
const result = spawnSync(isWindows ? 'npx.cmd' : 'npx', [...SKILLS_CLI, ...COMMANDS[command], ...options], {
  stdio: 'inherit',
  shell: isWindows,
});

if (result.error) {
  process.stderr.write(`Could not run npx: ${result.error.message}\n`);
  process.exit(1);
}
process.exit(result.status ?? 1);
