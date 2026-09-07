import { makeStyles } from '@material-ui/core';

/* ── [HSCROLL] 2026-09-07 · the rows grid's scroll box ───────────────────────────────────────────
   Reported as "there is no right-to-left scrolling on /react/DataSources/View/:id". The grid HAS
   scrolled sideways since it shipped — MUI's TableContainer root is `width:100%; overflow-x:auto`
   (node_modules/@material-ui/core/TableContainer/TableContainer.js:24-29) — but nothing on screen
   ever said so:
     · the only horizontal scrollbar sits at the BOTTOM of a 50-row table, ~1500px below the fold, so
       it is never on screen at the same time as the rows it scrolls; and
     · once you finally reach it, it is 6px of rgba(0,0,0,.2) on a near-transparent track, because
       src/screens/Whatsapp/Chat/css/overrides.css:31-42 declares an UNSCOPED
       `::-webkit-scrollbar { width:6px!important; height:6px!important }` that reaches every screen
       in the product (App.js imports WhatsappChat statically → WhatsappChat.tsx imports
       ./css/index.css → that file @imports overrides.css). Under the `body{zoom:0.95}` of
       src/index.css:11-15 it paints at ~5.7 device px, dark-grey-on-white.
   RowsTable.tsx caps the box's height so the bar rides directly under the visible rows; this sheet
   makes the bar itself impossible to miss, and is scoped to that one element.

   🔴 DIRECTION-NEUTRAL SHEET — DO NOT ADD A PHYSICAL PROPERTY HERE (left/right, margin-left,
   text-align, float, direction, or a box-shadow x-offset). This sheet is created by makeStyles
   UNDER MuiThemeProvider (App.js:1028), so @material-ui/styles sets `flip: theme.direction === 'rtl'`
   (@material-ui/styles/makeStyles/makeStyles.js:101) and the jss-rtl plugin registered at
   App.js:1060 rewrites every physical property behind your back — including negating the first
   offset of a box-shadow. The tree's "jss-rtl is inert" note applies to ganaralStyle.js ALONE, which
   is built at App.js:733, ABOVE the provider (its own comment, ganaralStyle.js:2628-2631). Every
   direction-dependent value in this feature is therefore written INLINE in RowsTable.tsx, where JSS
   never sees it — which is also why the `direction:'ltr'` bidi guard on numeric cells has always
   survived. Corollary: if you ever move one of those values in here, write it LTR-only and let
   jss-rtl mirror it. Hand-branching on isRtl inside a flipped sheet double-flips.

   Why `!important` on width/height and nowhere else: the leaking rule carries `!important` on
   exactly those two declarations, and an !important declaration beats a non-important one at ANY
   specificity — which is why the two scoped-but-polite attempts at ganaralStyle.js:5818 and :5881
   are inert to this day. The leak's thumb and track colours are NOT !important, so plain
   declarations win those on specificity alone. Do not "tidy up" by adding !important to the colours,
   and do not fix the leak at source: un-scoping it restyles every scrollbar in the product, which is
   a standing owner decision (2026-08-13 — see the same argument at
   src/screens/SendSearch/components/DrawerStack.tsx:47-52, the precedent this follows). */

const TRACK = '#eef1f6';
/* The slate this file already uses for the empty state (RowsTable's "no rows" line). ≈4.9:1 against
   the track, so the bar clears WCAG 1.4.11's 3:1 for the visual boundary of a UI component — it is
   the ONLY affordance for the reported bug, so it is not a place to be subtle. A 12px bar with the
   3px border of the DrawerStack precedent was rejected: 12 − (2 × 3) leaves 6px of colour, i.e. the
   exact stripe this change exists to replace (that precedent is a narrow vertical bar in a drawer,
   where the arithmetic lands differently). */
const THUMB = '#5b6b7b';
const THUMB_HOVER = '#3d4a58';

export const useRowsTableStyles = makeStyles((theme) => ({
    scroller: {
        border: '1px solid #e6e9ef',
        borderRadius: 6,
        /* MUI's root is width:100%; without border-box the 1px border would push the box past the
           page Container and grow a second, page-level horizontal scrollbar. */
        boxSizing: 'border-box',
        /* MUI declares overflow-x only. Per CSS Overflow 3 the other axis computes to `auto` once
           one axis is not `visible`, so this is already true — stated explicitly because the height
           cap RowsTable writes is meaningless without it, and an implicit value is a trap for the
           next reader. */
        overflowY: 'auto',
        /* Chromium / WebKit path. */
        '&::-webkit-scrollbar': { width: '14px !important', height: '14px !important' },
        '&::-webkit-scrollbar-track': { background: TRACK, borderRadius: 8 },
        '&::-webkit-scrollbar-thumb': { background: THUMB, borderRadius: 8, border: `2px solid ${TRACK}` },
        '&::-webkit-scrollbar-thumb:hover': { background: THUMB_HOVER },
        /* The corner where the two bars meet; unpainted it reads as a white notch in the frame. */
        '&::-webkit-scrollbar-corner': { background: TRACK },
        /* Standards path — Firefox, and Chrome 121+ where it SUPERSEDES the block above: that engine
           then draws its own ~15px bar in these colours and ignores the leak entirely. Both paths are
           wide and high-contrast; they are not pixel-identical, and that is fine. `auto` rather than
           `thin` on purpose — this is a drag target for a mouse without a horizontal wheel. */
        scrollbarWidth: 'auto',
        scrollbarColor: `${THUMB} ${TRACK}`,
        /* The box is a tab stop (WCAG 2.1.1 — a scrollable region must be operable by keyboard), so
           it needs a visible focus indicator, but only for KEYBOARD focus: clicking a header cell
           focuses the nearest focusable ancestor, which is this box, and a ring on every click to
           edit a column would be noise. Hence :focus-visible alone, and not the '&:focus,
           &:focus-visible' pair the pickers use (ChannelSelector.tsx:29-30) — those are click
           targets, this is a region you click INTO. Pre-15.4 Safari drops the rule and falls back to
           the UA outline, which is an acceptable degradation. */
        '&:focus-visible': { boxShadow: `0 0 0 3px ${theme.palette.primary.light}` },
        /* Paper has no scrollport. Without this, Ctrl+P (and Save as PDF — what a manager forwards)
           silently emits only the handful of rows that happened to fit on screen, with no marker that
           the rest was dropped, and the sticky cells repeat at fixed offsets on every page.
           `!important` is REQUIRED: RowsTable writes the height as an inline style, and the sticky
           cells carry inline `position:sticky`. */
        '@media print': {
            maxHeight: 'none !important',
            overflow: 'visible !important',
            border: 'none',
            '& th, & td': { position: 'static !important', boxShadow: 'none !important' },
        },
    },
}));
