import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useSearchParams } from 'react-router-dom';
import { Box, LinearProgress, Typography, Button, Snackbar, CircularProgress } from '@material-ui/core';
import { Refresh } from '@material-ui/icons';
import { useTranslation } from 'react-i18next';
import DefaultScreen from '../DefaultScreen';
import useRedirect from '../../helpers/Routes/Redirect';
import { sitePrefix } from '../../config';
import { PulseemFeatures } from '../../model/PulseemFields/Fields';
import {
    getMapping, setCampaignContext, setTokenMapping, setBusinessColumn,
    setMapping, fillAndSummarize, setEmailSendSettingsWrapped, loadSourceColumns,
    getSendSummaryWrapped, getEmailSendSettingsWrapped, selectUnmappedTokens,
} from '../../redux/reducers/smartSendSlice';
import ChannelSelector from './components/ChannelSelector';
import SourcePicker from './components/SourcePicker';
import TokenMappingTable from './components/TokenMappingTable';
import BusinessColumnsPicker from './components/BusinessColumnsPicker';
import StaleVersionBanner from './components/StaleVersionBanner';
import MappingMismatchBanner from './components/MappingMismatchBanner';
import UnmappedTokensWarning from './components/UnmappedTokensWarning';
import SmartSendPreview from './components/SmartSendPreview';
import SendSummaryDialog from './components/SendSummaryDialog';
import TestSendDialog from './components/TestSendDialog';

// Smart-Send screen (מסך השליחה החכמה). Wizard: ChannelSelector → SourcePicker →
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

    const campaignId = Number(id);
    const { accountFeatures } = useSelector((state: any) => state.common);
    const smartSend = useSelector((state: any) => state.smartSend);
    const dsList = useSelector((state: any) => state.dataSources.list);
    const unmapped = useSelector(selectUnmappedTokens);

    const currentSourceId = smartSend.dataSource?.DataSourceID ?? smartSend.dataSourceId ?? null;
    const selectedSourceItem =
        (dsList && dsList.items ? dsList.items.find((it: any) => it.DataSourceID === currentSourceId) : null) ?? null;
    const hasColumns = smartSend.columns.length > 0;

    const [confirmUnmapped, setConfirmUnmapped] = useState(false);
    const [saving, setSaving] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [summaryOpen, setSummaryOpen] = useState(false);
    const [testOpen, setTestOpen] = useState(false);
    const [toast, setToast] = useState<{ open: boolean; ok: boolean; msg: string }>({ open: false, ok: true, msg: '' });

    const showToast = (ok: boolean, msg: string) => setToast({ open: true, ok, msg });

    useEffect(() => {
        if (accountFeatures && accountFeatures.indexOf(PulseemFeatures.DATA_SOURCES) === -1) {
            Redirect({ url: sitePrefix });
        }
    }, [accountFeatures]);

    // The "send anyway" confirmation must apply ONLY to the exact unmapped set the user
    // acknowledged — reset it whenever the mapping/columns change (e.g. a source switch
    // clears the map), so a stale confirm can never bypass the §16 raw-token gate.
    useEffect(() => {
        setConfirmUnmapped(false);
    }, [smartSend.columns, smartSend.tokenMap]);

    useEffect(() => {
        if (!campaignId || Number.isNaN(campaignId) || campaignId <= 0) return;
        // Entry A ?dataSourceId — NaN-guard a garbage param to null (never store NaN).
        const parsedDsId = dataSourceId != null && !Number.isNaN(Number(dataSourceId)) ? Number(dataSourceId) : null;
        dispatch(setCampaignContext({ campaignId, dataSourceId: parsedDsId }));
        dispatch(getMapping(campaignId));
    }, [dispatch, campaignId, dataSourceId]);

    // ── save flow (§13 step 6): setMapping (lock + PulseemDS_ group + TokenMap) → get
    // SyntheticGroupID → setEmailSendSettings with it in BOTH GroupList AND GroupIds (§10). ──
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

    const doSave = async (silent?: boolean): Promise<boolean> => {
        setSaving(true);
        const res: any = await dispatch(setMapping(buildSaveRequest()));
        const r = res && res.payload ? res.payload : {};
        if (r.StatusCode !== 200) {
            setSaving(false);
            showToast(false, t('DataSources.send.errors.' + (ERR_KEY[r.Message] || 'generalError')));
            return false;
        }
        const gid = r.Data && r.Data.SyntheticGroupID;
        // Synthetic group id must ride in BOTH GroupList (array) AND GroupIds (CSV) — §10.
        await dispatch(setEmailSendSettingsWrapped({ CampaignID: campaignId, GroupList: [gid], GroupIds: String(gid), SendingMethod: 1, SendDate: null }));
        setSaving(false);
        if (!silent) showToast(true, t('DataSources.send.toasts.mappingSaved'));
        return true;
    };

    const openSummary = async () => {
        const saved = await doSave(true);
        if (!saved) return;
        await dispatch(fillAndSummarize({ campaignId, channel: smartSend.selectedChannel }));
        await dispatch(getSendSummaryWrapped(campaignId));
        await dispatch(getEmailSendSettingsWrapped(campaignId));
        setSummaryOpen(true);
    };

    const canSend = hasColumns && (unmapped.length === 0 || confirmUnmapped);

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
                        <Button variant="outlined" color="primary" onClick={() => Redirect({ url: `${sitePrefix}Campaigns` })}>
                            {t('DataSources.send.backToCampaigns')}
                        </Button>
                    </Box>
                );
            }
            if (smartSend.mappingError === 927) return <Typography>{t('DataSources.send.errors.featureOff')}</Typography>;
            return <Typography>{t('DataSources.send.errors.generalError')}</Typography>;
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

                <ChannelSelector source={selectedSourceItem} />
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
                            onChange={(token, columnId) => dispatch(setTokenMapping({ token, columnId }))}
                            warnSystemFieldOverride
                        />
                        <BusinessColumnsPicker
                            columns={smartSend.columns}
                            supervisorColumnId={smartSend.supervisorColumnId}
                            gapColumnId={smartSend.gapColumnId}
                            sortColumnId={smartSend.sortColumnId}
                            onChange={(role, columnId) => dispatch(setBusinessColumn({ role, columnId }))}
                            supervisorEnabled
                        />

                        <Box style={{ marginTop: 24 }}>
                            <UnmappedTokensWarning tokens={unmapped} confirmed={confirmUnmapped} onConfirmChange={setConfirmUnmapped} />
                        </Box>

                        {/* wizard actions */}
                        <Box style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 20, borderTop: '1px solid #e0e0e0', paddingTop: 18 }}>
                            <Button variant="contained" color="primary" disabled={saving} onClick={() => doSave()}>
                                {t('DataSources.send.actions.saveMapping')}
                            </Button>
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
        <DefaultScreen currentPage="groups" subPage="dataSources" classes={classes}>
            <Box style={{ padding: 16 }}>
                <Typography variant="h5" style={{ marginBottom: 16 }}>{t('DataSources.send.title')}</Typography>
                {renderBody()}
            </Box>

            <SendSummaryDialog open={summaryOpen} campaignId={campaignId} onClose={() => setSummaryOpen(false)} />
            <TestSendDialog open={testOpen} campaignId={campaignId} onClose={() => setTestOpen(false)} onToast={(r) => showToast(r.ok, r.msg)} />

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
