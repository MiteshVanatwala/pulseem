import { useState } from 'react';
import {
    Box, TextField, Select, MenuItem, Button, Chip, Typography, InputAdornment
} from '@material-ui/core';
import { Search, Add } from '@material-ui/icons';
import { useTranslation } from 'react-i18next';
import { DataSourceColumn, RowsFilter, eFilterOperator } from '../../../Models/DataSources/DataSource';

interface FiltersBarProps {
    classes: { [key: string]: string };
    columns: DataSourceColumn[];
    filters: RowsFilter[];
    onFiltersChange: (filters: RowsFilter[]) => void;
    freeText: string;
    onFreeTextChange: (v: string) => void;
    onSearch: () => void;
}

// Free-text search + structured filters. Only IsSearchable columns can be filtered (a non-searchable
// column would be rejected by the SP → COLUMN_NOT_SEARCHABLE); "contains" shows a slow-search hint.
const FiltersBar = ({ classes, columns, filters, onFiltersChange, freeText, onFreeTextChange, onSearch }: FiltersBarProps) => {
    const { t } = useTranslation();
    const searchable = (columns || []).filter(c => c.IsSearchable);
    const [draftColumn, setDraftColumn] = useState<number | ''>('');
    const [draftOperator, setDraftOperator] = useState<eFilterOperator>(eFilterOperator.EQUALS);
    const [draftValue, setDraftValue] = useState('');

    const addFilter = () => {
        if (draftColumn === '' || !draftValue.trim()) return;
        onFiltersChange([...filters, { DataSourceColumnID: Number(draftColumn), Operator: draftOperator, FilterValue: draftValue.trim() }]);
        setDraftColumn(''); setDraftValue(''); setDraftOperator(eFilterOperator.EQUALS);
    };

    const removeFilter = (idx: number) => onFiltersChange(filters.filter((_, i) => i !== idx));

    const colName = (id: number) => {
        const c = columns.find(x => x.ColumnID === id);
        return c ? c.DisplayName : String(id);
    };

    return (
        <Box style={{ display: 'flex', flexDirection: 'column', gap: 8, margin: '12px 0' }}>
            <Box style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <TextField
                    placeholder={t('DataSources.view.freeTextPlaceholder')}
                    value={freeText}
                    onChange={(e) => onFreeTextChange(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') onSearch(); }}
                    InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }}
                    size="small"
                    style={{ minWidth: 300 }}
                />
                <Button variant="outlined" onClick={onSearch}>{t('common.search')}</Button>
            </Box>

            <Box style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <Select displayEmpty value={draftColumn} onChange={(e) => setDraftColumn(e.target.value as any)} style={{ minWidth: 160 }}>
                    <MenuItem value="" disabled>{t('DataSources.view.addFilter')}</MenuItem>
                    {searchable.map(c => <MenuItem key={c.ColumnID} value={c.ColumnID}>{c.DisplayName}</MenuItem>)}
                </Select>
                <Select value={draftOperator} onChange={(e) => setDraftOperator(Number(e.target.value) as eFilterOperator)} style={{ minWidth: 120 }}>
                    <MenuItem value={eFilterOperator.EQUALS}>{t('DataSources.view.operator.1')}</MenuItem>
                    <MenuItem value={eFilterOperator.STARTS_WITH}>{t('DataSources.view.operator.2')}</MenuItem>
                    <MenuItem value={eFilterOperator.CONTAINS}>{t('DataSources.view.operator.3')}</MenuItem>
                </Select>
                <TextField size="small" value={draftValue} onChange={(e) => setDraftValue(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') addFilter(); }} />
                <Button startIcon={<Add />} onClick={addFilter} disabled={draftColumn === '' || !draftValue.trim()}>
                    {t('DataSources.view.addFilter')}
                </Button>
            </Box>

            {draftOperator === eFilterOperator.CONTAINS && (
                <Typography style={{ fontSize: 12, color: '#b54708' }}>{t('DataSources.view.containsSlowHint')}</Typography>
            )}

            {filters.length > 0 && (
                <Box style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                    {filters.map((f, i) => (
                        <Chip key={i} label={`${colName(f.DataSourceColumnID)} ${t(`DataSources.view.operator.${f.Operator}`)} ${f.FilterValue}`} onDelete={() => removeFilter(i)} />
                    ))}
                    <Button size="small" onClick={() => onFiltersChange([])}>{t('DataSources.view.clearFilters')}</Button>
                </Box>
            )}
        </Box>
    );
};

export default FiltersBar;
