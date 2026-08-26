/* This repo has no @types/jest (node_modules/@types has no jest entry), and tsconfig's
 * `include: ["src"]` means `react-scripts build` type-checks this file, so bare `describe`/`it`/
 * `beforeEach`/`afterEach` would fail the production build with "cannot find name". Pulling them
 * off `globalThis` through a locally declared shape works in both worlds — same convention as
 * gapColumnSuggest.selftest.test.ts and suggestMapping.selftest.test.ts. */
import { redirectToLogin as pulseemReactRedirect } from './PulseemReactAPI';
import { redirectToLogin as uploaderRedirect } from './UploaderAPI';
import { redirectToLogin as siteTrackingRedirect } from './SiteTrackingAPI';
import { redirectToLogin as unInterceptedRedirect } from './UnInterceptedAxiosInstance';

interface JestGlobals {
    describe: (name: string, fn: () => void) => void;
    it: (name: string, fn: () => void) => void;
    expect: (actual: any) => any;
    beforeEach: (fn: () => void) => void;
    afterEach: (fn: () => void) => void;
}
const { describe, it, expect, beforeEach, afterEach } = (globalThis as unknown) as JestGlobals;

const LOGIN_URL = '/Pulseem/Login.aspx?ReturnUrl=/Pulseem/HomePageMiddleware.aspx?fromreact=true';

const implementations: Array<[string, () => void]> = [
    ['PulseemReactAPI', pulseemReactRedirect],
    ['UploaderAPI', uploaderRedirect],
    ['SiteTrackingAPI', siteTrackingRedirect],
    ['UnInterceptedAxiosInstance', unInterceptedRedirect],
];

implementations.forEach(([name, redirectToLogin]) => {
    describe(`redirectToLogin (${name})`, () => {
        beforeEach(() => {
            // jsdom doesn't implement real navigation, so window.location.href silently no-ops
            // on assignment. Swap in a plain writable object so the assignment is observable.
            Object.defineProperty(window, 'location', {
                writable: true,
                value: { href: '' },
            });
        });

        afterEach(() => {
            delete (window as any).pulseem;
        });

        it('clears window.pulseem.currentUser and still redirects when window.pulseem exists', () => {
            (window as any).pulseem = { currentUser: { username: 'jane', email: 'jane@acme.com' } };

            redirectToLogin();

            expect((window as any).pulseem.currentUser).toBeUndefined();
            expect(window.location.href).toContain(LOGIN_URL);
        });

        it('does not throw and still redirects when window.pulseem is undefined', () => {
            delete (window as any).pulseem;

            expect(() => redirectToLogin()).not.toThrow();
            expect(window.location.href).toContain(LOGIN_URL);
        });
    });
});
