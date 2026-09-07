import { makeStyles } from '@material-ui/core';

/* ── [HSCROLL] 2026-09-07 · the rows grid's horizontal scrollbar ─────────────────────────────────
   Reported as "there is no right-to-left scrolling on /react/DataSources/View/:id". The grid HAS
   scrolled sideways since it shipped — MUI's TableContainer root is `width:100%; overflow-x:auto`
   (node_modules/@material-ui/core/TableContainer/TableContainer.js:24-29) — but the bar that says so
   was 6px of rgba(0,0,0,.2) on a near-transparent track, because
   src/screens/Whatsapp/Chat/css/overrides.css:31-42 declares an UNSCOPED
   `::-webkit-scrollbar { width:6px!important; height:6px!important }` that reaches every screen in
   the product (App.js imports WhatsappChat statically → WhatsappChat.tsx imports ./css/index.css →
   that file @imports overrides.css). Under the `body{zoom:0.95}` of src/index.css:11-15 it paints at
   ~5.7 device px, dark-grey on white. This sheet re-declares it, scoped to that one element.

   🔴 DIRECTION-NEUTRAL SHEET — DO NOT ADD A PHYSICAL PROPERTY HERE (left/right, margin-left,
   text-align, float, direction, or a box-shadow x-offset). This sheet is created by makeStyles UNDER
   MuiThemeProvider (App.js:1028), so @material-ui/styles sets `flip: theme.direction === 'rtl'`
   (@material-ui/styles/makeStyles/makeStyles.js:101) and the jss-rtl plugin registered at App.js:1060
   rewrites every physical property behind your back — including negating the first offset of a
   box-shadow. The tree's "jss-rtl is inert" note applies to ganaralStyle.js ALONE, which is built at
   App.js:733, ABOVE the provider (its own comment, ganaralStyle.js:2628-2631). Anything
   direction-dependent belongs INLINE in RowsTable.tsx, where JSS never sees it — which is also why
   the `direction:'ltr'` bidi guard on numeric cells has always survived.

   Why `!important` on width/height and nowhere else: the leaking rule carries `!important` on
   exactly those two declarations, and an !important declaration beats a non-important one at ANY
   specificity — which is why the two scoped-but-polite attempts at ganaralStyle.js:5818 and :5881 are
   inert to this day. The leak's thumb and track colours are NOT !important, so plain declarations win
   those on specificity alone. Do not "tidy up" by adding !important to the colours, and do not fix
   the leak at source: un-scoping it restyles every scrollbar in the product, which is a standing
   owner decision (2026-08-13 — see the same argument at
   src/screens/SendSearch/components/DrawerStack.tsx:47-52, the precedent this follows). */

const TRACK = '#eef1f6';
/* The slate RowsTable already uses for its empty state. ≈4.9:1 against the track, so the bar clears
   WCAG 1.4.11's 3:1 for the visual boundary of a UI component — it is the ONLY affordance for the
   reported bug, so it is not a place to be subtle. A 12px bar with the 3px border of the DrawerStack
   precedent was rejected: 12 − (2 × 3) leaves 6px of colour, i.e. the exact stripe this change exists
   to replace (that precedent is a narrow VERTICAL bar in a drawer, where the arithmetic differs). */
const THUMB = '#5b6b7b';
const THUMB_HOVER = '#3d4a58';

export const useRowsTableStyles = makeStyles((theme) => ({
    /* Nothing here bounds the box: the table is as tall as its page of rows and the PAGE scrolls
       vertically (owner, 2026-09-07 — the page size is the lever for how tall that is). The only
       scrolling this element does is sideways. These rules make its bar visible; `floatBar` below is
       what makes it REACHABLE without scrolling to the end of the rows. */
    scroller: {
        /* Chromium / WebKit path. */
        '&::-webkit-scrollbar': { width: '14px !important', height: '14px !important' },
        '&::-webkit-scrollbar-track': { background: TRACK, borderRadius: 8 },
        '&::-webkit-scrollbar-thumb': { background: THUMB, borderRadius: 8, border: `2px solid ${TRACK}` },
        '&::-webkit-scrollbar-thumb:hover': { background: THUMB_HOVER },
        /* Standards path — Firefox, and Chrome 121+ where it SUPERSEDES the block above: that engine
           then draws its own ~15px bar in these colours and ignores the leak entirely. Both paths are
           wide and high-contrast; they are not pixel-identical, and that is fine. `auto` rather than
           `thin` on purpose — this is a drag target for a mouse with no horizontal wheel. */
        scrollbarWidth: 'auto',
        scrollbarColor: `${THUMB} ${TRACK}`,
        /* The box is a tab stop (WCAG 2.1.1 — a scrollable region must be operable by keyboard), so it
           needs a visible focus indicator, but only for KEYBOARD focus: clicking a header cell to edit
           a column focuses the nearest focusable ancestor, which is this box, and a ring on every such
           click would be noise. Hence :focus-visible alone and not the '&:focus, &:focus-visible' pair
           the pickers use (ChannelSelector.tsx:29-30) — those are click targets, this is a region you
           click INTO. Pre-15.4 Safari drops the rule and falls back to the UA outline. */
        '&:focus-visible': { boxShadow: `0 0 0 3px ${theme.palette.primary.light}` },
        /* Paper has no scrollport: without this, Ctrl+P (and Save as PDF — what a manager forwards)
           emits only the columns that happened to be scrolled into view, with no marker that the rest
           was dropped. */
        '@media print': { overflow: 'visible !important' },
    },

    /* ── the floating twin ─────────────────────────────────────────────────────────────────────
       A scroll container draws its bar at the bottom of ITSELF, so on a 50-row page the only way to
       reach it is to scroll past every row — and by then the rows you wanted to scroll are off the
       top of the screen. This is a second, real scrollbar over a spacer as wide as the table, pinned
       to the bottom of the WINDOW and kept in sync both ways by RowsTable. It appears only while the
       table is on screen AND its own bar is not, so the two are never visible together.

       🔴 `position: fixed`, and it cannot be `sticky`. Measured in Chrome on a copy of this app's
       ancestor chain: `appBody` (ganaralStyle.js:110-111, the div at App.js:1029) sets
       `overflow-x:hidden`, which per CSS Overflow 3 computes `overflow-y` to `auto` — so appBody is a
       scroll container, and a sticky descendant is measured against ITS scrollport instead of the
       viewport. A/B on the identical markup: with that rule the bar parked at y=1236, off screen;
       without it, at y=763 in a 768px window. `fixed` is immune to an ancestor's overflow and is only
       trapped by transform/filter/perspective/contain — none of which exist above this component
       (checked at runtime over the whole chain).

       Height/left/width are written INLINE by the component from the table's own box, so no physical
       property appears in this sheet and jss-rtl has nothing to flip. z-index deliberately low: it
       must sit under the Tawk.to and Pulseem widgets that live in the same corner, and under MUI's
       dialog backdrop (1300) so an open dialog covers it. */
    floatBar: {
        position: 'fixed',
        bottom: 0,
        height: 16,
        display: 'none',
        overflowX: 'auto',
        overflowY: 'hidden',
        zIndex: 5,
        background: TRACK,
        borderRadius: '8px 8px 0 0',
        boxShadow: '0 -2px 8px rgba(16,24,40,0.10)',
        '&::-webkit-scrollbar': { height: '14px !important' },
        '&::-webkit-scrollbar-track': { background: TRACK, borderRadius: 8 },
        '&::-webkit-scrollbar-thumb': { background: THUMB, borderRadius: 8, border: `2px solid ${TRACK}` },
        '&::-webkit-scrollbar-thumb:hover': { background: THUMB_HOVER },
        scrollbarWidth: 'auto',
        scrollbarColor: `${THUMB} ${TRACK}`,
        // Paper has no window to pin to.
        '@media print': { display: 'none !important' },
    },
    /* The only content of the floating bar: a strip as wide as the table, which is what gives that
       bar a thumb of the right size and a scrollLeft range identical to the table's. */
    floatBarSpacer: { height: 1 },
}));
