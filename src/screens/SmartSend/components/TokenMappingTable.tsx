import React, { useMemo, useState } from 'react';
import {
    Box, Typography, Table, TableHead, TableBody, TableRow, TableCell, TableContainer,
    Select, MenuItem, Chip, Tooltip, TextField, InputAdornment,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Warning, ShowChart, VpnKey, TextFields, Search } from '@material-ui/icons';
import { useTranslation } from 'react-i18next';
import { SmartSendColumn, SmartSendTokenInfo } from '../../../Models/DataSources/SmartSend';

// §11.4 · one row per ##token## → a Select over the version's columns (by DisplayName).
// Mapping is by ColumnID (rename-safe). Each token carries exactly one badge: graph /
// system-field / free. Warnings: unmapped (blocks send at M9), a mapped column that
// VANISHED in the locked version (remap), and a system-field token mapped to a source
// (the source value overrides the recipient's account field). Long templates (50 tokens)
// scroll and are searchable; long Hebrew names wrap and carry a title (§ה.6).

interface Props {
    tokens: SmartSendTokenInfo[];
    columns: SmartSendColumn[];
    value: { [token: string]: number | null };
    onChange: (token: string, columnId: number | null) => void;
    warnSystemFieldOverride?: boolean;
}

const useStyles = makeStyles((theme) => ({
    header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: theme.spacing(1) },
    search: { minWidth: 220 },
    container: { marginTop: theme.spacing(1), maxHeight: 420, border: '1px solid #e0e0e0', borderRadius: 6 },
    tokenCell: { display: 'flex', alignItems: 'center', gap: theme.spacing(1), flexWrap: 'wrap' },
    tokenName: { fontWeight: 600, overflowWrap: 'anywhere' },
    warnRow: { background: '#fdf6ec' },
    unmapped: { color: '#c0392b', fontWeight: 600 },
    warnIcon: { color: '#c0392b', cursor: 'help', verticalAlign: 'middle' },
    select: { minWidth: 220 },
}));

const TokenMappingTable: React.FC<Props> = ({ tokens, columns, value, onChange, warnSystemFieldOverride = true }) => {
    const classes = useStyles();
    const { t } = useTranslation();
    const [search, setSearch] = useState('');

    const columnSet = useMemo(() => new Set(columns.map((c) => c.ColumnID)), [columns]);
    const filtered = useMemo(
        () => (search.trim() ? tokens.filter((tk) => tk.Token.indexOf(search.trim()) > -1) : tokens),
        [tokens, search],
    );

    const badgeFor = (tok: SmartSendTokenInfo) => {
        if (tok.IsGraphToken) return <Chip size="small" icon={<ShowChart />} label={t('DataSources.send.mapping.badge.graph')} />;
        if (tok.IsSystemField) return <Chip size="small" icon={<VpnKey />} label={t('DataSources.send.mapping.badge.systemField')} />;
        return <Chip size="small" variant="outlined" icon={<TextFields />} label={t('DataSources.send.mapping.badge.free')} />;
    };

    if (!tokens.length) {
        return <Typography variant="body2" color="textSecondary" style={{ marginTop: 16 }}>{t('DataSources.send.mapping.noTokens')}</Typography>;
    }

    return (
        <Box style={{ marginTop: 24 }}>
            <Box className={classes.header}>
                <Box>
                    <Typography variant="subtitle1" style={{ fontWeight: 600 }}>{t('DataSources.send.mapping.title')}</Typography>
                    <Typography variant="body2" color="textSecondary">{t('DataSources.send.mapping.hint')}</Typography>
                </Box>
                {tokens.length > 8 && (
                    <TextField
                        className={classes.search}
                        size="small"
                        variant="outlined"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder={t('DataSources.searchPlaceholder')}
                        InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }}
                        inputProps={{ 'aria-label': t('DataSources.send.mapping.title') }}
                    />
                )}
            </Box>

            <TableContainer className={classes.container}>
                <Table size="small" stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell>{t('DataSources.send.mapping.tokenCol')}</TableCell>
                            <TableCell>{t('DataSources.send.mapping.columnCol')}</TableCell>
                            <TableCell />
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filtered.map((tok) => {
                            const mapped = value[tok.Token] ?? null;
                            const isMapped = mapped != null && mapped > 0;
                            const vanished = isMapped && !columnSet.has(mapped as number);
                            const effectivelyMapped = isMapped && !vanished;
                            const systemOverride = warnSystemFieldOverride && tok.IsSystemField && effectivelyMapped;
                            const rowWarn = !effectivelyMapped;
                            return (
                                <TableRow key={tok.Token} className={rowWarn ? classes.warnRow : undefined}>
                                    <TableCell>
                                        <Box className={classes.tokenCell}>
                                            <Typography component="span" className={classes.tokenName} title={tok.Token}>
                                                {tok.Token}
                                            </Typography>
                                            {badgeFor(tok)}
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Select
                                            className={classes.select}
                                            variant="outlined"
                                            margin="dense"
                                            displayEmpty
                                            value={vanished ? 0 : (mapped ?? 0)}
                                            onChange={(e) => { const v = Number(e.target.value); onChange(tok.Token, v > 0 ? v : null); }}
                                            inputProps={{ 'aria-label': `${t('DataSources.send.mapping.columnCol')} — ${tok.Token}` }}
                                        >
                                            <MenuItem value={0}><em>{t('DataSources.send.mapping.selectColumn')}</em></MenuItem>
                                            {columns.map((c) => <MenuItem key={c.ColumnID} value={c.ColumnID}>{c.DisplayName}</MenuItem>)}
                                        </Select>
                                    </TableCell>
                                    <TableCell>
                                        {!isMapped && <span className={classes.unmapped}>{t('DataSources.send.mapping.unmapped')}</span>}
                                        {vanished && (
                                            <Tooltip title={t('DataSources.send.mapping.vanishedColumn')}>
                                                <Warning className={classes.warnIcon} fontSize="small" />
                                            </Tooltip>
                                        )}
                                        {systemOverride && (
                                            <Tooltip title={t('DataSources.send.mapping.systemFieldWarn')}>
                                                <Warning className={classes.warnIcon} fontSize="small" />
                                            </Tooltip>
                                        )}
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default TokenMappingTable;
