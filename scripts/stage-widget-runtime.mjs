// Stage the widget runtime into public/ so the CRA build ships it.
//
// Why this exists: the embed snippet customers paste points at
// REACT_APP_WIDGET_CDN_URL (e.g. https://<host>/widget/v1/pulseem.js). CRA only
// copies public/ and compiles src/, so widget-runtime/ at the repo root was never
// part of any deploy — the snippet resolved to 404 on every customer site while
// the admin UI looked perfectly healthy.
//
// widget-runtime/ stays the single source of truth; this copies the shippable
// subset into public/widget/v1/ before each build and start. public/widget/ is
// gitignored, so there is no second copy to drift.
//
// Not shipped: dev-server.mjs, demo/, README.md — local development only.
import { existsSync, mkdirSync, copyFileSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, 'widget-runtime');
const dest = join(root, 'public', 'widget', 'v1');

const FILES = [
  ['pulseem.js', 'pulseem.js'],
  ['app/index.html', 'app/index.html'],
  ['app/widget.js', 'app/widget.js'],
  ['app/widget.css', 'app/widget.css'],
];

if (!existsSync(src)) {
  console.error(`[widget-runtime] source missing: ${src}`);
  process.exit(1);
}

// Rebuild from scratch so a file deleted upstream cannot linger in a deploy.
rmSync(dest, { recursive: true, force: true });

let copied = 0;
for (const [from, to] of FILES) {
  const a = join(src, from);
  const b = join(dest, to);
  if (!existsSync(a)) {
    console.error(`[widget-runtime] missing ${from} — the embed snippet will 404 without it`);
    process.exit(1);
  }
  mkdirSync(dirname(b), { recursive: true });
  copyFileSync(a, b);
  copied++;
}

console.log(`[widget-runtime] staged ${copied} file(s) -> public/widget/v1/`);
