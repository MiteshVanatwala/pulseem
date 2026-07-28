import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Typography, Chip, Tooltip, CircularProgress, Button, Dialog, IconButton } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { CheckCircle, Storage, Refresh, Close } from '@material-ui/icons';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { getChannelDescriptor } from '../../../Models/DataSources/SmartSend';
import { eDataSourceStatus } from '../../../Models/DataSources/DataSource';
import { selectSource, loadSourceColumns } from '../../../redux/reducers/smartSendSlice';
import { getDataSources } from '../../../redux/reducers/dataSourcesSlice';
import InlineBanner from './InlineBanner';

// §11.1/§13 · pick a READY, sendable source (GetMany). "Sendable" for the selected channel
// is read via the descriptor's identity-flag NAME (never a hardcoded field). READY sources
// that are NOT sendable on this channel (datalake with no identity → "view only"; a
// cell-only source on the email channel → "no email column") are shown DISABLED with a
// badge + explanation (§7.2/§16). A sendable source with 0 resolved rows is selectable but
// flagged. Source data comes from the DataSources module (getDataSources, USE_DS_MOCK).
// a11y mirrors ChannelSelector: radiogroup, roving tabindex, arrows, Enter/Space; disabled
// cards carry aria-describedby → sr-only reason and don't steal focus.

// The server clamps PageSize at 100 (DataSourcesController.cs:135), so asking for more is a lie.
// It also doubles as the marker that tells OUR response apart from the DataSources page's 6-row
// page in the shared `dataSources.list` slice — see the `isOurPage` check below.
const SOURCE_PAGE_SIZE = 100;

const useStyles = makeStyles((theme) => ({
    grid: { display: 'flex', flexWrap: 'wrap', gap: theme.spacing(2), marginTop: theme.spacing(1) },
    card: {
        position: 'relative', boxSizing: 'border-box', width: 264, padding: theme.spacing(2),
        border: '2px solid #e0e0e0', borderRadius: 8, cursor: 'pointer', outline: 'none',
        transition: 'border-color .15s, box-shadow .15s',
        '&:hover': { borderColor: theme.palette.primary.light },
        '&:focus, &:focus-visible': { boxShadow: `0 0 0 3px ${theme.palette.primary.light}` },
    },
    selected: { borderColor: theme.palette.primary.main, background: 'rgba(0, 0, 0, 0.02)' },
    disabled: {
        cursor: 'not-allowed', opacity: 0.6,
        '&:hover': { borderColor: '#e0e0e0' },
        '&:focus, &:focus-visible': { boxShadow: 'none' },
    },
    name: { fontWeight: 600, display: 'flex', alignItems: 'center', gap: theme.spacing(0.5), overflowWrap: 'anywhere' },
    desc: { marginTop: theme.spacing(0.5) },
    meta: { marginTop: theme.spacing(1), display: 'flex', alignItems: 'center', gap: theme.spacing(1), flexWrap: 'wrap' },
    check: { position: 'absolute', top: 8, insetInlineEnd: 8 },
    zero: { color: '#c0392b' },
    state: { display: 'flex', alignItems: 'center', gap: theme.spacing(1), marginTop: theme.spacing(2) },
    srOnly: {
        position: 'absolute', width: 1, height: 1, padding: 0, margin: -1,
        overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap', border: 0,
    },
    // Confirm dialog — same head/body/foot skeleton TestSendDialog uses, so the two
    // SmartSend dialogs are visually identical (MUI v4 core Dialog, no lab dependency).
    dlgHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: theme.spacing(2, 3), borderBottom: '1px solid #e0e0e0' },
    dlgBody: { padding: theme.spacing(3) },
    dlgFoot: { display: 'flex', gap: theme.spacing(1.5), padding: theme.spacing(2, 3), borderTop: '1px solid #e0e0e0' },
}));

const SourcePicker: React.FC = () => {
    const classes = useStyles();
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const list = useSelector((s: any) => s.dataSources.list);
    const listStatus = useSelector((s: any) => s.dataSources.listStatus);
    const selectedChannel = useSelector((s: any) => s.smartSend.selectedChannel);
    const dataSourceId = useSelector((s: any) => s.smartSend.dataSourceId);
    const currentSourceId = useSelector((s: any) => s.smartSend.dataSource?.DataSourceID ?? s.smartSend.dataSourceId ?? null);
    const hasColumns = useSelector((s: any) => s.smartSend.columns.length > 0);
    const descriptor = getChannelDescriptor(selectedChannel);
    const cardRefs = useRef<Array<HTMLDivElement | null>>([]);

    const canSend = (it: any) => !!it[descriptor.identityFlag];

    // Fetch exactly once per mount, tracked by a ref rather than inferred from store state.
    // Two reasons this is not `!list && listStatus === '...'`:
    //  1. Any store-derived condition re-satisfies itself after a failure (list stays null), which
    //     looped the endpoint forever and made the retry button below unreachable.
    //  2. `list` may already hold a SEARCHED or small-page result left by the DataSources page,
    //     and gating on `!list` would silently show that filtered subset here instead of the
    //     full PageSize:100 list this screen needs.
    // The retry button dispatches directly, so it still works with the ref already set.
    // PageSize is 100, not the 200 this used to ask for: DataSourcesController.cs:135 clamps with
    // Math.Min(pageSize <= 0 ? 6 : pageSize, 100), so 200 was never honoured. Asking for the real
    // ceiling keeps the request honest and makes list.pageSize/list.total mean what they say —
    // the caption below is what tells the user when there is more than one page of sources.
    const didFetch = useRef(false);
    useEffect(() => {
        if (didFetch.current) return;
        didFetch.current = true;
        dispatch(getDataSources({ PageIndex: 1, PageSize: SOURCE_PAGE_SIZE, SearchTerm: '' }));
    }, [dispatch]);

    const ready = useMemo(
        () => ((list && list.items) ? list.items : []).filter((it: any) => it.Status === eDataSourceStatus.READY),
        [list],
    );
    const sendableIdx = useMemo(
        () => ready.reduce((acc: number[], it: any, i: number) => (canSend(it) ? [...acc, i] : acc), []),
        [ready, descriptor.identityFlag],
    );

    // Preselect (entry A ?dataSourceId): load the source's columns once, if it is sendable.
    // NaN-guarded — a garbage ?dataSourceId never dispatches (R2 note).
    // The latch records WHICH id we already loaded, and is set only when we actually dispatch.
    // Two failure modes it has to avoid at once:
    //  - latching on "the list arrived" loses the preselect entirely when that first list is a
    //    stale/filtered one left by the DataSources page that does not contain the target: the
    //    fresh PageSize:100 list then arrives to an already-burnt latch and nothing ever loads.
    //    Not finding the target is therefore NOT a latch — we simply wait for the next list.
    //  - not latching at all re-fires on a manual pick, because `pick` sets dataSourceId and
    //    clears columns via selectSource, flipping both deps; `pick` claims the id itself.
    // `idNum <= 0` also rejects `?dataSourceId=` (empty), which Number() turns into 0.
    const preselectedFor = useRef<number | null>(null);
    useEffect(() => {
        const idNum = Number(dataSourceId);
        if (!list || dataSourceId == null || Number.isNaN(idNum) || idNum <= 0 || hasColumns) return;
        if (preselectedFor.current === idNum) return;
        const pre = ready.find((it: any) => it.DataSourceID === idNum && canSend(it));
        if (!pre) return;
        preselectedFor.current = idNum;
        dispatch(loadSourceColumns(idNum));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [list, dataSourceId, hasColumns]);

    // Entry A can arrive with a ?dataSourceId that is NOT the source this campaign is already
    // mapped to. PRODUCT DECISION: the SAVED MAPPING WINS and is never overwritten automatically
    // — that is exactly what the `|| hasColumns` bail in the effect above does, since getMapping
    // has already filled columns for the mapped source. But losing silently is the bug: the
    // screen would simply ignore the source the user pressed "Smart Send" from, with no clue why.
    // So make the conflict visible and OFFER the switch; never take it.
    // All three conditions must hold:
    //  • a positive incoming id is stored (SmartSendScreen already rejects <= 0 / NaN; re-checked
    //    here because this component reads the store, not the URL),
    //  • it resolves to a READY, sendable-on-this-channel source in this list — an unknown,
    //    deleted or view-only id gets NO banner, because there is nothing we could switch to,
    //  • the campaign is genuinely mapped to a DIFFERENT source. `dataSource` is null both for an
    //    unmapped campaign (nothing to protect — the preselect above just loads the incoming one)
    //    and for the whole window between selectSource and loadSourceColumns.fulfilled, so
    //    requiring a non-null mapped id is also what stops the banner flashing back for a frame
    //    right after the user accepts the switch.
    const mappedSourceId = useSelector((s: any) => s.smartSend.dataSource?.DataSourceID ?? null);
    const incoming = useMemo(() => {
        const idNum = Number(dataSourceId);
        if (dataSourceId == null || Number.isNaN(idNum) || idNum <= 0) return null;
        if (mappedSourceId == null || mappedSourceId === idNum) return null;
        return ready.find((it: any) => it.DataSourceID === idNum && canSend(it)) ?? null;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dataSourceId, mappedSourceId, ready, descriptor.identityFlag]);

    // Switching source is DESTRUCTIVE and un-undoable from this screen: selectSource
    // (smartSendSlice.ts:287-302) drops tokenMap, supervisorColumnId, gapColumnId, sortColumnId,
    // lockedVersionId, columns, sampleValues and isMapped — up to 20 hand-made field mappings —
    // and nothing on this screen can bring them back. The banner button therefore only OPENS this
    // confirm, and the confirm is the ONLY route from the banner into `pick`. (A direct card
    // click still calls `pick` unguarded — that one is the user explicitly choosing a different
    // source, not a button sitting under reassuring text.) No auto-focus / ok-by-default
    // shortcut: the destructive button is a deliberate second click.
    const [confirmOpen, setConfirmOpen] = useState(false);

    const pick = (it: any) => {
        if (!canSend(it) || it.DataSourceID === currentSourceId) return;
        // Claim the id before dispatching so the preselect effect above — which is about to
        // re-run, since selectSource changes dataSourceId and clears columns — sees it as
        // already handled and does not fire a duplicate load.
        preselectedFor.current = it.DataSourceID;
        dispatch(selectSource(it.DataSourceID));
        dispatch(loadSourceColumns(it.DataSourceID));
    };

    const moveFocus = (fromIdx: number, dir: 1 | -1) => {
        if (!sendableIdx.length) return;
        const pos = sendableIdx.indexOf(fromIdx);
        const next = sendableIdx[(pos + dir + sendableIdx.length) % sendableIdx.length];
        cardRefs.current[next]?.focus();
    };
    const onKeyDown = (e: React.KeyboardEvent, idx: number, it: any) => {
        if (!canSend(it)) return;
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(it); }
        else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') { e.preventDefault(); moveFocus(idx, 1); }
        else if (e.key === 'ArrowUp' || e.key === 'ArrowRight') { e.preventDefault(); moveFocus(idx, -1); }
    };

    // Spin ONLY while the fetch is genuinely outstanding ('idle' before the post-paint dispatch,
    // then 'loading') so the empty "no sources" message never flashes before the first fetch
    // (§ה loading-state mandate). Anything else with no list is terminal and falls through to the
    // retry block below — including StatusCode!=200 responses, which this API returns inside an
    // HTTP 200 envelope, so the thunk resolves as fulfilled and listStatus becomes 'succeeded'
    // with list still null. Keying the spinner on `!== 'failed'` would hang it there forever.
    // `!didFetch.current` covers the very first render: the fetch is dispatched in a post-paint
    // effect, so a store left in a terminal state by another screen would otherwise flash the
    // error block for one frame before our own request starts.
    if (!list && (!didFetch.current || listStatus === 'idle' || listStatus === 'loading')) {
        return (
            <Box style={{ marginTop: 24 }}>
                <Typography variant="subtitle1" style={{ fontWeight: 600 }}>{t('DataSources.send.source.title')}</Typography>
                <Box className={classes.state}><CircularProgress size={20} /></Box>
            </Box>
        );
    }
    // Terminal with no list: a rejected request ('failed') OR a resolved-but-empty envelope
    // ('succeeded' with Data null — the dominant server-error path here). Both get the retry.
    if (!list) {
        return (
            <Box style={{ marginTop: 24 }}>
                <Typography variant="subtitle1" style={{ fontWeight: 600 }}>{t('DataSources.send.source.title')}</Typography>
                <Box className={classes.state}>
                    <Typography color="error">{t('DataSources.send.source.loadError')}</Typography>
                    <Button size="small" startIcon={<Refresh />} onClick={() => dispatch(getDataSources({ PageIndex: 1, PageSize: SOURCE_PAGE_SIZE, SearchTerm: '' }))}>
                        {t('DataSources.retry')}
                    </Button>
                </Box>
            </Box>
        );
    }

    // Roving tabindex: exactly one sendable card is tabbable (the selected one, else the first).
    const selectedIdx = ready.findIndex((it: any) => canSend(it) && it.DataSourceID === currentSourceId);
    const rovingTarget = selectedIdx >= 0 ? selectedIdx : (sendableIdx.length ? sendableIdx[0] : -1);

    // The server clamps PageSize to 100 (DataSourcesController.cs:135) and echoes back the TRUE
    // total, so an account with more than 100 sources is served a truncated list. This screen has
    // no paging and no search (both out of scope), so sources 101+ are unreachable here — the one
    // thing we must not do is let them vanish silently. Counted off `list.items`, the raw fetched
    // page, not `ready`: this caption is about what the server withheld, not about what the READY
    // /sendable filters removed from what it sent.
    // `list` is shared with the DataSources page, which fetches 6 rows at a time and can leave a
    // searched/small page in the store. Until OUR request lands, `total` and `items` are that
    // screen's numbers and would read as truncation on an account that has none. The echoed
    // pageSize identifies whose response this is: that screen asks for 6, this one for 100.
    const fetched = ((list && list.items) ? list.items : []).length;
    const isOurPage = (list.pageSize ?? 0) >= SOURCE_PAGE_SIZE;
    const truncated = isOurPage && list.total > fetched;

    return (
        <Box style={{ marginTop: 24 }}>
            <Typography variant="subtitle1" style={{ fontWeight: 600 }}>{t('DataSources.send.source.title')}</Typography>
            {incoming && (
                <Box style={{ marginTop: 8 }}>
                    <InlineBanner
                        severity="info"
                        role="status"
                        title={t('DataSources.send.source.incomingTitle')}
                        body={t('DataSources.send.source.incomingBody', { name: incoming.Name })}
                        action={(
                            /* Opens the confirm — it does NOT switch. The banner explains what is
                               about to be lost; the dialog is where the user accepts it. */
                            <Button size="small" variant="outlined" color="primary" onClick={() => setConfirmOpen(true)}>
                                {t('DataSources.send.source.incomingSwitch')}
                            </Button>
                        )}
                    />
                    {/* Rendered inside the `incoming &&` block on purpose: if the conflict resolves
                        for any reason (the switch lands, the mapping reloads, the list refreshes)
                        the dialog goes with it and cannot act on a stale source. */}
                    <Dialog
                        open={confirmOpen}
                        onClose={() => setConfirmOpen(false)}
                        maxWidth="sm"
                        fullWidth
                        aria-labelledby="smartsend-switch-confirm-title"
                        aria-describedby="smartsend-switch-confirm-body"
                    >
                        <Box className={classes.dlgHead}>
                            <Typography variant="h6" id="smartsend-switch-confirm-title">
                                {t('DataSources.send.source.incomingConfirmTitle')}
                            </Typography>
                            <IconButton size="small" onClick={() => setConfirmOpen(false)} aria-label={t('DataSources.send.close')}>
                                <Close />
                            </IconButton>
                        </Box>
                        <Box className={classes.dlgBody}>
                            <Typography variant="body2" id="smartsend-switch-confirm-body">
                                {t('DataSources.send.source.incomingConfirmBody', { name: incoming.Name })}
                            </Typography>
                        </Box>
                        <Box className={classes.dlgFoot}>
                            {/* The ONLY caller of `pick` for the banner path. It runs the exact same
                                selectSource + loadSourceColumns a manual card click does — including
                                claiming the preselect latch, which stops the effect above from firing
                                a duplicate load when dataSourceId/columns flip. Close first so the
                                dialog never lingers over the re-rendering picker. */}
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => { setConfirmOpen(false); pick(incoming); }}
                            >
                                {t('DataSources.send.source.incomingSwitch')}
                            </Button>
                            <Button onClick={() => setConfirmOpen(false)}>{t('DataSources.send.cancel')}</Button>
                        </Box>
                    </Dialog>
                </Box>
            )}
            {!ready.length ? (
                <Typography variant="body2" color="textSecondary" style={{ marginTop: 8 }}>
                    {t('DataSources.send.source.empty')}
                </Typography>
            ) : (
                <Box className={classes.grid} role="radiogroup" aria-label={t('DataSources.send.source.title')}>
                    {ready.map((it: any, idx: number) => {
                        const sendable = canSend(it);
                        // `sendable &&` matters: a stale/hand-typed ?dataSourceId pointing at a
                        // view-only or wrong-channel source would otherwise paint that card as
                        // checked (border + CheckCircle + aria-checked) while `pick` refuses it —
                        // a checked radio the user cannot uncheck, on a screen that then shows
                        // neither columns nor an error.
                        const isSelected = sendable && it.DataSourceID === currentSourceId;
                        const count = it[descriptor.resolvedCountField] ?? 0;
                        const zeroResolved = sendable && count === 0;
                        const blockedKey = it.HasCellIdentity ? 'blockedNoEmail' : 'viewOnly'; // only used when !sendable
                        const blockedText = t(`DataSources.send.source.${blockedKey}`);
                        const descId = `smartsend-src-desc-${it.DataSourceID}`;

                        const card = (
                            <div
                                ref={(el) => { cardRefs.current[idx] = el; }}
                                className={clsx(classes.card, isSelected && classes.selected, !sendable && classes.disabled)}
                                role="radio"
                                aria-checked={isSelected}
                                aria-disabled={sendable ? undefined : true}
                                aria-label={it.Name}
                                aria-describedby={!sendable ? descId : undefined}
                                tabIndex={sendable ? (idx === rovingTarget ? 0 : -1) : -1}
                                onMouseDown={sendable ? undefined : (e) => e.preventDefault()}
                                onClick={() => pick(it)}
                                onKeyDown={(e) => onKeyDown(e, idx, it)}
                            >
                                {isSelected && <CheckCircle className={classes.check} color="primary" fontSize="small" />}
                                <Typography className={classes.name} title={it.Name}>
                                    <Storage fontSize="small" />{it.Name}
                                </Typography>
                                {it.Description && (
                                    <Typography variant="body2" color="textSecondary" className={classes.desc}>{it.Description}</Typography>
                                )}
                                <Box className={classes.meta}>
                                    {sendable
                                        ? <Chip size="small" label={t('DataSources.send.source.recipients', { count })} />
                                        : <Chip size="small" label={blockedText} />}
                                    {zeroResolved && (
                                        <Typography variant="caption" className={classes.zero}>{t('DataSources.send.source.zeroResolved')}</Typography>
                                    )}
                                </Box>
                                {!sendable && <span id={descId} className={classes.srOnly}>{blockedText}</span>}
                            </div>
                        );

                        return sendable
                            ? <React.Fragment key={it.DataSourceID}>{card}</React.Fragment>
                            : (
                                <Tooltip key={it.DataSourceID} title={blockedText}>
                                    <span style={{ display: 'inline-flex' }}>{card}</span>
                                </Tooltip>
                            );
                    })}
                </Box>
            )}
            {/* Rendered outside the ready/empty branches on purpose: "no sources are ready to send"
                is a different and much more confusing message when the server only sent us the
                first 100 of many. */}
            {truncated && (
                <Typography variant="caption" color="textSecondary" display="block" style={{ marginTop: 8 }}>
                    {t('DataSources.send.source.truncated', { shown: fetched, total: list.total })}
                </Typography>
            )}
        </Box>
    );
};

export default SourcePicker;
