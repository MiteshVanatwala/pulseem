import React from 'react';
import { Box, Typography, FormControl, InputLabel, Select, MenuItem } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { SmartSendColumn } from '../../../Models/DataSources/SmartSend';

// §11.4 · the supervisor-email block. ALL version columns are offered for each role
// (NOT filtered by SemanticRole — supervisor/gap are free choices, §4). These columns affect
// the supervisor email table ONLY (V3); when no supervisor is picked the shortfall picker is
// disabled with an explanation so the user never selects something with no effect (§11.4).
//
// MERGED CONTROL: gap and sort used to be two separate pickers. They are now ONE, because the
// business rule is fixed — the supervisor's table is always ordered by the smallest shortfall to
// target — so a separate "sort by something else" control only invited a wrong answer. The server
// contract is untouched: setBusinessColumn('gapSort') writes the same ColumnID into GapColumnID
// and SortColumnID, and readers compute ISNULL(Sort, Gap) exactly as before.
// A mapping saved BEFORE the merge can still hold two different columns; `storedGapColumnId` /
// `storedSortColumnId` (the raw server values) drive a warning rather than a silent collapse.
//
// Both pickers can arrive PRE-FILLED by screens/SmartSend/businessColumnDefaults.ts. Those
// defaults are applied inside the slice, never mark the form dirty, and therefore never autosave
// on their own — read that file's header before changing this one.

type Role = 'supervisor' | 'gapSort';

interface Props {
    columns: SmartSendColumn[];
    supervisorColumnId: number | null;
    // The effective shortfall column. `sortColumnId` is no longer a separate control — the screen
    // keeps writing it (always equal to the gap column) because it is still a real server field.
    gapColumnId: number | null;
    // Raw server values, for the pre-merge divergence warning only. Absent → no warning.
    storedGapColumnId?: number | null;
    storedSortColumnId?: number | null;
    onChange: (role: Role, columnId: number | null) => void;
    supervisorEnabled?: boolean;
}

const useStyles = makeStyles((theme) => ({
    row: { display: 'flex', flexWrap: 'wrap', gap: theme.spacing(2), marginTop: theme.spacing(1) },
    control: { minWidth: 220 },
    hint: { marginTop: theme.spacing(1), display: 'block' },
}));

const BusinessColumnsPicker: React.FC<Props> = ({
    columns, supervisorColumnId, gapColumnId,
    storedGapColumnId, storedSortColumnId, onChange, supervisorEnabled = true,
}) => {
    const classes = useStyles();
    const { t } = useTranslation();
    // §2.5 · the Select menu portals to document.body — outside App's inner <div dir> — and
    // <html dir> is stuck "ltr", so the dropdown opens LTR. Force its direction like the dialogs.
    const isRTL = useSelector((s: any) => s.core && s.core.isRTL);
    // The shortfall column only matters for the supervisor email → disable until one is chosen.
    const gapDisabled = supervisorEnabled && supervisorColumnId == null;

    const menu = () => [
        <MenuItem key="none" value={0}>{t('DataSources.send.business.none')}</MenuItem>,
        ...columns.map((c) => <MenuItem key={c.ColumnID} value={c.ColumnID}>{c.DisplayName}</MenuItem>),
    ];

    const picker = (role: Role, labelKey: string, value: number | null, disabled: boolean) => (
        <FormControl variant="outlined" size="small" className={classes.control} disabled={disabled}>
            <InputLabel id={`bc-${role}-label`}>{t(labelKey)}</InputLabel>
            <Select
                labelId={`bc-${role}-label`}
                label={t(labelKey)}
                value={value ?? 0}
                onChange={(e) => { const v = Number(e.target.value); onChange(role, v > 0 ? v : null); }}
                MenuProps={{ PaperProps: { dir: isRTL ? 'rtl' : 'ltr' } }}
            >
                {menu()}
            </Select>
        </FormControl>
    );

    const colName = (id: number | null | undefined) => {
        if (id == null) return '';
        const c = columns.find((x) => x.ColumnID === id);
        return c ? c.DisplayName : String(id);
    };

    // Only for mappings saved before gap and sort were merged: the server still holds two
    // DIFFERENT columns, and saving from this screen will collapse them onto the gap column.
    // Say so rather than discarding the user's old sort choice silently.
    const legacyDiffers =
        storedGapColumnId != null && storedSortColumnId != null && storedGapColumnId !== storedSortColumnId;

    return (
        <Box style={{ marginTop: 24 }}>
            <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
                {t('DataSources.send.business.title')}
            </Typography>
            <Typography variant="body2" color="textSecondary">{t('DataSources.send.business.hint')}</Typography>
            <Box className={classes.row}>
                {supervisorEnabled && picker('supervisor', 'DataSources.send.business.supervisor', supervisorColumnId, false)}
                {/* Displays the GAP id: it is the effective column either way (the server resolves
                    ISNULL(Sort, Gap)), and setBusinessColumn('gapSort') keeps the two in step. */}
                {picker('gapSort', 'DataSources.send.business.gapSort', gapColumnId, gapDisabled)}
            </Box>
            {gapDisabled && (
                <Typography variant="caption" color="textSecondary" className={classes.hint}>
                    {t('DataSources.send.business.needSupervisor')}
                </Typography>
            )}
            {legacyDiffers && (
                <Typography variant="caption" color="textSecondary" className={classes.hint}>
                    {t('DataSources.send.business.legacySortDiffers', {
                        sort: colName(storedSortColumnId),
                        gap: colName(storedGapColumnId),
                    })}
                </Typography>
            )}
        </Box>
    );
};

export default BusinessColumnsPicker;
