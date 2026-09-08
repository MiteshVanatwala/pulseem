import { useMemo, useRef, useCallback, useEffect } from 'react';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Tooltip, Box, CircularProgress
} from '@material-ui/core';
import { Edit as EditIcon } from '@material-ui/icons';
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

/* Renders the dynamic RowJson grid + two resolve columns (email / cell). RowJson is parsed per row
   inside try/catch so a single malformed row degrades to blank cells instead of crashing the table.

   ── [HSCROLL] 2026-09-07 · "there is no sideways scrolling on this screen" ───────────────────────
   A Clal source is 20+ columns wide, so this grid has always been wider than the page. It has also
   always scrolled sideways — MUI's TableContainer root ships `width:100%; overflow-x:auto`. Two
   things kept that from being usable, and they are the whole of this change:
     1. THE BAR WAS INVISIBLE. 6px of near-transparent grey, from an UNSCOPED `::-webkit-scrollbar`
        rule that leaks into every screen of the product. Re-declared scoped in rowsTableStyles.ts,
        full argument there.
     2. THE BAR WAS UNREACHABLE. A scroll container draws its bar at the bottom of ITSELF, so on a
        50-row page you had to scroll past every row to reach it — and by then the rows you wanted to
        scroll sideways were off the top of the screen. `floatBar` below is a second, real scrollbar
        pinned to the bottom of the WINDOW, synced both ways with the table, shown only while the
        table is on screen and its own bar is not.

   🔴 THIS IS A PLAIN TABLE. NOTHING STICKS (owner, 2026-09-07). Three things were tried here and
   removed at the owner's word, in this order — do not bring any of them back without asking:
     · A frozen first column. It was in the original code (`position:sticky; insetInlineStart:0`) but
       never actually held; a first pass made it work, and a column that refuses to move while
       everything beside it does reads as a bug, not a feature.
     · A viewport-capped height, so the horizontal bar would ride under the visible rows instead of
       sitting at the bottom of a full page of them. Rejected with the page size as the answer: how
       many rows a page carries is the operator's lever, not this component's.
     · `stickyHeader` on <Table>. Rows scroll the PAGE now, so there is nothing for a pinned header
       to pin against.
   If a later change ever restores `stickyHeader`, know what comes with it: TableCell.js:126-133 is
   `{position:sticky; top:0; left:0; z-index:2}` and :185 applies it to EVERY head cell — not just
   the first — so the header cells jam against the reading edge and pile up on one another the moment
   the grid is scrolled sideways, while the body columns underneath keep moving. Measured in Chrome
   on a copy of the emitted CSS: at scrollLeft -500 the header read "מייל סוכן" over a column of
   prize amounts. The fix is `{left:'auto', right:'auto'}` inline on every head cell — BOTH insets,
   because jss-rtl flips MUI's own sheet on the Hebrew page. And if a frozen column ever returns, it
   needs PHYSICAL insets: `inset-inline-start` resolves against the CELL's own direction, and the
   body cells of non-TEXT columns carry a `direction:'ltr'` bidi guard, so (measured) the body pinned
   to `left:0` while its own header cell pinned to `right:0` — opposite edges of one column.

   Scroll input stays native everywhere: wheel, shift+wheel, trackpad, drag and touch all work on an
   overflow container, and the floating bar is a real scrollbar on a real overflow element rather
   than a drawn imitation — the only code is the two-way copy of scrollLeft. That copy is verbatim
   and needs no sign handling BECAUSE both elements sit in the same RTL subtree and therefore share
   one convention. Anything that ever COMPARES a scrollLeft does need it: in an RTL scroller Chrome
   and Firefox report 0 at the inline START and NEGATIVE toward the end, so "is it scrolled?" is
   `Math.abs(el.scrollLeft) > 1` and never `el.scrollLeft > 0`, which is permanently false in
   Hebrew. */

/* How much of the table must be in view before the floating bar is worth showing. Without it the bar
   appears while a 40px sliver of the header peeks over the fold, which reads as a stray artefact. */
const VISIBLE_SLICE_PX = 80;

const RowsTable = ({ classes, columns, rows, loading, readOnly, onColumnClick }: RowsTableProps) => {
    const { t, i18n } = useTranslation();
    const local = useRowsTableStyles();
    const isRtl = (i18n.dir?.() ?? 'rtl') === 'rtl';
    const ordered = useMemo(() => [...(columns || [])].sort((a, b) => a.Ordinal - b.Ordinal), [columns]);

    const parsed = useMemo(() => (rows || []).map(r => {
        try { return JSON.parse(r.RowJson || '{}'); } catch { return {}; }
    }), [rows]);

    const scrollerRef = useRef<HTMLDivElement>(null);
    const floatBarRef = useRef<HTMLDivElement>(null);
    const spacerRef = useRef<HTMLDivElement>(null);

    /* Place the floating bar over the table's own box and decide whether it is wanted at all. */
    const syncFloatBar = useCallback(() => {
        const el = scrollerRef.current, bar = floatBarRef.current, spacer = spacerRef.current;
        if (!el || !bar || !spacer) return;
        const rect = el.getBoundingClientRect();
        const wanted =
            el.scrollWidth - el.clientWidth > 1          // there is somewhere to scroll to
            && rect.bottom > window.innerHeight          // the table's OWN bar is below the fold
            && rect.top < window.innerHeight - VISIBLE_SLICE_PX  // and the table is really on screen
            && rect.bottom > 0;
        if (!wanted) {
            if (bar.style.display !== 'none') bar.style.display = 'none';
            return;
        }
        /* `body{zoom:0.95}` (index.css:11-15) covers this subtree between 1024 and 1440px. A fixed
           box inside a zoomed one still resolves `bottom:0` against the window — 0 survives any
           scale — but a left/width in px is multiplied by the zoom on the way to the screen, while
           getBoundingClientRect already reports PAINTED px. Dividing by the factor is what lines the
           bar up with the table instead of 5% short of it. The factor is derived from this very
           element (painted width over layout width), so no 0.95 is hardcoded; clamped because the
           relationship is engine behaviour and not a spec guarantee. */
        const ratio = el.offsetWidth > 0 ? rect.width / el.offsetWidth : 1;
        const scale = Math.min(1, Math.max(0.5, ratio)) || 1;
        bar.style.display = 'block';
        bar.style.left = `${rect.left / scale}px`;
        bar.style.width = `${rect.width / scale}px`;
        /* The spacer is what gives the floating bar a thumb of the right size and a scrollLeft range
           identical to the table's — same content width, same visible width, so the two positions
           can be copied across verbatim with no arithmetic. */
        const spacerWidth = `${el.scrollWidth}px`;
        if (spacer.style.width !== spacerWidth) spacer.style.width = spacerWidth;
        if (bar.scrollLeft !== el.scrollLeft) bar.scrollLeft = el.scrollLeft;
    }, []);

    useEffect(() => {
        const el = scrollerRef.current, bar = floatBarRef.current;
        if (!el || !bar) return;
        /* Each scroller drives the other. The lock is what stops the pair from ping-ponging: the
           assignment below fires the other element's scroll event synchronously. */
        let lock = false;
        const fromTable = () => { if (lock) return; lock = true; bar.scrollLeft = el.scrollLeft; lock = false; };
        const fromBar = () => { if (lock) return; lock = true; el.scrollLeft = bar.scrollLeft; lock = false; };
        /* Repositioning reads layout, so it is coalesced to one measurement per frame — page scroll
           fires at frame rate. Captured on `document` rather than bound to `window`: the page scrolls
           on the document today, but `appBody` computes `overflow-y:auto` (ganaralStyle.js:110-111 —
           see the note in rowsTableStyles.ts), so it could become the scroller without warning. A
           capturing listener sees the event either way. */
        let raf = 0;
        const onViewportChange = () => {
            if (raf) return;
            raf = window.requestAnimationFrame(() => { raf = 0; syncFloatBar(); });
        };
        el.addEventListener('scroll', fromTable, { passive: true });
        bar.addEventListener('scroll', fromBar, { passive: true });
        document.addEventListener('scroll', onViewportChange, true);
        window.addEventListener('resize', onViewportChange);
        /* Width changes that no scroll and no re-render reports: the side menu's ~225ms margin
           animation (MainLayout.tsx:27-30) and the Assistant webfont swapping in (index.css:62). */
        const RO: any = (window as any).ResizeObserver;
        const ro = RO ? new RO(syncFloatBar) : null;
        if (ro) ro.observe(el);
        syncFloatBar();
        return () => {
            el.removeEventListener('scroll', fromTable);
            bar.removeEventListener('scroll', fromBar);
            document.removeEventListener('scroll', onViewportChange, true);
            window.removeEventListener('resize', onViewportChange);
            if (raf) window.cancelAnimationFrame(raf);
            if (ro) ro.disconnect();
        };
    }, [syncFloatBar, loading, rows, columns]);

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

    return (
        /* tabIndex/role/aria-label: this box scrolls, and a region that can only be scrolled with a
           mouse fails WCAG 2.1.1. As a tab stop it gets the browser's own arrow / PageUp / PageDown /
           space handling for free — no key handler of ours. (Home/End are vertical in every engine;
           there is no native key for the horizontal extreme, so a keyboard user crosses a 25-column
           grid on arrow auto-repeat.) The name is on the region and NOT also on the <table>: the same
           aria-label on two nested elements is announced twice. */
        <>
            <TableContainer
                ref={scrollerRef}
                className={local.scroller}
                tabIndex={0}
                role="region"
                aria-label={t('DataSources.view.gridAriaLabel')}
            >
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            {ordered.map((c) => (
                                <TableCell
                                    key={c.ColumnID}
                                    style={{ whiteSpace: 'nowrap', cursor: readOnly ? 'default' : 'pointer', fontWeight: 700 }}
                                    onClick={readOnly ? undefined : () => onColumnClick(c)}
                                >
                                    <Box style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                        {c.DisplayName}
                                        {!readOnly && <EditIcon fontSize="inherit" style={{ opacity: 0.5 }} />}
                                    </Box>
                                </TableCell>
                            ))}
                            <TableCell style={{ whiteSpace: 'nowrap', fontWeight: 700 }}>{t('DataSources.view.resolveEmail')}</TableCell>
                            <TableCell style={{ whiteSpace: 'nowrap', fontWeight: 700 }}>{t('DataSources.view.resolveCell')}</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.map((row, ri) => (
                            <TableRow key={row.RowID}>
                                {ordered.map((c) => (
                                    <TableCell key={c.ColumnID} style={{
                                        whiteSpace: 'nowrap',
                                        /* A number, a phone or an email is never Hebrew: without an explicit
                                           ltr the bidi algorithm reorders "1,234.50-" style runs on an RTL
                                           page and the value on screen stops being the value in the file.
                                           textAlign follows the page so the column still lines up. */
                                        ...(c.DataType === eDataType.TEXT ? {} : { direction: 'ltr' as const, textAlign: isRtl ? 'right' as const : 'left' as const })
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
            {/* The floating twin. aria-hidden with no tabIndex on purpose: it is a duplicate control for
                a region that is already keyboard-scrollable through the tab stop above, and announcing a
                second nameless scrollbar would only add noise. Position and visibility are written
                imperatively by syncFloatBar — this element carries no `style` prop, so react-dom never
                touches el.style and cannot stomp them on a re-render. */}
            <div ref={floatBarRef} className={local.floatBar} aria-hidden="true">
                <div ref={spacerRef} className={local.floatBarSpacer} />
            </div>
        </>
    );
};

export default RowsTable;
