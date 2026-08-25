// ═══════════════════════════════════════════════════════════════════════════════════════════
// HistoryDrawer — the BODY of the history level (the chrome is `ClalDrawerStack`).
//
// It reads `GetHistory` for ONE entity. Note it opens from a GROUP row as well as an item row
// (14-W3 "דרישות התנהגות"): `entityType=2, entityId=GroupID` is where the SortOrder / Title /
// ParentGroupID / IsHidden rows live. A tree this editable needs an answer to "who moved this and
// when", and reorder rows only exist because SP3/SP6 capture the previous order into `OldValue`
// before they overwrite it — an append-only log cannot reconstruct it later.
//
// Value rendering is deliberately literal for everything except the codes: `Status` and
// `ItemType` are integers on the wire and would otherwise read as "1 → 2".
// ═══════════════════════════════════════════════════════════════════════════════════════════

import React, { useEffect, useState } from 'react';
import { Box, CircularProgress, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@material-ui/core';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import { DateFormats } from '../../../helpers/Constants';
import { CC, ChangeRowDto, eClalEntityType } from '../../../Models/ClalCenter/ClalCenter';
import { getClalHistory } from '../../../redux/reducers/clalCenterSlice';
import { toErrorKey } from '../../../redux/reducers/clalCenterSlice';

interface Props {
    entityType: eClalEntityType;
    entityId: number;
    isRTL: boolean;
    onError: (errorKey: string) => void;
}

const HistoryDrawer = ({ entityType, entityId, isRTL, onError }: Props) => {
    const { t } = useTranslation();
    const [rows, setRows] = useState<ChangeRowDto[] | null>(null);

    useEffect(() => {
        let alive = true;
        setRows(null);
        (async () => {
            try {
                const data = await getClalHistory(entityType, entityId);
                if (alive) setRows(data ?? []);
            } catch (error: any) {
                // Guarded, like every other call on this screen: a timeout arrives here as a
                // TypeError thrown from inside the response interceptor, not as an API error.
                if (alive) { setRows([]); onError(toErrorKey(error)); }
            }
        })();
        return () => { alive = false; };
    }, [entityType, entityId, onError]);

    const renderValue = (field: string, raw?: string | null): string => {
        if (raw === null || raw === undefined || raw === '') return t(`${CC}history.empty_value`);
        if (field === 'Status') return t(`${CC}status.${raw}`);
        if (field === 'ItemType') return t(`${CC}type.${raw}`);
        if (field === 'IsHidden' || field === 'IsDeleted') return raw === '1' ? t(`${CC}yes`) : '—';
        return raw;
    };

    const headCell: React.CSSProperties = { fontSize: 12.5, color: '#7a8794', fontWeight: 600, textAlign: isRTL ? 'right' : 'left' };

    if (rows === null) {
        return (
            <Box style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 0' }}>
                <CircularProgress size={18} />
                <Typography style={{ color: '#5b6b7b' }}>{t(`${CC}history.loading`)}</Typography>
            </Box>
        );
    }

    if (!rows.length) {
        return <Typography style={{ color: '#5b6b7b', padding: '12px 0' }}>{t(`${CC}history.empty`)}</Typography>;
    }

    return (
        <Box style={{ background: '#fff', borderRadius: 8, border: '1px solid #e3e8ee', overflowX: 'auto' }}>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell style={headCell}>{t(`${CC}history.colDate`)}</TableCell>
                        <TableCell style={headCell}>{t(`${CC}history.colWho`)}</TableCell>
                        <TableCell style={headCell}>{t(`${CC}history.colField`)}</TableCell>
                        <TableCell style={headCell}>{t(`${CC}history.colBefore`)}</TableCell>
                        <TableCell style={headCell}>{t(`${CC}history.colAfter`)}</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {rows.map((row, index) => (
                        <TableRow key={`${row.OnDate}-${row.FieldName}-${index}`}>
                            <TableCell style={{ fontSize: 13, whiteSpace: 'nowrap', direction: 'ltr', textAlign: isRTL ? 'right' : 'left' }}>
                                {moment(row.OnDate).format(DateFormats.DATE_TIME_24)}
                            </TableCell>
                            <TableCell style={{ fontSize: 13 }}>{row.ChangedBy || '—'}</TableCell>
                            <TableCell style={{ fontSize: 13 }}>
                                {t(`${CC}history.field.${row.FieldName}`, { defaultValue: row.FieldName })}
                            </TableCell>
                            <TableCell style={{ fontSize: 13, color: '#5b6b7b', textDecoration: 'line-through' }}>
                                {renderValue(row.FieldName, row.OldValue)}
                            </TableCell>
                            <TableCell style={{ fontSize: 13, fontWeight: 700 }}>
                                {renderValue(row.FieldName, row.NewValue)}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Box>
    );
};

export default HistoryDrawer;
