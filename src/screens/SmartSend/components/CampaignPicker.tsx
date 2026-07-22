import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Box, Typography, Chip, Tooltip, CircularProgress, Button, TextField, InputAdornment,
    FormControlLabel, Switch
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { CheckCircle, Search, Refresh } from '@material-ui/icons';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import moment from 'moment';
import { eCampaignStatus } from '../../../Models/Enums/Campaign';
import { DateFormats } from '../../../helpers/Constants';
import { getNewslatterParentChildData } from '../../../redux/reducers/newsletterSlice';

// §7.3 · pick the campaign to smart-send. Rows come from the campaigns-management endpoint
// (email/GetEmailCampaignsManagement → MainList) which does NO filtering, paging, search or
// sorting server-side — so search and sort are client-side over the in-memory list.
// Not-selectable campaigns stay VISIBLE but disabled, each carrying its own reason: hiding
// them turns "why can't I send this?" into "where did my campaign go?", which is worse.
// a11y mirrors SourcePicker/ChannelSelector: radiogroup, roving tabindex, arrows, Enter/Space;
// disabled rows carry aria-describedby → sr-only reason and don't steal focus. The one deliberate
// difference is the arrow map — this list is a vertical column, not SourcePicker's RTL grid (see
// onKeyDown).

// Row shape of MainList (newsletterSlice.js:243/345). Only the fields this screen reads are
// declared — the slice stores the raw server rows untouched, so this is not exhaustive.
export interface CampaignRow {
    CampaignID: number;
    Name: string;
    Status: number;
    SendDate: string | null;
    UpdatedDate: string | null;
    SentCount: number;
    IsNewEditor: boolean;
}

// The same labels the campaigns-management screen uses (NewsletterManagment.renderStatusCell),
// so the picker and the list can never disagree about what a status is called.
const STATUS_KEY: { [k: number]: string } = {
    [eCampaignStatus.Created]: 'common.Created',
    [eCampaignStatus.Sending]: 'common.Sending',
    [eCampaignStatus.Stopped]: 'campaigns.Stopped',
    [eCampaignStatus.Finished]: 'common.Sent',
    [eCampaignStatus.Canceled]: 'campaigns.Canceled',
    [eCampaignStatus.OptinPending]: 'campaigns.Optin',
    [eCampaignStatus.ApprovePending]: 'campaigns.Approve',
};

// The campaigns-management screen parses these timestamps with this same mask. '.FFF' is a .NET
// token moment does not know, so a value the mask rejects falls back to moment's own detection
// rather than sorting the row on NaN (which would scramble the whole list order).
const SERVER_DATE_FORMAT = 'YYYY-MM-DD HH:mm:ss.FFF';
const parseServerDate = (raw?: string | null) => {
    if (!raw) return null;
    const masked = moment(raw, SERVER_DATE_FORMAT);
    if (masked.isValid()) return masked;
    const loose = moment(raw);
    return loose.isValid() ? loose : null;
};

// §2 · sendable from a data source ⇔ still a draft AND built in the new (BEE) editor. The old
// editor has no ##token## syntax to map, and anything past Created is already out the door.
const isSelectable = (row: CampaignRow) =>
    row.Status === eCampaignStatus.Created && row.IsNewEditor === true;

// Sort key (§2): SendDate else UpdatedDate, descending. Truthiness and NOT `??` — ground truth
// NewsletterManagment.js:173-175 branches on `SendDate ? ... : UpdatedDate`, because the server
// sends `""` (not null) for "never scheduled". `??` would keep that `""`, parseServerDate rejects
// it, and the row would sort last on 0 despite having a perfectly good UpdatedDate.
const rowTime = (row: CampaignRow) => parseServerDate(row.SendDate || row.UpdatedDate)?.valueOf() ?? 0;

const useStyles = makeStyles((theme) => ({
    wrap: { marginTop: theme.spacing(1) },
    toolbar: {
        display: 'flex', alignItems: 'center', flexWrap: 'wrap',
        gap: theme.spacing(2), margin: `${theme.spacing(1)}px 0`,
    },
    search: { minWidth: 280 },
    list: {
        display: 'flex', flexDirection: 'column', gap: theme.spacing(1),
        // Cap the list instead of pushing the primary action below the fold — the account-wide
        // list can run to hundreds of rows and the CTA must stay reachable without scrolling past.
        maxHeight: 420, overflowY: 'auto', paddingInlineEnd: theme.spacing(0.5),
    },
    row: {
        position: 'relative', boxSizing: 'border-box', width: '100%', padding: theme.spacing(1.5),
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
    head: { display: 'flex', alignItems: 'center', gap: theme.spacing(1), flexWrap: 'wrap', paddingInlineEnd: theme.spacing(3) },
    name: { fontWeight: 600, overflowWrap: 'anywhere' },
    meta: { marginTop: theme.spacing(0.5), display: 'flex', alignItems: 'center', gap: theme.spacing(1.5), flexWrap: 'wrap' },
    check: { position: 'absolute', top: 8, insetInlineEnd: 8 },
    state: { display: 'flex', alignItems: 'center', gap: theme.spacing(1), marginTop: theme.spacing(2) },
    empty: { textAlign: 'center', padding: '32px 16px', color: '#5b6b7b' },
    emptyActions: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: theme.spacing(1), flexWrap: 'wrap' },
    hiddenNote: { display: 'flex', alignItems: 'center', gap: theme.spacing(1), flexWrap: 'wrap', marginTop: theme.spacing(1) },
    // MUI v4 Tooltip cannot attach to a disabled/non-interactive target — wrap it in a <span>.
    tooltipSpan: { display: 'block', width: '100%' },
    srOnly: {
        position: 'absolute', width: 1, height: 1, padding: 0, margin: -1,
        overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap', border: 0,
    },
}));

interface Props {
    value: number | null;                       // selected CampaignID
    onChange: (campaign: CampaignRow) => void;
}

const CampaignPicker: React.FC<Props> = ({ value, onChange }) => {
    const classes = useStyles();
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const campaigns: CampaignRow[] = useSelector((s: any) => s.newsletter.newslettersParentCampaigns);
    const [status, setStatus] = useState<'idle' | 'loading' | 'succeeded' | 'failed'>('idle');
    const [search, setSearch] = useState('');
    const [onlySendable, setOnlySendable] = useState(true);
    const rowRefs = useRef<Array<HTMLDivElement | null>>([]);

    // newsletterSlice carries NO loading flag (§2) — the request state has to live here.
    const load = async () => {
        setStatus('loading');
        let ok = false;
        try {
            // Zero arguments: the endpoint takes no request object (the server does no filtering).
            const res: any = await dispatch(getNewslatterParentChildData());
            // The thunk resolves to the fulfilled/rejected ACTION and its reducer has already
            // written MainList into the store, so all we need from it is which of the two it was
            // (house precedent: ChatTemplateModal.tsx:296). Tested POSITIVELY — anything that is
            // not an explicit '/fulfilled' lands on the retry block rather than on a silent "no
            // campaigns". This endpoint is NOT a PulseemResponse envelope: it returns
            // { MainList, ChildList } directly, so there is no StatusCode to branch on.
            ok = typeof res?.type === 'string' && res.type.endsWith('/fulfilled');
        } catch (err) {
            // Surface it: a 500 from GetEmailCampaignsManagement is otherwise completely invisible
            // to support — the user just sees the generic retry block with no trace anywhere.
            // eslint-disable-next-line no-console
            console.error('SmartSend campaign list failed', err);
            // `await dispatch(thunk)` is NOT safe on this endpoint. The fulfilled reducer
            // (newsletterSlice.js:346) does `payload.MainList === null ? [] : payload.MainList`
            // and then `.filter(...)`: a 200 body that OMITS MainList (or is not an object at
            // all) leaves `undefined` and the filter throws inside the immer producer, which RTK
            // rethrows straight out of `dispatch`. Uncaught, that rejects this promise before
            // `setStatus` ever runs — the spinner is then permanent, with no retry to click.
            ok = false;
        } finally {
            // Terminal either way: the component must never be left in 'loading'.
            setStatus(ok ? 'succeeded' : 'failed');
        }
    };

    // Fetch exactly once per mount, tracked by a ref and never by a store-derived condition:
    // any such condition (`!campaigns.length`) re-satisfies itself after a failure, which loops
    // the endpoint forever and makes the retry button below unreachable — the exact bug fixed in
    // SourcePicker. Retry calls `load` directly, so it still works with the ref already burnt.
    const didFetch = useRef(false);
    useEffect(() => {
        if (didFetch.current) return;
        didFetch.current = true;
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const matches = useMemo(() => {
        const term = search.trim().toLowerCase();
        // Filter as the user types: the server cannot search and the whole account list is already
        // in memory, so a round trip would buy nothing but latency. `.slice()` is mandatory — the
        // store array is frozen by immer and sorting it in place would throw in development.
        const list = term
            ? campaigns.filter((row) => String(row.Name ?? '').toLowerCase().indexOf(term) > -1)
            : campaigns.slice();
        return list.sort((a, b) => rowTime(b) - rowTime(a));
    }, [campaigns, search]);

    const visible = useMemo(
        () => (onlySendable ? matches.filter(isSelectable) : matches),
        [matches, onlySendable],
    );
    const hiddenCount = matches.length - visible.length;
    const selectableIdx = useMemo(
        () => visible.reduce<number[]>((acc, row, i) => (isSelectable(row) ? [...acc, i] : acc), []),
        [visible],
    );

    const pick = (row: CampaignRow) => { if (isSelectable(row)) onChange(row); };

    const moveFocus = (fromIdx: number, dir: 1 | -1) => {
        if (!selectableIdx.length) return;
        const pos = selectableIdx.indexOf(fromIdx);
        const next = selectableIdx[(pos + dir + selectableIdx.length) % selectableIdx.length];
        rowRefs.current[next]?.focus();
    };
    const onKeyDown = (e: React.KeyboardEvent, idx: number, row: CampaignRow) => {
        if (!isSelectable(row)) return;
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(row); }
        // This radiogroup is a VERTICAL column, unlike SourcePicker's horizontal RTL grid, so it
        // does not inherit that file's map: there, Left is "forward" because the grid flows
        // right-to-left. Here the reading order is top-to-bottom and Down/Right both mean next,
        // Up/Left both mean previous (WAI-ARIA radiogroup, vertical orientation).
        else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); moveFocus(idx, 1); }
        else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); moveFocus(idx, -1); }
    };

    // No section heading of its own: the screen renders `picker.step2` ("Step 2 — Select a
    // campaign") directly above this component, and a second title would just repeat it.

    // Spin ONLY while the fetch is genuinely outstanding, so the "no campaigns" message never
    // flashes before the first request resolves. `!didFetch.current` covers the very first render
    // (the fetch starts in a post-paint effect). A list left in the store by the campaigns screen
    // is the SAME account-wide, unfiltered list this endpoint returns — safe to paint immediately
    // while the refresh lands, so only a genuinely empty store spins.
    if (!campaigns.length && (!didFetch.current || status === 'idle' || status === 'loading')) {
        return (
            <Box className={classes.wrap}>
                <Box className={classes.state}><CircularProgress size={20} /></Box>
            </Box>
        );
    }
    if (!campaigns.length && status === 'failed') {
        return (
            <Box className={classes.wrap}>
                <Box className={classes.state}>
                    <Typography color="error">{t('DataSources.send.picker.loadError')}</Typography>
                    <Button size="small" startIcon={<Refresh />} onClick={load}>{t('DataSources.retry')}</Button>
                </Box>
            </Box>
        );
    }

    // Roving tabindex: exactly one selectable row is tabbable (the selected one, else the first).
    const selectedIdx = visible.findIndex((row) => isSelectable(row) && row.CampaignID === value);
    const rovingTarget = selectedIdx >= 0 ? selectedIdx : (selectableIdx.length ? selectableIdx[0] : -1);

    const renderRow = (row: CampaignRow, idx: number) => {
        const selectable = isSelectable(row);
        // Why this row cannot be picked, shown ON the row and not only behind a hover tooltip:
        // "my campaign is greyed out and I don't know why" is the same support call as "my
        // campaign is missing". Status is checked first — an already-sent old-editor campaign is
        // blocked by its status, which is the more useful of the two reasons.
        const blockedText = selectable ? '' : t(row.Status !== eCampaignStatus.Created
            ? 'DataSources.send.picker.blocked.notSendable'
            : 'DataSources.send.picker.blocked.oldEditor');
        const isSelected = selectable && row.CampaignID === value;
        const statusKey = STATUS_KEY[row.Status];
        // Shown: UpdatedDate — the only date the single "Updated {{date}}" label can describe
        // truthfully for every row. Sorted: SendDate else UpdatedDate (§2). The two differ only on
        // already-sent rows, which are disabled here anyway. Truthiness, not `??`, for the same
        // reason as rowTime: `""` is how this API says "absent", and `??` would keep it and drop
        // the label entirely on rows that do have the other date.
        const when = parseServerDate(row.UpdatedDate || row.SendDate);
        const descId = `smartsend-campaign-desc-${row.CampaignID}`;

        const card = (
            <div
                ref={(el) => { rowRefs.current[idx] = el; }}
                className={clsx(classes.row, isSelected && classes.selected, !selectable && classes.disabled)}
                role="radio"
                aria-checked={isSelected}
                aria-disabled={selectable ? undefined : true}
                // The id rides in the accessible name too: two campaigns may share a name, and the
                // id is the only thing that tells a screen-reader user which row is which.
                aria-label={`${row.Name} #${row.CampaignID}`}
                aria-describedby={!selectable ? descId : undefined}
                tabIndex={selectable ? (idx === rovingTarget ? 0 : -1) : -1}
                onMouseDown={selectable ? undefined : (e) => e.preventDefault()}
                onClick={() => pick(row)}
                onKeyDown={(e) => onKeyDown(e, idx, row)}
            >
                {isSelected && <CheckCircle className={classes.check} color="primary" fontSize="small" />}
                <Box className={classes.head}>
                    <Typography className={classes.name} title={row.Name}>{row.Name}</Typography>
                    {statusKey && <Chip size="small" label={t(statusKey)} />}
                </Box>
                <Box className={classes.meta}>
                    {/* direction:ltr — a bare "#123" would render mirrored inside the RTL layout. */}
                    <Typography variant="caption" color="textSecondary" style={{ direction: 'ltr' }}>
                        {`#${row.CampaignID}`}
                    </Typography>
                    {/* No recipient count here on purpose: selectable ⇔ Status === Created ⇔ never
                        sent ⇔ SentCount is always 0, so the line only ever read "0 recipients".
                        Worse, it is the wrong number to show at all — a smart send draws its
                        recipients from the data source, not from the campaign. */}
                    {when && (
                        <Typography variant="caption" color="textSecondary">
                            {t('DataSources.send.picker.updated', { date: when.format(DateFormats.DATE_TIME_24) })}
                        </Typography>
                    )}
                    {!selectable && <Chip size="small" label={blockedText} />}
                </Box>
                {!selectable && <span id={descId} className={classes.srOnly}>{blockedText}</span>}
            </div>
        );

        return selectable
            ? <React.Fragment key={row.CampaignID}>{card}</React.Fragment>
            : (
                <Tooltip key={row.CampaignID} title={blockedText}>
                    <span className={classes.tooltipSpan}>{card}</span>
                </Tooltip>
            );
    };

    const renderList = () => {
        // Nothing in the store at all. This is NOT proof of an empty account: the reducer maps
        // `MainList: null` to `[]` on a /fulfilled action, so a server-side failure arrives here
        // wearing exactly the same clothes as a brand-new account with no campaigns. We cannot
        // tell them apart, so we must not strand the first case — the empty state carries the same
        // Retry the 'failed' block above does (mirrors SourcePicker.tsx:151-165, where the
        // resolved-but-empty envelope is likewise treated as retryable).
        if (!campaigns.length) {
            return (
                <Box className={classes.empty}>
                    <Typography variant="body2">{t('DataSources.send.picker.empty')}</Typography>
                    <Box className={classes.emptyActions}>
                        <Button size="small" color="primary" startIcon={<Refresh />} onClick={load}>
                            {t('DataSources.retry')}
                        </Button>
                    </Box>
                </Box>
            );
        }
        if (!visible.length) {
            // Two dead ends that look identical on screen, so they must not share one message.
            // `hiddenCount` is `matches.length - visible.length`, and `visible` is empty here, so
            // it is exactly "how many rows survived the search and were then eaten by the toggle":
            //  · > 0 → the TOGGLE emptied the list. An account whose campaigns are all sent or all
            //    old-editor lands here on first paint (the toggle defaults on) and used to be told
            //    "no campaigns match your search" over an EMPTY search box, next to a Clear-search
            //    button that does nothing. Say what is true and offer the escape that works.
            //  · 0 → the SEARCH emptied it, and clearing the text is the escape.
            // Both escapes render together when both apply (searched, and everything the search
            // found is unsendable).
            const hiddenByToggle = hiddenCount > 0;
            return (
                <Box className={classes.empty}>
                    <Typography variant="body2">
                        {t(hiddenByToggle
                            ? 'DataSources.send.picker.noneSendable'
                            : 'DataSources.send.picker.noResults')}
                    </Typography>
                    <Box className={classes.emptyActions}>
                        {hiddenByToggle && (
                            <Button size="small" color="primary" onClick={() => setOnlySendable(false)}>
                                {t('DataSources.send.picker.showAll')}
                            </Button>
                        )}
                        {!!search && (
                            <Button size="small" color="primary" onClick={() => setSearch('')}>
                                {t('DataSources.send.picker.clearSearch')}
                            </Button>
                        )}
                    </Box>
                </Box>
            );
        }
        return (
            <>
                <Box className={classes.list} role="radiogroup" aria-orientation="vertical" aria-label={t('DataSources.send.picker.selectAria')}>
                    {visible.map(renderRow)}
                </Box>
                {/* Rows exist that the toggle is holding back — one click reveals them, disabled
                    and labelled with their reason, instead of leaving the user to wonder. Same
                    key as the empty-state button above: it is the same action on the same toggle,
                    and labelling one button two ways is its own small bug. */}
                {hiddenCount > 0 && (
                    <Box className={classes.hiddenNote}>
                        <Button size="small" color="primary" onClick={() => setOnlySendable(false)}>
                            {t('DataSources.send.picker.showAll')}
                        </Button>
                    </Box>
                )}
            </>
        );
    };

    return (
        <Box className={classes.wrap}>
            <Box className={classes.toolbar}>
                {/* `picker.searchPlaceholder` ("Search campaigns by name"), NOT the similarly named
                    `mapping.searchPlaceholder` ("Search fields") — that one belongs to the field
                    mapping table on the next step and searches something else entirely. */}
                <TextField
                    placeholder={t('DataSources.send.picker.searchPlaceholder')}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }}
                    inputProps={{ 'aria-label': t('DataSources.send.picker.searchPlaceholder') }}
                    size="small"
                    className={classes.search}
                />
                <FormControlLabel
                    control={<Switch color="primary" checked={onlySendable} onChange={(e) => setOnlySendable(e.target.checked)} />}
                    label={t('DataSources.send.picker.onlySendable')}
                />
            </Box>
            {renderList()}
        </Box>
    );
};

export default CampaignPicker;
