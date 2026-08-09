import { useMemo } from 'react';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Tooltip, Box, CircularProgress
} from '@material-ui/core';
import { Edit as EditIcon } from '@material-ui/icons';
import { useTranslation } from 'react-i18next';
import { DataSourceColumn, DataSourceRow, eMatchType } from '../../../Models/DataSources/DataSource';
import { eDataType } from '../../../Models/DataSources/DataSourceEnums';
import { formatValueForColumn } from './formatValue';

interface RowsTableProps {
    classes: { [key: string]: string };
    columns: DataSourceColumn[];
    rows: DataSourceRow[];
    loading: boolean;
    readOnly: boolean;
    onColumnClick: (col: DataSourceColumn) => void;
}

// Renders the dynamic RowJson grid + two resolve columns (email / cell). The first data column is
// sticky (insetInlineStart:0 — logical, works in RTL). RowJson is parsed per row inside try/catch so
// a single malformed row degrades to blank cells instead of crashing the table.
const RowsTable = ({ classes, columns, rows, loading, readOnly, onColumnClick }: RowsTableProps) => {
    const { t, i18n } = useTranslation();
    const isRtl = (i18n.dir?.() ?? 'rtl') === 'rtl';
    const ordered = useMemo(() => [...(columns || [])].sort((a, b) => a.Ordinal - b.Ordinal), [columns]);

    const parsed = useMemo(() => (rows || []).map(r => {
        try { return JSON.parse(r.RowJson || '{}'); } catch { return {}; }
    }), [rows]);

    const stickyStyle = (isFirst: boolean): any => isFirst
        ? { position: 'sticky', insetInlineStart: 0, background: '#fff', zIndex: 2 }
        : {};

    const renderMatch = (channel: 'email' | 'cell', matchType: eMatchType, isDup: boolean) => {
        if (matchType === eMatchType.NO_VALUE) return <Typography style={{ color: '#95A5A6' }}>—</Typography>;
        const label = t(`DataSources.view.match.${channel}.${matchType}`);
        if (isDup) {
            return (
                <Tooltip title={t('DataSources.view.duplicateTooltip')} PopperProps={{ style: { direction: isRtl ? 'rtl' : 'ltr' } }}>
                    <Typography style={{ color: '#95A5A6' }}>{label}</Typography>
                </Tooltip>
            );
        }
        return <Typography style={{ color: matchType === eMatchType.NOT_FOUND ? '#B42318' : '#067647' }}>{label}</Typography>;
    };

    if (loading) {
        return <Box style={{ textAlign: 'center', padding: 32 }}><CircularProgress /></Box>;
    }
    if (!rows || rows.length === 0) {
        return <Box style={{ textAlign: 'center', padding: 32, color: '#5b6b7b' }}>{t('DataSources.view.noRows')}</Box>;
    }

    return (
        <TableContainer style={{ overflowX: 'auto', maxWidth: '100%' }}>
            <Table size="small" stickyHeader>
                <TableHead>
                    <TableRow>
                        {ordered.map((c, ci) => (
                            <TableCell
                                key={c.ColumnID}
                                style={{ ...stickyStyle(ci === 0), whiteSpace: 'nowrap', cursor: readOnly ? 'default' : 'pointer', fontWeight: 700 }}
                                onClick={readOnly ? undefined : () => onColumnClick(c)}
                            >
                                <Box style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                    {c.DisplayName}
                                    {!readOnly && <EditIcon fontSize="inherit" style={{ opacity: 0.5 }} />}
                                </Box>
                            </TableCell>
                        ))}
                        <TableCell style={{ whiteSpace: 'nowrap', fontWeight: 700 }}>{t('DataSources.view.resolveEmail')}</TableCell>
                        <TableCell style={{ whiteSpace: 'nowrap', fontWeight: 700 }}>{t('DataSources.view.resolveCell')}</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {rows.map((row, ri) => (
                        <TableRow key={row.RowID}>
                            {ordered.map((c, ci) => (
                                <TableCell key={c.ColumnID} style={{
                                    ...stickyStyle(ci === 0), whiteSpace: 'nowrap',
                                    /* A number, a phone or an email is never Hebrew: without an explicit
                                       ltr the bidi algorithm reorders "1,234.50-" style runs on an RTL
                                       page and the value on screen stops being the value in the file.
                                       textAlign follows the page so the column still lines up. */
                                    ...(c.DataType === eDataType.TEXT ? {} : { direction: 'ltr' as const, textAlign: isRtl ? 'right' as const : 'left' as const })
                                }}>
                                    {/* ONE formatter, shared with every other screen — see formatValue.ts.
                                        Per COLUMN (c.DataType), never per cell: a column that renders with
                                        separators on some rows and without on others reads as a bug. */}
                                    {formatValueForColumn(parsed[ri] ? parsed[ri][c.ColumnKey] : null, c)}
                                </TableCell>
                            ))}
                            <TableCell>{renderMatch('email', row.EmailMatchType, row.IsEmailDuplicate)}</TableCell>
                            <TableCell>{renderMatch('cell', row.CellMatchType, row.IsCellDuplicate)}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default RowsTable;
