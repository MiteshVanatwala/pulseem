import { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import DefaultScreen from '../DefaultScreen';
import clsx from 'clsx';
import {
    Box, Button, TextField, InputAdornment, IconButton, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, TablePagination, Typography, Tooltip, Chip, Card, CardContent, Dialog,
    DialogTitle, DialogContent, DialogActions, Tabs, Tab
} from '@material-ui/core';
import {
    Visibility, GetApp, Edit as EditIcon, History, Assessment, Delete as DeleteIcon, Send, Search, Add
} from '@material-ui/icons';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import { Title } from '../../components/managment/Title';
import { Loader } from '../../components/Loader/Loader';
import Toast from '../../components/Toast/Toast.component';
import { ClassesType } from '../Classes.types';
import { ERROR_TYPE } from '../../helpers/Types/common';
import { DateFormats } from '../../helpers/Constants';
import { RenderHtml } from '../../helpers/Utils/HtmlUtils';
import { SetPageState, GetPageNyName } from '../../helpers/UI/SessionStorageManager';
import useRedirect from '../../helpers/Routes/Redirect';
import { PulseemFeatures } from '../../model/PulseemFields/Fields';
import { sitePrefix } from '../../config';
import {
    getDataSources, getDataSource, deleteDataSource
} from '../../redux/reducers/dataSourcesSlice';
import { GetExtraFields } from '../../redux/reducers/ExtraFieldsSlice';
import {
    DataSourceListItem, DataSourceDetails, DataSourceVersion, DataSourceColumn, eDataSourceStatus,
    ClientFieldOption, buildAccountExtraFieldOptions
} from '../../Models/DataSources/DataSource';
import { getChannelDescriptor, eSendChannel } from '../../Models/DataSources/SmartSend';
import StatusChip from './components/StatusChip';
import EditDataSourceDialog from './components/EditDataSourceDialog';
import UploadWizardDialog from './components/UploadWizardDialog';
import DataSourceSummary from './components/DataSourceSummary';
import ExportDialog from './components/ExportDialog';
import VersionsHistoryDialog from './components/VersionsHistoryDialog';
import { useDsDialogStyles } from './components/dialogStyles';
import SmartSendManageTab from './SmartSendManageTab';
// Third tab — חיפוש סוכנים ומפקחים. The SAME component the standalone /SendSearch route renders,
// so the two entry points cannot drift apart (see SendSearchPanel.tsx's header).
import SendSearchPanel from '../SendSearch/SendSearchPanel';

const PAGE_NAME = 'DataSources';
const POLL_MS = 4000;
const ROWS_OPTIONS = [6, 10, 20, 50];
// EMAIL is the only wired Smart Send channel in v1, and the mapping screen's SourcePicker accepts a
// source only when it carries THAT channel's identity flag (`canSend` there = it[identityFlag]).
// "Not view-only" is a weaker test — a cell-only source passes it, so offering Smart Send on that
// basis routed the user to a screen that silently dropped the ?dataSourceId. Read the flag NAME
// from the descriptor (never a hardcoded field) so this entry gate cannot drift from that one.
const EMAIL_IDENTITY_FLAG = getChannelDescriptor(eSendChannel.EMAIL).identityFlag;
// Action-strip sizing, shared with the versions-history dialog's action column (design feedback: the 7
// icons read as one smudge, and were asked to grow). NOTE: `fontSize="small"` is NOT 16px here — MUI v4
// resolves it to pxToRem(20), and this theme's coef is 1 (typography.fontSize 14 / 14), so it renders at
// exactly 20px. Pinning 20 would therefore have changed nothing; 22 is the actual step up. Breathing room
// comes from the 6px gap plus the 6px IconButton padding (hit target 26px → 34px, without `size="small"`
// jumping to MUI's 48px default). Keep this in lockstep with the versions dialog so both read as one system.
const ACTION_ICON_STYLE = { fontSize: 22 };
const ACTION_BTN_STYLE = { padding: 6 };
// MUI v4 Tab labels are 0.875rem — a step small against this page's header.
const TAB_LABEL_STYLE = { fontSize: 16, fontWeight: 600 };

const DataSources = ({ classes }: ClassesType) => {
    const { t, i18n } = useTranslation();
    const dispatch = useDispatch();
    const Redirect = useRedirect();
    const dsDialog = useDsDialogStyles();
    const { windowSize, rowsPerPage, userRoles } = useSelector((s: any) => s.core);
    const { accountFeatures } = useSelector((s: any) => s.common);
    const { list, listStatus, ToastMessages } = useSelector((s: any) => s.dataSources);

    const restored = GetPageNyName(PAGE_NAME);
    // The shared 'rowsPerPage' cookie may hold a value other screens use (e.g. 12/18/100) that isn't in
    // ROWS_OPTIONS — clamp so MUI TablePagination never gets an out-of-range value.
    const restoredSize = restored?.SearchData?.PageSize;
    const initialPageSize = ROWS_OPTIONS.indexOf(restoredSize) > -1 ? restoredSize
        : (ROWS_OPTIONS.indexOf(rowsPerPage) > -1 ? rowsPerPage : 6);
    const [searchData, setSearchData] = useState({
        PageIndex: restored?.PageNumber ?? 1,
        PageSize: initialPageSize,
        SearchTerm: restored?.SearchData?.SearchTerm ?? ''
    });
    const [searchInput, setSearchInput] = useState(searchData.SearchTerm);
    const [wizardOpen, setWizardOpen] = useState(false);
    const [dialog, setDialog] = useState<{ type: string; data?: any } | null>(null);
    const [summaryDetails, setSummaryDetails] = useState<DataSourceDetails | null>(null);
    // [CFT] The same response's columns, kept beside the details they belong to so the summary can
    // list the requested client-field write-backs. Held as its own state rather than read from the
    // `current` slice: this screen never populates `current` (only DataSourceView does), and the two
    // must come from ONE response or the dialog could pair version N's mappings with version M's
    // figures.
    const [summaryColumns, setSummaryColumns] = useState<DataSourceColumn[]>([]);
    const [versionsData, setVersionsData] = useState<{ dataSourceId: number | null; versions: DataSourceVersion[]; activeVersionId: number | null }>({ dataSourceId: null, versions: [], activeVersionId: null });
    const [toastMessage, setToastMessage] = useState<ERROR_TYPE>(null);
    const [loading, setLoading] = useState(false);
    // Which tab is showing is NOT state — it is derived from ?tab= in the TABS block below, which has
    // to sit after `canSend`. The sources tab keeps its own PAGE_NAME/search/polling unchanged; the
    // Smart Send management tab owns its own state (PAGE_NAME_SS='DataSourcesSmartSend') inside SmartSendManageTab.
    /* The account's named ExtraField/ExtraDate slots, for the upload wizard's client-field write-back
       picker. Fetched here rather than inside the wizard so it is loaded once per screen instead of
       on every open, and so the wizard stays a pure presentational component with the catalogue
       injected. Empty array = this account named no slots, which is a legitimate steady state — the
       wizard then shows the ten fixed recipient fields exactly as before. */
    const [accountExtraFields, setAccountExtraFields] = useState<ClientFieldOption[]>([]);

    const pollingRef = useRef<any>(null);
    const prevStatusesRef = useRef<Map<number, number>>(new Map());
    // Live "is any modal open" flag for the polling closure (whose deps don't include dialog/wizardOpen),
    // so a background poll never force-replaces a dialog the user opened.
    const anyModalOpenRef = useRef(false);

    const canUpload = !userRoles?.HideRecipients;
    const canDelete = !!userRoles?.AllowDelete;
    // HideRecipietns hides recipient PII → also hide viewing row content + exporting (the server enforces 405).
    const canViewRecipients = !userRoles?.HideRecipients;
    const canExport = !!userRoles?.AllowExport && canViewRecipients;
    // Mirrors the server's AllowSend gate on every Smart Send action (SetMapping/FillAndSummarize/Send),
    // so a user who cannot send never reaches a screen where every action 405s after the mapping work.
    const canSend = !!userRoles?.AllowSend;

    /* ── Tabs: ONE registry, three consumers ─────────────────────────────────────────────────────
       Which <Tab> renders, which ?tab= values are legal, and which panel shows — all three read from
       THIS array. Deriving them from one source is what makes the permission gate and the deep link
       structurally incapable of disagreeing; two separate lists fail as a ?tab= value that is legal
       but selects no tab, which MUI renders as a strip with nothing highlighted.

       The Smart Send entry is SPREAD in, never written as `{canSend && <Tab/>}` — MUI v4's <Tabs>
       maps over its children and would be handed a literal `false`.

       WHY canSend GATES THE MIDDLE TAB — this is a fix, not a refactor: SmartSendManageTab carries no
       permission check of its own, and its "עריכה" action navigates to Campaigns/SmartSend/:id, a route
       App.js registers ONLY when userRoles.AllowSend. Before this gate, a sub-user without send
       permission saw the full mapping list and hit the bare 404 catch-all on the first click.

       WHY canViewRecipients GATES THE THIRD TAB — it renders the very same SendSearchPanel that the
       /SendSearch route renders, and that route plus its sidebar entry are both gated on
       !HideRecipients because SendSearchController answers Search with 405 for that permission. The
       panel fetches on mount and carries no gate of its own, so an ungated tab left the exact dead
       surface those two gates exist to remove sitting one click inside this page — and, once ?tab=
       became a legal deep link, bookmarkable too. All three surfaces now read the same permission. */
    const TABS = useMemo(() => [
        { value: 'sources', label: t('DataSources.send.manage.tabSources') },
        ...(canSend ? [{ value: 'smartsend', label: t('DataSources.send.manage.tabSmartSend') }] : []),
        ...(canViewRecipients ? [{ value: 'sendsearch', label: t('DataSources.send.manage.tabSendSearch') }] : []),
    ], [canSend, canViewRecipients, t]);

    /* activeTab is derived from the URL rather than held in state — that single choice is what buys
       refresh, browser Back and a shareable link with no syncing code to get out of step. A value
       that is unknown, or legal for someone else but not for this user, falls back to 'sources':
       before this the render ternary's default branch meant ANY unrecognised ?tab= showed the send
       report. `sources` clears the param instead of writing ?tab=sources, so the default tab keeps
       the bare /DataSources URL every existing link and bookmark already uses. */
    const [searchParams, setSearchParams] = useSearchParams();
    const requestedTab = searchParams.get('tab');
    const activeTab = TABS.some(x => x.value === requestedTab) ? (requestedTab as string) : 'sources';
    const selectTab = (value: string) => {
        // Re-clicking the tab you are already on must not push an identical entry: the screen would
        // not change, so the only visible effect would be a Back press that appears to do nothing.
        // Guarded here rather than in the onChange arrow so any future caller is covered too.
        if (value === activeTab) return;
        const next = new URLSearchParams(searchParams);
        if (value === 'sources') next.delete('tab'); else next.set('tab', value);
        // Push, not replace: Back stepping through the tabs is the behaviour being added here.
        setSearchParams(next);
    };

    // The Send glyph is a paper-plane pointing forward-in-LTR; in an RTL UI "forward" is leftward, so
    // mirror it horizontally (scaleX, NOT rotate — rotate would flip it upside-down).
    const isRtl = (i18n.dir?.() ?? 'rtl') === 'rtl';
    const sendIconStyle = isRtl ? { transform: 'scaleX(-1)' } : undefined;

    /* Every floating layer MUI renders — Tooltip, and the rows-per-page Menu behind TablePagination —
       is portalled to document.body, outside App.js's <div dir={isRTL}>. <html dir> is stuck at "ltr"
       app-wide (App.js sets it in a mount-only effect that runs before i18n leaves its 'en' default),
       and neither theme.direction nor jss-rtl emits a `direction` of its own. So each portal has to
       carry its own. */
    const rtlPopperProps = { style: { direction: isRtl ? 'rtl' : 'ltr' } as any };
    const rtlMenuSelectProps = { MenuProps: { PaperProps: { dir: isRtl ? 'rtl' : 'ltr' } } };

    const items: DataSourceListItem[] = list?.items ?? [];
    const total: number = list?.total ?? 0;

    // ── third gating layer (redirect out only once features have actually loaded) ──
    useEffect(() => {
        if (accountFeatures?.length && accountFeatures.indexOf(PulseemFeatures.DATA_SOURCES) === -1)
            Redirect({ url: sitePrefix ?? '', openNewTab: false });
    }, [accountFeatures]);

    /* ── the account's extra-field labels, for the upload wizard's write-back picker ──
       ⚠ DEPLOY ORDER. This is the ONLY thing that exposes ClientFieldTarget ids 101-113 / 201-204
       in the UI. dbo.DataSources_ResolveVersionClients writes back only ids 1..10 until its phase-B
       body is deployed (_delivery\ClientFieldWriteBack-PhaseB\ in the project tree); its own comment
       says "Ids outside 1..10 are ignored here, so mapping one today is inert". Everything upstream
       accepts them — the API range-checks 1..204 and the FK to LU_DataSourceClientField is seeded —
       so WITHOUT phase B an operator maps a column, the upload reports success, and nothing is ever
       written. Do not ship this file ahead of that SP.

       Fetched once on mount, not on wizard open: the payload is 17 short strings, and the picker has
       to be populated the moment the wizard renders. StatusCode 201 is this API's success code (same
       check as Settings/ExtraFields.tsx).
       A failure is deliberately non-fatal and deliberately silent: the catalogue falls back to the
       ten fixed recipient fields and the upload still works, which beats blocking an operator who
       was not going to map an extra field anyway. The accepted cost is that a transient 500 looks
       exactly like "this account named no slots" — both render no extra-field group — so a support
       report of "the extra fields vanished" is a page reload before it is a bug. */
    useEffect(() => {
        let cancelled = false;
        (async () => {
            const response = await dispatch(GetExtraFields()) as any;
            if (cancelled) return;
            if (response?.payload?.StatusCode === 201)
                setAccountExtraFields(buildAccountExtraFieldOptions(response.payload?.Data));
        })();
        return () => { cancelled = true; };
    }, []);

    // ── load on searchData change + persist page state ──
    useEffect(() => {
        loadList();
        SetPageState({
            PageName: PAGE_NAME,
            PageNumber: searchData.PageIndex,
            SearchData: { SearchTerm: searchData.SearchTerm, PageSize: searchData.PageSize },
            SearchTerm: searchData.SearchTerm,
            IsDynamic: false
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchData]);

    const loadList = async () => {
        setLoading(true);
        const res: any = await dispatch(getDataSources({ ...searchData }));
        setLoading(false);
        // A restored page index can exceed the current page count (data shrank) → empty page while data
        // exists on earlier pages, and the empty-state hides pagination. Recover by snapping back to page 1.
        const data = res?.payload?.Data;
        if (data && (data.items?.length ?? 0) === 0 && (data.total ?? 0) > 0 && searchData.PageIndex > 1) {
            setSearchData(s => ({ ...s, PageIndex: 1 }));
        }
    };

    // ── silent polling while any source is pending/processing (no flicker, no interval leak) ──
    const hasInFlight = items.some(i => i.Status === eDataSourceStatus.PENDING || i.Status === eDataSourceStatus.PROCESSING);
    useEffect(() => {
        if (hasInFlight && activeTab === 'sources' && !pollingRef.current) {
            pollingRef.current = setInterval(async () => {
                const res: any = await dispatch(getDataSources({ ...searchData, silent: true }));
                const polled: DataSourceListItem[] = res?.payload?.Data?.items ?? [];
                polled.forEach((i) => {
                    const prev = prevStatusesRef.current.get(i.DataSourceID);
                    if (prev === eDataSourceStatus.PROCESSING && i.Status === eDataSourceStatus.READY) {
                        setToastMessage({ ...ToastMessages.SOURCE_READY });
                        // Never steal focus from a dialog the user has open (would discard unsaved edits).
                        if (!anyModalOpenRef.current) openSummary(i.DataSourceID);
                    }
                    if (prev === eDataSourceStatus.PROCESSING && i.Status === eDataSourceStatus.FAIL) {
                        setToastMessage({ ...ToastMessages.SOURCE_FAILED });
                    }
                    prevStatusesRef.current.set(i.DataSourceID, i.Status);
                });
            }, POLL_MS);
        }
        // Pause the poll on the other tab too: stop when nothing is in-flight OR the Smart Send tab is active.
        if ((!hasInFlight || activeTab !== 'sources') && pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
        }
        // seed the status map on each render so the first poll has a baseline
        items.forEach(i => {
            if (!prevStatusesRef.current.has(i.DataSourceID)) prevStatusesRef.current.set(i.DataSourceID, i.Status);
        });
        return () => {
            if (pollingRef.current) { clearInterval(pollingRef.current); pollingRef.current = null; }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hasInFlight, searchData, activeTab]);

    // ── handlers ──
    const doSearch = () => setSearchData(s => ({ ...s, SearchTerm: searchInput.trim(), PageIndex: 1 }));
    const clearSearch = () => { setSearchInput(''); setSearchData(s => ({ ...s, SearchTerm: '', PageIndex: 1 })); };
    const changePage = (_: any, page: number) => setSearchData(s => ({ ...s, PageIndex: page + 1 }));
    const changeRows = (e: any) => setSearchData(s => ({ ...s, PageSize: parseInt(e.target.value, 10), PageIndex: 1 }));

    const goToView = (id: number) => Redirect({ url: `${sitePrefix}DataSources/View/${id}`, openNewTab: false });
    const goToSend = (id: number) => Redirect({ url: `${sitePrefix}SmartSend?dataSourceId=${id}`, openNewTab: false });

    const openSummary = async (id: number) => {
        const res: any = await dispatch(getDataSource(id));
        if (res?.payload?.StatusCode === 200) {
            setSummaryDetails(res.payload.Data.details);
            // [CFT] Same response, same version — see the state declaration. `?? []` because a source
            // whose first version has not completed has no active version, and Get RS2 is then empty.
            setSummaryColumns(res.payload.Data.columns ?? []);
            setDialog({ type: 'summary' });
        }
    };

    const openVersions = async (id: number) => {
        const res: any = await dispatch(getDataSource(id));
        if (res?.payload?.StatusCode === 200) {
            setVersionsData({ dataSourceId: id, versions: res.payload.Data.versions ?? [], activeVersionId: res.payload.Data.details?.ActiveVersionID ?? null });
            setDialog({ type: 'versions' });
        }
    };

    const confirmDelete = async () => {
        const row: DataSourceListItem = dialog?.data;
        if (!row) return;
        const res: any = await dispatch(deleteDataSource(row.DataSourceID));
        const payload = res?.payload;
        if (payload?.StatusCode === 200) {
            setDialog(null);
            setToastMessage({ ...ToastMessages.SOURCE_DELETED });
            // last row on a non-first page → step back a page, else refresh in place
            if (items.length === 1 && searchData.PageIndex > 1) setSearchData(s => ({ ...s, PageIndex: s.PageIndex - 1 }));
            else loadList();
        } else if (payload?.StatusCode === 409 && payload?.Message === 'LOCKED_BY_CAMPAIGNS') {
            setDialog({ type: 'deleteBlocked', data: payload.Data?.campaigns ?? [] });
        } else {
            setDialog(null);
            setToastMessage({ ...ToastMessages.GENERAL_ERROR });
        }
    };

    const onEditSaved = () => {
        setDialog(null);
        setToastMessage({ ...ToastMessages.SOURCE_UPDATED });
        loadList();
    };

    const onUploaded = () => {
        setWizardOpen(false);
        setToastMessage({ ...ToastMessages.SOURCE_CREATED });
        setSearchData(s => ({ ...s, PageIndex: 1 }));
    };

    // Auto-dismiss the toast from an effect (one timer per toast) — not from render, where the 4s poll's
    // re-renders would schedule redundant timers and clear a newer toast early.
    useEffect(() => {
        if (!toastMessage) return;
        const id = setTimeout(() => setToastMessage(null), 4000);
        return () => clearTimeout(id);
    }, [toastMessage]);

    useEffect(() => { anyModalOpenRef.current = !!dialog || wizardOpen; }, [dialog, wizardOpen]);

    // ── row rendering ──
    const rowStyle = { head: classes.tableRowHead, root: classes.tableRowRoot };
    const cellStyle = { head: classes.tableCellHead, body: classes.tableCellBody, root: classes.tableCellRoot };

    const isViewOnly = (row: DataSourceListItem) => !row.HasEmailIdentity && !row.HasCellIdentity;

    const renderActions = (row: DataSourceListItem) => {
        const canViewContent = row.Status === eDataSourceStatus.READY || row.Status === eDataSourceStatus.PROCESSING || row.Status === eDataSourceStatus.PENDING;
        /* [VW] The view screen renders the ACTIVE version, and a version only becomes active when the
           worker completes it (DataSources_CompleteVersion, under Status = 2). While the newest version
           is still being processed there are only two possible outcomes and neither is worth a click:
           on a FIRST upload there is no active version at all, so DataSources_Get RS1 returns a NULL
           status that the API maps to 0 and the screen renders an indeterminate progress bar it never
           refreshes — the hang this fixes; on a RE-upload the screen silently shows the PREVIOUS
           version's rows with nothing saying so, which is worse than an honest "not yet".
           So: rendered but disabled until the newest version is READY. The icon keeps its slot (a
           conditional render would make a six-icon row jump), and the 4s poll below already re-fetches
           status while anything is in flight, so it re-enables itself within one tick of the worker
           finishing — no reload, no dead button.
           The <span> is required: MUI v4 disabled buttons fire no mouse events, so without it the
           Tooltip that explains the disabled state disappears exactly when it is needed. */
        const viewNotReady = row.Status !== eDataSourceStatus.READY;
        return (
            <Box style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
                {canViewRecipients && canViewContent && (
                    <Tooltip title={t(viewNotReady ? 'DataSources.actions.viewWhileProcessing' : 'DataSources.actions.view')} PopperProps={rtlPopperProps}>
                        <span style={{ display: 'inline-flex' }}>
                            <IconButton size="small" style={ACTION_BTN_STYLE} disabled={viewNotReady} aria-label={t('DataSources.actions.view')} onClick={() => goToView(row.DataSourceID)}><Visibility fontSize="small" style={ACTION_ICON_STYLE} /></IconButton>
                        </span>
                    </Tooltip>
                )}
                {canExport && row.Status === eDataSourceStatus.READY && (
                    <Tooltip title={t('DataSources.actions.export')} PopperProps={rtlPopperProps}>
                        <IconButton size="small" style={ACTION_BTN_STYLE} aria-label={t('DataSources.actions.export')} onClick={() => setDialog({ type: 'export', data: row })}><GetApp fontSize="small" style={ACTION_ICON_STYLE} /></IconButton>
                    </Tooltip>
                )}
                {canUpload && (
                    <Tooltip title={t('DataSources.actions.edit')} PopperProps={rtlPopperProps}>
                        <IconButton size="small" style={ACTION_BTN_STYLE} aria-label={t('DataSources.actions.edit')} onClick={() => setDialog({ type: 'edit', data: row })}><EditIcon fontSize="small" style={ACTION_ICON_STYLE} /></IconButton>
                    </Tooltip>
                )}
                <Tooltip title={t('DataSources.actions.versions')} PopperProps={rtlPopperProps}>
                    <IconButton size="small" style={ACTION_BTN_STYLE} aria-label={t('DataSources.actions.versions')} onClick={() => openVersions(row.DataSourceID)}><History fontSize="small" style={ACTION_ICON_STYLE} /></IconButton>
                </Tooltip>
                {row.Status === eDataSourceStatus.READY && (
                    <Tooltip title={t('DataSources.actions.summary')} PopperProps={rtlPopperProps}>
                        <IconButton size="small" style={ACTION_BTN_STYLE} aria-label={t('DataSources.actions.summary')} onClick={() => openSummary(row.DataSourceID)}><Assessment fontSize="small" style={ACTION_ICON_STYLE} /></IconButton>
                    </Tooltip>
                )}
                {canDelete && (
                    <Tooltip title={t('DataSources.actions.delete')} PopperProps={rtlPopperProps}>
                        <IconButton size="small" style={ACTION_BTN_STYLE} aria-label={t('DataSources.actions.delete')} onClick={() => setDialog({ type: 'delete', data: row })}><DeleteIcon fontSize="small" style={ACTION_ICON_STYLE} /></IconButton>
                    </Tooltip>
                )}
                {canSend && row[EMAIL_IDENTITY_FLAG] && row.Status === eDataSourceStatus.READY && (
                    <Tooltip title={t('DataSources.goToSend')} PopperProps={rtlPopperProps}>
                        <IconButton size="small" style={ACTION_BTN_STYLE} aria-label={t('DataSources.goToSend')} onClick={() => goToSend(row.DataSourceID)}><Send fontSize="small" style={{ ...ACTION_ICON_STYLE, ...sendIconStyle }} /></IconButton>
                    </Tooltip>
                )}
            </Box>
        );
    };

    const renderNameCell = (row: DataSourceListItem) => (
        <Box>
            <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <Typography style={{ fontWeight: 600 }}>{row.Name}</Typography>
                {isViewOnly(row) && (
                    <Tooltip title={t('DataSources.viewOnlyTooltip')} PopperProps={rtlPopperProps}>
                        <Chip size="small" label={t('DataSources.viewOnlyBadge')} style={{ background: '#f1ebfb', color: '#6941c6' }} />
                    </Tooltip>
                )}
            </Box>
            <Typography style={{ fontSize: 12, color: '#5b6b7b' }}>
                {/* LastUploadDate, NOT CreatedDate. DataSources_GetMany:62 projects
                    `LastUploadDate = v.CreatedDate` from the ACTIVE VERSION (the OUTER APPLY at :78-87,
                    TOP 1 ORDER BY VersionNumber DESC), while :38 `ds.CreatedDate` is the SOURCE row and
                    never moves — DataSources_Insert contains no UPDATE of dbo.DataSources at all, so a
                    re-upload leaves it frozen at V1. The label promises the upload event in all three
                    locales ("הועלה ע\"י X בתאריך Y" / "Uploaded by X on Y"), and `name` is already
                    v.UploadedBy from :61, so pairing it with the source date put two different events in
                    one sentence. `??` and not `||`: the OUTER APPLY yields NULL for a source with no
                    version row (the SP handles that case at :46), and bare moment(undefined) renders NOW
                    — a silently plausible wrong timestamp — while moment(null) renders "Invalid date". */}
                {RenderHtml(t('DataSources.table.uploadedBy', { name: row.UploadedBy, date: moment(row.LastUploadDate ?? row.CreatedDate).format(DateFormats.DATE_TIME_24) }))}
            </Typography>
        </Box>
    );

    const renderRow = (row: DataSourceListItem) => (
        <TableRow key={row.DataSourceID} classes={rowStyle}>
            <TableCell classes={cellStyle} align="center" className={clsx(classes.flex3)}>{renderNameCell(row)}</TableCell>
            <TableCell classes={cellStyle} align="center" className={clsx(classes.flex2)}>{row.Description}</TableCell>
            <TableCell classes={cellStyle} align="center" className={clsx(classes.flex2)}>
                {/* createdDate feeds StatusChip's 2h "processing delayed" threshold, which falls back to it
                    while RunDateStart is null. A new version is born with RunDateStart NULL — it is stamped
                    at claim by DataSourceProcessQueue_SelectManyAndUpdateStatus, and DataSources_Insert never
                    writes it — so passing the SOURCE's CreatedDate made every re-upload of a source older
                    than 2h read "העיבוד מתעכב" the instant it was queued. LastUploadDate is the version's
                    own upload time, so the threshold now measures the queue wait it was meant to measure.
                    A genuinely stalled run is unaffected: it has a RunDateStart, which still wins the ||. */}
                <StatusChip status={row.Status} progress={row.ProgressPercent} runDateStart={row.RunDateStart} createdDate={row.LastUploadDate ?? row.CreatedDate} t={t} align="center" />
            </TableCell>
            <TableCell classes={cellStyle} align="center" className={clsx(classes.flex1)} style={{ direction: 'ltr' }}>
                {row.TotalRows !== null && row.TotalRows !== undefined ? row.TotalRows.toLocaleString() : '—'}
            </TableCell>
            <TableCell classes={cellStyle} align="center" className={clsx(classes.flex1)} style={{ direction: 'ltr' }}>{`V${row.VersionNumber}`}</TableCell>
            <TableCell classes={cellStyle} align="center" className={clsx(classes.flex3, classes.noBorderOnLastCell)}>{renderActions(row)}</TableCell>
        </TableRow>
    );

    const renderPhoneRow = (row: DataSourceListItem) => (
        <TableRow key={row.DataSourceID} classes={rowStyle}>
            <TableCell classes={cellStyle} align="right" style={{ display: 'block' }}>
                <Card variant="outlined" style={{ marginBottom: 8 }}>
                    <CardContent>
                        {renderNameCell(row)}
                        <Box style={{ marginTop: 8 }}>
                            {/* Same fix as the desktop row above — the mobile card is a second call site of
                                the identical defect and has to move with it. */}
                            <StatusChip status={row.Status} progress={row.ProgressPercent} runDateStart={row.RunDateStart} createdDate={row.LastUploadDate ?? row.CreatedDate} t={t} align="center" />
                        </Box>
                        <Box style={{ marginTop: 8 }}>{renderActions(row)}</Box>
                    </CardContent>
                </Card>
            </TableCell>
        </TableRow>
    );

    const renderTableHead = () => (
        <TableHead>
            <TableRow classes={rowStyle}>
                <TableCell classes={cellStyle} className={clsx(classes.flex3)} align="center">{t('DataSources.table.name')}</TableCell>
                <TableCell classes={cellStyle} className={clsx(classes.flex2)} align="center">{t('DataSources.table.description')}</TableCell>
                <TableCell classes={cellStyle} className={clsx(classes.flex2)} align="center">{t('DataSources.table.status')}</TableCell>
                <TableCell classes={cellStyle} className={clsx(classes.flex1)} align="center">{t('DataSources.table.rows')}</TableCell>
                <TableCell classes={cellStyle} className={clsx(classes.flex1)} align="center">{t('DataSources.table.version')}</TableCell>
                <TableCell classes={cellStyle} className={clsx(classes.flex3, classes.noBorderOnLastCell)} align="center">{t('DataSources.table.actions')}</TableCell>
            </TableRow>
        </TableHead>
    );

    const renderEmptyState = () => {
        const searching = !!searchData.SearchTerm;
        return (
            <Box style={{ textAlign: 'center', padding: '48px 16px', color: '#5b6b7b' }}>
                {searching ? (
                    <>
                        <Typography style={{ fontSize: 18, fontWeight: 600 }}>{t('DataSources.emptyState.noResults')}</Typography>
                        <Button onClick={clearSearch} style={{ marginTop: 12 }}>{t('DataSources.clearSearch')}</Button>
                    </>
                ) : (
                    <>
                        <Typography style={{ fontSize: 20, fontWeight: 700 }}>{t('DataSources.emptyState.title')}</Typography>
                        <Typography style={{ marginTop: 8 }}>{t('DataSources.emptyState.subtitle')}</Typography>
                        {canUpload && (
                            <Button variant="contained" color="primary" startIcon={<Add />} style={{ marginTop: 16 }} onClick={() => setWizardOpen(true)}>
                                {t('DataSources.emptyState.cta')}
                            </Button>
                        )}
                    </>
                )}
            </Box>
        );
    };

    const renderTable = () => {
        // `list` stays null until the first GetMany resolves — avoids flashing the empty state on mount.
        if (list && !loading && items.length === 0) return renderEmptyState();
        return (
            <>
                <TableContainer className={classes.tableStyle}>
                    <Table className={classes.tableContainer}>
                        {windowSize !== 'xs' && renderTableHead()}
                        <TableBody>
                            {items.map(windowSize === 'xs' ? renderPhoneRow : renderRow)}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    component="div"
                    count={total}
                    page={Math.max(0, searchData.PageIndex - 1)}
                    onPageChange={changePage}
                    rowsPerPage={searchData.PageSize}
                    onRowsPerPageChange={changeRows}
                    rowsPerPageOptions={ROWS_OPTIONS}
                    SelectProps={rtlMenuSelectProps}
                />
            </>
        );
    };

    const renderDialogs = () => (
        <>
            <UploadWizardDialog classes={classes} open={wizardOpen} onClose={() => setWizardOpen(false)} onUploaded={onUploaded} setToastMessage={setToastMessage} existingSources={items.map(i => ({ Name: i.Name, VersionNumber: i.VersionNumber, Description: i.Description }))} accountExtraFields={accountExtraFields} />
            <EditDataSourceDialog
                classes={classes}
                open={dialog?.type === 'edit'}
                source={dialog?.type === 'edit' ? { ID: dialog.data.DataSourceID, Name: dialog.data.Name, Description: dialog.data.Description } : null}
                onClose={() => setDialog(null)}
                onSaved={onEditSaved}
            />
            {/* [CFT] accountExtraFields is already fetched on mount for the wizard's picker, so the
                summary gets the account's own names for ExtraField1..13 / ExtraDate1..4 for free. */}
            <DataSourceSummary classes={classes} open={dialog?.type === 'summary'} details={summaryDetails} columns={summaryColumns} extraFieldOptions={accountExtraFields} onClose={() => setDialog(null)} />
            <ExportDialog
                classes={classes}
                open={dialog?.type === 'export'}
                dataSource={dialog?.type === 'export' ? { ID: dialog.data.DataSourceID, Name: dialog.data.Name } : null}
                versionId={dialog?.type === 'export' ? (dialog.data.versionId ?? null) : null}
                totalRows={dialog?.type === 'export' ? (dialog.data.TotalRows ?? 0) : 0}
                onClose={() => setDialog(null)}
                setToastMessage={setToastMessage}
            />
            <VersionsHistoryDialog
                classes={classes}
                open={dialog?.type === 'versions'}
                versions={versionsData.versions}
                activeVersionId={versionsData.activeVersionId}
                onClose={() => setDialog(null)}
                onViewVersion={() => { setDialog(null); if (versionsData.dataSourceId) goToView(versionsData.dataSourceId); }}
                onExportVersion={(vid, totalRows) => setDialog({ type: 'export', data: { DataSourceID: versionsData.dataSourceId, Name: '', TotalRows: totalRows, versionId: vid } })}
                onShowSummary={() => { if (versionsData.dataSourceId) openSummary(versionsData.dataSourceId); }}
                canView={canViewRecipients}
                canExport={canExport}
            />
            {/* delete confirmation */}
            {/* Reactive dir, not hardcoded "rtl" — see UploadWizardDialog.tsx for why the attribute
                is mandatory on a portalled Dialog and why hardcoding it broke en/pl. */}
            <Dialog open={dialog?.type === 'delete'} onClose={() => setDialog(null)} dir={isRtl ? 'rtl' : 'ltr'} PaperProps={{ className: dsDialog.paper }}>
                <DialogTitle>{t('DataSources.delete.title')}</DialogTitle>
                <DialogContent><Typography>{t('DataSources.delete.body')}</Typography></DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialog(null)}>{t('common.cancel')}</Button>
                    <Button color="secondary" variant="contained" onClick={confirmDelete}>{t('DataSources.actions.delete')}</Button>
                </DialogActions>
            </Dialog>
            {/* delete blocked by campaigns */}
            <Dialog open={dialog?.type === 'deleteBlocked'} onClose={() => setDialog(null)} dir={isRtl ? 'rtl' : 'ltr'} PaperProps={{ className: dsDialog.paper }}>
                <DialogTitle>{t('DataSources.delete.blockedTitle')}</DialogTitle>
                <DialogContent>
                    <Typography>{t('DataSources.delete.blockedBody')}</Typography>
                    <ul>
                        {(dialog && Array.isArray(dialog.data) ? dialog.data : []).map((c: any) => <li key={c.CampaignID}>{c.CampaignName}</li>)}
                    </ul>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialog(null)}>{t('common.close')}</Button>
                </DialogActions>
            </Dialog>
        </>
    );

    return (
        <DefaultScreen currentPage="groups" subPage="dataSources" classes={classes} containerClass={clsx(classes.management, classes.mb50)}>
            <Box className={classes.mb50}>
                <Box className={'topSection onlyTitleBar'} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                    <Title Text={t('DataSources.title')} classes={classes} ContainerStyle={{ border: 'none !important' }} />
                    {activeTab === 'sources' && (
                        <Box style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            {canUpload && (
                                <Button variant="contained" color="primary" startIcon={<Add />} onClick={() => setWizardOpen(true)}>
                                    {t('DataSources.uploadButton')}
                                </Button>
                            )}
                            {canSend && (
                                <Button variant="outlined" color="primary" startIcon={<Send style={sendIconStyle} />} onClick={() => Redirect({ url: `${sitePrefix}SmartSend`, openNewTab: false })}>
                                    {t('DataSources.send.title')}
                                </Button>
                            )}
                        </Box>
                    )}
                </Box>

                <Tabs
                    value={activeTab}
                    onChange={(_: any, v: string) => selectTab(v)}
                    indicatorColor="primary"
                    textColor="primary"
                    style={{ borderBottom: '1px solid #e0e0e0', marginTop: 8 }}
                >
                    {TABS.map(tb => <Tab key={tb.value} value={tb.value} style={TAB_LABEL_STYLE} label={tb.label} />)}
                </Tabs>

                {activeTab === 'sources' ? (
                <>
                <Box style={{ display: 'flex', gap: 8, alignItems: 'center', margin: '12px 0' }}>
                    <TextField
                        variant="outlined"
                        label={t('DataSources.searchPlaceholder')}
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') doSearch(); }}
                        InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }}
                        size="small"
                        style={{ minWidth: 320 }}
                    />
                    <Button onClick={doSearch} variant="outlined">{t('common.search')}</Button>
                    {searchData.SearchTerm && <Button onClick={clearSearch}>{t('DataSources.clearSearch')}</Button>}
                </Box>

                {renderTable()}

                <Loader isOpen={loading && listStatus === 'loading'} />
                {toastMessage && <Toast data={toastMessage} />}
                {renderDialogs()}
                </>
                ) : activeTab === 'smartsend' ? (
                    <SmartSendManageTab classes={classes} />
                ) : (
                    // Reachable ONLY as 'sendsearch' now: activeTab is validated against TABS above, so
                    // this default branch can no longer be hit by a stray ?tab= value the way it was.
                    // No `showTitle` — the page heading above ("מקורות נתונים") plus the tab label
                    // already name this view; a second <h1> inside the tab would be duplicate chrome.
                    <SendSearchPanel />
                )}
            </Box>
        </DefaultScreen>
    );
};

export default DataSources;
