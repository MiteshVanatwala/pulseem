import { useState } from 'react';
import {
    Box, TextField, Select, MenuItem, Button, Chip, Typography, InputAdornment, FormControl
} from '@material-ui/core';
import { Search, Add } from '@material-ui/icons';
import { useTranslation } from 'react-i18next';
import { DataSourceColumn, RowsFilter } from '../../../Models/DataSources/DataSource';
import { eFilterOperator } from '../../../Models/DataSources/DataSourceEnums';

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
    const { t, i18n } = useTranslation();
    const isRtl = (i18n.dir?.() ?? 'rtl') === 'rtl';
    const searchable = (columns || []).filter(c => c.IsSearchable);
    const [draftColumn, setDraftColumn] = useState<number | ''>('');
    const [draftOperator, setDraftOperator] = useState<eFilterOperator>(eFilterOperator.EQUALS);
    const [draftValue, setDraftValue] = useState('');

    // Dropdowns must drop BELOW the field (not cover it) and stay anchored to its START edge:
    // right in RTL, left in LTR. anchorOrigin is a prop, not CSS, so jss-rtl never mirrors it and
    // MUI v4's Popover does not either — hardcoding 'right' anchored en/pl menus to the END edge.
    // getContentAnchorEl:null is what lets anchorOrigin.vertical:'bottom' actually apply in MUI v4.
    const menuProps: any = {
        getContentAnchorEl: null,
        anchorOrigin: { vertical: 'bottom', horizontal: isRtl ? 'right' : 'left' },
        transformOrigin: { vertical: 'top', horizontal: isRtl ? 'right' : 'left' },
        PaperProps: { style: { maxHeight: 320, marginTop: 4 } }
    };

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
                    variant="outlined"
                    label={t('DataSources.view.freeTextPlaceholder')}
                    value={freeText}
                    onChange={(e) => onFreeTextChange(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') onSearch(); }}
                    InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }}
                    size="small"
                    style={{ minWidth: 320 }}
                />
                <Button variant="outlined" onClick={onSearch}>{t('common.search')}</Button>
            </Box>

            <Box style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <FormControl variant="outlined" size="small" style={{ minWidth: 180 }}>
                    <Select displayEmpty value={draftColumn} onChange={(e) => setDraftColumn(e.target.value as any)} MenuProps={menuProps}>
                        <MenuItem value="" disabled>{t('DataSources.view.addFilter')}</MenuItem>
                        {searchable.map(c => <MenuItem key={c.ColumnID} value={c.ColumnID}>{c.DisplayName}</MenuItem>)}
                    </Select>
                </FormControl>
                {/* ⚠️ EXACTLY THREE OPERATORS, DELIBERATELY — do NOT extend this list from the enum.
                    `eFilterOperator` now also carries GT/LT/GTE/LTE/BETWEEN (5..9), but those exist
                    for `dbo.DataSources_SearchSends` (the SendSearch screen). THIS bar builds a
                    `RowsFilter` for `dbo.DataSources_GetRows`, which whitelists 1/2/3 and rejects
                    anything else — offering 5..9 here would put a filter in the menu that the server
                    answers with a red error. The whitelist is `GET_ROWS_OPERATORS` in
                    DataSourceEnums.ts. The options are also NOT derived from the column's DataType
                    here (unlike SendSearch's `operatorsForType`), so widening the enum changed
                    nothing on this screen. */}
                <FormControl variant="outlined" size="small" style={{ minWidth: 140 }}>
                    <Select value={draftOperator} onChange={(e) => setDraftOperator(Number(e.target.value) as eFilterOperator)} MenuProps={menuProps}>
                        <MenuItem value={eFilterOperator.EQUALS}>{t('DataSources.view.operator.1')}</MenuItem>
                        <MenuItem value={eFilterOperator.STARTS_WITH}>{t('DataSources.view.operator.2')}</MenuItem>
                        <MenuItem value={eFilterOperator.CONTAINS}>{t('DataSources.view.operator.3')}</MenuItem>
                    </Select>
                </FormControl>
                <TextField variant="outlined" size="small" label={t('DataSources.view.filterValueLabel')} value={draftValue}
                    onChange={(e) => setDraftValue(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') addFilter(); }} />
                <Button variant="outlined" startIcon={<Add />} onClick={addFilter} disabled={draftColumn === '' || !draftValue.trim()}>
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
