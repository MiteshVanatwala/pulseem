# FLIP-NOTES — CLAL CENTER (W3 → W5)

**What this file is:** the exact, line-anchored instructions for W5's *mock-switch commit* — the
single declared commit that disconnects `USE_CC_MOCK` and points the screen at the real
`ClalCenterController`. Written by W3, per `14-W3-ADMIN.md` "תוצרים".

**W3 committed `USE_CC_MOCK = true`** (11-CONTRACTS §C6). The screen runs entirely on the mock
until W5 flips it, which is why **React must not be deployed before the flip** — a deployed
mock screen would show an editor a fabricated tree.

> **Delete this file** in the clean-up commit that follows the flip. It is deliberately excluded
> from the "grep must return 0" gate below only because it is going away with that commit.

---

## 0. Preconditions

* `ClalCenterController` merged and reachable at `api/ClalCenter/*` (11-CONTRACTS §C2).
* The 19 `SQL.SP.ClalCenter_*` keys applied to `Web.config` — or, per the declared relaxation in
  §C2, every SP named identically to its key so `MappingSP.GetSP` falls through safely.
* `ClalCenter.AllowedSubAccountID` set for the environment, and feature `'77'` granted to the
  account under test (owner: SubAccountID **14008** for testing).

---

## 1. `src/redux/reducers/clalCenterSlice.ts`

### 1a. Remove the mock imports — the whole statement, lines 23–27

```ts
import {
    mockGetTree, mockSaveGroup, mockDeleteGroup, mockRestoreGroup, mockReorderGroups,
    mockSetGroupVisibility, mockSaveItem, mockSetStatus, mockDeleteItem, mockRestoreItem,
    mockReorderItems, mockUploadFile, mockPublish, mockGetHistory
} from './_mocks/clalCenterMock';
```

### 1b. Remove the flag and its comment block — lines 29–36

The block opens with `// ── MOCK SWITCH ─…` and ends with `const USE_CC_MOCK = true;`.

### 1c. Remove the fourteen guards

Eleven thunks carry a five-line guard of this exact shape:

```ts
        if (USE_CC_MOCK) {
            try { return await mockXxx(req); }
            catch (error: any) { return thunkAPI.rejectWithValue({ error: toErrorKey(error) }); }
        }
```

They are, in file order:
`saveClalGroup` · `deleteClalGroup` · `restoreClalGroup` · `reorderClalGroups` ·
`setClalGroupVisibility` · `saveClalItem` · `setClalItemStatus` · `deleteClalItem` ·
`restoreClalItem` · `reorderClalItems` · `publishClalCenter`.

Three more are shaped differently:

| where | what to remove |
|---|---|
| `getClalTree` | the single line `if (USE_CC_MOCK) return mockGetTree();` (line 114) |
| `getClalHistory` | the single line `if (USE_CC_MOCK) return mockGetHistory(entityType, entityId, top);` |
| `uploadClalFile` | the whole `if (USE_CC_MOCK) { … }` block — the fake progress ticker and its `finally` |

**Nothing else in the file changes.** `toErrorKey`, `unwrap`, the reducers and the local
optimistic actions are all production code and stay exactly as they are.

---

## 2. `src/screens/ClalCenter/ClalCenterScreen.tsx`

| line | remove |
|---|---|
| 78 | `const USE_CC_MOCK = true;` |
| 161–172 | the `useEffect` that prints the C5 vector table — it opens `if (!USE_CC_MOCK) return;` (line 166) and ends with the `console.table(...)` |

`verifyC5Vectors()` itself **stays** in `searchNormalizer.ts`: it is a pure function with no side
effects, it is the coded form of the §C5 acceptance vectors, and nothing imports it after the flip
except a future test.

---

## 3. Delete exactly one file

```
src/redux/reducers/_mocks/clalCenterMock.ts
```

> 🔴 **THE FOLDER `_mocks/` STAYS.** `dataSourcesMock.ts` and `smartSendMock.ts` live in it and are
> imported by live slices. Deleting the directory breaks two shipped features (11-CONTRACTS §C8).

---

## 4. The gate

```powershell
Select-String -Path (Get-ChildItem -Recurse src -Include *.ts,*.tsx) -Pattern 'USE_CC_MOCK|clalCenterMock'
```

Must return **zero** rows. (`.md` is excluded on purpose — this file still names them until the
clean-up commit removes it.)

---

## 5. Two dev levers that vanish with the mock

Both live only in `clalCenterMock.ts`; after step 3 they no longer exist. Recorded here so a
reader of the mock is not left guessing what they were for.

| lever | what it does |
|---|---|
| `localStorage['cc_mock_empty'] = '1'` then reload | boots an EMPTY tree — the first-screen / starter-template path |
| `window.__ccMockFail = { saveGroupAfter: 12 }` | fails `SaveGroup` after N calls — the partial-starter-failure path |
| `window.__ccMockFail = { reorder: true }` | fails every reorder — the snap-back path |
| `window.__ccMockFail = { publish: true }` | fails `Publish` — the `publish_failed` / partial-publish copy |
| `window.__ccMockFail = { upload: true }` | fails `UploadFile` — "העלאת הקובץ נכשלה — הקובץ הקודם נשאר" |

---

## 6. `tsc` output at hand-off

The acceptance gate is *"`npx tsc --noEmit` prints **exactly** the one known baseline line and
nothing else"* (14-W3 "קריטריוני קבלה", C6 v12 §2). Run on the finished branch:

```
> npx tsc --noEmit
src/screens/Editors/modals/ResponseModal.js(39,9): error TS17001: JSX elements cannot have multiple attributes with the same name.
```

One line. `TS2786 = 0`. Verified that the checker really is looking at the new folder by
temporarily planting `const __probe: number = "not a number";` in `starterTree.ts`, confirming
`src/screens/ClalCenter/starterTree.ts(54,7): error TS2322`, and removing it.

`npm run build` completes: *"The build folder is ready to be deployed."*

### 🔴 6a. A BUILD-BREAKING TRAP THAT IS NOT OURS — read before running `npm install`

That baseline holds **only against the `node_modules` currently on this machine**. It does **not**
survive a fresh install, and the cause is pre-existing:

* `package.json` asks for `"react-icons": "^5.6.0"`.
* From **react-icons 5.4.0** onward, `IconType` is declared as
  `(props: IconBaseProps) => React.ReactNode`, and `GenIcon` returns `React.JSX.Element`.
  Neither is usable as a JSX component under this repo's `@types/react`.
* Result: **hundreds of `TS2786: '<Icon>' cannot be used as a JSX component`** across
  `SideBarItem.tsx`, `TopMenu.tsx`, `ProductCatalog.tsx`, `NotificationBell.tsx` and ~30 more
  files — none of them ClalCenter files — and `npm run build` fails, because react-scripts treats
  type errors as build errors.

Measured on this branch:

| `react-icons` in `node_modules` | `npx tsc --noEmit` |
|---|---|
| 5.2.1 | 1 error (the known baseline) ✅ |
| 5.5.0 | TS2786 wall ❌ |
| 5.7.0 | TS2786 wall ❌ |

`@types/react` is **not** the variable: the wall reproduces with both 17.0.93 and 18.0.21.

**This is almost certainly where the "~458 red errors" figure in the pre-v12 documents came
from.** It was never a property of the source; it is a property of resolving `react-icons ^5.6.0`.

**Do not fix it inside the ClalCenter commits** — it is outside W3's ownership and touches a
dependency the whole product uses. It belongs to the owner / W5 as its own decision, and the two
candidate fixes are (a) pin `react-icons` to `5.2.1` (or whatever the deployed build actually
runs) in `package.json`, or (b) upgrade `@types/react` and widen the JSX typing so 5.6+ compiles.
Until then, **anyone who runs a bare `npm install` here will get a build that does not compile**,
and it will look like the ClalCenter branch broke it. It did not.

Working state used for the numbers above:

```powershell
npm install react-icons@5.2.1 --no-save --legacy-peer-deps
```

(Also note: `npm install` refuses without `--legacy-peer-deps` on this tree — a pre-existing peer
conflict between `@types/react` 18 and MUI v4, unrelated to `@dnd-kit`.)

---

## 7. The dependency commit

`@dnd-kit/core` + `@dnd-kit/sortable` + `@dnd-kit/utilities` are a **declared, isolated** commit
touching `package.json` and `package-lock.json` only (C6 v12 §1). `npm install` also wanted to
resync a pre-existing `react-icons` drift in the lock (`^5.2.1`/5.5.0 there vs `^5.6.0` in
`package.json`); **that resync was reverted by hand** so the commit carries dnd-kit and nothing
else, and the drift is left exactly as it was found.
