// ═══════════════════════════════════════════════════════════════════════════════════════════
// sendSearchTestI18n — the shared i18n harness for the SendSearch jest suites.
//
// DELIVERY PATH: _delivery\SendSearch-V1\tests\react\sendSearchTestI18n.ts
// TARGET PATH:   ReactCode\src\screens\SendSearch\sendSearchTestI18n.ts
//
// NOT A TEST SUITE. It deliberately carries neither `.test.` nor a `__tests__` folder, so it
// matches NEITHER leg of CRA's testMatch
// (`src/**/__tests__/**` | `src/**/*.{spec,test}.{js,jsx,ts,tsx}`) and jest will not try to run it
// as an empty suite. Same reasoning that put `tierGraphCore.selftest.js` next to — and not inside —
// `tierGraphCore.selftest.test.js`.
//
// WHY IT RESOLVES AGAINST THE REAL he JSON INSTEAD OF ECHOING THE KEY:
// A `t` that returns its own argument makes every assertion pass. `expect(text).not.toBe('')` would
// then be satisfied by the literal string "SendSearch.version.state.purged" — i.e. the test would
// certify a cell that is non-empty but says nothing to an operator, and it would NOT catch the one
// failure that actually ships: a key the component constructs that the JSON does not define. Here a
// missing key returns `undefined`, React renders nothing for it, and the empty-cell assertions fail.
// That is the point of the whole suite (CONTRACT D8: "A blank cell currently reads as 'nothing was
// sent'"), so the harness must be able to produce a blank cell.
// ═══════════════════════════════════════════════════════════════════════════════════════════

// The SHIPPED Hebrew namespace. Importing it means these tests break when a key is deleted or
// renamed in the JSON — which is exactly the coupling we want, because the components build their
// keys by string construction and tsc cannot see the join.
import heNamespace from '../../assets/translations/he/SendSearch.he.json';

// `Models/DataSources/SendSearch.ts` exports `SS = 'SendSearch.'` and every component prefixes its
// keys with it. The runtime i18next has the namespace registered under that name; here the JSON is
// imported directly, so the prefix is stripped before resolution.
const NS_PREFIX = 'SendSearch.';

const resolve = (obj: any, path: string): any =>
    path.split('.').reduce((acc: any, part: string) => (acc == null ? undefined : acc[part]), obj);

/**
 * Fake `t`, faithful to the two i18next behaviours these components depend on:
 *  - a key inside the SendSearch namespace resolves against the real he JSON, or returns
 *    `undefined` when the JSON does not define it (this is what makes a missing key VISIBLE
 *    to the assertions rather than silently rendering the key text);
 *  - `{{var}}` interpolation, including the i18next quirk the VersionBadge header calls out:
 *    an unknown variable name leaves the raw `{{n}}` placeholder in the output instead of
 *    throwing. The suites assert on the absence of '{{' precisely to catch that.
 *
 * Keys OUTSIDE the SendSearch namespace (the channel label from `getChannelDescriptor().labelKey`,
 * which lives in the DataSources namespace) return the key itself. That is not a cop-out: those
 * keys are owned by another namespace this suite does not police, and returning the key keeps them
 * visible and non-empty so they cannot mask an empty SendSearch cell.
 */
export const tHe = (key: string, vars?: { [k: string]: any }): any => {
    let value: any;
    if (key.indexOf(NS_PREFIX) === 0) {
        value = resolve(heNamespace as any, key.slice(NS_PREFIX.length));
        if (typeof value !== 'string') return undefined;   // missing / non-leaf key → blank render
    } else {
        value = key;                                        // foreign namespace — echo, stays visible
    }
    if (!vars) return value;
    return value.replace(/\{\{(\w+)\}\}/g, (whole: string, name: string) =>
        (Object.prototype.hasOwnProperty.call(vars, name) ? String(vars[name]) : whole));
};

/** The he JSON itself, so a suite can assert against the shipped copy rather than a transcription. */
export const heStrings: any = heNamespace;

/** The `react-i18next` shape the components consume. Used from inside a `jest.mock` factory. */
export const useTranslationStub = () => ({ t: tHe, i18n: { language: 'he', dir: () => 'rtl' } });
