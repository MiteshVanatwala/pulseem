import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import DefaultScreen from '../DefaultScreen';
import clsx from 'clsx';
import {
    Box, Button, Typography, Chip, LinearProgress, IconButton, Tooltip, TablePagination
} from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import {
    ArrowBack, GetApp, Edit as EditIcon, History, Assessment, Send
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
import {
    DataSourceColumn, DataSourceVersion, RowsFilter, eDataSourceStatus
} from '../../Models/DataSources/DataSource';
import { getChannelDescriptor, eSendChannel } from '../../Models/DataSources/SmartSend';
import StatusChip from './components/StatusChip';
import RowsTable from './components/RowsTable';
import FiltersBar from './components/FiltersBar';
import EditColumnDialog from './components/EditColumnDialog';
import VersionsHistoryDialog from './components/VersionsHistoryDialog';
import ExportDialog from './components/ExportDialog';
import DataSourceSummary from './components/DataSourceSummary';
import EditDataSourceDialog from './components/EditDataSourceDialog';

const ROWS_PAGE_SIZE = 50;
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

    const openSummary = (v?: DataSourceVersion) => {
        setSummaryDetails(details);
        setDialog({ type: 'summary' });
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
                {details && <StatusChip status={details.Status} progress={null} runDateStart={details.RunDateStart ?? null} createdDate={details.CreatedDate} t={t} />}
                {details && <Chip size="small" label={`V${details.VersionNumber ?? ''}`} style={{ direction: 'ltr' }} />}
                {isViewOnly && (
                    <Tooltip title={t('DataSources.viewOnlyTooltip')}>
                        <Chip size="small" label={t('DataSources.viewOnlyBadge')} style={{ background: '#f1ebfb', color: '#6941c6' }} />
                    </Tooltip>
                )}
            </Box>
            <Box style={{ display: 'flex', gap: 2 }}>
                {canExport && details?.Status === eDataSourceStatus.READY && (
                    <Tooltip title={t('DataSources.actions.export')}><IconButton aria-label={t('DataSources.actions.export')} onClick={() => setDialog({ type: 'export' })}><GetApp /></IconButton></Tooltip>
                )}
                {canEditMeta && (
                    <Tooltip title={t('DataSources.actions.edit')}><IconButton aria-label={t('DataSources.actions.edit')} onClick={() => setDialog({ type: 'editSource' })}><EditIcon /></IconButton></Tooltip>
                )}
                <Tooltip title={t('DataSources.actions.versions')}><IconButton aria-label={t('DataSources.actions.versions')} onClick={() => setDialog({ type: 'versions' })}><History /></IconButton></Tooltip>
                {details?.Status === eDataSourceStatus.READY && (
                    <Tooltip title={t('DataSources.actions.summary')}><IconButton aria-label={t('DataSources.actions.summary')} onClick={() => openSummary()}><Assessment /></IconButton></Tooltip>
                )}
                {canSend && details?.[EMAIL_IDENTITY_FLAG] && details?.Status === eDataSourceStatus.READY && (
                    <Tooltip title={t('DataSources.goToSend')}><IconButton aria-label={t('DataSources.goToSend')} onClick={() => Redirect({ url: `${sitePrefix}SmartSend?dataSourceId=${details?.DataSourceID}`, openNewTab: false })}><Send style={sendIconStyle} /></IconButton></Tooltip>
                )}
            </Box>
        </Box>
    );

    const renderBody = () => {
        if (!details) return <LinearProgress />;
        if (details.Status === eDataSourceStatus.PENDING || details.Status === eDataSourceStatus.PROCESSING) {
            return (
                <Box style={{ textAlign: 'center', padding: 40 }}>
                    <Typography style={{ marginBottom: 12 }}>{t('DataSources.view.processing')}</Typography>
                    <LinearProgress />
                </Box>
            );
        }
        if (details.Status === eDataSourceStatus.FAIL) {
            return (
                <Alert severity="error" style={{ marginTop: 16 }}
                    action={<Button color="inherit" size="small" onClick={() => Redirect({ url: `${sitePrefix}DataSources`, openNewTab: false })}>{t('DataSources.summary.uploadAgain')}</Button>}>
                    <Typography style={{ fontWeight: 700 }}>{t('DataSources.summary.failTitle')}</Typography>
                    {details.ErrorData && <Typography style={{ fontSize: 13 }}>{details.ErrorData}</Typography>}
                </Alert>
            );
        }
        if (details.Status === eDataSourceStatus.CANCELLED) {
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
                    readOnly={!!isHistorical || !canEditMeta}
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
                    canView={canEditMeta}
                    canExport={canExport}
                />
                <ExportDialog
                    classes={classes}
                    open={dialog?.type === 'export'}
                    dataSource={details ? { ID: details.DataSourceID, Name: details.Name } : null}
                    versionId={dialog?.type === 'export' ? (dialog.data?.versionId ?? null) : null}
                    totalRows={dialog?.type === 'export' && dialog.data?.totalRows != null ? dialog.data.totalRows : (details?.TotalRows ?? 0)}
                    onClose={() => setDialog(null)}
                    setToastMessage={setToastMessage}
                />
                <DataSourceSummary classes={classes} open={dialog?.type === 'summary'} details={summaryDetails} onClose={() => setDialog(null)} />
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
