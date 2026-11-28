import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const isSha = (value) => typeof value === 'string' && /^(?:[a-f0-9]{40}|[a-f0-9]{64})$/.test(value);
const isRole = (value) => typeof value === 'string' && /^[a-z][a-z0-9-]*$/.test(value);

export function validateReview(record) {
  const { base, candidate, required, checks, verdicts } = record ?? {};
  if (!isSha(base) || !isSha(candidate) || base === candidate) {
    return ['Expected distinct full base and candidate SHAs'];
  }
  if (!Array.isArray(required) || !required.length || !required.every(isRole) || new Set(required).size !== required.length) {
    return ['Expected a non-empty set of unique required roles'];
  }
  if (!Array.isArray(checks) || !checks.length || !Array.isArray(verdicts)) {
    return ['Expected local check evidence and reviewer verdicts'];
  }

  const errors = [];
  for (const check of checks) {
    if (typeof check?.command !== 'string' || !check.command.trim() || check.candidate !== candidate || check.status !== 'passed') {
      errors.push('Each required local check must have a command and a passing result on the candidate');
      break;
    }
  }

  const roles = new Set(required);
  const seen = new Set();
  for (const verdict of verdicts) {
    const role = verdict?.role;
    if (!roles.has(role) || seen.has(role)) {
      errors.push(`Unexpected or duplicate role: ${role}`);
      continue;
    }
    seen.add(role);
    if (verdict.base !== base || verdict.candidate !== candidate || verdict.status !== 'APPROVED') {
      errors.push(`Missing approval for this base and candidate: ${role}`);
    }
  }
  for (const role of required) {
    if (!seen.has(role)) errors.push(`Missing verdict: ${role}`);
  }
  return errors;
}

export function validateCheckout({ base, candidate }, cwd) {
  const git = (...args) => execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  try {
    if (git('rev-parse', 'HEAD') !== candidate) return ['Checkout HEAD differs from the candidate'];
    if (git('status', '--porcelain')) return ['Candidate checkout is dirty'];
    git('merge-base', '--is-ancestor', base, candidate);
    return [];
  } catch {
    return ['Could not verify candidate checkout and base ancestry'];
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const record = JSON.parse(readFileSync(process.argv[2], 'utf8'));
    const errors = validateReview(record);
    if (!errors.length && process.argv[3]) errors.push(...validateCheckout(record, process.argv[3]));
    console.log(JSON.stringify({ approved: errors.length === 0, errors }));
    process.exitCode = errors.length === 0 ? 0 : 1;
  } catch (error) {
    console.error(`Could not validate review: ${error.message}`);
    process.exitCode = 2;
  }
}
