#!/usr/bin/env node
// Validates every skill so a release can never ship a broken or project-specific skill.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { ACCESS_LEVELS, loadRoles } from '../lib/agents.mjs';

const FORBIDDEN_TERMS = ['flashcard', 'ididntcatchthat', 'tfm', 'big-school', 'elevenlabs', 'deepseek', 'doppler'];
const FORBIDDEN = new RegExp(`\\b(${FORBIDDEN_TERMS.join('|')})\\b`, 'i');
const REQUIRED_FIELDS = ['name', 'description', 'license'];
// Concept skills describe patterns. Framework details belong in stack-* skills.
const FRAMEWORK = /(@nestjs|NestJS|TypeORM|typeorm|class-validator|class-transformer|Passport|@Injectable|@Controller|@Module|useState|useEffect|useQuery|useMutation|TanStack|React|Zustand|\bJest\b|jest\.|jest-mock|Vitest|Playwright|\bMSW\b|RabbitMQ|amqplib|\bpino\b|Prometheus|OpenTelemetry|Swagger|\bJoi\b|Faker|queryRunner|AppDataSource|\bdataSource\b|queryFn|mutationFn|mutateAsync|staleTime|invalidateQueries|QueryClient|\.tsx|\.jsx|\bJSX\b|mock<|migrationsRun|migrationsTableName|LOKI_URL|AMQP_URI|qb\.|mockReset|mockResolvedValue|\.mock\.calls|IS_PUBLIC_KEY|SharedModule|AppModule|AuthModule|\.module\.ts|\.decorator\.ts|@CurrentUser|queryKey|onSuccess)/;
const STACK_SKILL_NAME = /stack-[a-z-]+/g;
const CONCEPT_SKILL = /^(api|client)-/;
const PINNED_VERSION = /\b([A-Z][\w.]+ v\d+)\b/;
const SPANISH_WORDS = /\b(que|para|los|las|una|del|con|cuando|debe|nunca|siempre|desde|como|tambi\u00e9n)\b/gi;
const MAX_SPANISH_RATIO = 0.03;
const MIN_SPANISH_WORDS = 5;
const FENCE = /^[ \t]*```[\s\S]*?^[ \t]*```[ \t]*$/gm;
// Conventions the project replaced. Keep these narrow, so they cannot match unrelated text.
const RETIRED_CONVENTION = /(containers\/|total_items|total_pages|page_size|has_next_page|has_prev_page|request_id|\[State, Handlers\]|__mothers__|criteria\.(limit|offset)|(query|request)\.(limit|offset)|getStatusCode|ResponseOrderCompleter|spec-planner|finding-verifier)/;
const MOJIBAKE = /[\u00c3\u00c2][\u0080-\u00bf]|\u00e2\u20ac/;
const LINK = /\]\(([^)\s]+)\)/g;
const MAX_DESCRIPTION = 250;
const MAX_BODY = 4000; // Roughly the style guide's hard maximum of 1000 tokens.
const REQUIRED_SECTIONS = ['## Activation Contract', '## Hard Rules'];

const root = resolve(process.argv[2] ?? 'skills');
const agentsRoot = process.argv[3] ? resolve(process.argv[3]) : null;
const errors = [];
const label = (path) => relative(root, path).split(sep).join('/');

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

function parseFrontmatter(text) {
  const match = text.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;
  const fields = {};
  for (const line of match[1].split('\n')) {
    const field = line.match(/^(\w[\w-]*):\s*(.*)$/);
    if (field) fields[field[1]] = field[2].replace(/^["']|["']$/g, '');
  }
  return fields;
}

function checkBody(path, text) {
  const body = text.replace(/^---\n[\s\S]*?\n---\n/, '').trim();
  if (body.length > MAX_BODY) errors.push(`${label(path)}: body has ${body.length} characters, the budget is ${MAX_BODY}`);
  const lines = body.split('\n');
  const positions = REQUIRED_SECTIONS.map((section) => lines.indexOf(section));
  REQUIRED_SECTIONS.forEach((section, i) => {
    if (positions[i] === -1) errors.push(`${label(path)}: missing section "${section}"`);
  });
  if (positions.every((p) => p !== -1) && positions[0] > positions[1]) {
    errors.push(`${label(path)}: "${REQUIRED_SECTIONS[0]}" must come before "${REQUIRED_SECTIONS[1]}"`);
  }
}

function checkFrontmatter(skillDir, path) {
  const dirName = label(skillDir);
  const text = readFileSync(path, 'utf8');
  checkBody(path, text);
  const fields = parseFrontmatter(text);
  if (!fields) {
    errors.push(`${label(path)}: missing frontmatter`);
    return;
  }
  for (const field of REQUIRED_FIELDS) {
    if (!fields[field]) errors.push(`${label(path)}: missing field "${field}"`);
  }
  if (fields.name && fields.name !== dirName) {
    errors.push(`${label(path)}: name "${fields.name}" must match directory "${dirName}"`);
  }
  if (fields.description && fields.description.length > MAX_DESCRIPTION) {
    errors.push(`${label(path)}: description exceeds ${MAX_DESCRIPTION} characters`);
  }
  if (fields.description && !fields.description.includes('Trigger:')) {
    errors.push(`${label(path)}: description must include "Trigger:"`);
  }
}

function checkLanguage(path, content) {
  const prose = content.replace(FENCE, '').replace(/`[^`\n]*`/g, '');
  const words = prose.split(/\s+/).length;
  const spanish = (prose.match(SPANISH_WORDS) ?? []).length;
  if (spanish >= MIN_SPANISH_WORDS && spanish / words > MAX_SPANISH_RATIO) errors.push(`${label(path)}: text is not in English`);
}

// Installers copy one skill directory, so any link leaving it would break after install.
function checkMarkdown(skillDir, path) {
  const inTemplates = label(path).includes('/assets/');
  const isConcept = CONCEPT_SKILL.test(label(skillDir));
  const content = readFileSync(path, 'utf8');
  checkLanguage(path, content);
  const lines = content.split('\n');
  lines.forEach((line, index) => {
    const term = line.match(FORBIDDEN);
    if (term) errors.push(`${label(path)}:${index + 1}: project-specific term "${term[1].toLowerCase()}"`);
    const framework = isConcept && line.replace(STACK_SKILL_NAME, '').match(FRAMEWORK);
    if (framework) errors.push(`${label(path)}:${index + 1}: concept skill names framework "${framework[1]}"`);
    const pinned = line.match(PINNED_VERSION);
    if (pinned) errors.push(`${label(path)}:${index + 1}: pinned version "${pinned[1]}"`);
    const retired = line.match(RETIRED_CONVENTION);
    if (retired) errors.push(`${label(path)}:${index + 1}: retired convention "${retired[1]}"`);
    if (MOJIBAKE.test(line)) errors.push(`${label(path)}:${index + 1}: corrupted encoding`);
    if (inTemplates) return;
    for (const [, raw] of line.matchAll(LINK)) {
      if (/^(https?:|mailto:|#)/.test(raw) || raw.includes('{')) continue;
      const target = resolve(dirname(path), raw.split('#')[0]);
      const inside = target === skillDir || target.startsWith(skillDir + sep);
      if (!inside || !existsSync(target)) errors.push(`${label(path)}:${index + 1}: broken link "${raw}"`);
    }
  });
}

const skillDirs = readdirSync(root)
  .map((name) => join(root, name))
  .filter((path) => statSync(path).isDirectory());

for (const skillDir of skillDirs) {
  const skillFile = join(skillDir, 'SKILL.md');
  if (!existsSync(skillFile)) {
    errors.push(`${label(skillDir)}: missing SKILL.md`);
    continue;
  }
  checkFrontmatter(skillDir, skillFile);
  for (const path of walk(skillDir).filter((file) => file.endsWith('.md'))) checkMarkdown(skillDir, path);
}

if (agentsRoot) {
  for (const role of loadRoles(agentsRoot)) {
    if (!ACCESS_LEVELS.includes(role.access)) errors.push(`agents/${role.name}.md: unknown access "${role.access}"`);
    for (const skill of role.skills) {
      if (!existsSync(join(root, skill, 'SKILL.md'))) errors.push(`agents/${role.name}.md: unknown skill "${skill}"`);
    }
  }
}

if (errors.length > 0) {
  console.error(errors.join('\n'));
  console.error(`\n${errors.length} problem(s) found`);
  process.exit(1);
}
console.log(`${skillDirs.length} skills OK`);
