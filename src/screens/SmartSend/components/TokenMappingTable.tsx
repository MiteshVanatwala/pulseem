import React, { useMemo, useState } from 'react';
import {
    Box, Typography, Table, TableHead, TableBody, TableRow, TableCell, TableContainer,
    Select, MenuItem, Chip, Tooltip, TextField, InputAdornment,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Warning, ShowChart, VpnKey, TextFields, Search } from '@material-ui/icons';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { SmartSendColumn, SmartSendTokenInfo } from '../../../Models/DataSources/SmartSend';
import { resolveColumnLabel } from '../columnLabel';
import { suggestMapping } from '../suggestMapping';

// §11.4 · one row per ##token## → a Select over the version's columns (labelled by
// `resolveColumnLabel`, imported from ../columnLabel — DisplayName, but never blank).
// Mapping is by ColumnID (rename-safe). Each token carries exactly one badge: graph /
// system-field / free. Warnings: unmapped (blocks send at M9), a mapped column that
// VANISHED in the locked version (remap), and a system-field token mapped to a source
// (the source value overrides the recipient's account field). Long templates (50 tokens)
// scroll and are searchable; long Hebrew names wrap and carry a title (§ה.6).
//
// NAME-SIMILARITY SUGGESTIONS (`../suggestMapping`, pure module, no redux, no i18n):
// exactly ONE entry point — every unmapped row offers its single best candidate as a clickable
// chip. It goes through the SAME `onChange` a manual pick uses, so nothing new touches redux and
// the screen's setDirty(true) + 750ms debounced autosave (SmartSendScreen.tsx:225-235) treat it
// like any other manual edit.
//
// WHY THERE IS NO LONGER A BULK "AUTO-MAP" BUTTON (three review rounds, removed): the confidence
// score measures NAME similarity, and name similarity is not meaning. `MobilePhone` scored 1.0000
// against a column displayed as "טלפון נייד חסום" (a SUPPRESSION flag) and `EmailAddress` 1.0000
// against "האימייל של בן הזוג" (the spouse's address). Applied in bulk those are persisted by the
// 750ms autosave with no undo and are afterwards indistinguishable from a choice the user made.
// The CHIP is safe where the button was not, and for a structural reason rather than a tuning one:
// `resolveColumnLabel` prints the candidate column's ACTUAL name on the chip, so those same cases
// read "הצעה: טלפון נייד חסום" and the user simply does not click. One row, named, one click.
//
// WHY A CLICK AND NOT A PRE-FILL: businessColumnDefaults.ts:8-16 records the property this must
// not break — a GUESSED value must never trip the autosave into the shared production DB on its
// own. Defaults therefore live in a reducer (structurally unable to set `dirty`). A suggestion
// computed here CAN set dirty, and that is precisely why it is gated behind a click: the guess
// only ever leaves the component when the user asks for it, one named row at a time.
//
// WHY THE SUGGESTIONS ARE COMPUTED HERE AND NOT IN THE SLICE: they are derived state — a pure
// function of (tokens, columns, value), all three already props. Storing them would add a fourth
// thing to keep in sync and would put a guess into persisted state before anyone acted on it.

interface Props {
    tokens: SmartSendTokenInfo[];
    columns: SmartSendColumn[];
    value: { [token: string]: number | null };
    onChange: (token: string, columnId: number | null) => void;
    warnSystemFieldOverride?: boolean;
}

const useStyles = makeStyles((theme) => ({
    header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: theme.spacing(1) },
    // The header's right-hand cluster (counter · filter toggle · search).
    // Its own flex box so the header keeps its two-child space-between layout.
    headerActions: { display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: theme.spacing(1) },
    search: { minWidth: 220 },
    // Viewport-relative, not the old fixed 420px: that cap showed ~6 rows on any screen and made a
    // 50-token template a scroll-inside-a-scroll. A percentage of the viewport grows with the
    // monitor while still keeping the table scrolling INSIDE its box, so the page's own controls
    // (business-columns picker, send bar) never get pushed off the bottom on a long template.
    container: { marginTop: theme.spacing(1), maxHeight: '70vh', border: '1px solid #e0e0e0', borderRadius: 6 },
    tokenCell: { display: 'flex', alignItems: 'center', gap: theme.spacing(1), flexWrap: 'wrap' },
    tokenName: { fontWeight: 600, overflowWrap: 'anywhere' },
    warnRow: { background: '#fdf6ec' },
    unmapped: { color: '#c0392b', fontWeight: 600 },
    unmappedCount: { color: '#c0392b', fontWeight: 600, whiteSpace: 'nowrap' },
    warnIcon: { color: '#c0392b', cursor: 'help', verticalAlign: 'middle' },
    select: { minWidth: 220 },
    // The status cell now holds up to three things (unmapped text, warning icons, suggestion
    // chip); flex-wrap keeps a long Hebrew column name from stretching the column.
    statusCell: { display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: theme.spacing(1) },
    suggestChip: { maxWidth: 240 },
}));

const TokenMappingTable: React.FC<Props> = ({ tokens, columns, value, onChange, warnSystemFieldOverride = true }) => {
    const classes = useStyles();
    const { t } = useTranslation();
    // §2.5 · the Select menu portals to document.body — outside App's inner <div dir> — and
    // <html dir> is stuck "ltr", so the dropdown opens LTR. Force its direction like the dialogs.
    const isRTL = useSelector((s: any) => s.core && s.core.isRTL);
    const [search, setSearch] = useState('');
    const [unmappedOnly, setUnmappedOnly] = useState(false);

    const columnSet = useMemo(() => new Set(columns.map((c) => c.ColumnID)), [columns]);
    // ColumnID → the resolved label above, for the suggestion chip. Built once per column list
    // rather than a .find() per row: 50 tokens × 40 columns on every keystroke in the search box.
    // Built from the SAME `columns` array and under the SAME dependency as `columnSet` above, so a
    // ColumnID that passes the columnSet guard at the chip is guaranteed to have an entry here —
    // which is what lets the chip's label read straight out of this map with no undefined case.
    const columnLabel = useMemo(() => {
        const m = new Map<number, string>();
        columns.forEach((c) => m.set(c.ColumnID, resolveColumnLabel(c)));
        return m;
    }, [columns]);

    // THE single definition of "this token still needs a column" — the row tint, the header
    // counter, the "unmapped only" filter and the suggestion chip all call it, so they cannot
    // drift apart. A mapping pointing at a column that VANISHED from the locked version counts as
    // unmapped here because it cannot resolve at send time; that is deliberate and matches what
    // suggestMapping itself treats as unmapped (it re-offers a candidate for such a row).
    const isUnmapped = useMemo(() => (tok: SmartSendTokenInfo) => {
        const m = value[tok.Token] ?? null;
        return !(m != null && m > 0 && columnSet.has(m));
    }, [value, columnSet]);

    // Recomputed on `value` as well as on tokens/columns: suggestMapping RESERVES the columns of
    // already-mapped tokens, so mapping one row must stop that column being offered to another.
    const { suggestions } = useMemo(
        () => suggestMapping(tokens, columns, value),
        [tokens, columns, value],
    );

    // Counted over ALL tokens, never over `filtered` — the header number must not change when the
    // user types in the search box. Cheap enough to do inline (≤ ~50 tokens, §11.4).
    const unmappedCount = tokens.reduce((n, tk) => n + (isUnmapped(tk) ? 1 : 0), 0);

    const filtered = useMemo(() => {
        // Case-insensitive: these are ##token## names typed by hand into the template in whatever
        // case the author felt like, so a case-sensitive indexOf made "email" miss "Email".
        // Hebrew is caseless, so this only ever helps.
        const q = search.trim().toLowerCase();
        let rows = q ? tokens.filter((tk) => tk.Token.toLowerCase().indexOf(q) > -1) : tokens;
        if (unmappedOnly) rows = rows.filter(isUnmapped);
        return rows;
    }, [tokens, search, unmappedOnly, isUnmapped]);

    // NOTHING INTERSECTS THE SUGGESTIONS WITH `filtered` ANY MORE, and nothing should. That
    // intersection existed solely to keep the bulk button from writing rows the search box was
    // hiding; a chip is rendered BY a visible row, so "only acts on what you can see" is now a
    // property of where the control lives rather than a rule some list has to enforce. The only
    // guard a suggestion still needs is the per-row `columnSet` check at the chip itself — the
    // last point before a ColumnID reaches the save request.

    const badgeFor = (tok: SmartSendTokenInfo) => {
        if (tok.IsGraphToken) return <Chip size="small" icon={<ShowChart />} label={t('DataSources.send.mapping.badge.graph')} />;
        if (tok.IsSystemField) return <Chip size="small" icon={<VpnKey />} label={t('DataSources.send.mapping.badge.systemField')} />;
        return <Chip size="small" variant="outlined" icon={<TextFields />} label={t('DataSources.send.mapping.badge.free')} />;
    };

    if (!tokens.length) {
        return <Typography variant="body2" color="textSecondary" style={{ marginTop: 16 }}>{t('DataSources.send.mapping.noTokens')}</Typography>;
    }

    return (
        <Box style={{ marginTop: 24 }}>
            <Box className={classes.header}>
                <Box>
                    <Typography variant="subtitle1" style={{ fontWeight: 600 }}>{t('DataSources.send.mapping.title')}</Typography>
                    <Typography variant="body2" color="textSecondary">{t('DataSources.send.mapping.hint')}</Typography>
                </Box>
                <Box className={classes.headerActions}>
                    {unmappedCount > 0 && (
                        <Typography variant="body2" component="span" className={classes.unmappedCount}>
                            {t('DataSources.send.mapping.unmappedCount', { n: unmappedCount })}
                        </Typography>
                    )}
                    {/* Rendered while the toggle is ON even with nothing left unmapped: mapping the
                        last field (by chip or by dropdown) would otherwise remove the only control
                        that can turn the filter off, leaving an empty table with no way out. */}
                    {(unmappedCount > 0 || unmappedOnly) && (
                        <Chip
                            size="small"
                            clickable
                            color={unmappedOnly ? 'primary' : 'default'}
                            variant={unmappedOnly ? 'default' : 'outlined'}
                            label={t('DataSources.send.mapping.showUnmappedOnly')}
                            onClick={() => setUnmappedOnly((v) => !v)}
                            aria-pressed={unmappedOnly}
                        />
                    )}
                    {tokens.length > 8 && (
                        <TextField
                            className={classes.search}
                            size="small"
                            variant="outlined"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            // This box filters FIELD names. `DataSources.searchPlaceholder` is the
                            // sources-list string ("search by name or description") and was wrong here.
                            placeholder={t('DataSources.send.mapping.searchPlaceholder')}
                            InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }}
                            inputProps={{ 'aria-label': t('DataSources.send.mapping.title') }}
                        />
                    )}
                </Box>
            </Box>

            <TableContainer className={classes.container}>
                <Table size="small" stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell>{t('DataSources.send.mapping.tokenCol')}</TableCell>
                            <TableCell>{t('DataSources.send.mapping.columnCol')}</TableCell>
                            <TableCell />
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filtered.map((tok) => {
                            const mapped = value[tok.Token] ?? null;
                            const isMapped = mapped != null && mapped > 0;
                            const vanished = isMapped && !columnSet.has(mapped as number);
                            // Identical to the previous `isMapped && !vanished`, routed through the
                            // shared helper so the row tint and the header counter can never disagree.
                            const effectivelyMapped = !isUnmapped(tok);
                            const systemOverride = warnSystemFieldOverride && tok.IsSystemField && effectivelyMapped;
                            const rowWarn = !effectivelyMapped;
                            // Offered for a vanished mapping too — that row needs a column just as
                            // much as a never-mapped one. Null unless the candidate belongs to THIS
                            // version's columns, which also guarantees the label below is defined.
                            const sugg = (() => {
                                const s = suggestions[tok.Token];
                                return (!effectivelyMapped && s && columnSet.has(s.columnId)) ? s : null;
                            })();
                            // `resolveColumnLabel` via the map, NOT `DisplayName`: an empty
                            // DisplayName used to render "הצעה: " with nothing after it. The same
                            // resolution feeds the MenuItem below, so the chip and the dropdown can
                            // never disagree about what this column is called.
                            const suggestLabel = sugg
                                ? t('DataSources.send.mapping.suggestApply', { name: columnLabel.get(sugg.columnId) })
                                : '';
                            return (
                                <TableRow key={tok.Token} className={rowWarn ? classes.warnRow : undefined}>
                                    <TableCell>
                                        <Box className={classes.tokenCell}>
                                            <Typography component="span" className={classes.tokenName} title={tok.Token}>
                                                {tok.Token}
                                            </Typography>
                                            {badgeFor(tok)}
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Select
                                            className={classes.select}
                                            variant="outlined"
                                            margin="dense"
                                            displayEmpty
                                            value={vanished ? 0 : (mapped ?? 0)}
                                            onChange={(e) => { const v = Number(e.target.value); onChange(tok.Token, v > 0 ? v : null); }}
                                            inputProps={{ 'aria-label': `${t('DataSources.send.mapping.columnCol')} — ${tok.Token}` }}
                                            MenuProps={{ PaperProps: { dir: isRTL ? 'rtl' : 'ltr' } }}
                                        >
                                            <MenuItem value={0}><em>{t('DataSources.send.mapping.selectColumn')}</em></MenuItem>
                                            {/* Called directly rather than read out of `columnLabel`
                                                so this is literally the same expression the chip's
                                                label came from: a column with a blank DisplayName
                                                was an unpickable blank option here while the chip
                                                offered it by name. */}
                                            {columns.map((c) => <MenuItem key={c.ColumnID} value={c.ColumnID}>{resolveColumnLabel(c)}</MenuItem>)}
                                        </Select>
                                    </TableCell>
                                    <TableCell>
                                        <Box className={classes.statusCell}>
                                            {!isMapped && <span className={classes.unmapped}>{t('DataSources.send.mapping.unmapped')}</span>}
                                            {vanished && (
                                                <Tooltip title={t('DataSources.send.mapping.vanishedColumn')}>
                                                    <Warning className={classes.warnIcon} fontSize="small" />
                                                </Tooltip>
                                            )}
                                            {systemOverride && (
                                                <Tooltip title={t('DataSources.send.mapping.systemFieldWarn')}>
                                                    <Warning className={classes.warnIcon} fontSize="small" />
                                                </Tooltip>
                                            )}
                                            {/* Sits ALONGSIDE the warnings above, never instead of them: the
                                                row is still unmapped until this is clicked. Explicit aria-label
                                                because the visible label names only the COLUMN — out of the row
                                                context a screen reader user cannot tell which field it fills
                                                (same reason as the Select's aria-label above). */}
                                            {sugg && (
                                                <Tooltip title={t('DataSources.send.mapping.suggestTip')} PopperProps={{ dir: isRTL ? 'rtl' : 'ltr' }}>
                                                    <Chip
                                                        size="small"
                                                        clickable
                                                        variant="outlined"
                                                        className={classes.suggestChip}
                                                        label={suggestLabel}
                                                        aria-label={`${suggestLabel} — ${tok.Token}`}
                                                        onClick={() => onChange(tok.Token, sugg.columnId)}
                                                    />
                                                </Tooltip>
                                            )}
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default TokenMappingTable;
