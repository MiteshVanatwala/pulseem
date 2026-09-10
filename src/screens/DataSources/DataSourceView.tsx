import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import DefaultScreen from '../DefaultScreen';
import clsx from 'clsx';
import {
    Box, Button, Typography, Chip, LinearProgress, IconButton, Tooltip, TablePagination
} from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import {
    ArrowBack, GetApp, Edit as EditIcon, History, Assessment, Send, GroupAdd
} from '@material-ui/icons';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import Toast from '../../components/Toast/Toast.component';
import { ClassesType } from '../Classes.types';
import { ERROR_TYPE } from '../../helpers/Types/common';
import useRedirect from '../../helpers/Routes/Redirect';
import { PulseemFeatures } from '../../model/PulseemFields/Fields';
import { sitePrefix } from '../../config';
import {
    getDataSource, getRows, checkQuota, clearCurrent, clearRows
} from '../../redux/reducers/dataSourcesSlice';
import { GetExtraFields } from '../../redux/reducers/ExtraFieldsSlice';
import {
    DataSourceColumn, DataSourceVersion, RowsFilter, eDataSourceStatus,
    ClientFieldOption, buildAccountExtraFieldOptions
} from '../../Models/DataSources/DataSource';
import { getChannelDescriptor, eSendChannel } from '../../Models/DataSources/SmartSend';
import StatusChip from './components/StatusChip';
import RowsTable from './components/RowsTable';
import FiltersBar from './components/FiltersBar';
import EditColumnDialog from './components/EditColumnDialog';
import { detectColumnType } from './components/columnTypeDetect';
import VersionsHistoryDialog from './components/VersionsHistoryDialog';
import ExportDialog from './components/ExportDialog';
import AddToGroupDialog from './components/AddToGroupDialog';
import DataSourceSummary from './components/DataSourceSummary';
import EditDataSourceDialog from './components/EditDataSourceDialog';

const ROWS_PAGE_SIZE = 50;
// [VW] How often this screen re-checks a source that is still being processed. Deliberately the same
// 4s the list screen polls at (DataSources.tsx POLL_MS) — the two are showing the same worker, and a
// user who has both open should not see them disagree about whether it has finished.
const VIEW_POLL_MS = 4000;
// Same gate the mapping screen's SourcePicker applies for the only wired channel — see the note in
// DataSources.tsx. "Not view-only" would let a cell-only source through to a screen that drops it.
const EMAIL_IDENTITY_FLAG = getChannelDescriptor(eSendChannel.EMAIL).identityFlag;

const DataSourceView = ({ classes }: ClassesType) => {
    const { t, i18n } = useTranslation();
    // RTL: mirror the Send paper-plane horizontally so it points "forward" (leftward) — see DataSources.tsx.
    const isRtl = (i18n.dir?.() ?? 'rtl') === 'rtl';
    const sendIconStyle = isRtl ? { transform: 'scaleX(-1)' } : undefined;
    const dispatch = useDispatch();
    const Redirect = useRedirect();
    const { id } = useParams();
    const numId = Number(id);

    const { userRoles } = useSelector((s: any) => s.core);
    const { accountFeatures } = useSelector((s: any) => s.common);
    const { current, rows, rowsStatus, quota, ToastMessages } = useSelector((s: any) => s.dataSources);

    const [filters, setFilters] = useState<RowsFilter[]>([]);
    const [freeText, setFreeText] = useState('');
    const [page, setPage] = useState(1);
    const [viewVersionId, setViewVersionId] = useState<number | null>(null); // null = active version
    const [dialog, setDialog] = useState<{ type: string; data?: any } | null>(null);
    const [summaryDetails, setSummaryDetails] = useState<any>(null);
    /* [CFT] The account's names for ExtraField1..13 / ExtraDate1..4, for the summary's write-back list.
       Fetched LAZILY on first summary open, not on mount as the list screen does: this screen's job is
       showing rows, and most visits never open the dialog — an unconditional call would put a request
       on every page load to label a list that is usually not rendered. Cached in state afterwards, so
       reopening the dialog costs nothing. Without it the summary still names every target, it just
       falls back to the physical slot ("שדה נוסף 3") instead of the account's own word for it. */
    const [accountExtraFields, setAccountExtraFields] = useState<ClientFieldOption[]>([]);
    const extraFieldsLoadedRef = useRef(false);
    const [toastMessage, setToastMessage] = useState<ERROR_TYPE>(null);
    const requestedIdRef = useRef<number>(0);

    const details = current?.details ?? null;
    const columns: DataSourceColumn[] = current?.columns ?? [];
    const versions: DataSourceVersion[] = current?.versions ?? [];

    const canExport = !!userRoles?.AllowExport;
    const canEditMeta = !userRoles?.HideRecipients;
    // Mirrors the server's AllowSend gate on every Smart Send action — see DataSources.tsx.
    const canSend = !!userRoles?.AllowSend;
    const isHistorical = viewVersionId !== null && details && viewVersionId !== details.ActiveVersionID;
    const isViewOnly = details && !details.HasEmailIdentity && !details.HasCellIdentity;
    /* The version actually ON SCREEN. `details` always describes the ACTIVE version — openVersion()
       swaps the grid without refetching it — so anything that must describe what the user is looking
       at has to resolve through `versions` first and fall back to `details` only for the active case. */
    const viewedVersion: DataSourceVersion | null =
        viewVersionId !== null ? (versions.find(v => v.DataSourceVersionID === viewVersionId) ?? null) : null;
    /* On the ACTIVE view this must resolve through `versions` too. `details.VersionNumber` is not a
       fallback — DataSources_Get RS1 does not select it (verified 2026-09-09 against the SP and its
       _Stage variant), so it is always null and gating the chip on it made the chip disappear from the
       active view entirely. RS3 carries the number; ActiveVersionID identifies the row. */
    const activeVersion: DataSourceVersion | null =
        details?.ActiveVersionID != null ? (versions.find(v => v.DataSourceVersionID === details.ActiveVersionID) ?? null) : null;
    const viewedVersionNumber: number | null = viewedVersion ? viewedVersion.VersionNumber : (activeVersion?.VersionNumber ?? null);

    /* 🔴 THE STATUS THIS SCREEN RENDERS FROM (fixed 2026-09-10, deep-review K20).
       `details.Status` is RS1's `v.Status`, reached through
       `LEFT JOIN DataSourceVersions v ON v.DataSourceVersionID = ds.ActiveVersionID` — so it describes
       the ACTIVE version, and ActiveVersionID only moves when a version COMPLETES
       (DataSources_CompleteVersion swaps it under Status = 2 only).

       A source whose only version FAILED or was CANCELLED therefore still has ActiveVersionID NULL,
       the LEFT JOIN yields NULL, the C# maps DBNull to 0, and 0 is PENDING. The consequences were both
       user-visible and unbounded: renderBody showed "processing" FOREVER, the poll effect below
       re-fetched every 4 seconds with no terminating condition (the value it waits on could never
       change), and the FAIL and CANCELLED branches of renderBody were unreachable dead code.

       When there IS an active version, details.Status is exactly right and is used unchanged. When
       there is not, the newest version in RS3 is what actually describes the source. Same fix as the
       one applied to the wizard's pre-submit check — RS3 carries per-version Status; RS1 does not.

       KNOWN REMAINING GAP, deliberately not fixed here: the FAIL branch renders details.ErrorData,
       and RS1 does not select ErrorData either, so it is always null and the failure REASON still
       cannot be shown. Surfacing it needs the SP to project it — an API change, out of scope. */
    const newestVersion: DataSourceVersion | null = versions.length
        ? versions.reduce((a, b) => ((b.VersionNumber ?? 0) > (a.VersionNumber ?? 0) ? b : a))
        : null;
    const effectiveStatus: eDataSourceStatus | undefined =
        details?.ActiveVersionID != null ? details?.Status : (newestVersion?.Status ?? details?.Status);
    const viewedVersionId: number | null = viewVersionId !== null ? viewVersionId : (details?.ActiveVersionID ?? null);
    /* WHICH VERSIONS have already been added to a group this session — not a bare boolean.
       It was one session-wide flag, and a single AddToGroupDialog instance serves both entry points,
       so adding a HISTORICAL version from the versions dialog disabled the header button (which
       targets the ACTIVE version) and told the operator "this version's recipients have already been
       added" about a version nobody had touched — false, and it blocked the primary path for the rest
       of the session. Keyed by version id, the guard still stops a double-submit of the SAME version
       while leaving every other version reachable. (Fixed 2026-09-09, deep-review R3/trust-1.) */
    const [addedVersionIds, setAddedVersionIds] = useState<number[]>([]);
    const activeAlreadyAdded = details?.ActiveVersionID != null && addedVersionIds.indexOf(details.ActiveVersionID) !== -1;

    const maxSearchable = quota?.Limits?.MaxSearchableColumnsPerVersion ?? 10;
    const searchableRemaining = Math.max(0, maxSearchable - columns.filter(c => c.IsSearchable).length);

    // ── third gating layer ──
    useEffect(() => {
        if (accountFeatures?.length && accountFeatures.indexOf(PulseemFeatures.DATA_SOURCES) === -1)
            Redirect({ url: sitePrefix ?? '', openNewTab: false });
    }, [accountFeatures]);

    // ── load source (race-guarded) on id change ──
    useEffect(() => {
        // A non-numeric :id → numId=NaN, and NaN!==NaN would make the race guard bail on every response
        // (page hangs on the loader). Reject up front.
        if (!Number.isFinite(numId)) { Redirect({ url: `${sitePrefix}DataSources`, openNewTab: false }); return; }
        requestedIdRef.current = numId;
        setViewVersionId(null); setFilters([]); setFreeText(''); setPage(1);
        dispatch(clearCurrent()); dispatch(clearRows());
        dispatch(checkQuota());
        loadSource(numId);
        return () => { dispatch(clearCurrent()); dispatch(clearRows()); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    /* ── [VW] keep a processing source refreshing until it resolves ──────────────────────────────
       The effect above runs on `[id]` alone, so before this the screen loaded ONCE. A source whose
       first version is still being processed has no active version yet, and DataSources_Get RS1 then
       returns a NULL status that the API maps to 0 (PENDING) — so renderBody drew an indeterminate
       progress bar that nothing would ever replace. The page sat there until a manual reload.
       Gating the eye in the list is not enough on its own, because this screen has two other
       entrances that carry no status with them: a pasted /DataSources/View/:id URL (App.js route)
       and the versions-history dialog's "view" action. Fixing it HERE closes all three at once.
       Same cadence and same shape as the list screen's poll, deliberately: one interval, created
       only while something is in flight, cleared the moment it is not. The status this reads comes
       from the same getDataSource response the rest of the screen uses, and loadSource already
       loads the rows itself once the status turns READY — so the bar is replaced by real content
       without a reload and without a second code path. */
    useEffect(() => {
        const st = effectiveStatus;
        if (st !== eDataSourceStatus.PENDING && st !== eDataSourceStatus.PROCESSING) return;
        if (!Number.isFinite(numId)) return;
        const timer = setInterval(() => { loadSource(numId); }, VIEW_POLL_MS);
        return () => clearInterval(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [effectiveStatus, numId]);

    const loadSource = async (dsId: number) => {
        const res: any = await dispatch(getDataSource(dsId));
        if (requestedIdRef.current !== dsId) return; // ignore a stale response for a previous id
        const payload = res?.payload;
        if (payload?.StatusCode === 404) {
            setToastMessage({ ...ToastMessages.GENERAL_ERROR, message: 'DataSources.errors.sourceDeleted' } as ERROR_TYPE);
            Redirect({ url: `${sitePrefix}DataSources`, openNewTab: false });
            return;
        }
        // true 500 / network error → thunk rejects (no StatusCode in payload)
        if (!payload || res?.meta?.requestStatus === 'rejected' || (payload.StatusCode && payload.StatusCode >= 500)) {
            setToastMessage({ ...ToastMessages.GENERAL_ERROR });
            return;
        }
        const st = payload?.Data?.details?.Status;
        if (st === eDataSourceStatus.READY) loadRows(dsId, null, [], '', 1);
    };

    const loadRows = async (dsId: number, versionId: number | null, flt: RowsFilter[], ft: string, pg: number) => {
        const res: any = await dispatch(getRows({
            DataSourceID: dsId, VersionID: versionId, Filters: flt, FreeText: ft, PageNumber: pg, PageSize: ROWS_PAGE_SIZE
        }));
        if (requestedIdRef.current !== dsId) return;
        const p = res?.payload;
        if (p?.StatusCode === 400 && p?.Message === 'COLUMN_NOT_SEARCHABLE') {
            setToastMessage({ ...ToastMessages.GENERAL_ERROR, message: 'DataSources.errors.columnNotSearchable' } as ERROR_TYPE);
        } else if (p?.StatusCode === 404) {
            setToastMessage({ ...ToastMessages.GENERAL_ERROR, message: 'DataSources.errors.sourceDeleted' } as ERROR_TYPE);
            Redirect({ url: `${sitePrefix}DataSources`, openNewTab: false });
        } else if (p?.StatusCode === 405) {
            // HideRecipietns sub-user reached the row viewer by direct navigation — no PII access.
            setToastMessage({ ...ToastMessages.GENERAL_ERROR, message: 'DataSources.errors.featureNotAvailable' } as ERROR_TYPE);
            Redirect({ url: `${sitePrefix}DataSources`, openNewTab: false });
        } else if (p?.StatusCode === 403) {
            setToastMessage({ ...ToastMessages.GENERAL_ERROR, message: 'DataSources.errors.invalidChars' } as ERROR_TYPE);
        } else if (p?.StatusCode && p.StatusCode >= 400) {
            setToastMessage({ ...ToastMessages.GENERAL_ERROR });
        }
    };

    // ── handlers ──
    const runSearch = () => { setPage(1); loadRows(numId, viewVersionId, filters, freeText, 1); };
    const onFiltersChange = (f: RowsFilter[]) => { setFilters(f); setPage(1); loadRows(numId, viewVersionId, f, freeText, 1); };
    const changePage = (_: any, p: number) => { setPage(p + 1); loadRows(numId, viewVersionId, filters, freeText, p + 1); };

    const openColumnEdit = (col: DataSourceColumn) => setDialog({ type: 'column', data: col });

    /* Evidence for the column editor's ℹ️, re-derived from the rows CURRENTLY ON SCREEN.
       The server does not store the wizard's detection result, and re-uploading the file just to
       explain a type would be absurd — but the page already holds a page of real values for this
       column, and those are the same values the user is looking at while the dialog is open, which
       makes the percentage checkable on the spot. It is a sample of the page, not of the file, and
       that is the honest thing to show here. RowJson is parsed inside try/catch, exactly like
       RowsTable does, so one malformed row degrades the evidence instead of breaking the dialog. */
    const detectionFor = (col: DataSourceColumn | null) => {
        if (!col) return null;
        const items: any[] = rows?.items ?? [];
        if (items.length === 0) return null;
        const values = items.map(r => {
            try { return JSON.parse(r.RowJson || '{}')[col.ColumnKey]; } catch { return null; }
        });
        return detectColumnType(values);
    };
    const onColumnSaved = () => {
        setDialog(null);
        setToastMessage({ ...ToastMessages.COLUMN_UPDATED });
        // loadSource reloads rows unfiltered/page-1 — reset the view state so the UI stays in sync.
        setViewVersionId(null); setFilters([]); setFreeText(''); setPage(1);
        loadSource(numId);
    };

    const openVersion = (vid: number) => {
        setDialog(null);
        setViewVersionId(vid);
        setPage(1); setFilters([]); setFreeText('');
        loadRows(numId, vid, [], '', 1);
    };
    const backToActive = () => { setViewVersionId(null); setPage(1); setFilters([]); setFreeText(''); loadRows(numId, null, [], '', 1); };

    const onEditSaved = () => {
        setDialog(null);
        setToastMessage({ ...ToastMessages.SOURCE_UPDATED });
        // loadSource reloads rows unfiltered/active-version/page-1 — reset view state so the UI stays in sync.
        setViewVersionId(null); setFilters([]); setFreeText(''); setPage(1);
        loadSource(numId);
    };

    const openSummary = async (v?: DataSourceVersion) => {
        setSummaryDetails(details);
        setDialog({ type: 'summary' });
        /* [CFT] Fetch the account's extra-field names once, AFTER the dialog is already open, so a slow
           or failing catalogue never delays it. The list re-labels itself when the names arrive.
           A failure is deliberately silent and non-fatal, the same contract DataSources.tsx documents
           for this endpoint: the summary falls back to the physical slot names, which is degraded but
           never wrong. The ref, not the array's length, guards the call — an account that named no
           extra fields legitimately returns an empty list, and keying on length would re-request it
           on every open forever. */
        if (extraFieldsLoadedRef.current) return;
        extraFieldsLoadedRef.current = true;
        const response: any = await dispatch(GetExtraFields());
        if (response?.payload?.StatusCode === 201)
            setAccountExtraFields(buildAccountExtraFieldOptions(response.payload?.Data));
    };

    // Auto-dismiss the toast from an effect (one timer per toast), not from render.
    useEffect(() => {
        if (!toastMessage) return;
        const id = setTimeout(() => setToastMessage(null), 4000);
        return () => clearTimeout(id);
    }, [toastMessage]);

    // ── header ──
    const renderHeader = () => (
        <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Button startIcon={<ArrowBack />} onClick={() => Redirect({ url: `${sitePrefix}DataSources`, openNewTab: false })}>
                    {t('DataSources.backToList')}
                </Button>
                <Typography style={{ fontSize: 20, fontWeight: 700 }}>{details?.Name}</Typography>
                {details && <StatusChip status={effectiveStatus ?? details.Status} progress={null} runDateStart={details.RunDateStart ?? null} createdDate={details.CreatedDate} t={t} />}
                {/* 🔴 FIXED 2026-09-09: this rendered details.VersionNumber unconditionally, i.e. the
                    ACTIVE version's number, while openVersion() swaps the grid to a historical version
                    without refetching `details`. A user who opened V2 from the history dialog saw the
                    grid change, the orange historical banner appear — and the chip beside it still say
                    "V4". The chip is the only always-visible statement of WHICH version is on screen,
                    so it was the one element that had to be right. Now resolved through `versions`,
                    falling back to details only for the active view. */}
                {details && viewedVersionNumber !== null && <Chip size="small" label={`V${viewedVersionNumber}`} style={{ direction: 'ltr' }} />}
                {isViewOnly && (
                    <Tooltip title={t('DataSources.viewOnlyTooltip')} PopperProps={{ style: { direction: isRtl ? 'rtl' : 'ltr' } }}>
                        <Chip size="small" label={t('DataSources.viewOnlyBadge')} style={{ background: '#f1ebfb', color: '#6941c6' }} />
                    </Tooltip>
                )}
            </Box>
            <Box style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                {/* LABELLED, unlike the five icons beside it, and that inconsistency is deliberate.
                    Those five are conventional glyphs for read-only or reversible actions the user has
                    seen elsewhere in the product. This is the only OUTBOUND WRITE in the cluster, it
                    has no conventional glyph, and nobody has muscle memory for it — icon-only would
                    cost hover, wait, read, click anyway. Default size (no size="small"): the
                    IconButtons here are full height, and a small button in a 2px gap sits visibly off
                    the baseline. marginInlineEnd rather than raising the container gap, which would
                    re-space the five existing icons.

                    HIDDEN on a historical view, exactly as Export is (R3-02 above): a write attributed
                    to the wrong version is strictly worse than the read that gate was added for. The
                    historical route is the per-version icon in the versions dialog, which names its
                    version by construction.

                    DISABLED rather than hidden for a view-only source, because the header already
                    shows the view-only chip — the disabled button finishes an explanation the chip
                    started. The span wrapper + tabIndex keep that tooltip reachable: MUI v4 disabled
                    buttons fire no mouse events and leave the tab order. */}
                {canEditMeta && details?.Status === eDataSourceStatus.READY && !isHistorical && (
                    <Tooltip title={t(isViewOnly ? 'DataSources.addToGroup.disabledNoIdentity' : (activeAlreadyAdded ? 'DataSources.addToGroup.queuedTooltip' : 'DataSources.actions.addToGroup'))} PopperProps={{ style: { direction: isRtl ? 'rtl' : 'ltr' } }}>
                        <span style={{ display: 'inline-flex', marginInlineEnd: 8 }} tabIndex={0}>
                            <Button
                                variant="outlined" color="primary" startIcon={<GroupAdd />}
                                disabled={!!isViewOnly || activeAlreadyAdded}
                                aria-label={t('DataSources.actions.addToGroup')}
                                onClick={() => setDialog({ type: 'addToGroup' })}
                            >
                                {t('DataSources.actions.addToGroup')}
                            </Button>
                        </span>
                    </Tooltip>
                )}
                {/* 🔴 GATED ON `!isHistorical` 2026-08-08 (review R3-02).
                    This header button exports the ACTIVE version. While the screen is showing a
                    HISTORICAL version — grid reloaded, orange banner up, version chip changed — it
                    still exported the active one: a different row count and different content, with
                    nothing in the dialog, the filename or the downloads page naming a version. The
                    file is what a manager forwards to a regulator, so the divergence is discoverable
                    only by someone who already knows the answer.
                    Fail CLOSED rather than guess at export plumbing: on a historical version the
                    button is withheld, and the per-version export that already exists in the
                    versions dialog (`DataSources.versions.exportVersion`) is the correct route —
                    it is the only one that names the version it is exporting. */}
                {canExport && details?.Status === eDataSourceStatus.READY && !isHistorical && (
                    <Tooltip title={t('DataSources.actions.export')} PopperProps={{ style: { direction: isRtl ? 'rtl' : 'ltr' } }}><IconButton aria-label={t('DataSources.actions.export')} onClick={() => setDialog({ type: 'export' })}><GetApp /></IconButton></Tooltip>
                )}
                {canEditMeta && (
                    <Tooltip title={t('DataSources.actions.edit')} PopperProps={{ style: { direction: isRtl ? 'rtl' : 'ltr' } }}><IconButton aria-label={t('DataSources.actions.edit')} onClick={() => setDialog({ type: 'editSource' })}><EditIcon /></IconButton></Tooltip>
                )}
                <Tooltip title={t('DataSources.actions.versions')} PopperProps={{ style: { direction: isRtl ? 'rtl' : 'ltr' } }}><IconButton aria-label={t('DataSources.actions.versions')} onClick={() => setDialog({ type: 'versions' })}><History /></IconButton></Tooltip>
                {details?.Status === eDataSourceStatus.READY && (
                    <Tooltip title={t('DataSources.actions.summary')} PopperProps={{ style: { direction: isRtl ? 'rtl' : 'ltr' } }}><IconButton aria-label={t('DataSources.actions.summary')} onClick={() => openSummary()}><Assessment /></IconButton></Tooltip>
                )}
                {canSend && details?.[EMAIL_IDENTITY_FLAG] && details?.Status === eDataSourceStatus.READY && (
                    <Tooltip title={t('DataSources.goToSend')} PopperProps={{ style: { direction: isRtl ? 'rtl' : 'ltr' } }}><IconButton aria-label={t('DataSources.goToSend')} onClick={() => Redirect({ url: `${sitePrefix}SmartSend?dataSourceId=${details?.DataSourceID}`, openNewTab: false })}><Send style={sendIconStyle} /></IconButton></Tooltip>
                )}
            </Box>
        </Box>
    );

    const renderBody = () => {
        if (!details) return <LinearProgress />;
        if (effectiveStatus === eDataSourceStatus.PENDING || effectiveStatus === eDataSourceStatus.PROCESSING) {
            return (
                <Box style={{ textAlign: 'center', padding: 40 }}>
                    <Typography style={{ marginBottom: 12 }}>{t('DataSources.view.processing')}</Typography>
                    <LinearProgress />
                </Box>
            );
        }
        if (effectiveStatus === eDataSourceStatus.FAIL) {
            return (
                <Alert severity="error" style={{ marginTop: 16 }}
                    action={<Button color="inherit" size="small" onClick={() => Redirect({ url: `${sitePrefix}DataSources`, openNewTab: false })}>{t('DataSources.summary.uploadAgain')}</Button>}>
                    <Typography style={{ fontWeight: 700 }}>{t('DataSources.summary.failTitle')}</Typography>
                    {details.ErrorData && <Typography style={{ fontSize: 13 }}>{details.ErrorData}</Typography>}
                </Alert>
            );
        }
        if (effectiveStatus === eDataSourceStatus.CANCELLED) {
            return (
                <Alert severity="warning" style={{ marginTop: 16 }}>
                    <Typography style={{ fontWeight: 700 }}>{t('DataSources.statuses.4')}</Typography>
                </Alert>
            );
        }
        return (
            <>
                {isHistorical && (
                    <Box style={{ background: '#fff4e5', border: '1px solid #f5d9b0', borderRadius: 8, padding: '8px 12px', margin: '12px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography style={{ color: '#b54708' }}>
                            {t('DataSources.historicalVersionBanner', { n: versions.find(v => v.DataSourceVersionID === viewVersionId)?.VersionNumber ?? '' })}
                            {/* Second sentence, added with the column-edit change: the user can now open
                                a column here and find most of it greyed out. Saying WHICH field is
                                editable and WHY turns a dead control into an understood rule — the name
                                and type describe a send that already went out, searchability does not. */}
                            {' '}
                            {t('DataSources.historicalVersionEditNote')}
                        </Typography>
                        <Button size="small" onClick={backToActive}>{t('DataSources.backToActiveVersion')}</Button>
                    </Box>
                )}
                <FiltersBar
                    classes={classes}
                    columns={rows?.columns ?? columns}
                    filters={filters}
                    onFiltersChange={onFiltersChange}
                    freeText={freeText}
                    onFreeTextChange={setFreeText}
                    onSearch={runSearch}
                />
                <RowsTable
                    classes={classes}
                    columns={rows?.columns ?? columns}
                    rows={rows?.items ?? []}
                    loading={rowsStatus === 'loading'}
                    /* WAS `!!isHistorical || !canEditMeta`.
                       `readOnly` is consumed in exactly one place (RowsTable): it decides whether a
                       header cell is CLICKABLE and shows the pencil. So on a historical version it did
                       not "lock the fields" — it removed the only door to them, and IsSearchable went
                       with them even though searchability is a decision about today, not a description
                       of a send that already happened.
                       The lock now lives where the fields are (EditColumnDialog.restrictedToSearchable),
                       which is the only place that can distinguish between them. readOnly keeps its
                       original, narrower meaning: no permission to open the editor at all. Widening it
                       to anything else would unlock more than intended, because the flag is a door and
                       not a per-field rule. */
                    readOnly={!canEditMeta}
                    onColumnClick={openColumnEdit}
                />
                <TablePagination
                    component="div"
                    count={rows?.total ?? 0}
                    page={Math.max(0, page - 1)}
                    onPageChange={changePage}
                    rowsPerPage={ROWS_PAGE_SIZE}
                    rowsPerPageOptions={[ROWS_PAGE_SIZE]}
                    onRowsPerPageChange={() => { /* fixed page size for the content grid */ }}
                    SelectProps={{ MenuProps: { PaperProps: { dir: isRtl ? 'rtl' : 'ltr' } } }}
                />
            </>
        );
    };

    return (
        <DefaultScreen currentPage="groups" subPage="dataSources" classes={classes} containerClass={clsx(classes.management, classes.mb50)}>
            <Box className={classes.mb50}>
                {renderHeader()}
                {renderBody()}

                <EditColumnDialog
                    classes={classes}
                    open={dialog?.type === 'column'}
                    column={dialog?.type === 'column' ? dialog.data : null}
                    searchableRemaining={searchableRemaining}
                    maxSearchable={maxSearchable}
                    detection={dialog?.type === 'column' ? detectionFor(dialog.data) : null}
                    restrictedToSearchable={!!isHistorical}
                    onClose={() => setDialog(null)}
                    onSaved={onColumnSaved}
                />
                <VersionsHistoryDialog
                    classes={classes}
                    open={dialog?.type === 'versions'}
                    versions={versions}
                    activeVersionId={details?.ActiveVersionID ?? null}
                    onClose={() => setDialog(null)}
                    onViewVersion={openVersion}
                    onExportVersion={(vid, totalRows) => setDialog({ type: 'export', data: { versionId: vid, totalRows } })}
                    onShowSummary={(v) => openSummary(v)}
                    /* Closes the versions dialog before opening this one — two stacked MUI dialogs
                       leave the lower one's backdrop and focus trap in play, and the user cannot reach
                       the Autocomplete underneath it. The version id is carried explicitly, which is
                       what makes this the safe route for a historical version. */
                    onAddToGroupVersion={(vid) => setDialog({ type: 'addToGroup', data: { versionId: vid } })}
                    canView={canEditMeta}
                    canExport={canExport}
                    canAddToGroup={canEditMeta && !isViewOnly}
                />
                {/* Both entry points funnel here. `data.versionId` is set by the versions-dialog
                    route (a historical version, named explicitly); its absence means the header route,
                    which is only rendered on the active view — so viewedVersionId is right for both and
                    the version is never inferred server-side. Counts come from the matching version
                    record rather than from `details`, which always describes the ACTIVE version. */}
                {(() => {
                    const dVid: number | null = dialog?.type === 'addToGroup' ? (dialog.data?.versionId ?? viewedVersionId) : viewedVersionId;
                    const v = dVid != null ? (versions.find(x => x.DataSourceVersionID === dVid) ?? null) : null;
                    return (
                        <AddToGroupDialog
                            classes={classes}
                            open={dialog?.type === 'addToGroup'}
                            dataSource={details ? { ID: details.DataSourceID, Name: details.Name } : null}
                            versionId={dVid}
                            versionNumber={v ? v.VersionNumber : viewedVersionNumber}
                            totalRows={v ? v.TotalRows : (details?.TotalRows ?? null)}
                            resolvedEmail={v ? v.ResolvedRowsEmail : (details?.ResolvedRowsEmail ?? 0)}
                            resolvedCell={v ? v.ResolvedRowsCell : (details?.ResolvedRowsCell ?? 0)}
                            onClose={() => setDialog(null)}
                            onAdded={() => { if (dVid != null) setAddedVersionIds(ids => (ids.indexOf(dVid) === -1 ? [...ids, dVid] : ids)); }}
                            setToastMessage={setToastMessage}
                        />
                    );
                })()}
                <ExportDialog
                    classes={classes}
                    open={dialog?.type === 'export'}
                    dataSource={details ? { ID: details.DataSourceID, Name: details.Name } : null}
                    versionId={dialog?.type === 'export' ? (dialog.data?.versionId ?? null) : null}
                    totalRows={dialog?.type === 'export' && dialog.data?.totalRows != null ? dialog.data.totalRows : (details?.TotalRows ?? 0)}
                    onClose={() => setDialog(null)}
                    setToastMessage={setToastMessage}
                />
                {/* [CFT] `columns` is the ACTIVE version's column list, from the same getDataSource
                    response that produced `details` — so the mappings shown always belong to the
                    version whose figures are shown beside them. */}
                <DataSourceSummary classes={classes} open={dialog?.type === 'summary'} details={summaryDetails} columns={columns} extraFieldOptions={accountExtraFields} onClose={() => setDialog(null)} />
                <EditDataSourceDialog
                    classes={classes}
                    open={dialog?.type === 'editSource'}
                    source={details ? { ID: details.DataSourceID, Name: details.Name, Description: details.Description } : null}
                    onClose={() => setDialog(null)}
                    onSaved={onEditSaved}
                />

                {toastMessage && <Toast data={toastMessage} />}
            </Box>
        </DefaultScreen>
    );
};

export default DataSourceView;
