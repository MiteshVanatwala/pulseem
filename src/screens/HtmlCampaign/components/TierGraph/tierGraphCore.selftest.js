/* ============================================================================
 * tierGraphCore.selftest.js — node self-test for the pure core (plan §3.9).
 * Run: `node tierGraphCore.selftest.js` (ESM) — or run the same assertions
 * under jest if the executor has react-scripts.
 *
 * Provides a LOCAL btoa/atob polyfill (test file only — the module is NOT
 * modified). Exits non-zero on the first failed batch so it is CI-usable.
 * ========================================================================== */

// --- local base64 polyfill (node) — does not touch the module ---------------
if (typeof globalThis.btoa === 'undefined') {
  globalThis.btoa = (s) => Buffer.from(s, 'binary').toString('base64');
}
if (typeof globalThis.atob === 'undefined') {
  globalThis.atob = (b) => Buffer.from(b, 'base64').toString('binary');
}

import {
  amountDisp, num, fmt, gv, sizeG, numG, isTok, pureTok, tokName,
  defaultState, computeLayout, buildLink, b64url, PALETTE, STATE_VERSION,
  parseTierGraphUrl, autoHighlightIndex,
} from './tierGraphCore.js';

let failures = 0;
const eq = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) { failures++; console.error('FAIL', label, '\n   got :', JSON.stringify(got), '\n   want:', JSON.stringify(want)); }
  else console.log('ok  ', label);
};
const ok = (label, cond) => {
  if (!cond) { failures++; console.error('FAIL', label); }
  else console.log('ok  ', label);
};

// decode a b64url cfg back to an object (mirror of the module's b64url encode)
const decodeCfg = (b64) => {
  let s = b64.replace(/-/g, '+').replace(/_/g, '/');
  while (s.length % 4) s += '=';
  return JSON.parse(decodeURIComponent(escape(atob(s))));
};

/* ---------------- constants ---------------- */
eq('STATE_VERSION', STATE_VERSION, 4);
eq('PALETTE length', PALETTE.length, 13);
eq('PALETTE[0]/[12]', [PALETTE[0], PALETTE[12]], ['#c4cdf2', '#d14343']);

/* ---------------- token helpers ---------------- */
ok('isTok mixed', isTok('בונוס ##X##'));
ok('pureTok true', pureTok('  ##ExtraField1##  '));
ok('pureTok false on mixed', !pureTok('שלום ##X##'));
eq('tokName', tokName('##ExtraField7##'), 'ExtraField7');

/* ---------------- num / fmt ---------------- */
eq('num empty', num(''), 0);
eq('num hebrew', num('פרס'), 0);
eq('num commas', num('1,234'), 1234);
eq('num null', num(null), 0);
eq('fmt empty', fmt(''), '');
eq('fmt hebrew', fmt('פרס יוקרה'), 'פרס יוקרה');
eq('fmt number', fmt('120000'), '120,000');
eq('fmt decimal', fmt('1234567.5'), '1,234,567.5');

/* ---------------- gv (scalar — deviation #8) ---------------- */
eq('gv explicit s', gv('##X##', 5000), 5000);
eq('gv from t', gv('7500', undefined), 7500);
eq('gv fallback', gv('##X##', undefined), 100000);
ok('gv is scalar', typeof gv('##X##', 5000) === 'number');

/* ---------------- sizeG (deviation #7) ---------------- */
eq('sizeG static numeric', sizeG({ t: '120000' }), 120000);
eq('sizeG static text -> 0', sizeG({ t: 'פרס יוקרה' }), 0);
eq('sizeG token+s', sizeG({ t: '##X##', s: 5000 }), 5000);
eq('sizeG token no s', sizeG({ t: '##X##' }), 100000);
eq('numG == sizeG', numG({ t: '##X##', s: 5000 }), 5000);

/* ---------------- amountDisp (4 states, deviation #6) ---------------- */
eq('amountDisp static numeric', amountDisp({ t: '120000' }), '₪120,000');
eq('amountDisp static text', amountDisp({ t: 'פרס יוקרה' }), 'פרס יוקרה');
eq('amountDisp pure token', amountDisp({ t: '##ExtraField1##', s: 100000 }), 'ExtraField1 · ₪100,000');
eq('amountDisp mixed token', amountDisp({ t: 'בונוס ##ExtraField1##', s: 100000 }), '₪100,000');

/* ---------------- computeLayout ---------------- */
const L = computeLayout(defaultState());
eq('layout chartBottom', L.chartBottom, defaultState().height - 152);
eq('layout chartTop', L.chartTop, 78);
eq('layout barW cap', L.barW, Math.min(190, (defaultState().width - 92 - L.gap * 3) / 4));
ok('hereY clamps low', Math.abs(L.hereY(-100) - L.chartBottom) < 1e-9);
ok('hereY clamps high', Math.abs(L.hereY(L.axisMax * 5) - L.chartTop) < 1e-9);
ok('axisMax floor 1', computeLayout({ ...defaultState(), tiers: [{ amount: { t: '0' } }], tierCountActive: 1, axisMax: 0 }).axisMax >= 1);

/* ---------------- buildLink — 2 tokens (M1 acceptance) ---------------- */
const s2 = defaultState();
s2.here.value = { t: '##ExtraField7##', s: 42000 };
s2.tiers[0].amount = { t: '##ExtraField1##', s: 120000 };
const { url, imgTag } = buildLink(s2);

ok('url gt first, cfg second', /\?gt=stairs&cfg=/.test(url));
ok('url p1/p2 URL-encoded', url.includes('&p1=%23%23ExtraField7%23%23&p2=%23%23ExtraField1%23%23'));
ok('url encodes ## as %23', url.includes('%23%23ExtraField7%23%23'));
ok('imgTag well-formed', imgTag.startsWith('<img src="') && imgTag.includes('alt="גרף התקדמות"') && imgTag.includes('width="' + defaultState().width + '"'));

const cfg = decodeCfg(url.split('cfg=')[1].split('&')[0]);
eq('cfg here.v slot', cfg.here.v, { dyn: 'p1', s: 42000, n: 'ExtraField7' });
eq('cfg tier0.a slot', cfg.tiers[0].a, { dyn: 'p2', s: 120000, n: 'ExtraField1' });
eq('cfg top keys', Object.keys(cfg).sort(), ['axisMax', 'bg', 'font', 'h', 'here', 'pg', 'tiers', 'w']);
eq('cfg here keys', Object.keys(cfg.here).sort(), ['color', 'show', 't', 'v']);
eq('cfg static here.t stays', cfg.here.t, { v: 'אתה כאן' });
ok('cfg contains no ## token', !JSON.stringify(cfg).includes('##'));
eq('cfg tiers length == active', cfg.tiers.length, 4);

/* ---------------- deterministic pN order + only active tiers ------------- */
const s3 = defaultState();
s3.tierCountActive = 2;                 // array still length 4, only 2 exported
s3.here.value = { t: '##A##', s: 1 };   // p1
s3.here.text = '##B##';                 // p2
s3.tiers[0].amount = { t: '##C##', s: 3 };   // p3
s3.tiers[0].box.cat1 = '##D##';         // p4  (c1)
s3.tiers[0].box.cat2 = '##E##';         // p5  (c2)
s3.tiers[0].box.line1 = '##F##';        // p6  (l1)
s3.tiers[0].box.line2 = '##G##';        // p7  (l2)
s3.tiers[1].amount = { t: '##H##', s: 8 };   // p8
const { url: u3 } = buildLink(s3);
const q3 = u3.split('?')[1].split('&').filter((p) => p.startsWith('p'));
eq('pN deterministic order', q3, [
  'p1=%23%23A%23%23', 'p2=%23%23B%23%23', 'p3=%23%23C%23%23', 'p4=%23%23D%23%23',
  'p5=%23%23E%23%23', 'p6=%23%23F%23%23', 'p7=%23%23G%23%23', 'p8=%23%23H%23%23',
]);
const cfg3 = decodeCfg(u3.split('cfg=')[1].split('&')[0]);
eq('cfg3 only active tiers', cfg3.tiers.length, 2);

/* ---------------- b64url round-trip with Hebrew ---------------- */
const round = decodeURIComponent(escape(atob(
  (() => { let x = b64url('אתה כאן · ₪42,000'); x = x.replace(/-/g, '+').replace(/_/g, '/'); while (x.length % 4) x += '='; return x; })(),
)));
eq('b64url hebrew round-trip', round, 'אתה כאן · ₪42,000');

/* ---------------- parseTierGraphUrl (inverse of buildLink) ---------------- */
// default (all static) round-trip
const rtDef = parseTierGraphUrl(buildLink(defaultState()).url);
eq('parse default width/height', [rtDef.width, rtDef.height], [640, 420]);
eq('parse default tierCount', rtDef.tierCountActive, 4);
eq('parse default tier0 amount static', rtDef.tiers[0].amount.t, '120000');
eq('parse default here text', rtDef.here.text, 'אתה כאן');
eq('parse default box texts', [rtDef.tiers[0].box.line1, rtDef.tiers[0].box.cat1], ['יחיד', 'פרס טיסה']);

// token round-trip — the raw ## tokens must be recovered from the pN params
const st = defaultState();
st.here.value = { t: '##ExtraField7##', s: 42000 };
st.tiers[0].amount = { t: '##ExtraField1##', s: 120000 };
const rtTok = parseTierGraphUrl(buildLink(st).url);
eq('parse token here.value', rtTok.here.value, { t: '##ExtraField7##', s: 42000 });
eq('parse token tier0.amount', rtTok.tiers[0].amount, { t: '##ExtraField1##', s: 120000 });

// tokens with Hebrew + spaces must stay URL-valid (no raw # / whitespace in pN) AND round-trip
const stHeb = defaultState();
stHeb.tiers[0].amount = { t: '##יעד פרס 1##', s: 120000 };
const urlHeb = buildLink(stHeb).url;
const pHeb = urlHeb.split('&').filter((p) => p.startsWith('p')).join('&');
ok('hebrew/space token URL-safe (no raw # or whitespace in pN)', !/[#\s]/.test(pHeb));
eq('hebrew/space token round-trips via parse', parseTierGraphUrl(urlHeb).tiers[0].amount.t, '##יעד פרס 1##');

// 2 active tiers -> tierCountActive 2, array padded to 4
const st2 = defaultState(); st2.tierCountActive = 2;
const rt2 = parseTierGraphUrl(buildLink(st2).url);
eq('parse 2-tier active count', rt2.tierCountActive, 2);
eq('parse 2-tier array padded', rt2.tiers.length, 4);

// invalid inputs -> null (soft error, no throw)
eq('parse invalid string', parseTierGraphUrl('not a url'), null);
eq('parse empty', parseTierGraphUrl(''), null);

/* ---------------- auto-highlight (by value) ---------------- */
eq('autoHighlight 42k -> tier0', autoHighlightIndex([120000, 150000, 180000, 240000], 42000), 0);
eq('autoHighlight 130k -> tier1', autoHighlightIndex([120000, 150000, 180000, 240000], 130000), 1);
eq('autoHighlight exact 150k -> tier1', autoHighlightIndex([120000, 150000, 180000, 240000], 150000), 1);
eq('autoHighlight exceeds-all -> largest', autoHighlightIndex([120000, 150000, 180000, 240000], 999999), 3);
eq('autoHighlight tie -> lowest index', autoHighlightIndex([100, 100, 100], 50), 0);

/* ---------------- per-field font sizes (asz/l1sz/..) + row show/hide (r1/r2) ---------------- */
const sx = defaultState();
sx.tiers[0].box.row2Show = false;
sx.tiers[0].box.line1Size = 22; sx.tiers[0].box.cat1Size = 9;
sx.tiers[0].amountSize = 30; sx.here.textSize = 18;
const cfgX = decodeCfg(buildLink(sx).url.split('cfg=')[1].split('&')[0]);
eq('cfg emits r2:0 when hidden', cfgX.tiers[0].box.r2, 0);
eq('cfg emits asz/tsz', [cfgX.tiers[0].asz, cfgX.here.tsz], [30, 18]);
eq('cfg emits l1sz/c1sz', [cfgX.tiers[0].box.l1sz, cfgX.tiers[0].box.c1sz], [22, 9]);
const rtX = parseTierGraphUrl(buildLink(sx).url);
eq('parse row2Show=false, row1Show default true', [rtX.tiers[0].box.row2Show, rtX.tiers[0].box.row1Show], [false, true]);
eq('parse sizes round-trip', [rtX.tiers[0].box.line1Size, rtX.tiers[0].box.cat1Size, rtX.tiers[0].amountSize, rtX.here.textSize], [22, 9, 30, 18]);

const cfgDef = decodeCfg(buildLink(defaultState()).url.split('cfg=')[1].split('&')[0]);
ok('default cfg omits all size/row keys', !/r1|r2|asz|tsz|l1sz|c1sz|l2sz|c2sz/.test(JSON.stringify(cfgDef)));
ok('default cfg omits dead hl key', !/"hl"/.test(JSON.stringify(cfgDef)));

/* ---------------- summary ---------------- */
if (failures > 0) {
  console.error(`\n${failures} assertion(s) FAILED`);
  if (typeof process !== 'undefined') process.exit(1);
} else {
  console.log('\nAll tierGraphCore self-tests passed.');
}
