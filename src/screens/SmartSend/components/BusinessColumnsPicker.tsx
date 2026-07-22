import React from 'react';
import { Box, Typography, FormControl, InputLabel, Select, MenuItem } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { useTranslation } from 'react-i18next';
import { SmartSendColumn } from '../../../Models/DataSources/SmartSend';

// §11.4 · optional business columns. ALL version columns are offered for each role
// (NOT filtered by SemanticRole — supervisor/gap/sort are free choices, §4). Gap & Sort
// affect the supervisor email table ONLY (V3); when no supervisor is picked they are
// disabled with an explanation so the user never selects something with no effect (§11.4).
// The supervisor picker is active because M11 is in scope (PO decision); pass
// supervisorEnabled={false} to hide it if M11 is ever de-scoped (§9.3 v1 behavior).
// Effective sort is ISNULL(Sort, Gap) server-side — leaving Sort empty falls back to Gap.

type Role = 'supervisor' | 'gap' | 'sort';

interface Props {
    columns: SmartSendColumn[];
    supervisorColumnId: number | null;
    gapColumnId: number | null;
    sortColumnId: number | null;
    onChange: (role: Role, columnId: number | null) => void;
    supervisorEnabled?: boolean;
}

const useStyles = makeStyles((theme) => ({
    row: { display: 'flex', flexWrap: 'wrap', gap: theme.spacing(2), marginTop: theme.spacing(1) },
    control: { minWidth: 220 },
    hint: { marginTop: theme.spacing(1), display: 'block' },
}));

const BusinessColumnsPicker: React.FC<Props> = ({
    columns, supervisorColumnId, gapColumnId, sortColumnId, onChange, supervisorEnabled = true,
}) => {
    const classes = useStyles();
    const { t } = useTranslation();
    // Gap/Sort only matter for the supervisor email → disable them until a supervisor is chosen.
    const gapSortDisabled = supervisorEnabled && supervisorColumnId == null;

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
            >
                {menu()}
            </Select>
        </FormControl>
    );

    return (
        <Box style={{ marginTop: 24 }}>
            <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
                {t('DataSources.send.business.title')}
            </Typography>
            <Typography variant="body2" color="textSecondary">{t('DataSources.send.business.hint')}</Typography>
            <Box className={classes.row}>
                {supervisorEnabled && picker('supervisor', 'DataSources.send.business.supervisor', supervisorColumnId, false)}
                {picker('gap', 'DataSources.send.business.gap', gapColumnId, gapSortDisabled)}
                {picker('sort', 'DataSources.send.business.sort', sortColumnId, gapSortDisabled)}
            </Box>
            {gapSortDisabled && (
                <Typography variant="caption" color="textSecondary" className={classes.hint}>
                    {t('DataSources.send.business.needSupervisor')}
                </Typography>
            )}
            {!gapSortDisabled && (gapColumnId != null || sortColumnId != null || supervisorColumnId != null) && (
                <Typography variant="caption" color="textSecondary" className={classes.hint}>
                    {t('DataSources.send.business.sortDefault')}
                </Typography>
            )}
        </Box>
    );
};

export default BusinessColumnsPicker;
