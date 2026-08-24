/**
 * Canonical list of web-safe fonts for the Beefree email editor.
 * Fonts in this set do NOT trigger the font validation warning pop-up.
 * All names are stored lowercase for case-insensitive comparison.
 *
 * Source: Ticket — "Add Custom Font Validation Pop-up in Beefree Email Editor"
 */
export const WEB_SAFE_FONT_NAMES: ReadonlySet<string> = new Set([
    'arial',
    'courier new',
    'georgia',
    'helvetica neue',
    'lucida sans',
    'tahoma',
    'times new roman',
    'trebuchet ms',
    'verdana',
    'geneva',
    'sans-serif',
    'serif',
    'monospace',
    'inherit',
    'couriernew',
    'helveticaneue',
    'lucidasans',
    'timesnewroman',
    'trebuchetms'
]);
