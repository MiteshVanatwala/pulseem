# CLAUDE.md

Guidance for Claude Code when working in this repository.

**This is the live React working copy.** Branch `NewClalDesign`. Any `ReactCode/src` folder
you find under `ClalNewDesign` is a stale plain-folder copy — never edit it, and never use it
to decide whether a feature exists. See `~/.claude/CLAUDE.md` → Source of Truth.

## What This Is

The Pulseem customer-facing React app, served from `https://www.pulseem.co.il/react/`
(`homepage` in package.json — build output is path-sensitive, do not change it casually).
It talks to the C# API in `C:\BitBucketProjects\WebSiteApiNew` (branch `ClientsEnv`).

## Stack

| | |
|---|---|
| React | **17.0.2** — pinned exact, no caret |
| Types | `@types/react` `^18.0.19`, **18.0.21 installed** |
| Build | `react-scripts` 5.0.1 (CRA), TypeScript `^4.8.3` |
| State | Redux Toolkit + react-redux 7 |
| UI | Material-UI **v4** (`@material-ui/*`) and MUI **v5** (`@mui/*`) side by side |
| RTL | `jss-rtl`; i18n via `i18next` / `react-i18next` |
| Email editor | `@mailupinc/bee-plugin` |
| E2E | Cypress (devDependency) |

## Build Environment — read before touching dependencies

There is **no `.npmrc`**, so the flag is not automatic:

```bash
npm install --legacy-peer-deps
```

Without it the install fails on peer-dependency conflicts (React 17 runtime against
React-18-era type and component packages). Running a type-check before a successful install
produces a wall of phantom errors that look like real breakage.

**The TS2786 trap** (`'X' cannot be used as a JSX component`). The combination currently
installed and building is:

```
react 17.0.2  +  @types/react 18.0.21  +  react-icons 5.3.0
```

Note that `package.json` declares `react-icons: ^5.6.0` — **that is not what is installed.**
A fresh `npm install` will resolve a newer react-icons and can reintroduce TS2786. If you hit
it, the fix is the dependency triple, not the component code and not `tsconfig`. Do not bump
`@types/react` or `react-icons` independently, and do not "fix" it by casting components.

Build and type-check:

```bash
npm run build
```

`build` runs with `--max_old_space_size=8000`; the `-ssl` variants add
`--openssl-legacy-provider` for older Node. Report pre-existing project errors separately from
errors your change introduced — this project does not build clean from a cold checkout.

## Layout

`src/` — `screens/` (pages), `components/`, `Shared/`, `redux/`, `hooks/`, `helpers/`,
`config/`, `style/`, `assets/`.

**Trap:** both `src/model/` and `src/Models/` exist. Windows paths are case-insensitive but
imports are not consistently cased — check which one a file actually imports from before
adding to either.

Feature specs live at the repo root as markdown: `SMARTSEND-PHASE2-CONTRACT.md`,
`SMARTSEND-PHASE2-BUILD-PROMPT.md`, `SMARTSEND-PHASE2-PROGRESS.md`,
`PROMPT_REACT_CLIENT_CHANGES.md`. Read the contract before implementing against it — do not
infer the spec from the code.

## Conventions

- **The UI is RTL Hebrew.** Every layout change has to be checked in RTL: dropdown anchoring,
  icon direction, text alignment, graph clipping. LTR-correct is not correct here.
- Verify interactions end-to-end, not just that they compile. A draggable-icon change once
  shipped fully draggable and completely un-clickable, because pointer capture on the wrapper
  swallowed every `onClick`.
- Prefer MUI v5 (`@mui/material`) for new code; do not migrate existing v4 screens as a side
  effect of an unrelated change.
- When asked to delete failing test files, delete them. Do not repair them first.

## Safety

- Never commit, never push — enforced by `~/.claude/hooks/guard-shell.js`. Leave changes in
  the working tree and report what changed.
- Do not change `homepage`, `browserslist`, or the `--max_old_space_size` flags without being
  asked; they are deployment-load-bearing.
- Before a wide edit, check whether the same component also exists in a sibling repo — see the
  `blast-radius` skill.
