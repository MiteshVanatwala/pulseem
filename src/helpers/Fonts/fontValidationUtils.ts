import { WEB_SAFE_FONT_NAMES } from './webSafeFonts';


/**
 * localStorage key for per-user suppressed font list.
 * Format: "pulseem_suppressed_fonts_<userId>"
 */
const storageKey = (userId?: string | number | null): string =>
    `pulseem_suppressed_fonts_${userId ?? 'default'}`;

/**
 * Extracts the primary font name from a CSS font-family stack.
 * e.g. "'Rubik', sans-serif"  =>  "Rubik"
 * e.g. "Arial, Helvetica, sans-serif"  =>  "Arial"
 */
export const extractPrimaryFontName = (fontFamilyCss: string): string => {
    if (!fontFamilyCss) return '';
    const first = fontFamilyCss.split(',')[0];
    // Strip surrounding quotes and whitespace
    return first.replace(/["']/g, '').trim();
};

/**
 * Scans the entire Beefree editor JSON and returns a Set of all primary font
 * names found — covering:
 *  1. Global body font  (page.body.content.style["font-family"])
 *  2. Block-level fonts (module.descriptor.style["font-family"])
 *  3. Inline HTML fonts (font-family inside style attributes of HTML strings)
 */
export const extractAllFontFamilies = (jsonData: any): Set<string> => {
    const fonts = new Set<string>();
    try {
        const json = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;

        const addFont = (css: string) => {
            const name = extractPrimaryFontName(css);
            if (name) fonts.add(name);
        };

        // 1. Global body font
        const globalFont = json?.page?.body?.content?.style?.['font-family'];
        if (globalFont) addFont(globalFont);

        // 2 & 3. Walk every row → column → module
        const inlineRegex = /font-family:\s*([^;]+)/g;
        (json?.page?.rows || []).forEach((row: any) => {
            (row?.columns || []).forEach((col: any) => {
                (col?.modules || []).forEach((module: any) => {
                    // Block-level font
                    const blockFont = module?.descriptor?.style?.['font-family'];
                    if (blockFont) addFont(blockFont);

                    // Inline HTML font-family values (inline text toolbar)
                    const htmlSources = [
                        module?.descriptor?.text?.html,
                        module?.descriptor?.heading?.html,
                        module?.descriptor?.title?.html,
                    ];
                    htmlSources.forEach((html: string) => {
                        if (!html) return;
                        let m;
                        inlineRegex.lastIndex = 0;
                        while ((m = inlineRegex.exec(html)) !== null) {
                            addFont(m[1].trim());
                        }
                    });
                });
            });
        });
    } catch {
        // Silently ignore parse errors during font detection
    }
    fonts.delete('');
    return fonts;
};

/**
 * Returns true if the given font name is considered web-safe
 * and should NOT trigger the validation pop-up.
 */
export const isWebSafeFont = (fontName: string): boolean =>
    WEB_SAFE_FONT_NAMES.has(fontName.toLowerCase().trim());

/**
 * Returns the list of font names the user has suppressed warnings for.
 * Stored as lowercase strings.
 */
export const getSuppressedFonts = (userId?: string | number | null): string[] => {
    try {
        const raw = localStorage.getItem(storageKey(userId));
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
};

/**
 * Returns true if the user has previously chosen "Do not show again"
 * for the specified font.
 */
export const isFontSuppressed = (
    userId: string | number | null | undefined,
    fontName: string
): boolean => {
    return getSuppressedFonts(userId).includes(fontName.toLowerCase().trim());
};

/**
 * Saves the font to the user's suppressed list in localStorage.
 * Idempotent — safe to call multiple times for the same font.
 */
export const suppressFont = (
    userId: string | number | null | undefined,
    fontName: string
): void => {
    const key = fontName.toLowerCase().trim();
    const list = getSuppressedFonts(userId);
    if (!list.includes(key)) {
        list.push(key);
        try {
            localStorage.setItem(storageKey(userId), JSON.stringify(list));
        } catch {
            // localStorage write failure (e.g. private browsing quota) — fail silently
        }
    }
};
