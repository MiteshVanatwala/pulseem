import { useState } from 'react';
import {
    Box, TextField, Select, MenuItem, Button, Chip, Typography, InputAdornment, FormControl
} from '@material-ui/core';
import { Search, Add } from '@material-ui/icons';
import { useTranslation } from 'react-i18next';
import { DataSourceColumn, RowsFilter } from '../../../Models/DataSources/DataSource';
import {
    eFilterOperator, getRowsOperatorsForType, isNumericOperator
} from '../../../Models/DataSources/DataSourceEnums';

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
//
// [NUMFILT] 2026-08-23: the operator menu is TYPE-AWARE. A NUMBER column additionally offers
// GT/LT/GTE/LTE (5..8), served by the numeric half of the search index
// (dbo.DataSourceRowSearchValues.ValueNum). The set lives in DataSourceEnums.getRowsOperatorsForType
// and is mirrored by the C# whitelist in DataSourcesController.GetRows — three places must agree:
// this menu, that whitelist, and dbo.DataSources_GetRows / _Stage. The SP is the only one of the
// three that fails SILENTLY when it disagrees (an empty grid with HTTP 200), which is why it ships
// first.
const FiltersBar = ({ classes, columns, filters, onFiltersChange, freeText, onFreeTextChange, onSearch }: FiltersBarProps) => {
    const { t, i18n } = useTranslation();
    const isRtl = (i18n.dir?.() ?? 'rtl') === 'rtl';
    const searchable = (columns || []).filter(c => c.IsSearchable);
    const [draftColumn, setDraftColumn] = useState<number | ''>('');
    const [draftOperator, setDraftOperator] = useState<eFilterOperator>(eFilterOperator.EQUALS);
    const [draftValue, setDraftValue] = useState('');

    // [NUMFILT] 2026-08-23. The operator menu is now derived from the SELECTED COLUMN's DataType,
    // because GT/LT/GTE/LTE are legal on a NUMBER column and on nothing else — the SP answers a
    // numeric operator on any other family with ReturnCode -10.
    //
    // Nothing had to be added to the wire for this: `DataType` has always been on
    // `DataSourceColumn` (DataSource.ts:224) and `DataSources_GetRows` has always returned it in
    // RS1. This bar simply never read it.
    const colById = (id: number | '') =>
        id === '' ? undefined : searchable.find(c => c.ColumnID === Number(id));
    const draftOps = getRowsOperatorsForType(colById(draftColumn)?.DataType);

    // Dropdowns must drop BELOW the field (not cover it) and stay anchored to its START edge:
    // right in RTL, left in LTR. anchorOrigin is a prop, not CSS, so jss-rtl never mirrors it and
    // MUI v4's Popover does not either — hardcoding 'right' anchored en/pl menus to the END edge.
    // getContentAnchorEl:null is what lets anchorOrigin.vertical:'bottom' actually apply in MUI v4.
    const menuProps: any = {
        getContentAnchorEl: null,
        anchorOrigin: { vertical: 'bottom', horizontal: isRtl ? 'right' : 'left' },
        transformOrigin: { vertical: 'top', horizontal: isRtl ? 'right' : 'left' },
        PaperProps: { dir: isRtl ? 'rtl' : 'ltr', style: { maxHeight: 320, marginTop: 4 } }
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
                    {/* [NUMFILT] Changing the column may make the CURRENT operator illegal for the
                        new column's type — pick "יעד 1" and ">", then switch to an email column and
                        the ">" would still be selected and would come back as a red -10 from the SP
                        on a control the UI itself offered. Reset to EQUALS whenever the operator in
                        hand is not in the new column's set; keep it when it still is, so switching
                        between two NUMBER columns does not throw away the operator. Invisible before
                        this change, because 1/2/3 were legal on every type. */}
                    <Select displayEmpty value={draftColumn} MenuProps={menuProps}
                        onChange={(e) => {
                            const id = e.target.value as any;
                            setDraftColumn(id);
                            const nextOps = getRowsOperatorsForType(colById(id)?.DataType);
                            setDraftOperator(prev => (nextOps.indexOf(prev) >= 0 ? prev : eFilterOperator.EQUALS));
                        }}>
                        <MenuItem value="" disabled>{t('DataSources.view.addFilter')}</MenuItem>
                        {searchable.map(c => <MenuItem key={c.ColumnID} value={c.ColumnID}>{c.DisplayName}</MenuItem>)}
                    </Select>
                </FormControl>
                {/* [NUMFILT] 2026-08-23 — the three hardcoded MenuItems that used to sit here are
                    now `draftOps`, derived from the selected column's DataType by
                    `getRowsOperatorsForType`. That helper — NOT this component — is the single
                    place the legal set is written down, so this menu and the C# whitelist in
                    DataSourcesController.GetRows cannot drift.

                    ⚠️ STILL DO NOT MAP THE WHOLE `eFilterOperator` ENUM HERE. It is the union of
                    what the FAMILY understands, not a menu: 9 (BETWEEN) belongs to
                    `dbo.DataSources_SearchSends` and needs a second value this screen's table type
                    cannot carry, and 4 / 10 are reserved holes. Add operators in
                    DataSourceEnums.ts, after the SP that implements them has shipped. */}
                <FormControl variant="outlined" size="small" style={{ minWidth: 140 }}>
                    <Select value={draftOperator} onChange={(e) => setDraftOperator(Number(e.target.value) as eFilterOperator)} MenuProps={menuProps}>
                        {draftOps.map(op => (
                            <MenuItem key={op} value={op}>{t(`DataSources.view.operator.${op}`)}</MenuItem>
                        ))}
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

            {/* [NUMFILT] The value box stays a PLAIN TextField for numeric operators — deliberately
                NOT <input type="number">, which is what SendSearch's AdvancedFilterBuilder uses. In
                a number input the browser rejects a pasted "250,000" and reports value === '', and
                the clause would then be dropped from the request with no error at all, returning
                MORE rows than asked for. That matters more since the grid started rendering NUMBER
                cells WITH separators: the operator's natural move is to copy a cell and paste it
                here. dbo.fn_DataSourceNormalizeValue parses separators, a currency symbol and the
                U+200E/U+200F marks, so the paste is handled server-side, where it belongs. */}
            {isNumericOperator(draftOperator) && (
                <Typography style={{ fontSize: 12, color: '#475467' }}>{t('DataSources.view.numericFilterHint')}</Typography>
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
