import { Box, Typography, LinearProgress, CircularProgress } from '@material-ui/core';
import moment from 'moment';
import { eDataSourceStatus } from '../../../Models/DataSources/DataSource';

interface StatusChipProps {
    status: eDataSourceStatus;
    progress: number | null;
    runDateStart: string | null;
    createdDate?: string | null;
    t: (key: string) => string;
}

// The single place the "processing delayed" threshold lives (mirrors the worker's 2h stale threshold).
// Measured from RunDateStart; while the version has not yet been picked from the queue RunDateStart is
// null and we fall back to CreatedDate. No time comparison is scattered across the list.
const DELAY_THRESHOLD_MS = 2 * 60 * 60 * 1000;

const isDelayed = (runDateStart: string | null, createdDate?: string | null): boolean => {
    const ref = runDateStart || createdDate;
    if (!ref) return false;
    const started = moment(ref);
    if (!started.isValid()) return false;
    return moment().diff(started) >= DELAY_THRESHOLD_MS;
};

const colorFor = (status: eDataSourceStatus): string => {
    switch (status) {
        case eDataSourceStatus.READY: return '#27AE60';
        case eDataSourceStatus.FAIL: return '#E74C3C';
        case eDataSourceStatus.CANCELLED: return '#95A5A6';
        default: return '#0371AD'; // pending / processing
    }
};

const StatusChip = ({ status, progress, runDateStart, createdDate, t }: StatusChipProps) => {
    const inFlight = status === eDataSourceStatus.PENDING || status === eDataSourceStatus.PROCESSING;
    const delayed = inFlight && isDelayed(runDateStart, createdDate);

    const label = delayed
        ? t('DataSources.statuses.delayed')
        : t(`DataSources.statuses.${status}`);

    return (
        <Box role="status" aria-live="polite" style={{ minWidth: 120 }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {inFlight && progress === null && <CircularProgress size={14} thickness={5} />}
                <Typography style={{ color: delayed ? '#B54708' : colorFor(status), fontWeight: 700, fontSize: 14 }}>
                    {label}
                </Typography>
                {status === eDataSourceStatus.PROCESSING && progress !== null && (
                    <Typography style={{ color: '#5b6b7b', fontSize: 13, direction: 'ltr' }}>{`${progress}%`}</Typography>
                )}
            </Box>
            {status === eDataSourceStatus.PROCESSING && progress !== null && (
                <LinearProgress
                    variant="determinate"
                    value={Math.max(0, Math.min(100, progress))}
                    aria-label={t('DataSources.statuses.1')}
                    style={{ marginTop: 4, borderRadius: 4, height: 6 }}
                />
            )}
        </Box>
    );
};

export default StatusChip;
