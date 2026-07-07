import { useState, useEffect } from 'react';
import pulseemMcpImage from '../../../assets/images/pulseem_mcp.png';
import {
    Box, Button, Typography, TextField, Divider, Link,
    Table, TableBody, TableCell, TableHead, TableRow,
    Dialog, DialogTitle, DialogContent, DialogActions,
    makeStyles, CircularProgress
} from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import clsx from 'clsx';
import { getMcpTokens, createMcpToken, deactivateMcpToken } from '../../../redux/reducers/McpTokensSlice';
import { logout } from '../../../helpers/Api/PulseemReactAPI';
import Toast from '../../../components/Toast/Toast.component';
import { PulseemFeatures } from '../../../model/PulseemFields/Fields';

const useStyles = makeStyles({
    sectionBox: {
        border: '1px solid #e0e0e0',
        borderRadius: 8,
        padding: '20px 24px',
        marginTop: 24,
    },
    sectionHeader: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: 12,
    },
    tokenRow: {
        '&:hover': { background: '#fafafa' }
    },
    inactiveRow: {
        opacity: 0.5
    },
    emptyBox: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        padding: '32px 24px',
        color: '#666',
    },
    emptyImage: {
        width: 150,
        marginBottom: 16,
    },
    urlBox: {
        background: '#f5f5f5',
        borderRadius: 4,
        padding: '10px 14px',
        fontFamily: 'monospace',
        fontSize: 13,
        wordBreak: 'break-all',
        marginTop: 8,
        marginBottom: 4,
    },
    warningBox: {
        background: '#fff8e1',
        border: '1px solid #ffe082',
        borderRadius: 4,
        padding: '8px 14px',
        marginBottom: 12,
        fontSize: 14,
    },
    directApiWarning: {
        background: '#ffebee',
        border: '1px solid #ef9a9a',
        borderRadius: 4,
        padding: '8px 14px',
        marginTop: 4,
        marginBottom: 8,
        fontSize: 13,
        color: '#c62828',
    },
    infoBox: {
        background: '#f5f7ff',
        border: '1px solid #d0d5f0',
        borderRadius: 4,
        padding: '10px 14px',
        marginBottom: 16,
        fontSize: 13,
    },
    urlDesc: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
    },
    deactivatedChip: {
        background: '#e0e0e0',
        borderRadius: 12,
        padding: '2px 8px',
        fontSize: 12,
        color: '#666',
        display: 'inline-block'
    }
});

interface McpToken {
    id: number;
    token: string;
    label: string;
    createdDate: string;
    lastUsedDate?: string;
    isActive: boolean;
}

const McpSection = ({ classes }: any) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const { isRTL, windowSize } = useSelector((state: any) => state.core);
    const { ToastMessages } = useSelector((state: any) => state?.accountSettings);
    const { accountFeatures } = useSelector((state: any) => state.common);
    const localClasses = useStyles();

    const [tokens, setTokens] = useState<McpToken[]>([]);
    const [loading, setLoading] = useState(false);
    const [toastMessage, setToastMessage] = useState<any>(null);

    const [createOpen, setCreateOpen] = useState(false);
    const [createLabel, setCreateLabel] = useState('');
    const [creating, setCreating] = useState(false);

    const [successData, setSuccessData] = useState<{ mcpApiUrl: string; mcpUiApiUrl: string; label: string } | null>(null);
    const [copiedApiUrl, setCopiedApiUrl] = useState(false);
    const [copiedUiApiUrl, setCopiedUiApiUrl] = useState(false);

    const [deactivateTarget, setDeactivateTarget] = useState<McpToken | null>(null);
    const [deactivating, setDeactivating] = useState(false);

    const showError = () => setToastMessage(ToastMessages?.GENERAL_ERROR);

    useEffect(() => {
        loadTokens();
    }, []);

    useEffect(() => {
        if (!toastMessage) return;
        const timer = setTimeout(() => setToastMessage(null), 4000);
        return () => clearTimeout(timer);
    }, [toastMessage]);

    const loadTokens = async () => {
        setLoading(true);
        const res = await dispatch(getMcpTokens()) as any;
        setLoading(false);
        const payload = res?.payload;
        if (!payload || payload.StatusCode === 401) { logout(); return; }
        if (payload.StatusCode === 500) { showError(); return; }
        // Normalize PascalCase API response → camelCase interface
        setTokens((payload.Data || []).map((t: any) => ({
            id: t.Id,
            token: t.Token,
            label: t.Label,
            createdDate: t.CreatedDate,
            lastUsedDate: t.LastUsedDate,
            isActive: t.IsActive
        })));
    };

    const handleCreate = async () => {
        setCreating(true);
        const res = await dispatch(createMcpToken(createLabel.trim())) as any;
        setCreating(false);
        const payload = res?.payload;
        if (!payload || payload.StatusCode === 401) { logout(); return; }
        if (payload.StatusCode === 500) { showError(); return; }
        const data = payload.Data;
        setCreateOpen(false);
        setCreateLabel('');
        const mcpApiUrl = data.McpUrl;
        const mcpUiApiUrl = data.McpUrl.replace('//mcp.api.', '//mcp.ui-api.');
        setSuccessData({ mcpApiUrl, mcpUiApiUrl, label: data.Label || createLabel });
        // Add masked entry to list
        setTokens(prev => [{
            id: data.Id,
            token: data.Token.substring(0, 8) + '...',
            label: data.Label || '',
            createdDate: data.CreatedDate,
            lastUsedDate: undefined,
            isActive: true
        }, ...prev]);
    };

    const handleDeactivate = async () => {
        if (!deactivateTarget) return;
        setDeactivating(true);
        const res = await dispatch(deactivateMcpToken(deactivateTarget.id)) as any;
        setDeactivating(false);
        const payload = res?.payload;
        if (!payload || payload.StatusCode === 401) { logout(); return; }
        if (payload.StatusCode === 500) { showError(); return; }
        if (payload.StatusCode === 404 || payload.StatusCode === 403) {
            // Token was already deactivated or not found — refresh list from server
            setDeactivateTarget(null);
            loadTokens();
            return;
        }
        setTokens(prev => prev.map(t => t.id === deactivateTarget.id ? { ...t, isActive: false } : t));
        setDeactivateTarget(null);
    };

    const handleCopyUrl = (url: string, setCopied: (v: boolean) => void) => {
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    const hasDirectApi = accountFeatures?.indexOf(PulseemFeatures.DIRECT_API) > -1;

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return t('settings.mcpSettings.neverUsed');
        return new Date(dateStr).toLocaleDateString();
    };

    const activeCount = tokens.filter(t => t.isActive).length;

    return (
        <Box className={localClasses.sectionBox}>
            {toastMessage && <Toast data={toastMessage} />}

            {/* Section header */}
            <Box className={localClasses.sectionHeader} style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                <Box style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <img src={pulseemMcpImage} alt="Pulseem MCP" style={{ width: 52, height: 52, objectFit: 'contain' }} />
                    <Box>
                        <Box style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                            <Typography className={clsx(classes.managementTitle, classes.font20)}>
                                {t('settings.mcpSettings.sectionTitle')}
                            </Typography>
                            <Link
                                href="https://site.pulseem.co.il/pulsyai/mcp"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ fontSize: 13, whiteSpace: 'nowrap' }}
                            >
                                {t('settings.mcpSettings.guideLink')}
                            </Link>
                        </Box>
                        <Typography style={{ color: '#666', fontSize: 14, marginTop: 2 }}>
                            {t('settings.mcpSettings.sectionSubtitle')}
                        </Typography>
                    </Box>
                </Box>
                {tokens.length > 0 && (
                    <Button
                        className={clsx(classes.btn, classes.btnRounded)}
                        onClick={() => setCreateOpen(true)}
                    >
                        {t('settings.mcpSettings.createBtn')}
                    </Button>
                )}
            </Box>

            <Divider style={{ marginBottom: 16 }} />

            {/* Connection types info */}
            <Box className={localClasses.infoBox}>
                <Typography style={{ fontSize: 13, marginBottom: 3 }}>
                    <strong>{t('settings.mcpSettings.sectionInfoDirectApiTitle')}</strong>{' '}
                    {t('settings.mcpSettings.sectionInfoDirectApiDesc')}
                </Typography>
                <Typography style={{ fontSize: 13 }}>
                    <strong>{t('settings.mcpSettings.sectionInfoUiApiTitle')}</strong>{' '}
                    {t('settings.mcpSettings.sectionInfoUiApiDesc')}
                </Typography>
            </Box>

            {/* Loading */}
            {loading && (
                <Box style={{ textAlign: 'center', padding: 24 }}>
                    <CircularProgress size={28} />
                </Box>
            )}

            {/* Empty state */}
            {!loading && tokens.length === 0 && (
                <Box className={localClasses.emptyBox}>
                    <img src={pulseemMcpImage} alt="Pulseem MCP" className={localClasses.emptyImage} />
                    <Typography style={{ fontWeight: 700, fontSize: 20, marginBottom: 8, textAlign: 'start' }}>
                        {t('settings.mcpSettings.emptyTitle')}
                    </Typography>
                    <Typography style={{ fontSize: 16, color: '#555', marginBottom: 20, maxWidth: 420, textAlign: 'start' }}>
                        {t('settings.mcpSettings.emptyDesc')}
                    </Typography>
                    <Button
                        className={clsx(classes.btn, classes.btnRounded)}
                        onClick={() => setCreateOpen(true)}
                    >
                        {t('settings.mcpSettings.createFirstBtn')}
                    </Button>
                </Box>
            )}

            {/* Tokens table */}
            {!loading && tokens.length > 0 && (
                <>
                    <Typography style={{ fontSize: 13, color: '#666', marginBottom: 8 }}>
                        {t('settings.mcpSettings.activeCount').replace('{count}', String(activeCount))}
                    </Typography>
                    <Box style={{ overflowX: 'auto' }}>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>{t('settings.mcpSettings.colLabel')}</TableCell>
                                    <TableCell>{t('settings.mcpSettings.colToken')}</TableCell>
                                    <TableCell>{t('settings.mcpSettings.colCreated')}</TableCell>
                                    <TableCell>{t('settings.mcpSettings.colLastUsed')}</TableCell>
                                    <TableCell>{t('settings.mcpSettings.colStatus')}</TableCell>
                                    <TableCell />
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {tokens.map(token => (
                                    <TableRow
                                        key={token.id}
                                        className={clsx(localClasses.tokenRow, !token.isActive && localClasses.inactiveRow)}
                                    >
                                        <TableCell>{token.label || '—'}</TableCell>
                                        <TableCell>
                                            <code style={{ fontSize: 12 }}>{token.token}</code>
                                        </TableCell>
                                        <TableCell>{formatDate(token.createdDate)}</TableCell>
                                        <TableCell>{formatDate(token.lastUsedDate)}</TableCell>
                                        <TableCell>
                                            {token.isActive
                                                ? <span style={{ color: '#2e7d32', fontSize: 12 }}>● {t('settings.mcpSettings.statusActive')}</span>
                                                : <span className={localClasses.deactivatedChip}>{t('settings.mcpSettings.statusInactive')}</span>
                                            }
                                        </TableCell>
                                        <TableCell>
                                            {token.isActive && (
                                                <Button
                                                    size="small"
                                                    className={clsx(classes.btn, classes.btnRounded)}
                                                    onClick={() => setDeactivateTarget(token)}
                                                >
                                                    {t('settings.mcpSettings.deactivateBtn')}
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Box>
                </>
            )}

            {/* Create dialog */}
            <Dialog open={createOpen} onClose={() => { setCreateOpen(false); setCreateLabel(''); }} dir={isRTL ? 'rtl' : 'ltr'} maxWidth="sm" fullWidth>
                <DialogTitle>{t('settings.mcpSettings.createDialogTitle')}</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        label={t('settings.mcpSettings.labelField')}
                        placeholder={t('settings.mcpSettings.labelPlaceholder')}
                        value={createLabel}
                        onChange={e => setCreateLabel(e.target.value.slice(0, 100))}
                        variant="outlined"
                        fullWidth
                        style={{ marginTop: 8 }}
                        inputProps={{ maxLength: 100 }}
                    />
                </DialogContent>
                <DialogActions style={{ padding: '12px 24px', gap: 8, flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                    <Button
                        className={clsx(classes.btn, classes.btnRounded)}
                        onClick={() => { setCreateOpen(false); setCreateLabel(''); }}
                    >
                        {t('common.cancel')}
                    </Button>
                    <Button
                        className={clsx(classes.btn, classes.btnRounded)}
                        onClick={handleCreate}
                        disabled={creating}
                    >
                        {creating ? <CircularProgress size={16} /> : t('settings.mcpSettings.createConfirmBtn')}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Success dialog — shown once after creation */}
            <Dialog open={!!successData} onClose={() => setSuccessData(null)} dir={isRTL ? 'rtl' : 'ltr'} maxWidth="sm" fullWidth>
                <DialogTitle>✅ {t('settings.mcpSettings.successTitle')}</DialogTitle>
                <DialogContent>
                    <Box className={localClasses.warningBox}>
                        ⚠️ {t('settings.mcpSettings.successWarning')}
                    </Box>

                    {/* URL 1: Direct API (mcp.api.pulseem.com) */}
                    <Typography style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>
                        {t('settings.mcpSettings.mcpApiUrlLabel')}
                    </Typography>
                    <Typography className={localClasses.urlDesc}>
                        {t('settings.mcpSettings.mcpApiUrlDesc')}
                    </Typography>
                    <Box className={localClasses.urlBox}>{successData?.mcpApiUrl}</Box>
                    {!hasDirectApi && (
                        <Box className={localClasses.directApiWarning}>
                            ⚠ {t('settings.mcpSettings.directApiNotActive')}
                        </Box>
                    )}
                    <Box style={{ display: 'flex', justifyContent: isRTL ? 'flex-start' : 'flex-end', marginTop: 4, marginBottom: 20 }}>
                        <Button
                            className={clsx(classes.btn, classes.btnRounded)}
                            onClick={() => handleCopyUrl(successData?.mcpApiUrl || '', setCopiedApiUrl)}
                        >
                            {copiedApiUrl ? `✓ ${t('settings.mcpSettings.copiedLabel')}` : `📋 ${t('settings.mcpSettings.copyUrlBtn')}`}
                        </Button>
                    </Box>

                    {/* URL 2: Main API (mcp.ui-api.pulseem.com) */}
                    <Typography style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>
                        {t('settings.mcpSettings.mcpUiApiUrlLabel')}
                    </Typography>
                    <Typography className={localClasses.urlDesc}>
                        {t('settings.mcpSettings.mcpUiApiUrlDesc')}
                    </Typography>
                    <Box className={localClasses.urlBox}>{successData?.mcpUiApiUrl}</Box>
                    <Box style={{ display: 'flex', justifyContent: isRTL ? 'flex-start' : 'flex-end', marginTop: 4, marginBottom: 4 }}>
                        <Button
                            className={clsx(classes.btn, classes.btnRounded)}
                            onClick={() => handleCopyUrl(successData?.mcpUiApiUrl || '', setCopiedUiApiUrl)}
                        >
                            {copiedUiApiUrl ? `✓ ${t('settings.mcpSettings.copiedLabel')}` : `📋 ${t('settings.mcpSettings.copyUrlBtn')}`}
                        </Button>
                    </Box>
                </DialogContent>
                <DialogActions style={{ padding: '12px 24px', flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                    <Button
                        className={clsx(classes.btn, classes.btnRounded)}
                        onClick={() => setSuccessData(null)}
                    >
                        {t('settings.mcpSettings.successClose')}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Deactivate confirm dialog */}
            <Dialog open={!!deactivateTarget} onClose={() => setDeactivateTarget(null)} dir={isRTL ? 'rtl' : 'ltr'}>
                <DialogTitle>{t('settings.mcpSettings.deactivateConfirmTitle')}</DialogTitle>
                <DialogContent>
                    <Typography>
                        {t('settings.mcpSettings.deactivateConfirmText').replace('{label}', deactivateTarget?.label || '')}
                    </Typography>
                </DialogContent>
                <DialogActions style={{ padding: '12px 24px', gap: 8, flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                    <Button
                        className={clsx(classes.btn, classes.btnRounded)}
                        onClick={() => setDeactivateTarget(null)}
                    >
                        {t('common.cancel')}
                    </Button>
                    <Button
                        className={clsx(classes.btn, classes.btnRounded)}
                        onClick={handleDeactivate}
                        disabled={deactivating}
                    >
                        {deactivating ? <CircularProgress size={16} /> : t('settings.mcpSettings.deactivateConfirmBtn')}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default McpSection;
