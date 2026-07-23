import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useSearchParams } from 'react-router-dom';
import { Box, LinearProgress, Typography, Button, Snackbar, CircularProgress, Dialog } from '@material-ui/core';
import { Refresh } from '@material-ui/icons';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import DefaultScreen from '../DefaultScreen';
import useRedirect from '../../helpers/Routes/Redirect';
import { sitePrefix } from '../../config';
import { PulseemFeatures } from '../../model/PulseemFields/Fields';
import {
    getMapping, setCampaignContext, setTokenMapping, setBusinessColumn,
    setMapping, fillAndSummarize, setEmailSendSettingsWrapped, loadSourceColumns,
    getSendSummaryWrapped, getEmailSendSettingsWrapped, selectUnmappedTokens,
} from '../../redux/reducers/smartSendSlice';
import SourcePicker from './components/SourcePicker';
import TokenMappingTable from './components/TokenMappingTable';
import BusinessColumnsPicker from './components/BusinessColumnsPicker';
import StaleVersionBanner from './components/StaleVersionBanner';
import MappingMismatchBanner from './components/MappingMismatchBanner';
import UnmappedTokensWarning from './components/UnmappedTokensWarning';
import SmartSendPreview from './components/SmartSendPreview';
import SendSummaryDialog from './components/SendSummaryDialog';
import TestSendDialog from './components/TestSendDialog';

// Smart-Send screen (מסך השליחה החכמה). Wizard: SourcePicker →
// TokenMappingTable → BusinessColumnsPicker → Preview → Summary → Send (§11/§13).
// Route: `${sitePrefix}Campaigns/SmartSend/:id` (+ optional ?dataSourceId= from entry A).
const ERR_KEY: { [k: string]: string } = {
    EDIT_BLOCKED_DURING_SEND: 'editBlockedDuringSend', VIEW_ONLY: 'viewOnlyBlocked',
    GROUP_MERGE_LIMIT: 'groupMergeLimit', DATA_INCORRECT: 'dataIncorrect',
    CHANNEL_NOT_SUPPORTED: 'channelNotSupported', NOT_FOUND: 'notFound',
};

const SmartSendScreen = ({ classes }: any) => {
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const Redirect = useRedirect();
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const dataSourceId = searchParams.get('dataSourceId');
    // Entry A ?dataSourceId — a garbage param must land as null, never as a bogus id.
    // A NaN guard alone is NOT enough: `Number('')` is 0 (and `Number(' ')` is 0 too), so
    // `?dataSourceId=` — which the picker emits whenever its source chip is cleared, and
    // which any hand-edited URL can produce — would pass the guard and store 0. SourcePicker
    // then treats a stored id as "an id to preselect". Reject anything <= 0 as well, so the
    // only values that reach the store are real, positive source ids.
    // Hoisted out of the load effect because the back-to-picker link in the header has to hand
    // the SAME sanitised id back to the picker.
    const dsNum = dataSourceId != null ? Number(dataSourceId) : NaN;
    const parsedDsId = !Number.isNaN(dsNum) && dsNum > 0 ? dsNum : null;

    const campaignId = Number(id);
    const { accountFeatures } = useSelector((state: any) => state.common);
    const smartSend = useSelector((state: any) => state.smartSend);
    const unmapped = useSelector(selectUnmappedTokens);
    // The campaign identity shown in the header. It comes from the newsletter summary the reused
    // pipeline hydrates (getSendSummaryWrapped, dispatched from openSummary) — deliberately NO
    // extra fetch is added here, so until that lands the line is simply absent rather than a
    // placeholder. `newsletterSendSummary` is session-sticky (newsletterSlice.js:263 seeds it to
    // [] and nothing ever clears it), so a summary left over from a DIFFERENT campaign would
    // otherwise label this screen with the wrong name — the whole point of the label is that the
    // user can trust it, so it renders only when the hydrated CampaignID is this campaign's.
    const sendSummary = useSelector((state: any) => state.newsletter && state.newsletter.newsletterSendSummary);
    const campaignName: string | null = sendSummary && sendSummary.CampaignID === campaignId
        ? (sendSummary.CampaignName || null)
        : null;

    const currentSourceId = smartSend.dataSource?.DataSourceID ?? smartSend.dataSourceId ?? null;
    const hasColumns = smartSend.columns.length > 0;

    const [confirmUnmapped, setConfirmUnmapped] = useState(false);
    const [saving, setSaving] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [summaryOpen, setSummaryOpen] = useState(false);
    const [testOpen, setTestOpen] = useState(false);
    // Set by SendSummaryDialog's onSent (a 200/201 from sendSmart) and NOT acted on until the
    // user closes the dialog — see the SendSummaryDialog block at the bottom of this file.
    const [sent, setSent] = useState(false);
    // The working tokenMap differs from what is persisted. There is no dirty flag in the slice
    // and none can be derived from it: setMapping.fulfilled does not write the new mapping back
    // onto `tokens`, so comparing tokenMap to `tokens[].MappedColumnID` would keep claiming
    // "unsaved" straight after a successful save. Tracked here instead, at the one place in this
    // screen that edits the map.
    const [dirty, setDirty] = useState(false);
    // item 2: the synthetic group id returned by saveMapping, held so the confirmed Send inside
    // SendSummaryDialog can attach it (attachGroup) — the attach is deferred out of openSummary.
    const [pendingGid, setPendingGid] = useState<number | null>(null);
    // item 3: three-way exit confirm (Save & exit / Exit without saving / Cancel).
    const [exitOpen, setExitOpen] = useState(false);
    const [exitSaveFailed, setExitSaveFailed] = useState(false);
    const [toast, setToast] = useState<{ open: boolean; ok: boolean; msg: string }>({ open: false, ok: true, msg: '' });

    const showToast = (ok: boolean, msg: string) => setToast({ open: true, ok, msg });

    useEffect(() => {
        // `accountFeatures?.length &&`, NOT `accountFeatures &&` — the same guard SmartSendPicker.tsx:38,
        // DataSources.tsx:90 and DataSourceView.tsx:73 use. The cookie-backed list is null until it
        // loads (commonSlice.js:239) and a bare truthiness check would let an unentitled user through
        // on `undefined`; `?.length` also covers an empty array. Redirect only once features arrived.
        if (accountFeatures?.length && accountFeatures.indexOf(PulseemFeatures.DATA_SOURCES) === -1) {
            // `sitePrefix` is `string | undefined` (it comes straight from process.env), so it
            // needs the same `?? ''` the other feature-gate redirects use — see
            // DataSources.tsx:88 and DataSourceView.tsx:72.
            Redirect({ url: sitePrefix ?? '', openNewTab: false });
        }
    }, [accountFeatures]);

    // The "send anyway" confirmation must apply ONLY to the exact unmapped set the user
    // acknowledged — reset it whenever the mapping/columns change (e.g. a source switch
    // clears the map), so a stale confirm can never bypass the §16 raw-token gate.
    useEffect(() => {
        setConfirmUnmapped(false);
    }, [smartSend.columns, smartSend.tokenMap]);

    // Nothing is unsaved right after the mapping (re)loads — getMapping.fulfilled reseeds
    // `tokens` AND `tokenMap` from the server — nor right after a source switch, which empties
    // the map (selectSource, smartSendSlice.ts:292). `tokens` is a fresh array on every load, so
    // its identity is the load signal; a plain setTokenMapping never touches it.
    useEffect(() => {
        setDirty(false);
    }, [smartSend.tokens, currentSourceId]);

    // item 3: warn on tab close / refresh while there are unsaved mapping changes. react-router
    // 6.4.2 exposes no useBlocker, so this covers only real unloads; in-SPA navigation is
    // mitigated by the sticky save bar. Pattern mirrors LegacyPageFrame.tsx:17-27.
    useEffect(() => {
        if (!dirty) return undefined;
        const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ''; };
        window.addEventListener('beforeunload', handler);
        return () => window.removeEventListener('beforeunload', handler);
    }, [dirty]);

    useEffect(() => {
        if (!campaignId || Number.isNaN(campaignId) || campaignId <= 0) return;
        dispatch(setCampaignContext({ campaignId, dataSourceId: parsedDsId }));
        dispatch(getMapping(campaignId));
    }, [dispatch, campaignId, parsedDsId]);

    // ── save flow (§13 step 6): setMapping (lock + PulseemDS_ group + TokenMap) → get
    // SyntheticGroupID → READ the campaign's current send settings → post them back with the
    // synthetic group MERGED into GroupIds (§10). Read-modify-write, never a partial body. ──
    const buildSaveRequest = () => {
        const colSet = new Set(smartSend.columns.map((c: any) => c.ColumnID));
        return {
            CampaignID: campaignId,
            Channel: smartSend.selectedChannel,
            DataSourceID: smartSend.dataSource?.DataSourceID,
            DataSourceVersionID: smartSend.lockedVersionId,
            SupervisorColumnID: smartSend.supervisorColumnId,
            GapColumnID: smartSend.gapColumnId,
            SortColumnID: smartSend.sortColumnId,
            // Only tokens mapped to a column that still EXISTS in the locked version. A
            // vanished mapping (id ∉ columns) is treated as unmapped (sent raw) — the same
            // definition selectUnmappedTokens/TokenMappingTable use — otherwise the SP would
            // reject the whole save with -9 and the confirm-then-send path would dead-end.
            Mappings: smartSend.tokens
                .filter((tk: any) => { const c = smartSend.tokenMap[tk.Token]; return c && c > 0 && colSet.has(c); })
                .map((tk: any, i: number) => ({ Token: tk.Token, DataSourceColumnID: smartSend.tokenMap[tk.Token], GroupNo: 0, GroupTitle: null, DisplayOrder: i + 1 })),
        };
    };

    // ── save flow, SPLIT (item 2): saveMapping persists the mapping and returns the synthetic
    //    group id but does NOT attach it; attachGroup performs the GroupIds merge (the mutation
    //    that decides who the campaign sends to). Opening the summary — or saving from the test
    //    dialog — calls saveMapping only; the attach is deferred to a confirmed Send. ──
    const saveMapping = async (silent?: boolean): Promise<{ ok: boolean; gid: number | null }> => {
        setSaving(true);
        const res: any = await dispatch(setMapping(buildSaveRequest()));
        const r = res && res.payload ? res.payload : {};
        if (r.StatusCode !== 200) {
            setSaving(false);
            showToast(false, t('DataSources.send.errors.' + (ERR_KEY[r.Message] || 'generalError')));
            return { ok: false, gid: null };
        }
        const gid = r.Data && r.Data.SyntheticGroupID;
        setSaving(false);
        setDirty(false); // the mapping is persisted — the unsaved-changes bar must go away
        if (!silent) showToast(true, t('DataSources.send.toasts.mappingSaved'));
        return { ok: true, gid: gid != null ? Number(gid) : null };
    };

    // Attach the synthetic group to the campaign's GroupIds — called ONLY from a confirmed Send
    // (SendSummaryDialog.beforeSend), never on preview.
    const attachGroup = async (gid: number | null): Promise<boolean> => {

        // Attaching the synthetic group means posting the WHOLE settings row back, not a patch:
        // the server handler (NewsletterLogic.cs:1175-1193) forwards EVERY SendSettings field to
        // the stored proc, so a field missing from this body arrives as its DEFAULT and silently
        // overwrites whatever the user configured on the classic send-settings screen —
        // PulseAmount, TimeInterval, FromDate/ToDate, the IsOpened/IsOpenedClicked/IsNotClicked/
        // IsNotOpened filters, ExceptionalDays, ExeptionalCampaigns, ExeptionalGroups,
        // AutoSendingByUserField, AutoSendDelay, IsBestTime. Hence read-modify-write, with the
        // read as a HARD precondition: if it fails there is nothing to preserve, and posting a
        // minimal body "anyway" is precisely the data loss this guards against — fail the save.
        // GetSendSettings answers 201 on success (EmailController.cs:517), NOT 200 — the SmartSend
        // mock returns 200, which is exactly what would hide this until the mock is switched off.
        // Both are accepted so the screen behaves identically in mock and real mode.
        const cur: any = await dispatch(getEmailSendSettingsWrapped(campaignId));
        const curPayload = cur && cur.payload ? cur.payload : {};
        const ok = curPayload.StatusCode === 201 || curPayload.StatusCode === 200;
        const settings = ok && curPayload.Data ? curPayload.Data.Settings : null;
        // `!settings` alone would pass an [] or {} straight through (both truthy / spreadable to an
        // empty body), producing a POST with no CampaignID — worse than the minimal body this
        // replaced. Require the identifying field.
        if (!settings || !settings.CampaignID) {
            showToast(false, t('DataSources.send.errors.' + (ERR_KEY[curPayload.Message] || 'generalError')));
            return false;
        }

        // GroupIds (CSV) is the ONE field that changes — and the authoritative one: SendSettings
        // .GroupList (SendSettings.cs:35-41) is a getter-only computed property, so the GroupList
        // that came back from the GET rides along untouched and is simply ignored server-side.
        // MERGE, never replace: a combined campaign (source + regular groups, §16) keeps its
        // regular groups. Trim + de-dupe so a loose or empty CSV ('', '301,,302', '301, 302')
        // yields no empty entries and a re-save cannot append the synthetic group twice.
        const ids: string[] = String(settings.GroupIds ?? '').split(',').map((s: string) => s.trim()).filter((s: string) => s !== '');
        // A 200 with no SyntheticGroupID must never push the literal "undefined" into the CSV;
        // post the settings back unchanged rather than corrupt the group list.
        if (gid != null && Number(gid) > 0 && ids.indexOf(String(gid)) === -1) ids.push(String(gid));
        // Everything else rides verbatim — EXCEPT two scheduling fields that cannot be echoed back
        // blindly, both mirroring what the classic screen already does with the SAME payload:
        //  1. SendingMethod: 0 is a real stored value, and the classic normalises it to 1 on every
        //     post (NewsletterSendSettings.js:409). Echoing 0 writes back an invalid send method.
        //  2. A stored "scheduled" method with no SendDate is a reachable state — the classic
        //     DISABLES its save button on exactly that combination (NewsletterSendSettings.js:895-898)
        //     and the server answers 405 SEND_DATE_MISSING. Echoing it verbatim would make the
        //     mapping permanently unsavable for that campaign. Only an ALREADY-INVALID combination
        //     is normalised to "send now"; a valid schedule is preserved untouched.
        const METHOD_SCHEDULED = 2, METHOD_AUTO = 3;
        let method = settings.SendingMethod === 0 ? 1 : (settings.SendingMethod ?? 1);
        let sendDate = settings.SendDate;
        const scheduleBroken =
            (method === METHOD_SCHEDULED && !sendDate) ||
            (method === METHOD_AUTO && !sendDate && !settings.AutoSendDelay);
        if (scheduleBroken) { method = 1; sendDate = null; }
        const setRes: any = await dispatch(setEmailSendSettingsWrapped({
            ...settings, GroupIds: ids.join(','), SendingMethod: method, SendDate: sendDate,
        }));
        const s = setRes && setRes.payload ? setRes.payload : {};
        // SetSendSettings answers 201 on success (NewsletterSendSettings.js:429-431 switches on
        // exactly these codes). Anything else — 401/405/409/410/500 — means the synthetic group
        // was NOT attached, so the campaign would still send to its old recipients: that is a
        // FAILED save. It must not clear `dirty` and must not show the success toast.
        if (s.StatusCode !== 201 && s.StatusCode !== 200) {
            showToast(false, t('DataSources.send.errors.' + (ERR_KEY[s.Message] || 'generalError')));
            return false;
        }
        return true;
    };

    const openSummary = async () => {
        // item 2: persist the mapping (fillAndSummarize needs it) and stash the synthetic group
        // id, but DO NOT attach it here — the attach is deferred to the confirmed Send
        // (SendSummaryDialog.beforeSend → attachGroup). fillAndSummarize fills the staging group
        // and feeds the recipient counts the dialog shows; it does not wire the campaign, so
        // opening — and abandoning — the summary leaves GroupIds untouched (item 2 / §6).
        // KNOWN EDGE (adversarial review): if the campaign was already attached by a PRIOR send
        // whose pipeline then failed (attachGroup ok but sendSmart errored → no detach exists,
        // §6), its group is still in GroupIds, so re-filling here refreshes an already-armed
        // campaign. No worse than the pre-split behaviour; a durable fix needs a detach endpoint.
        // Flagged to the product owner.
        const { ok, gid } = await saveMapping(true);
        if (!ok) return;
        setPendingGid(gid);
        await dispatch(fillAndSummarize({ campaignId, channel: smartSend.selectedChannel }));
        await dispatch(getSendSummaryWrapped(campaignId));
        await dispatch(getEmailSendSettingsWrapped(campaignId));
        setSummaryOpen(true);
    };

    // item 3: leaving the loaded screen. The only in-screen exit is the back-to-picker link (the
    // 404 branch has nothing to lose; the summary-close redirect runs only after a real send).
    const doExit = () => Redirect({ url: `${sitePrefix}SmartSend${parsedDsId != null ? `?dataSourceId=${parsedDsId}` : ''}`, openNewTab: false });
    const handleBackToPicker = () => { if (dirty) { setExitSaveFailed(false); setExitOpen(true); } else doExit(); };
    // Save & exit must NOT navigate on a failed save (saveMapping returns ok:false on StatusCode
    // != 200); navigating then would silently drop the very changes the user asked to keep.
    const handleSaveAndExit = async () => {
        const { ok } = await saveMapping();
        if (ok) { setExitOpen(false); doExit(); } else setExitSaveFailed(true);
    };

    // `!sent`: once sendSmart has answered 200/201 for this campaign the screen must not be able
    // to arm a second send. Closing the summary dialog navigates away, but this gate deliberately
    // does not depend on that navigation actually happening.
    const canSend = hasColumns && !sent && (unmapped.length === 0 || confirmUnmapped);

    const renderBody = () => {
        if (!campaignId || Number.isNaN(campaignId) || campaignId <= 0) {
            return <Typography>{t('DataSources.send.errors.notFound')}</Typography>;
        }
        if (smartSend.mappingStatus === 'loading' || smartSend.mappingStatus === 'idle') return <LinearProgress />;
        if (smartSend.mappingStatus === 'failed') {
            // §16: distinct UI per code. 404 (foreign/deleted campaign) → back to the list;
            // 927 (feature off) → its own message; everything else → generic retry text.
            if (smartSend.mappingError === 404) {
                return (
                    <Box>
                        <Typography style={{ marginBottom: 12 }}>{t('DataSources.send.errors.notFound')}</Typography>
                        <Button variant="outlined" color="primary" onClick={() => Redirect({ url: `${sitePrefix}Campaigns`, openNewTab: false })}>
                            {t('DataSources.send.backToCampaigns')}
                        </Button>
                    </Box>
                );
            }
            // 927 (feature off) and the generic branch were both bare text: the screen has no
            // other control on it in this state, so a transient failure — or an entitlement that
            // was switched on server-side moments ago — left the user with a dead end and no way
            // out but the browser. Both now re-run the only request this screen loads with.
            const retry = (
                <Button variant="outlined" color="primary" size="small" startIcon={<Refresh />}
                    onClick={() => dispatch(getMapping(campaignId))}>
                    {t('DataSources.send.errors.retryAction')}
                </Button>
            );
            if (smartSend.mappingError === 927) {
                return (
                    <Box>
                        <Typography style={{ marginBottom: 12 }}>{t('DataSources.send.errors.featureOff')}</Typography>
                        {retry}
                    </Box>
                );
            }
            return (
                <Box>
                    <Typography style={{ marginBottom: 12 }}>{t('DataSources.send.errors.generalError')}</Typography>
                    {retry}
                </Box>
            );
        }

        return (
            <Box>
                <StaleVersionBanner />
                <MappingMismatchBanner />
                <Typography variant="body1" style={{ marginBottom: 8 }}>
                    {smartSend.isMapped
                        ? t('DataSources.send.mappedTo', { name: smartSend.dataSource?.Name ?? '' })
                        : t('DataSources.send.notMapped')}
                </Typography>
                <Typography variant="body2" color="textSecondary" style={{ marginBottom: 16 }}>
                    {t('DataSources.send.tokensFound', { count: smartSend.tokens.length })}
                </Typography>

                {/* The channel is no longer picked here — it is chosen on the SmartSend picker
                    screen, which dispatches setChannel before navigating to this route. Landing
                    on this route directly (campaign-row icon, BEE editor button, or a pasted URL)
                    simply skips that step, and smartSend.selectedChannel correctly falls back to
                    the slice default (eSendChannel.EMAIL); it is still read from the slice and
                    sent in every request that carries a channel.
                    NOTE: `clearSmartSend` (smartSendSlice.ts:316) is exported but has ZERO
                    dispatch sites, so nothing ever resets the slice — selectedChannel is written
                    once by the picker and then survives the entire SPA session, across campaigns.
                    Harmless today because EMAIL is the only enabled channel (setChannel rejects
                    disabled ones), so the fallback and the sticky value are the same value. This
                    MUST be revisited when SMS is wired: a channel chosen for campaign A would
                    otherwise silently apply to a campaign B reached by a direct link. */}
                <SourcePicker />

                {/* Source-column load (after a pick) — loading spinner + error/retry so a
                    failed getDataSource never silently strands the user with no mapping table. */}
                {!hasColumns && currentSourceId != null && smartSend.columnsStatus === 'loading' && (
                    <Box style={{ marginTop: 20 }}><CircularProgress size={22} /></Box>
                )}
                {!hasColumns && currentSourceId != null && smartSend.columnsStatus === 'failed' && (
                    <Box style={{ marginTop: 20, display: 'flex', gap: 12, alignItems: 'center' }}>
                        <Typography color="error">{t('DataSources.send.source.loadError')}</Typography>
                        <Button size="small" startIcon={<Refresh />} onClick={() => dispatch(loadSourceColumns(currentSourceId as number))}>
                            {t('DataSources.retry')}
                        </Button>
                    </Box>
                )}

                {hasColumns && (
                    <>
                        <TokenMappingTable
                            tokens={smartSend.tokens}
                            columns={smartSend.columns}
                            value={smartSend.tokenMap}
                            onChange={(token, columnId) => { dispatch(setTokenMapping({ token, columnId })); setDirty(true); }}
                            warnSystemFieldOverride
                        />
                        <BusinessColumnsPicker
                            columns={smartSend.columns}
                            supervisorColumnId={smartSend.supervisorColumnId}
                            gapColumnId={smartSend.gapColumnId}
                            sortColumnId={smartSend.sortColumnId}
                            onChange={(role, columnId) => { dispatch(setBusinessColumn({ role, columnId })); setDirty(true); }}
                            supervisorEnabled
                        />

                        <Box style={{ marginTop: 24 }}>
                            <UnmappedTokensWarning tokens={unmapped} confirmed={confirmUnmapped} onConfirmChange={setConfirmUnmapped} />
                        </Box>

                        {/* wizard actions. Save moved to the sticky save bar (shown only when
                            there are unsaved changes), co-located with the unsaved indicator. */}
                        <Box style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 20, borderTop: '1px solid #e0e0e0', paddingTop: 18 }}>
                            <Button variant="outlined" color="primary" onClick={() => setShowPreview((v) => !v)}>
                                {t('DataSources.send.actions.preview')}
                            </Button>
                            <Button variant="outlined" color="primary" onClick={() => setTestOpen(true)}>
                                {t('DataSources.send.actions.testSend')}
                            </Button>
                            <Button variant="contained" color="primary" disabled={!canSend || saving} onClick={openSummary}>
                                {t('DataSources.send.actions.sendToAll')}
                            </Button>
                        </Box>

                        {showPreview && (
                            <Box style={{ marginTop: 20 }}>
                                <Typography variant="subtitle1" style={{ fontWeight: 600, marginBottom: 4 }}>{t('DataSources.send.preview')}</Typography>
                                <SmartSendPreview campaignId={campaignId} height={420} />
                            </Box>
                        )}
                    </>
                )}
            </Box>
        );
    };

    return (
        // subPage drives BOTH the side-menu highlight (SideBarItem.tsx:256 matches
        // `option.key === subPage`) and the document title (DefaultScreen.js:41-43 looks the
        // option up by key inside the `groups` route). This screen's own route entry is
        // `smartSend` (routes.tsx), so `dataSources` highlighted the wrong sibling and titled
        // the page "Data Sources" for every user who continued from the picker.
        <DefaultScreen currentPage="groups" subPage="smartSend" classes={classes} containerClass={clsx(classes.management, classes.mb50)}>
            {/* paddingBottom reserves clearance so the sticky save bar (below) never rests over
                the "Send to all" button / last action row (contract §3). */}
            <Box style={{ padding: 16, paddingBottom: 88 }}>
                <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
                    <Box>
                        <Typography variant="h5">{t('DataSources.send.title')}</Typography>
                        {/* Which campaign is about to go out. On entry A (a source tile → this
                            screen) the title alone identified nothing, so the user could confirm a
                            send to every recipient in the source without ever seeing the campaign
                            name. Absent (or belonging to another campaign) → render nothing; a
                            placeholder here would be worse than no line at all. */}
                        {campaignName && (
                            <Typography variant="body2" color="textSecondary">
                                {t('DataSources.send.campaignLabel', { name: campaignName })}
                            </Typography>
                        )}
                    </Box>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        {/* Unsaved changes now surface in a sticky save bar at the bottom of the
                            screen (next to the Save action), not as a caption here. Per the
                            product-owner reversal the screen DOES guard exits: a beforeunload
                            handler (above) for tab close/refresh, and a three-way confirm dialog on
                            the back-to-picker link (below). In-SPA side-menu navigation still cannot
                            be intercepted (react-router 6.4.2 has no useBlocker) — the sticky bar is
                            the mitigation for that path.
                            The picker is this screen's entry point, so the way back to it must exist
                            on the NORMAL path too — not only in the 404 branch. Rendered in the header
                            (outside renderBody) so it is also reachable while the mapping is still
                            loading or has failed. `Redirect` requires `openNewTab`.
                            The ?dataSourceId= the screen was entered with is handed BACK: without it
                            the picker loses the "sending from source" context the user started in and
                            a second continue would drop the source entirely. The sanitised
                            `parsedDsId` is used, not the raw param, so garbage is not round-tripped;
                            it is a positive number, so it needs no encoding (contrast
                            SmartSendPicker.tsx:64, which forwards the raw string). */}
                        <Button size="small" color="primary" onClick={handleBackToPicker}>
                            {t('DataSources.send.backToPicker')}
                        </Button>
                    </Box>
                </Box>
                {renderBody()}

                {/* item 3: sticky save bar — shown only when there are unsaved mapping changes.
                    Colours mirror InlineBanner's `warning` severity; it hosts the Save action so
                    the unsaved indicator and the way to resolve it sit together (replacing the old
                    header caption that sat far from the Save button). Sticky (not fixed) so it
                    keeps its place in the RTL content column and never overlaps the side menu. */}
                {dirty && (
                    <Box style={{
                        position: 'sticky', bottom: 0, marginTop: 20, zIndex: 2,
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        gap: 12, flexWrap: 'wrap', padding: '12px 16px', borderRadius: 6,
                        background: '#fff8e1', border: '1px solid #ffe082',
                        boxShadow: '0 -2px 8px rgba(0,0,0,0.06)',
                    }}>
                        <Typography variant="body2" style={{ color: '#8a5a00', fontWeight: 600 }}>
                            {t('DataSources.send.saveBar.unsaved')}
                        </Typography>
                        <Button variant="contained" color="primary" size="small" disabled={saving} onClick={() => saveMapping()}>
                            {saving ? <CircularProgress size={16} color="inherit" /> : t('DataSources.send.actions.saveMapping')}
                        </Button>
                    </Box>
                )}
            </Box>

            {/* onSent fires only on a 200/201 from sendSmart, on the line right after the dialog
                sets its own phase to 'result' (SendSummaryDialog.tsx:69-70). It must therefore do
                NOTHING that unmounts or navigates: React 17 renders both updates before the
                browser ever paints, so closing the dialog here made the dialog's success banner
                literally impossible to see — a completed send gave the user zero confirmation.
                It only records the outcome now; the dialog stays open on its result phase and
                renders the banner itself.
                Navigation is moved onto the close of a SUCCESSFUL send (every exit the dialog
                offers — its Close button, the X and the backdrop — comes through onClose), which
                still keeps the user off a screen whose "Send to all" would otherwise be re-armed.
                `canSend` also gates on `sent`, so the second send is blocked even if the redirect
                does not happen. */}
            <SendSummaryDialog
                open={summaryOpen}
                campaignId={campaignId}
                beforeSend={() => attachGroup(pendingGid)}
                onClose={() => {
                    setSummaryOpen(false);
                    if (sent) Redirect({ url: `${sitePrefix}Campaigns`, openNewTab: false });
                }}
                onSent={() => setSent(true)}
            />
            <TestSendDialog open={testOpen} campaignId={campaignId} dirty={dirty} onSaveMapping={saveMapping} onClose={() => setTestOpen(false)} onToast={(r) => showToast(r.ok, r.msg)} />

            {/* item 3: three-way exit confirm. Save & exit is primary + autofocus; Exit without
                saving is muted and set apart (destructive — up to ~20 mappings); Esc → Cancel via
                onClose. A failed save keeps the dialog open and does NOT navigate. */}
            <Dialog open={exitOpen} onClose={() => setExitOpen(false)} maxWidth="xs" fullWidth>
                <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid #e0e0e0' }}>
                    <Typography variant="h6">{t('DataSources.send.exit.title')}</Typography>
                </Box>
                <Box style={{ padding: 24 }}>
                    <Typography variant="body2" color="textSecondary">{t('DataSources.send.exit.body')}</Typography>
                    {exitSaveFailed && (
                        <Typography variant="body2" style={{ color: '#c0392b', marginTop: 12 }}>
                            {t('DataSources.send.exit.saveFailed')}
                        </Typography>
                    )}
                </Box>
                <Box style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 24px', borderTop: '1px solid #e0e0e0' }}>
                    <Button variant="contained" color="primary" disabled={saving} onClick={handleSaveAndExit} autoFocus>
                        {saving ? <CircularProgress size={18} color="inherit" /> : t('DataSources.send.exit.saveAndExit')}
                    </Button>
                    <Box style={{ flex: 1 }} />
                    <Button variant="text" disabled={saving} onClick={doExit} style={{ color: '#8a8a8a' }}>
                        {t('DataSources.send.exit.exitWithoutSaving')}
                    </Button>
                    <Button onClick={() => setExitOpen(false)} disabled={saving}>{t('DataSources.send.cancel')}</Button>
                </Box>
            </Dialog>

            <Snackbar
                open={toast.open}
                autoHideDuration={3500}
                onClose={() => setToast({ ...toast, open: false })}
                message={toast.msg}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                ContentProps={{ style: { backgroundColor: toast.ok ? '#2e7d32' : '#c0392b' } }}
            />
        </DefaultScreen>
    );
};

export default SmartSendScreen;
