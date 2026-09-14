/* ============================================================================
 * yotpoTranslations.selftest.test.js — key parity for the Yotpo panel.
 *
 * registerGroup and registerGroupSubtitle shipped in en only. Because
 * i18n.js sets fallbackLng:'en', Hebrew and Polish users saw untranslated
 * English rather than a raw key path — quiet enough that it survived review.
 * This locks the three locales together so the next added key cannot ship
 * English-only.
 *
 * Scoped to the Yotpo section on purpose: asserting parity across all of
 * Integrations would fail on pre-existing gaps this work did not touch.
 *
 * .js for the same reason as yotpoImport.selftest.test.js — no @types/jest.
 * ========================================================================= */

import en from '../../assets/translations/en/Integrations.json';
import he from '../../assets/translations/he/Integrations.he.json';
import pl from '../../assets/translations/pl/Integrations.json';

const LOCALES = { he, pl };

// Keys added or corrected by this work, with the placeholders their call sites
// interpolate. A key that loses its placeholder renders "{{count}}" literally.
const REQUIRED_PLACEHOLDERS = {
  filesSelected: ['{{count}}'],
  importNotCsv: ['{{files}}'],
  importProcessing: ['{{processed}}', '{{failed}}'],
  importDone: ['{{processed}}', '{{failed}}'],
};

const NEWLY_ADDED = [
  'registerGroup',
  'registerGroupSubtitle',
  'filesSelected',
  'csvOnlyHint',
  'importNotCsv',
];

describe('Yotpo translations — locale parity', () => {
  test('en has a Yotpo section to compare against', () => {
    expect(en.Yotpo).toBeTruthy();
    expect(Object.keys(en.Yotpo).length).toBeGreaterThan(30);
  });

  Object.keys(LOCALES).forEach((lang) => {
    test(`${lang} defines every key en defines`, () => {
      const missing = Object.keys(en.Yotpo).filter((key) => !(key in LOCALES[lang].Yotpo));
      expect(missing).toEqual([]);
    });

    test(`${lang} adds no key en does not have`, () => {
      // An orphan key is dead weight and usually a typo of a real one.
      const extra = Object.keys(LOCALES[lang].Yotpo).filter((key) => !(key in en.Yotpo));
      expect(extra).toEqual([]);
    });

    test(`${lang} has no empty values`, () => {
      const blank = Object.keys(LOCALES[lang].Yotpo)
        .filter((key) => String(LOCALES[lang].Yotpo[key] || '').trim() === '');
      expect(blank).toEqual([]);
    });
  });

  test('THE BUG: registerGroup and registerGroupSubtitle exist in every locale', () => {
    ['registerGroup', 'registerGroupSubtitle'].forEach((key) => {
      expect(en.Yotpo[key]).toBeTruthy();
      expect(he.Yotpo[key]).toBeTruthy();
      expect(pl.Yotpo[key]).toBeTruthy();
    });
  });

  test('the keys this work added are present in all three locales', () => {
    NEWLY_ADDED.forEach((key) => {
      expect(Object.keys(en.Yotpo)).toContain(key);
      expect(Object.keys(he.Yotpo)).toContain(key);
      expect(Object.keys(pl.Yotpo)).toContain(key);
    });
  });
});

describe('Yotpo translations — interpolation placeholders survive translation', () => {
  Object.keys(REQUIRED_PLACEHOLDERS).forEach((key) => {
    test(`${key} keeps its placeholders in en, he and pl`, () => {
      [['en', en], ['he', he], ['pl', pl]].forEach(([lang, bundle]) => {
        const value = bundle.Yotpo[key];
        expect(typeof value).toBe('string');
        REQUIRED_PLACEHOLDERS[key].forEach((placeholder) => {
          // Interpolation is configured with {{ }} in i18n.js; a translator who
          // drops or localises the braces leaves the raw token on screen.
          expect(value).toContain(placeholder);
        });
      });
    });
  });
});

describe('Yotpo translations — no reliance on the content of a translated string', () => {
  test('importStep5 still contains the em dash that the panel splits on', () => {
    // Yotpo.tsx does t('importStep5').split('—')[1] to show the second half.
    // Parsing a translated sentence is fragile: this asserts the assumption
    // rather than letting it fail silently in one language.
    ['en', 'he', 'pl'].forEach((lang) => {
      const bundle = { en, he, pl }[lang];
      expect(bundle.Yotpo.importStep5).toContain('—');
    });
  });
});
