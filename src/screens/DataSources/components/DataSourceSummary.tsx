import { useMemo } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography, Grid, Divider
} from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { DataSourceDetails, ResultsJson, ResultsJsonChannel } from '../../../Models/DataSources/DataSource';

interface DataSourceSummaryProps {
    classes: { [key: string]: string };
    open: boolean;
    details: DataSourceDetails | null;
    onClose: () => void;
}

// Per-channel upload summary. ResultsJson is parsed defensively (any missing field renders '—'), so a
// malformed or partial blob never crashes the dialog. truncatedCells is shown only when > 0.
const DataSourceSummary = ({ classes, open, details, onClose }: DataSourceSummaryProps) => {
    const { t } = useTranslation();

    const parsed: ResultsJson = useMemo(() => {
        if (!details?.ResultsJson) return {};
        // Guard valid-but-non-object JSON too (e.g. the literal "null" from a serialized null object).
        try { const p = JSON.parse(details.ResultsJson); return (p && typeof p === 'object') ? (p as ResultsJson) : {}; } catch { return {}; }
    }, [details]);

    const num = (v: number | undefined | null) => (v === undefined || v === null) ? '—' : v.toLocaleString();

    const renderChannel = (title: string, ch?: ResultsJsonChannel) => (
        <Grid item xs={12} sm={6}>
            <Typography style={{ fontWeight: 700, marginBottom: 6 }}>{title}</Typography>
            <Box style={{ display: 'flex', justifyContent: 'space-between' }}><span>{t('DataSources.summary.matched')}</span><b>{num(ch?.matched)}</b></Box>
            <Box style={{ display: 'flex', justifyContent: 'space-between' }}><span>{t('DataSources.summary.created')}</span><b>{num(ch?.created)}</b></Box>
            <Box style={{ display: 'flex', justifyContent: 'space-between' }}><span>{t('DataSources.summary.notFound')}</span><b>{num(ch?.notFound)}</b></Box>
            <Box style={{ display: 'flex', justifyContent: 'space-between' }}><span>{t('DataSources.summary.duplicates')}</span><b>{num(ch?.duplicates)}</b></Box>
            <Box style={{ display: 'flex', justifyContent: 'space-between' }}><span>{t('DataSources.summary.noValue')}</span><b>{num(ch?.noValue)}</b></Box>
        </Grid>
    );

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" dir="rtl">
            <DialogTitle>{t('DataSources.summary.title')}</DialogTitle>
            <DialogContent>
                <Box style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Typography>{t('DataSources.summary.totalRows')}</Typography>
                    <Typography style={{ fontWeight: 700 }}>{num(details?.TotalRows ?? (parsed.rows ? parsed.rows.total : undefined))}</Typography>
                </Box>
                <Box style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Typography>{t('DataSources.summary.noIdentity')}</Typography>
                    <Typography style={{ fontWeight: 700 }}>{num(details?.NoIdentityRows)}</Typography>
                </Box>
                <Divider style={{ margin: '10px 0' }} />
                <Grid container spacing={3}>
                    {renderChannel(t('DataSources.summary.emailSection'), parsed.email)}
                    {renderChannel(t('DataSources.summary.cellSection'), parsed.cell)}
                </Grid>
                {typeof parsed.truncatedCells === 'number' && parsed.truncatedCells > 0 && (
                    <Box style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12 }}>
                        <Typography>{t('DataSources.summary.truncated')}</Typography>
                        <Typography style={{ fontWeight: 700 }}>{num(parsed.truncatedCells)}</Typography>
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
