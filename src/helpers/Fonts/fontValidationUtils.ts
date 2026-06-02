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
    let first = fontFamilyCss.split(',')[0];
    // Strip surrounding quotes (including HTML entities) and whitespace
    first = first.replace(/&quot;/g, '').replace(/&#39;/g, '').replace(/["']/g, '');
    return first.trim();
};

/**
 * Scans the entire Beefree editor JSON and returns a Map of all primary font
 * names found to their occurrence count — covering:
 *  1. Global body font  (page.body.content.style["font-family"])
 *  2. Block-level fonts (module.descriptor.style["font-family"])
 *  3. Inline HTML fonts (font-family inside style attributes of HTML strings)
 */
export const extractAllFontFamilies = (jsonData: any): Map<string, number> => {
    const fonts = new Map<string, number>();
    try {
        const json = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;

        const addFont = (css: string) => {
            const name = extractPrimaryFontName(css);
            if (name) {
                fonts.set(name, (fonts.get(name) || 0) + 1);
            }
        };

        // 1. Recursive extractor to find fonts ANYWHERE in the JSON (Buttons, Menus, Text, Global, etc.)
        const extractFontsRecursive = (obj: any) => {
            if (!obj) return;
            if (typeof obj === 'string') {
                // Parse inline HTML for style attributes safely matching the correct quote pair
                const styleRegex = /style=(["'])(.*?)\1/gi;
                let styleMatch;
                while ((styleMatch = styleRegex.exec(obj)) !== null) {
                    const styleStr = styleMatch[2];
                    const fontMatch = styleStr.match(/font-family\s*:\s*([^;]+)/i);
                    if (fontMatch) {
                        addFont(fontMatch[1].trim());
                    }
                }
            } else if (Array.isArray(obj)) {
                obj.forEach(extractFontsRecursive);
            } else if (typeof obj === 'object') {
                for (const key in obj) {
                    // Match block-level or global font-family CSS properties
                    if (key === 'font-family' && typeof obj[key] === 'string') {
                        addFont(obj[key]);
                    }
                    extractFontsRecursive(obj[key]);
                }
            }
        };

        // Run the recursive extractor on the entire JSON root
        extractFontsRecursive(json);
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
