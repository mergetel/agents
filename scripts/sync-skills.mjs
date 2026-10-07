// Copies the published Merge & Tell skills into this plugin.
//
// The skills are written in the Merge & Tell app repository, under
// `plugins/merge-and-tell/skills/`, which is private. The app serves a copy of each at
// https://merge.tel/skills/<id>.md and lists them at https://merge.tel/skills.txt.
// That copy is what this script reads: it is public, the app's own tests pin its
// shape, and it needs no token to fetch. This repository holds the copy a plugin
// install carries.
//
// When anything changed, the patch version is bumped in every manifest, because
// Claude Code only offers an update when the version moves. Run with
// `node scripts/sync-skills.mjs`; the daily workflow runs it too. SKILLS_INDEX points
// it at another deployment (a local dev server) for a dry run.

import { appendFileSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const INDEX = process.env.SKILLS_INDEX ?? 'https://merge.tel/skills.txt';
const skillsDir = path.join(root, 'plugins/merge-and-tell/skills');
const VERSIONED = [
  'plugins/merge-and-tell/plugin.json',
  'plugins/merge-and-tell/.claude-plugin/plugin.json',
  '.claude-plugin/marketplace.json',
  '.cursor-plugin/marketplace.json',
];

async function text(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} answered ${res.status}`);
  return (await res.text()).replace(/\r\n/g, '\n');
}

// The index lists each skill as an `id` line followed by a `fetch` line.
const index = await text(INDEX);
const listed = [...index.matchAll(/^\s+id\s+(\S+)\n\s+fetch\s+(\S+)$/gm)].map(([, id, url]) => ({ id, url }));
if (listed.length === 0) throw new Error(`${INDEX} lists no skills; refusing to delete them all`);

const changed = [];
for (const { id, url } of listed) {
  const body = await text(url);
  // A real skill starts with frontmatter naming itself. Anything else (an error page,
  // a login redirect's HTML) must never land where a host expects a skill.
  if (!body.startsWith('---\n') || !new RegExp(`^name: ${id}$`, 'm').test(body)) {
    throw new Error(`${url} did not return the ${id} skill`);
  }
  const file = path.join(skillsDir, id, 'SKILL.md');
  const before = existsSync(file) ? readFileSync(file, 'utf8').replace(/\r\n/g, '\n') : null;
  if (before !== body) {
    mkdirSync(path.dirname(file), { recursive: true });
    writeFileSync(file, body, 'utf8');
    changed.push(before === null ? `added ${id}` : `updated ${id}`);
  }
}

// A skill the app stopped publishing leaves the plugin too.
const keep = new Set(listed.map((s) => s.id));
for (const id of existsSync(skillsDir) ? readdirSync(skillsDir) : []) {
  if (!keep.has(id)) {
    rmSync(path.join(skillsDir, id), { recursive: true });
    changed.push(`removed ${id}`);
  }
}

let version = JSON.parse(readFileSync(path.join(root, VERSIONED[0]), 'utf8')).version;
if (changed.length > 0) {
  const [major, minor, patch] = version.split('.').map(Number);
  const next = `${major}.${minor}.${patch + 1}`;
  for (const rel of VERSIONED) {
    const file = path.join(root, rel);
    const before = readFileSync(file, 'utf8');
    const after = before.replaceAll(`"version": "${version}"`, `"version": "${next}"`);
    if (after === before) throw new Error(`${rel} does not carry version ${version}; run node scripts/check.mjs`);
    writeFileSync(file, after, 'utf8');
  }
  version = next;
}

console.log(changed.length > 0 ? `${changed.join(', ')}; version ${version}` : `skills unchanged; version ${version}`);
if (process.env.GITHUB_OUTPUT) {
  appendFileSync(process.env.GITHUB_OUTPUT, `changed=${changed.length > 0}\nversion=${version}\nsummary=${changed.join(', ')}\n`);
}
