import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Box, Typography, Chip, Tooltip, CircularProgress, Button, TextField, InputAdornment,
    FormControlLabel, Switch
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { CheckCircle, Search, Refresh, TextFields, Close } from '@material-ui/icons';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import moment from 'moment';
import { eCampaignStatus } from '../../../Models/Enums/Campaign';
import { DateFormats } from '../../../helpers/Constants';
import { getNewslatterParentChildData } from '../../../redux/reducers/newsletterSlice';
import { getCampaignTokens } from '../../../redux/reducers/smartSendSlice';

// §7.3 · pick the campaign to smart-send. Rows come from the campaigns-management endpoint
// (email/GetEmailCampaignsManagement → MainList) which does NO filtering, paging, search or
// sorting server-side — so search and sort are client-side over the in-memory list.
// Not-selectable campaigns stay VISIBLE but disabled, each carrying its own reason: hiding
// them turns "why can't I send this?" into "where did my campaign go?", which is worse.
// a11y mirrors SourcePicker/ChannelSelector: radiogroup, roving tabindex, arrows, Enter/Space;
// disabled rows carry aria-describedby → sr-only reason and don't steal focus. Like SourcePicker
// this is a wrapping RTL grid, so the arrow map is that file's grid map, not a column map (see
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

// Cap the rendered grid so the primary action stays above the fold on a long account-wide list —
// a "show more" control reveals the rest on demand. Applied AFTER the onlySendable filter, so it
// counts only the campaigns actually on offer.
// Two full rows of four. Keeps the "show more" control — and therefore the Continue button —
// above the fold on the account-wide list, instead of pushing them down a third row.
const CAP = 8;

const useStyles = makeStyles((theme) => ({
    wrap: { marginTop: theme.spacing(1) },
    toolbar: {
        display: 'flex', alignItems: 'center', flexWrap: 'wrap',
        gap: theme.spacing(2), margin: `${theme.spacing(1)}px 0`,
    },
    // OUTLINED, deliberately. MUI v4's default TextField variant is `standard`
    // (TextField.js:127), which draws no box — only a bottom underline — and that underline is
    // itself killed app-wide by an unscoped global rule in
    // components/Notifications/Preview/preview.styles.css:1-4
    // (`.MuiInput-underline:before,:after { border-bottom: none !important }`), which reaches
    // every screen because App.js:8 statically imports MmsManagment.js → Preview.js:6 and there
    // is no React.lazy anywhere in App.js. A `standard` field therefore renders with ZERO chrome
    // and does not read as an input at all. `outlined` uses .MuiOutlinedInput-notchedOutline,
    // which that rule does not touch, so this sidesteps the global CSS instead of fighting it.
    // Colours mirror the house recipe at style/classes/managementStyle.js:533-550.
    // The focused fieldset is left alone on purpose — MUI's default 2px primary is the strongest
    // focus cue and matches the card focus ring at `row` below.
    search: {
        minWidth: 320,
        '& .MuiOutlinedInput-root': {
            background: '#fff',
            borderRadius: 6,
            '& fieldset': { borderColor: '#a6a6a6' },
            '&:hover fieldset': { borderColor: '#797979' },
        },
        '& .MuiInputAdornment-positionStart': { color: '#797979' },
    },
    // Wrapping grid (SourcePicker idiom), not a scrolling column: a grid that scrolls inside its
    // own maxHeight would hide the Continue button below the fold. The list is capped by card
    // count + a "show more" control instead — see CAP.
    // A fixed FOUR-column grid, not a wrapping flex row of fixed-width cards: with flex-wrap the
    // number of cards per row changed with the viewport (five fit on a wide screen), so the
    // CAP of 8 did not correspond to a whole number of rows. A grid pins it at 4 × 2 and the
    // cards stretch to fill instead. Column count steps down on narrow viewports so a card never
    // becomes unreadably thin.
    list: {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
        gap: theme.spacing(2),
        marginTop: theme.spacing(1),
        [theme.breakpoints.down('md')]: { gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' },
        [theme.breakpoints.down('sm')]: { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' },
        [theme.breakpoints.down('xs')]: { gridTemplateColumns: '1fr' },
    },
    row: {
        // No fixed width — the grid cell sets it. minWidth:0 stops a long unbroken campaign name
        // from forcing the track wider than its share (grid items default to min-content).
        position: 'relative', boxSizing: 'border-box', minWidth: 0, padding: theme.spacing(1.5),
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
    // Clamp to two lines with a matching min-height so a mix of short and long names does not
    // leave the fixed-width (264) grid ragged — every card reserves the same two-line name box.
    name: {
        fontWeight: 600, overflowWrap: 'anywhere',
        display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 2,
        overflow: 'hidden', minHeight: '3em',
    },
    meta: { marginTop: theme.spacing(0.5), display: 'flex', alignItems: 'center', gap: theme.spacing(1.5), flexWrap: 'wrap' },
    // The field-count chip gets its OWN row with a reserved height, rather than another entry in
    // `meta`. `meta` is flexWrap inside a 264px card whose inner width is ~236px, and "#123" plus
    // "עודכן dd/MM/yyyy HH:mm" already fill most of it — a ~90px chip added there wraps and grows
    // every card in the row by a line the moment the counts land. The fixed height means the grid
    // geometry is final on first paint and does not reflow when the fetch resolves.
    fieldsRow: { marginTop: theme.spacing(0.5), minHeight: 26, display: 'flex', alignItems: 'center' },
    // Not a MUI `clickable` Chip: in v4 that renders role="button" tabIndex={0}, which would put a
    // focusable element inside a role="radio" (an ARIA violation) and add one Tab stop per card,
    // destroying the radiogroup's single-tab-stop invariant. A plain span with a click handler
    // keeps the chip inert; the roving tabindex on the card is untouched.
    fieldsChip: { display: 'inline-flex', cursor: 'pointer' },
    // Expansion panel, rendered BELOW the grid and OUTSIDE the radiogroup — see renderList.
    panel: {
        marginTop: theme.spacing(2), padding: theme.spacing(1.5, 2),
        border: '1px solid #e0e0e0', borderRadius: 8, background: '#fafafa',
    },
    panelHead: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: theme.spacing(1) },
    panelList: {
        marginTop: theme.spacing(1), display: 'flex', flexWrap: 'wrap', gap: theme.spacing(1),
        maxHeight: 220, overflowY: 'auto',
    },
    check: { position: 'absolute', top: 8, insetInlineEnd: 8 },
    state: { display: 'flex', alignItems: 'center', gap: theme.spacing(1), marginTop: theme.spacing(2) },
    empty: { textAlign: 'center', padding: '32px 16px', color: '#5b6b7b' },
    emptyActions: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: theme.spacing(1), flexWrap: 'wrap' },
    hiddenNote: { display: 'flex', alignItems: 'center', gap: theme.spacing(1), flexWrap: 'wrap', marginTop: theme.spacing(1) },
    // The cap expander is a pagination-style "reveal more of the same list" — a centered, neutral
    // outlined button, deliberately UNLIKE the primary-coloured filter-toggle link below it so the
    // two reveal controls never read as twins.
    moreBar: { display: 'flex', justifyContent: 'center', marginTop: theme.spacing(2) },
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
    const campaignTokens = useSelector((s: any) => s.smartSend.campaignTokens);
    const tokensStatus = useSelector((s: any) => s.smartSend.campaignTokensStatus);
    const selectedChannel = useSelector((s: any) => s.smartSend.selectedChannel);
    // Which campaign's field list is expanded, or null. Lives here (not per card) because the
    // panel is rendered once, below the grid.
    const [openFields, setOpenFields] = useState<number | null>(null);
    const [status, setStatus] = useState<'idle' | 'loading' | 'succeeded' | 'failed'>('idle');
    const [search, setSearch] = useState('');
    const [onlySendable, setOnlySendable] = useState(true);
    const [expanded, setExpanded] = useState(false);   // cap expander — reveals rows past CAP
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
    // `capped` is what the grid actually renders: rows past CAP stay out of the DOM — and so out
    // of the roving-tabindex / arrow order below — until "show more" is pressed. Every index-based
    // helper (selectableIdx, rovingTarget, rowRefs) is therefore computed over `capped`, never over
    // the full `visible`, or the indices would not line up with the rendered cards.
    // One exception keeps the radiogroup usable: cap to CAP UNLESS the row that must hold the tab
    // stop — the selected campaign if selectable, else the first selectable row — sorts past CAP.
    // Capping it away would either trap the keyboard (every rendered card tabIndex=-1, rovingTarget
    // =-1, arrows no-op) or hide the checked selection, so in that one case we reveal the whole
    // list. A target of -1 (no selectable row anywhere) is NOT "past the cap": nothing to focus, so
    // the plain CAP slice stands.
    const capped = useMemo(() => {
        if (expanded) return visible;
        const sel = value != null ? visible.findIndex((row) => isSelectable(row) && row.CampaignID === value) : -1;
        const target = sel >= 0 ? sel : visible.findIndex(isSelectable);
        return target >= CAP ? visible : visible.slice(0, CAP);
    }, [visible, expanded, value]);
    const moreCount = visible.length - capped.length;   // rows the cap is still holding back

    // Fetch field counts for the cards that are actually RENDERED, never for the whole account.
    // Only selectable rows are asked for: the count is not shown on blocked cards (they already
    // carry their own reason chip and tooltip), and skipping them roughly halves the traffic.
    //
    // ONE BATCH AT A TIME. The server caps a request at BATCH_MAX, so a rendered list longer than
    // that needs several passes — but they must be SEQUENTIAL. `tokensStatus` is in the deps
    // (it has to be: it is what tells the effect a batch finished), and getCampaignTokens.pending
    // writes 'loading' into that same object synchronously inside dispatch. So the effect re-enters
    // immediately on the PENDING write, not on the response, and without this guard the whole
    // rendered list would go out as ceil(N/BATCH_MAX) near-simultaneous POSTs against the shared
    // production DB — each id costing two stored-procedure round trips. `inFlight` collapses that
    // back to the intended drain: dispatch, wait, dispatch the next slice.
    const BATCH_MAX = 10;   // must not exceed the server's cap in DataSourcesSenderController
    const tokensInFlight = useRef(false);
    useEffect(() => {
        if (tokensInFlight.current) return;
        const need = capped
            .filter(isSelectable)
            .map((row) => row.CampaignID)
            .filter((id) => tokensStatus[id] == null);   // never re-ask, including after a failure
        if (!need.length) return;
        tokensInFlight.current = true;
        // Cleared in BOTH outcomes: the thunk is wrapped so it never rejects, but a throw here
        // would latch the flag on and stop every later batch for the rest of the session.
        Promise.resolve(dispatch(getCampaignTokens({ campaignIds: need.slice(0, BATCH_MAX), channel: selectedChannel })))
            .finally(() => { tokensInFlight.current = false; });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [capped, tokensStatus]);

    // A stale panel must not point at a card that is no longer rendered.
    useEffect(() => {
        if (openFields != null && !capped.some((row) => row.CampaignID === openFields)) setOpenFields(null);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [capped]);
    const selectableIdx = useMemo(
        () => capped.reduce<number[]>((acc, row, i) => (isSelectable(row) ? [...acc, i] : acc), []),
        [capped],
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
        // Wrapping RTL grid, same map as SourcePicker: ArrowLeft = next (the grid flows right→left)
        // and ArrowRight = prev; ArrowDown/ArrowUp follow the same next/prev. moveFocus walks only
        // the selectable rows, so disabled cards are stepped over rather than landed on.
        else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') { e.preventDefault(); moveFocus(idx, 1); }
        else if (e.key === 'ArrowUp' || e.key === 'ArrowRight') { e.preventDefault(); moveFocus(idx, -1); }
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
    // Both are guaranteed to be within `capped`: the cap auto-reveals the full list whenever the
    // selected-or-first-selectable row would otherwise sort past it (see `capped`), so this cannot
    // resolve to -1 while any selectable row exists.
    const selectedIdx = capped.findIndex((row) => isSelectable(row) && row.CampaignID === value);
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
        const fieldsId = `smartsend-campaign-fields-${row.CampaignID}`;

        // The ##fields## this campaign's template contains. Shown on selectable cards only.
        // `names` is undefined until the batch resolves; 'failed' also leaves it undefined, and in
        // BOTH cases the chip is simply absent — the card stays selectable and Continue still works,
        // because nothing about choosing a campaign depends on the count.
        // An EMPTY array is different from undefined and MUST render: "no fields in template" is
        // real, actionable information (that campaign has nothing to map), not a loading state.
        const names: string[] | undefined = selectable ? campaignTokens[row.CampaignID] : undefined;

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
                // Space-separated id LIST — the blocked-reason id must be preserved, not replaced.
                // The field count reaches assistive tech through this description rather than
                // through a control, so the radiogroup keeps exactly one tab stop.
                aria-describedby={[
                    !selectable ? descId : null,
                    names ? fieldsId : null,
                ].filter(Boolean).join(' ') || undefined}
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
                {/* Field count. Always occupies a reserved-height row so the counts landing later
                    cannot reflow the grid. Clicking it toggles the list panel BELOW the grid — the
                    handler sits on a plain span, never on the Chip (a MUI v4 clickable Chip becomes
                    role="button" tabIndex=0, i.e. a focusable descendant of a radio and an extra Tab
                    stop per card). stopPropagation is what keeps the click from also selecting the
                    campaign via the card's own onClick. */}
                {selectable && (
                    <Box className={classes.fieldsRow}>
                        {names && (
                            <span
                                className={classes.fieldsChip}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenFields(openFields === row.CampaignID ? null : row.CampaignID);
                                }}
                            >
                                <Chip
                                    size="small"
                                    icon={<TextFields fontSize="small" />}
                                    label={names.length
                                        ? t('DataSources.send.picker.fieldsCount', { n: names.length })
                                        : t('DataSources.send.picker.fieldsEmpty')}
                                    variant={openFields === row.CampaignID ? 'default' : 'outlined'}
                                />
                            </span>
                        )}
                    </Box>
                )}
                {!selectable && <span id={descId} className={classes.srOnly}>{blockedText}</span>}
                {names && (
                    <span id={fieldsId} className={classes.srOnly}>
                        {t('DataSources.send.picker.fieldsAria', { n: names.length, list: names.join(', ') })}
                    </span>
                )}
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
                <Box className={classes.list} role="radiogroup" aria-label={t('DataSources.send.picker.selectAria')}>
                    {capped.map(renderRow)}
                </Box>
                {/* The expanded field list, rendered OUTSIDE the radiogroup on purpose.
                    Inside a card it would either grow the card (reflowing the whole wrapping grid)
                    or need a Popover/Tooltip: a v4 Popover steals focus out of the roving tabindex,
                    and a controlled v4 Tooltip has no Escape and no click-away handler, so with the
                    hover/focus/touch listeners disabled its onClose is unreachable and the bubble
                    cannot be dismissed. Out here a real focusable close Button is legal and the
                    grid's single-tab-stop invariant is untouched. */}
                {openFields != null && campaignTokens[openFields] && (
                    <Box className={classes.panel} role="region" aria-live="polite">
                        <Box className={classes.panelHead}>
                            <Typography variant="subtitle2" style={{ fontWeight: 600 }}>
                                {t('DataSources.send.picker.fieldsPanelTitle', {
                                    name: (capped.find((r) => r.CampaignID === openFields) || { Name: '' }).Name,
                                })}
                            </Typography>
                            {/* Return focus to the card this panel belongs to. The Close button is
                                the focused element and unmounts itself, so without this the focus
                                position is lost and the next Tab resumes from wherever the removed
                                node sat rather than from the card the user was working on. */}
                            <Button
                                size="small"
                                startIcon={<Close fontSize="small" />}
                                onClick={() => {
                                    const idx = capped.findIndex((r) => r.CampaignID === openFields);
                                    setOpenFields(null);
                                    if (idx >= 0) rowRefs.current[idx]?.focus();
                                }}
                            >
                                {t('DataSources.send.picker.fieldsPanelClose')}
                            </Button>
                        </Box>
                        <Box className={classes.panelList}>
                            {campaignTokens[openFields].length
                                ? campaignTokens[openFields].map((n: string) => (
                                    // The token exactly as it appears in the template, ##…## included,
                                    // so the user can match it against the editor by eye.
                                    <Chip key={n} size="small" variant="outlined" label={`##${n}##`} />
                                ))
                                : <Typography variant="body2" color="textSecondary">{t('DataSources.send.picker.fieldsEmpty')}</Typography>}
                        </Box>
                    </Box>
                )}
                {/* ONE shared retry for the whole grid, not an error chip per card: a failed batch
                    would otherwise print the same message up to twelve times on one screen. */}
                {capped.some((row) => isSelectable(row) && tokensStatus[row.CampaignID] === 'failed') && (
                    <Box className={classes.hiddenNote}>
                        <Typography variant="caption" color="textSecondary">
                            {t('DataSources.send.picker.fieldsLoadError')}
                        </Typography>
                        <Button
                            size="small"
                            startIcon={<Refresh />}
                            onClick={() => dispatch(getCampaignTokens({
                                campaignIds: capped
                                    .filter((row) => isSelectable(row) && tokensStatus[row.CampaignID] === 'failed')
                                    .map((row) => row.CampaignID)
                                    .slice(0, BATCH_MAX),
                                channel: selectedChannel,
                            }))}
                        >
                            {t('DataSources.retry')}
                        </Button>
                    </Box>
                )}
                {/* Cap expander — pagination-style "reveal more of the same list". A centered,
                    neutral OUTLINED button, visually distinct from the primary-coloured filter
                    toggle below (which changes WHAT is listed). `moreCount` is how many sendable-
                    list rows the cap is still holding back; hidden once expanded or when it fits. */}
                {moreCount > 0 && (
                    <Box className={classes.moreBar}>
                        <Button size="small" variant="outlined" onClick={() => setExpanded(true)}>
                            {t('DataSources.send.picker.showMore', { count: moreCount })}
                        </Button>
                    </Box>
                )}
                {/* Filter toggle, NOT "show more": this reveals the campaigns the onlySendable switch
                    is hiding (already-sent / old-editor), each rendered disabled with its reason.
                    Same key/action as the empty-state button above. */}
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
                {/* `placeholder`, NOT `label`. MUI v4 does not shrink an InputLabel while a
                    startAdornment is present on an empty, unfocused field, so a label would sit
                    ON the magnifier — the DataSources search boxes (DataSources.tsx:488,
                    SmartSendManageTab.tsx:277, FiltersBar.tsx:54) all carry that glitch because
                    none of them passes InputLabelProps={{ shrink: true }}. The correct in-screen
                    precedent is TokenMappingTable.tsx:67-79: outlined + placeholder + the same
                    start adornment. theme.js:49-52 already renders outlined placeholders near-
                    black at weight 500, so the hint stays highly legible.
                    `position="start"` is correct under RTL and must NOT become "end": jss-rtl
                    (App.js:1047) mirrors MUI's positionStart marginRight, so the magnifier paints
                    on the RIGHT in Hebrew. Same as DataSources.tsx:492. */}
                <TextField
                    variant="outlined"
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
