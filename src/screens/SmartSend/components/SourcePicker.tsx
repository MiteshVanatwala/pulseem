import React, { useEffect, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Typography, Chip, Tooltip, CircularProgress, Button } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { CheckCircle, Storage, Refresh } from '@material-ui/icons';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { getChannelDescriptor } from '../../../Models/DataSources/SmartSend';
import { eDataSourceStatus } from '../../../Models/DataSources/DataSource';
import { selectSource, loadSourceColumns } from '../../../redux/reducers/smartSendSlice';
import { getDataSources } from '../../../redux/reducers/dataSourcesSlice';

// §11.1/§13 · pick a READY, sendable source (GetMany). "Sendable" for the selected channel
// is read via the descriptor's identity-flag NAME (never a hardcoded field). READY sources
// that are NOT sendable on this channel (datalake with no identity → "view only"; a
// cell-only source on the email channel → "no email column") are shown DISABLED with a
// badge + explanation (§7.2/§16). A sendable source with 0 resolved rows is selectable but
// flagged. Source data comes from the DataSources module (getDataSources, USE_DS_MOCK).
// a11y mirrors ChannelSelector: radiogroup, roving tabindex, arrows, Enter/Space; disabled
// cards carry aria-describedby → sr-only reason and don't steal focus.

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
    //     full PageSize:200 list this screen needs.
    // The retry button dispatches directly, so it still works with the ref already set.
    const didFetch = useRef(false);
    useEffect(() => {
        if (didFetch.current) return;
        didFetch.current = true;
        dispatch(getDataSources({ PageIndex: 1, PageSize: 200, SearchTerm: '' }));
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
    //    fresh PageSize:200 list then arrives to an already-burnt latch and nothing ever loads.
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
                    <Button size="small" startIcon={<Refresh />} onClick={() => dispatch(getDataSources({ PageIndex: 1, PageSize: 200, SearchTerm: '' }))}>
                        {t('DataSources.retry')}
                    </Button>
                </Box>
            </Box>
        );
    }

    // Roving tabindex: exactly one sendable card is tabbable (the selected one, else the first).
    const selectedIdx = ready.findIndex((it: any) => canSend(it) && it.DataSourceID === currentSourceId);
    const rovingTarget = selectedIdx >= 0 ? selectedIdx : (sendableIdx.length ? sendableIdx[0] : -1);

    return (
        <Box style={{ marginTop: 24 }}>
            <Typography variant="subtitle1" style={{ fontWeight: 600 }}>{t('DataSources.send.source.title')}</Typography>
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
        </Box>
    );
};

export default SourcePicker;
