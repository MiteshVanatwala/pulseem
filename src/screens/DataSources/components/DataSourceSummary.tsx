import { useMemo } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography, Grid, Divider
} from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { DataSourceDetails, ResultsJson, ResultsJsonChannel } from '../../../Models/DataSources/DataSource';
import { useDsDialogStyles } from './dialogStyles';

interface DataSourceSummaryProps {
    classes: { [key: string]: string };
    open: boolean;
    details: DataSourceDetails | null;
    onClose: () => void;
}

// Same tokens the wizard / list already use, kept local so the summary matches the feature without a theme change.
const BORDER = '#e3ebf3';
const ROW_LINE = '#eef3f8';
const PANEL_BG = '#f6f9fc';
const TEXT_STRONG = '#344054';
const TEXT_MUTED = '#5b6b7b';
const TEXT_QUIET = '#a9bdd4';

// Per-channel upload summary. ResultsJson is parsed defensively (any missing field renders '—'), so a
// malformed or partial blob never crashes the dialog. truncatedCells is shown only when > 0.
const DataSourceSummary = ({ classes, open, details, onClose }: DataSourceSummaryProps) => {
    const { t } = useTranslation();
    const dsDialog = useDsDialogStyles();

    const parsed: ResultsJson = useMemo(() => {
        if (!details?.ResultsJson) return {};
        // Guard valid-but-non-object JSON too (e.g. the literal "null" from a serialized null object).
        try { const p = JSON.parse(details.ResultsJson); return (p && typeof p === 'object') ? (p as ResultsJson) : {}; } catch { return {}; }
    }, [details]);

    const num = (v: number | undefined | null) => (v === undefined || v === null) ? '—' : v.toLocaleString();
    // Zero / missing figures are dimmed so the numbers that actually say something carry the eye.
    const quiet = (v: number | undefined | null) => v === undefined || v === null || v === 0;

    // Headline figure: big number with its caption directly underneath, so it reads as a KPI instead of a
    // full-width row whose value ends up flung to the far edge of the dialog.
    const renderTotal = (label: string, value: number | undefined | null) => (
        <Grid item xs={6}>
            <Box style={{ background: PANEL_BG, border: `1px solid ${BORDER}`, borderRadius: 8, padding: '10px 14px', height: '100%' }}>
                <Typography style={{ fontSize: 26, fontWeight: 700, lineHeight: 1.25, color: quiet(value) ? TEXT_QUIET : TEXT_STRONG }}>{num(value)}</Typography>
                <Typography style={{ fontSize: 15, color: TEXT_MUTED }}>{label}</Typography>
            </Box>
        </Grid>
    );

    // Label and value stay paired inside the (half-width) channel card: the value keeps its own narrow
    // column so the five figures line up, and the hairline carries the eye from label to number.
    const renderMetric = (label: string, value: number | undefined | null, last?: boolean) => (
        <Box style={{ display: 'flex', alignItems: 'baseline', padding: '7px 0', borderBottom: last ? undefined : `1px solid ${ROW_LINE}` }}>
            <Typography style={{ flex: 1, minWidth: 0, color: TEXT_MUTED }}>{label}</Typography>
            <Typography style={{ flexShrink: 0, minWidth: 40, marginInlineStart: 12, textAlign: 'end', fontSize: 18, fontWeight: 700, color: quiet(value) ? TEXT_QUIET : TEXT_STRONG }}>{num(value)}</Typography>
        </Box>
    );

    const renderChannel = (title: string, ch?: ResultsJsonChannel) => (
        <Grid item xs={12} sm={6}>
            <Box style={{ border: `1px solid ${BORDER}`, borderRadius: 8, height: '100%', overflow: 'hidden' }}>
                <Box style={{ background: PANEL_BG, borderBottom: `1px solid ${BORDER}`, padding: '8px 14px' }}>
                    <Typography style={{ fontWeight: 700, color: TEXT_STRONG }}>{title}</Typography>
                </Box>
                <Box style={{ padding: '2px 14px 6px' }}>
                    {renderMetric(t('DataSources.summary.matched'), ch?.matched)}
                    {renderMetric(t('DataSources.summary.created'), ch?.created)}
                    {renderMetric(t('DataSources.summary.notFound'), ch?.notFound)}
                    {renderMetric(t('DataSources.summary.duplicates'), ch?.duplicates)}
                    {renderMetric(t('DataSources.summary.noValue'), ch?.noValue, true)}
                </Box>
            </Box>
        </Grid>
    );

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" dir="rtl" scroll="body" PaperProps={{ className: dsDialog.paper }}>
            <DialogTitle>{t('DataSources.summary.title')}</DialogTitle>
            <DialogContent style={{ overflowY: 'visible', height: 'auto' }}>
                <Grid container spacing={2}>
                    {renderTotal(t('DataSources.summary.totalRows'), details?.TotalRows ?? (parsed.rows ? parsed.rows.total : undefined))}
                    {renderTotal(t('DataSources.summary.noIdentity'), details?.NoIdentityRows)}
                </Grid>
                {/* 20px, not 10 — the Grid gutters above and below eat 8px of it each. */}
                <Divider style={{ margin: '20px 0' }} />
                <Grid container spacing={2}>
                    {renderChannel(t('DataSources.summary.emailSection'), parsed.email)}
                    {renderChannel(t('DataSources.summary.cellSection'), parsed.cell)}
                </Grid>
                {typeof parsed.truncatedCells === 'number' && parsed.truncatedCells > 0 && (
                    <Box style={{ display: 'flex', alignItems: 'baseline', marginTop: 16, padding: '8px 14px', background: '#fff4e5', border: '1px solid #f5d9b0', borderRadius: 8 }}>
                        <Typography style={{ color: '#b54708' }}>{t('DataSources.summary.truncated')}</Typography>
                        <Typography style={{ fontSize: 18, fontWeight: 700, color: '#b54708', marginInlineStart: 10 }}>{num(parsed.truncatedCells)}</Typography>
                    </Box>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>{t('common.close')}</Button>
            </DialogActions>
        </Dialog>
    );
};

export default DataSourceSummary;
