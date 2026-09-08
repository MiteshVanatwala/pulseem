// Sync the widget runtime into the pulseem_secured deploy repo.
//
// Why this exists: stage.l-p.site serves the widget from
// pulseem_secured/Site/widget/v1/, which is a hand-maintained copy of
// widget-runtime/ added twelve days after the widget was written. Nothing kept
// the two in step, and forgetting is silent — the widget keeps loading and keeps
// looking healthy while serving stale code. That drift shipped a five-day-old
// app/widget.js to production: chat could not start, and the deployed loader was
// current enough that every visible symptom pointed somewhere else.
//
// widget-runtime/ remains the single source of truth. stage-widget-runtime.mjs
// handles the copy CRA ships (public/widget/v1/, gitignored). This handles the
// copy IIS serves, which lives in another git repo and must be committed there.
//
// Deliberately NOT wired into prestart/prebuild: writing into a sibling repo on
// every dev start would dirty someone else's working tree unannounced. Run it
// when you change the widget:
//
//   npm run widget:sync      copy source -> deploy repo, report what changed
//   npm run widget:check     report drift only, exit 1 if any (for CI or a hook)
//
// Override the destination repo with PULSEEM_SECURED_DIR when it is not a
// sibling of this one.
import { existsSync, readFileSync, mkdirSync, copyFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, 'widget-runtime');
const securedRoot = resolve(process.env.PULSEEM_SECURED_DIR || join(root, '..', 'pulseem_secured'));
const dest = join(securedRoot, 'Site', 'widget', 'v1');

const checkOnly = process.argv.includes('--check');

// The shippable subset, same as stage-widget-runtime.mjs. dev-server.mjs, demo/
// and README.md are local development only and must never reach a deploy.
const FILES = ['pulseem.js', 'app/index.html', 'app/widget.js', 'app/widget.css'];

const label = checkOnly ? '[widget:check]' : '[widget:sync]';

function fail(message) {
  console.error(`${label} ${message}`);
  process.exit(1);
}

if (!existsSync(src)) fail(`source missing: ${src}`);
if (!existsSync(dest)) {
  fail(
    `deploy copy not found: ${dest}\n` +
    `        Set PULSEEM_SECURED_DIR to the pulseem_secured checkout if it is not a sibling directory.`
  );
}

// Compare bytes, not timestamps. The deploy repo's files are checked out fresh
// by git and by whatever runs the deploy, so mtimes say nothing useful about
// whether the contents actually match.
const drifted = [];
const same = [];

for (const file of FILES) {
  const from = join(src, file);
  const to = join(dest, file);

  if (!existsSync(from)) fail(`missing ${file} in widget-runtime/ — refusing to sync a partial runtime`);

  const a = readFileSync(from);
  const b = existsSync(to) ? readFileSync(to) : null;

  if (b === null) drifted.push([file, 'missing in deploy repo']);
  else if (!a.equals(b)) drifted.push([file, `differs (${a.length} vs ${b.length} bytes)`]);
  else same.push(file);
}

if (drifted.length === 0) {
  console.log(`${label} in sync — all ${FILES.length} file(s) match ${dest}`);
  process.exit(0);
}

for (const [file, why] of drifted) console.log(`${label} ${file}: ${why}`);

if (checkOnly) {
  console.error(
    `${label} ${drifted.length} file(s) out of sync. ` +
    `Run "npm run widget:sync", then commit and push in pulseem_secured.`
  );
  process.exit(1);
}

for (const [file] of drifted) {
  const to = join(dest, file);
  mkdirSync(dirname(to), { recursive: true });
  copyFileSync(join(src, file), to);
}

console.log(
  `${label} copied ${drifted.length} file(s) -> ${dest}` +
  (same.length ? ` (${same.length} already current)` : '')
);
console.log(`${label} not committed. In the pulseem_secured repo:`);
console.log(`${label}   git add Site/widget/v1 && git commit && git push`);
console.log(`${label} the deploy reads that branch, so an uncommitted copy never ships.`);
