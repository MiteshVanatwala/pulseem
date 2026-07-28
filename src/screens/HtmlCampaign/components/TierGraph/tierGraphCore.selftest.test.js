/* ============================================================================
 * tierGraphCore.selftest.test.js — the jest entry point for the TierGraph core
 * self-test suite (contract §16b/c/d).
 *
 * The suite itself lives in `tierGraphCore.selftest.js` and is written as
 * top-level assertions so it can double as a node script. It could not run in
 * THIS repo: `node tierGraphCore.selftest.js` needs `"type":"module"` (absent,
 * and package.json is not ours to change), and `.selftest.js` matches neither
 * leg of CRA's testMatch (`src/**\/__tests__/**` | `src/**\/*.{spec,test}.js`)
 * — so a 243-assertion parity net silently never executed.
 *
 * This file matches `*.test.js`, so `npm test` / `react-scripts test` picks it
 * up, and CRA's jest gives the suite exactly what plain node could not:
 * resolution of the extensionless `../../../../config` import inside
 * tierGraphCore.js, and a CommonJS module scope where `__dirname` locates the
 * TierGraphStage.jsx source the A15/A19/A21d assertions read.
 *
 * NOTE the suite runs at IMPORT time (that is what makes it a script), so the
 * import below IS the test run; the assertions here only report its tally.
 * Nothing is duplicated — an assertion added there is covered here for free.
 * ========================================================================== */
import { selfTestFailures, selfTestFailureLog, selfTestCount } from './tierGraphCore.selftest';

describe('tierGraphCore self-test suite (contract §16)', () => {
  test('every assertion passes', () => {
    // The log first: on a failure jest prints the offending labels (with got/want),
    // which is the diagnosis. The count is the belt-and-braces check on the same state.
    expect(selfTestFailureLog()).toEqual([]);
    expect(selfTestFailures()).toBe(0);
  });

  test('the suite actually executed (guards against a silently empty import)', () => {
    // "0 failures" is also what a suite that never ran reports, so the count is checked too:
    // a wrapper that can only ever pass is not a safety net. Bound kept loose on purpose —
    // this must not become a second place to update every time an assertion is added.
    expect(typeof selfTestFailures).toBe('function');
    // 243 today (§16d). Bound kept well below it so this never needs updating with the suite.
    expect(selfTestCount()).toBeGreaterThan(200);
  });
});
