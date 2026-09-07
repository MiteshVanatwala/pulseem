import { useMemo, useRef, useState, useCallback, useEffect, useLayoutEffect } from 'react';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Tooltip, Box, CircularProgress
} from '@material-ui/core';
import { Edit as EditIcon } from '@material-ui/icons';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { DataSourceColumn, DataSourceRow, eMatchType } from '../../../Models/DataSources/DataSource';
import { eDataType } from '../../../Models/DataSources/DataSourceEnums';
import { formatValueForColumn } from './formatValue';
import { useRowsTableStyles } from './rowsTableStyles';

interface RowsTableProps {
    classes: { [key: string]: string };
    columns: DataSourceColumn[];
    rows: DataSourceRow[];
    loading: boolean;
    readOnly: boolean;
    onColumnClick: (col: DataSourceColumn) => void;
}

/* Renders the dynamic RowJson grid + two resolve columns (email / cell). The first data column is
   frozen at the reading edge. RowJson is parsed per row inside try/catch so a single malformed row
   degrades to blank cells instead of crashing the table.

   ── [HSCROLL] 2026-09-07 · "there is no sideways scrolling on this screen" ───────────────────────
   A Clal source is 20+ columns wide, so this grid has always been wider than the page. It has also
   always scrolled — MUI's TableContainer root ships `width:100%; overflow-x:auto`. What was missing
   is everything that TELLS the operator so, and four separate defects hid it:

   1. NOTHING BOUNDED THE BOX. A scroll container draws its horizontal bar at the bottom of ITSELF,
      i.e. under 50 rows, ~1500px below the fold. To reach it you scroll the whole page down — at
      which point the grid you wanted to scroll is off the top of the screen. The box is now capped
      to the viewport (fitToViewport below), which puts the bar directly under the visible rows.
   2. THE BAR WAS 6px OF NEAR-TRANSPARENT GREY, from an unscoped `::-webkit-scrollbar` rule that
      leaks product-wide. Re-declared, scoped, in rowsTableStyles.ts — full argument there.
   3. `stickyHeader` WAS INERT. position:sticky needs room to move inside a scrollport, and an
      unbounded container has scrollHeight === clientHeight. Capping the box switches the header on
      for free, which is what makes 50 rows of a 20-column grid readable at all.
      🔴 Do not remove `stickyHeader` from <Table>: Table.js:44-46 is the ONLY source of
      `border-collapse:separate` here, and a sticky cell in a collapsed table does not stick — the
      frozen column below dies with it.
   4. MUI PINS EVERY HEADER CELL, not just the first. TableCell.js:126-133 is
      `{position:sticky; top:0; left:0; z-index:2}` and :185 applies it to every head cell, so the
      moment the grid is scrolled sideways the header cells pile up on one another at the reading
      edge while the body columns underneath scroll normally. HEAD_INSET_RESET neutralises the
      horizontal half of that and keeps the vertical pin. BOTH insets are reset, not just `left`,
      because MUI's own sheet is flipped by jss-rtl on the Hebrew page and we would otherwise be
      overriding the edge it is no longer using.

   Deliberately NOT done: no wheel handler, no scroll listener, no edge-fade overlay, no floating
   arrow buttons, no proxy scrollbar. Wheel, shift+wheel, trackpad, drag and touch are all native on
   an overflow container and a hand-rolled version is always worse; the problem here was visibility,
   not input. If a future change does need scroll math, note that in an RTL scroller Chrome and
   Firefox report scrollLeft as 0 at the inline START and NEGATIVE toward the end — so "is it
   scrolled?" is `Math.abs(el.scrollLeft) > 1`, never `el.scrollLeft > 0`, which is permanently
   false in Hebrew. */

/* Painted px kept clear beneath the grid so TablePagination (DataSourceView.tsx:360-370) lands on
   screen with it — a 52px MUI toolbar plus breathing room. A constant, not a measurement of the
   sibling: coupling this component to the layout of the one below it breaks the moment either
   moves. If that row ever grows, the right answer is a flex column with min-height:0 in
   DataSourceView, not a bigger number here. */
const BOTTOM_RESERVE_PX = 88;
/* Below this the box stops being a grid (≈4 rows + header). */
const MIN_GRID_PX = 240;
const LAST_RESORT_GRID_PX = 150;
const VIEWPORT_EDGE_GAP_PX = 8;
/* Sub-3px churn is ignored. Two reasons, both real: the ResizeObserver below watches this box's own
   parent, so writing a height on every callback could feed itself; and capping the grid can remove
   the document's vertical overflow, which widens the layout viewport by a scrollbar's width and can
   cross the 1440px edge of the `body{zoom:0.95}` media query in index.css:11-15 — a window sized in
   that 1441-1456px seam could otherwise oscillate. */
const REFIT_EPSILON_PX = 3;

/* Shared, and frozen so no caller can mutate the module's copy. It is SPREAD at both call sites, so
   there is no allocation saved here — the value is a rule, not a cache. See defect 4 above for why
   BOTH insets are cleared and not just `left`. */
const HEAD_INSET_RESET = Object.freeze({ left: 'auto', right: 'auto' });

const RowsTable = ({ classes, columns, rows, loading, readOnly, onColumnClick }: RowsTableProps) => {
    const { t, i18n } = useTranslation();
    const local = useRowsTableStyles();
    const isRtl = (i18n.dir?.() ?? 'rtl') === 'rtl';
    /* [HSCROLL] The direction the DOM is ACTUALLY laid out in. App.js:1029 renders
       `<div dir={isRTL ? 'rtl' : 'ltr'}>` from redux core.isRTL, and the browser resolves every
       physical offset below against THAT. Reading the SAME store value that `dir` is built from is
       what makes these insets unfalsifiable: they cannot disagree with the direction the browser
       resolves them against, whatever the boot order — which is not a property i18next can offer.
       (The pair that CAN diverge is theme.direction, getTheme(core.language) at App.js:848, against
       that same `dir`: coreSlice.js:17-19 boots language:'he' with isRTL:false, so jss-rtl flips
       MUI's own sheets to RTL while the DOM is still LTR. That is why HEAD_INSET_RESET has to clear
       BOTH insets and not just `left`.) `isRtl` stays on i18next above because it only steers Tooltip
       poppers, which are portalled OUTSIDE that wrapper. */
    const isRtlDom = useSelector((s: any) => !!s?.core?.isRTL);
    const ordered = useMemo(() => [...(columns || [])].sort((a, b) => a.Ordinal - b.Ordinal), [columns]);

    const parsed = useMemo(() => (rows || []).map(r => {
        try { return JSON.parse(r.RowJson || '{}'); } catch { return {}; }
    }), [rows]);

    const scrollerRef = useRef<HTMLDivElement>(null);
    const [canScrollX, setCanScrollX] = useState(false);

    /* Cap the box at the viewport, MEASURED rather than guessed.
       `maxHeight:'70vh'` — the in-repo precedent at TokenMappingTable.tsx:65 — cannot work here:
       this grid sits under a page header, a FiltersBar whose chips wrap, and an optional
       historical-version banner (DataSourceView.tsx:319-341), so its top edge moves by ~150px
       between states, and 70vh of an 800px viewport puts the bottom of the box — and the scrollbar
       with it — back below the fold. A calc() constant has that problem plus the zoom one below. */
    const fitToViewport = useCallback(() => {
        const el = scrollerRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        /* `body{zoom:0.95}` (index.css:11-15) covers this subtree between 1024 and 1440px — i.e. the
           laptops this account actually uses. Inside a zoomed box getBoundingClientRect() reports
           PAINTED px while offsetWidth reports LAYOUT px, so their ratio IS the zoom factor: derived,
           so no 0.95 is hardcoded and nothing silently breaks if that media query is retuned.
           Clamped because the relationship is engine behaviour, not a spec guarantee — a ratio above
           1 would push the box below the fold, which is the bug we are here to remove. */
        const ratio = el.offsetWidth > 0 ? rect.width / el.offsetWidth : 1;
        /* An UNMEASURABLE box keeps the cap it already has. `offsetWidth > 0` does not catch every
           case: an ancestor with transform:scale(0) reports rect.width 0 with a non-zero offsetWidth,
           the clamp below would floor that at 0.5, and the box would be written at DOUBLE the
           intended height — the original bug, silently. No such ancestor exists on this screen today;
           this is here so that adding a Grow/Zoom wrapper later cannot resurrect it. */
        if (!(ratio > 0.1)) return;
        const scale = Math.min(1, Math.max(0.5, ratio)) || 1;
        /* Page-scroll independent. rect.top alone would grow the box whenever a re-measure happened
           while the user was scrolled down, and the bar would be back under the fold on the way up. */
        const naturalTop = rect.top + window.scrollY;
        const room = window.innerHeight - naturalTop - BOTTOM_RESERVE_PX;
        const edgeRoom = window.innerHeight - naturalTop - VIEWPORT_EDGE_GAP_PX;
        /* 1366x768 with the banner open is the tight case. Give up the RESERVE before the fold: a
           short grid whose bar is on screen beats a taller one whose bar is not. Only when the grid's
           own top is already at or below the fold — where no cap can put the bar on screen — fall
           back to a fixed small box, so nudging the page down brings rows and bar into view together.
           🔴 Never Math.max() across those two branches (this code did, and it was wrong): with
           edgeRoom below ~142 the floor pushes the bar back off screen, which is the reported bug in
           miniature — and Math.max(0, edgeRoom) has the opposite failure, writing max-height:0 and
           rendering an empty box while the side menu's 225ms margin transition is still running. */
        const painted = room >= MIN_GRID_PX ? room
            : edgeRoom > 0 ? edgeRoom
                : LAST_RESORT_GRID_PX;
        const next = Math.round(painted / scale);
        /* Written imperatively, and the container deliberately carries NO `style` prop: react-dom
           only touches el.style for keys present in a style object it is diffing, so with no style
           prop at all this value can never be stomped by a re-render. If you ever add one, make it a
           module constant — a fresh literal per render re-writes every key it holds.
           🔴 The previous value is read back off THE ELEMENT and not remembered in a ref. A ref
           outlives the node: every filter change flips `loading` and returns the spinner instead of
           the grid, so the next grid is a NEW div with no inline height — and a ref still holding
           the old number would fall inside the epsilon and skip the write, leaving that box
           unbounded and the scrollbar back below the fold from the first search onward. */
        const current = parseFloat(el.style.maxHeight || '');
        if (!isFinite(current) || Math.abs(next - current) >= REFIT_EPSILON_PX) {
            el.style.maxHeight = `${next}px`;
        }
        /* The frozen column's shadow is a promise that something passes underneath it. On a
           four-column source nothing ever does, so it is drawn only when the grid can really scroll.
           Measured in this same pass — no scroll listener — and setState bails out when unchanged. */
        setCanScrollX(el.scrollWidth - el.clientWidth > 1);
    }, []);

    /* Re-fit on anything that changes the grid's geometry: a new page of rows, a different column
       set, the loader coming and going. A dependency list, not a bare effect: FiltersBar's free-text
       field is controlled state on the parent (DataSourceView.tsx:63), so an unlisted effect would
       force a synchronous layout on every keystroke. No eslint-disable is needed for the three deps
       the callback does not read — exhaustive-deps allows an EFFECT extra dependencies, and adding a
       blanket suppression here would silence a genuinely missing one later. */
    useLayoutEffect(() => { fitToViewport(); }, [fitToViewport, loading, rows, columns]);

    /* Keyed on `loading` because that is the only edge on which the container can appear:
       dataSourcesSlice routes every state.rows mutation through rowsStatus:'loading' first. If a
       future path ever swaps rows WITHOUT a pending phase (an optimistic edit, a cached-page poll, a
       client-side sort), the grid would mount on a run where this effect had already bailed at the
       null check and would keep a stale cap for its whole life — re-key it on the node then. */
    useEffect(() => {
        const el = scrollerRef.current;
        if (!el) return;
        let alive = true;
        /* Coalesced to one measurement per frame: resize fires at frame rate during a window drag,
           and fitToViewport forces two full layouts of a 50-row sticky grid (a rect read, a style
           write, then a scrollWidth read). The ResizeObserver path already gets this for free from
           the app-wide 20ms debounce in index.js. */
        let raf = 0;
        const onResize = () => {
            if (raf) return;
            raf = window.requestAnimationFrame(() => { raf = 0; fitToViewport(); });
        };
        window.addEventListener('resize', onResize);
        /* A re-render is not the only thing that moves this box's top edge, and the three that do
           not render it are the three that matter: the Assistant webfont swaps in after first paint
           (index.css:62, &display=swap) and reflows everything above the grid; the side menu animates
           its margin for ~225ms (MainLayout.tsx:27-30), so measuring at t=0 measures the old width;
           and the filter chips re-wrap at that new width afterwards. Observing the parent catches all
           three at their settled size. Feature-detected — no polyfill ships in this app. */
        const RO: any = (window as any).ResizeObserver;
        const parent = el.parentElement;
        const ro = RO && parent ? new RO(fitToViewport) : null;
        if (ro && parent) ro.observe(parent);
        /* Guarded by `alive`, not only by the null check inside fitToViewport: once the fonts have
           settled this is an already-resolved cached promise, so every filter search would schedule
           another microtask against a grid that may be gone by the time it runs. */
        const fonts: any = (document as any).fonts;
        if (fonts?.ready?.then) fonts.ready.then(() => { if (alive) fitToViewport(); }).catch(() => { /* the fonts API is a nicety */ });
        return () => {
            alive = false;
            window.removeEventListener('resize', onResize);
            if (raf) window.cancelAnimationFrame(raf);
            if (ro) ro.disconnect();
        };
    }, [fitToViewport, loading]);

    /* PHYSICAL insets, resolved from the DOM's own direction — NOT `inset-inline-start`.
       A logical inset resolves against the ELEMENT's direction, and the body cells of every
       non-TEXT column carry `direction:'ltr'` as a bidi guard (see the cell below). On the Hebrew
       page that made a numeric first column resolve inset-inline-start to `left:0` in the body while
       its own header cell — which has no such override — resolved it to `right:0`: header and body
       of one frozen column pinned to OPPOSITE edges. Physical values cannot drift apart like that.
       The rule this leaves behind: never put a logical inset on a cell carrying the bidi guard. */
    const startInset: any = isRtlDom ? { right: 0, left: 'auto' } : { left: 0, right: 'auto' };
    /* Hairline + a soft depth cue, cast toward the content that slides under the frozen column:
       leftward in RTL (negative x), rightward in LTR. Written inline precisely because jss-rtl would
       mirror it a second time inside a stylesheet. */
    const frozenShadow = isRtlDom
        ? '-1px 0 0 0 #e6e9ef, -10px 0 10px -10px rgba(16,24,40,0.22)'
        : '1px 0 0 0 #e6e9ef, 10px 0 10px -10px rgba(16,24,40,0.22)';

    /* z-index tiers — all three are needed once both axes are sticky:
         1 — frozen body cell. Positioned, so it still paints over the static cells it scrolls past.
         2 — MUI's header cells (TableCell.js:130), untouched.
         3 — the corner cell, which must win against BOTH. At the old shared z-index:2 the tie was
             broken by DOM order, and <tbody> follows <thead>: body cells painted over the header. */
    const frozenBodyStyle = (isFirst: boolean): any => isFirst
        ? {
            position: 'sticky', ...startInset, zIndex: 1,
            /* Opaque, or the scrolled columns show through it. If zebra striping or a row hover tint
               is ever added, this must become `background:'inherit'` with the colour moved onto the
               row, otherwise the frozen column stays white while its row is not. */
            background: '#fff',
            ...(canScrollX ? { boxShadow: frozenShadow } : {}),
        }
        : {};

    const frozenHeadStyle = (isFirst: boolean): any => isFirst
        ? {
            /* position/top/background come from MUI's stickyHeader class — only the horizontal pin
               and the layering are ours. The background is restated because this cell used to be
               hardcoded #fff, which left one white notch in an otherwise #fafafa header row (MUI
               resolves it from palette.background.default, which theme.js does not override). */
            ...startInset, zIndex: 3, background: '#fafafa',
            ...(canScrollX ? { boxShadow: frozenShadow } : {}),
        }
        : HEAD_INSET_RESET;

    const renderMatch = (channel: 'email' | 'cell', matchType: eMatchType, isDup: boolean) => {
        if (matchType === eMatchType.NO_VALUE) return <Typography style={{ color: '#95A5A6' }}>—</Typography>;
        const label = t(`DataSources.view.match.${channel}.${matchType}`);
        if (isDup) {
            return (
                <Tooltip title={t('DataSources.view.duplicateTooltip')} PopperProps={{ style: { direction: isRtl ? 'rtl' : 'ltr' } }}>
                    <Typography style={{ color: '#95A5A6' }}>{label}</Typography>
                </Tooltip>
            );
        }
        return <Typography style={{ color: matchType === eMatchType.NOT_FOUND ? '#B42318' : '#067647' }}>{label}</Typography>;
    };

    if (loading) {
        return <Box style={{ textAlign: 'center', padding: 32 }}><CircularProgress /></Box>;
    }
    if (!rows || rows.length === 0) {
        return <Box style={{ textAlign: 'center', padding: 32, color: '#5b6b7b' }}>{t('DataSources.view.noRows')}</Box>;
    }

    const gridLabel = t('DataSources.view.gridAriaLabel');

    return (
        /* tabIndex/role/aria-label: this box scrolls in both axes, and a region that can only be
           scrolled with a mouse fails WCAG 2.1.1. As a tab stop it gets the browser's own arrow /
           PageUp / PageDown / space handling for free — no key handler of ours. (Home/End are
           vertical in every engine; there is no native key for the horizontal extreme, so a keyboard
           user crosses a 25-column grid on arrow auto-repeat.) The name lives on the region and NOT
           also on the <table>: two elements carrying the same aria-label makes a screen reader
           announce it twice, and the region is the thing being navigated. */
        <TableContainer
            ref={scrollerRef}
            className={local.scroller}
            tabIndex={0}
            role="region"
            aria-label={gridLabel}
        >
            <Table size="small" stickyHeader>
                <TableHead>
                    <TableRow>
                        {ordered.map((c, ci) => (
                            <TableCell
                                key={c.ColumnID}
                                style={{ ...frozenHeadStyle(ci === 0), whiteSpace: 'nowrap', cursor: readOnly ? 'default' : 'pointer', fontWeight: 700 }}
                                onClick={readOnly ? undefined : () => onColumnClick(c)}
                            >
                                <Box style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                    {c.DisplayName}
                                    {!readOnly && <EditIcon fontSize="inherit" style={{ opacity: 0.5 }} />}
                                </Box>
                            </TableCell>
                        ))}
                        <TableCell style={{ ...HEAD_INSET_RESET, whiteSpace: 'nowrap', fontWeight: 700 }}>{t('DataSources.view.resolveEmail')}</TableCell>
                        <TableCell style={{ ...HEAD_INSET_RESET, whiteSpace: 'nowrap', fontWeight: 700 }}>{t('DataSources.view.resolveCell')}</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {rows.map((row, ri) => (
                        <TableRow key={row.RowID}>
                            {ordered.map((c, ci) => (
                                <TableCell key={c.ColumnID} style={{
                                    ...frozenBodyStyle(ci === 0), whiteSpace: 'nowrap',
                                    /* A number, a phone or an email is never Hebrew: without an explicit
                                       ltr the bidi algorithm reorders "1,234.50-" style runs on an RTL
                                       page and the value on screen stops being the value in the file.
                                       textAlign follows the page so the column still lines up.
                                       🔴 This is also why the frozen column above must use PHYSICAL
                                       insets — a logical one would resolve against THIS direction. */
                                    ...(c.DataType === eDataType.TEXT ? {} : { direction: 'ltr' as const, textAlign: isRtlDom ? 'right' as const : 'left' as const })
                                }}>
                                    {/* ONE formatter, shared with every other screen — see formatValue.ts.
                                        Per COLUMN (c.DataType), never per cell: a column that renders with
                                        separators on some rows and without on others reads as a bug. */}
                                    {formatValueForColumn(parsed[ri] ? parsed[ri][c.ColumnKey] : null, c)}
                                </TableCell>
                            ))}
                            <TableCell>{renderMatch('email', row.EmailMatchType, row.IsEmailDuplicate)}</TableCell>
                            <TableCell>{renderMatch('cell', row.CellMatchType, row.IsCellDuplicate)}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default RowsTable;
