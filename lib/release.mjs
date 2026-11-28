import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { isGenerated, loadRoles, targets } from './agents.mjs';
import { findMissingSkills, listSharedSkills } from './skills.mjs';

export const repository = 'AbrahamVilchesDeLaCruz/abraham-harness';
export const skillsCliVersion = '1.9.1';
const { version } = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));

export const release = {
  version,
  ref: `v${version}`,
  source: `${repository}@v${version}`,
  skillsCliVersion,
};

function readLock(base, isGlobal) {
  const path = isGlobal
    ? process.env.XDG_STATE_HOME
      ? join(process.env.XDG_STATE_HOME, 'skills/.skill-lock.json')
      : join(base, '.agents/.skill-lock.json')
    : join(base, 'skills-lock.json');
  if (!existsSync(path)) return {};
  const { skills } = JSON.parse(readFileSync(path, 'utf8'));
  if (!skills || typeof skills !== 'object' || Array.isArray(skills)) {
    throw new Error(`Invalid skills lock: ${path}`);
  }
  return skills;
}

function isManaged(entry) {
  return typeof entry?.source === 'string' && entry.source.toLowerCase() === repository.toLowerCase();
}

export function inspectRelease({ sourceDir, rolesDir, base, isGlobal }) {
  const catalog = listSharedSkills(sourceDir);
  const roles = loadRoles(rolesDir);
  const missing = findMissingSkills({ sourceDir, base, isGlobal });
  const lock = readLock(base, isGlobal);
  const installed = targets(isGlobal).map(({ runtime, dir, ext, render }) => {
    const roots = runtime === 'claude-code'
      ? ['.claude/skills']
      : runtime === 'codex'
        ? ['.agents/skills', '.codex/skills']
        : ['.agents/skills', isGlobal ? '.config/opencode/skills' : '.opencode/skills'];
    const skills = catalog.map(name => {
      const paths = roots.map(root => `${root}/${name}/SKILL.md`).filter(path => existsSync(join(base, path)));
      const state = !paths.length ? 'missing' : !isManaged(lock[name]) ? 'unmanaged' : lock[name].ref === release.ref ? 'present' : 'different-release';
      return { name, state, paths };
    });
    const installedRoles = roles.map(role => {
      const path = `${dir}/${role.name}.${ext}`;
      const absolute = join(base, path);
      const state = !existsSync(absolute) ? 'missing' : !isGenerated(absolute) ? 'override'
        : readFileSync(absolute, 'utf8') === render(role) ? 'present' : 'different-release';
      return { name: role.name, state, path };
    });
    return { runtime, skills, roles: installedRoles, capabilities: 'unverified' };
  });

  const names = catalog.filter(name => {
    if (!isManaged(lock[name])) return missing.includes(name) && !Object.hasOwn(lock, name);
    if (existsSync(join(base, 'skills', name, 'SKILL.md'))) return false;
    return lock[name].ref !== release.ref || installed.some(runtime =>
      runtime.skills.some(skill => skill.name === name && skill.state === 'missing'));
  });
  return { release, catalog, names, installed };
}
