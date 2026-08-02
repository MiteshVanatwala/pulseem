// ═══════════════════════════════════════════════════════════════════════════════════════════
// SendSearchFilters — the filter bar (CONTRACT §4.2, `SendSearch-Mock-v3.html:172-198`).
//
// DELIVERY PATH: _delivery\SendSearch-V1\react\screens\SendSearch\components\SendSearchFilters.tsx
// TARGET PATH:   ReactCode\src\screens\SendSearch\components\SendSearchFilters.tsx
//
// Mock facts honoured exactly:
//   :176      free-text search — "שם, אימייל או סלולרי של סוכן או מפקח…"
//   :178-180  role select — סוכן ומפקח / סוכן בלבד / מפקח בלבד
//   :181      campaign select (+ "כל הקמפיינים")
//   :182      two date fields
//   :183      "חפש" (primary) + "עוד מסננים ▾"  ← the mock's own is a STUB, so it ships DISABLED
//   :187-191  segmented row-kind control — הכל / סוכנים בלבד / נמעני ריכוז בלבד
//   :194      "נקה הכל" link
//   :195-196  the >1-year opt-in checkbox, pinned to the far end of the row
//
// The type is imported as `Filters` because CONTRACT §4.3 names the state type `SendSearchFilters`
// and this file's default export has the same name — the alias keeps both, with no renaming of the
// contract type.
// ═══════════════════════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect } from 'react';
import {
    Box, Button, ButtonGroup, Checkbox, FormControlLabel, InputAdornment, MenuItem, TextField, Typography,
} from '@material-ui/core';
import { Search } from '@material-ui/icons';
import { useTranslation } from 'react-i18next';
import {
    SS,
    SendSearchFilters as Filters,
    eRoleFilter,
    eRowKind,
} from '../../../Models/DataSources/SendSearch';

// The campaign dropdown's options. There is no campaign-list endpoint in this contract (§3.3 defines
// only Search and Provenance), so the screen derives the options from the campaigns present in the
// CURRENT result set and hands them down. That is honest — every option offered is a campaign the
// user can actually see rows for — and it adds no unscoped API surface. See LEDGER / contract_issues.
export interface CampaignOption {
    CampaignID: number;
    CampaignName: string;
}

interface Props {
    value: Filters;
    // Partial patch, committed to the slice by the screen. Everything except the free-text box is a
    // COMMITTED filter (it refetches immediately) — matching the mock, where the selects call
    // applyF() directly and only the text box waits for "חפש".
    onChange: (patch: Partial<Filters>) => void;
    onSearch: () => void;
    onClearAll: () => void;
    campaigns: CampaignOption[];
    loading?: boolean;
}

const KIND_ORDER: eRowKind[] = [eRowKind.All, eRowKind.Agents, eRowKind.Rollup];
const KIND_KEY: { [k in eRowKind]: string } = {
    [eRowKind.All]: 'kind.all',
    [eRowKind.Agents]: 'kind.agents',
    [eRowKind.Rollup]: 'kind.rollup',
};

const SendSearchFilters: React.FC<Props> = ({ value, onChange, onSearch, onClearAll, campaigns, loading }) => {
    const { t } = useTranslation();

    // Local text state: typing must not refetch. Committed by "חפש" or Enter — the same
    // searchInput/doSearch split DataSources.tsx and SmartSendManageTab.tsx:60,102 use.
    const [text, setText] = useState(value.SearchText);
    // Re-sync when the slice's text changes from the outside (e.g. "נקה הכל"), otherwise the box would
    // keep showing a term that is no longer being filtered on.
    useEffect(() => { setText(value.SearchText); }, [value.SearchText]);

    const commitText = () => {
        onChange({ SearchText: text.trim() });
        onSearch();
    };

    // Dates are exchanged as ISO `yyyy-MM-dd` — the value shape a native date input uses and a shape
    // JSON.NET binds straight into `DateTime?`. An empty input yields '', which must travel as null
    // (the SP's @prm_DateFrom/@prm_DateTo default), not as an empty string.
    const onDate = (which: 'DateFrom' | 'DateTo') => (e: any) => {
        const v = e.target.value;
        onChange({ [which]: v ? v : null } as Partial<Filters>);
    };

    return (
        <Box
            style={{
                background: '#fff', border: '1px solid #e0e0e0', borderRadius: 10,
                padding: 15, marginBottom: 13,
            }}
        >
            {/* ── row 1: text · role · campaign · dates · actions ── */}
            <Box style={{ display: 'flex', gap: 9, flexWrap: 'wrap', alignItems: 'center' }}>
                <TextField
                    variant="outlined"
                    size="small"
                    placeholder={t(`${SS}searchPlaceholder`)}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') commitText(); }}
                    InputProps={{
                        startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment>,
                    }}
                    style={{ minWidth: 330, flex: '0 1 380px' }}
                    inputProps={{ 'aria-label': t(`${SS}searchPlaceholder`), autoComplete: 'off' }}
                />

                <TextField
                    select
                    variant="outlined"
                    size="small"
                    value={value.RoleFilter}
                    onChange={(e) => onChange({ RoleFilter: Number(e.target.value) as eRoleFilter })}
                    style={{ minWidth: 150 }}
                    inputProps={{ 'aria-label': t(`${SS}role.all`) }}
                >
                    <MenuItem value={eRoleFilter.All}>{t(`${SS}role.all`)}</MenuItem>
                    <MenuItem value={eRoleFilter.Agent}>{t(`${SS}role.agent`)}</MenuItem>
                    <MenuItem value={eRoleFilter.Supervisor}>{t(`${SS}role.supervisor`)}</MenuItem>
                </TextField>

                <TextField
                    select
                    variant="outlined"
                    size="small"
                    // -1 is the sentinel for "all campaigns": MUI's select cannot hold `null` as a
                    // value without falling back to the uncontrolled/empty rendering, and 0 is a
                    // legal-looking campaign id. Converted back to null on the way out.
                    value={value.CampaignID ?? -1}
                    onChange={(e) => {
                        const n = Number(e.target.value);
                        onChange({ CampaignID: n === -1 ? null : n });
                    }}
                    style={{ minWidth: 190 }}
                    inputProps={{ 'aria-label': t(`${SS}campaign.all`) }}
                >
                    <MenuItem value={-1}>{t(`${SS}campaign.all`)}</MenuItem>
                    {campaigns.map((c) => (
                        <MenuItem key={c.CampaignID} value={c.CampaignID}>{c.CampaignName}</MenuItem>
                    ))}
                </TextField>

                <TextField
                    type="date"
                    variant="outlined"
                    size="small"
                    label={t(`${SS}dateFrom`)}
                    value={value.DateFrom ?? ''}
                    onChange={onDate('DateFrom')}
                    InputLabelProps={{ shrink: true }}
                    style={{ width: 160 }}
                />
                <TextField
                    type="date"
                    variant="outlined"
                    size="small"
                    label={t(`${SS}dateTo`)}
                    value={value.DateTo ?? ''}
                    onChange={onDate('DateTo')}
                    InputLabelProps={{ shrink: true }}
                    style={{ width: 160 }}
                />

                <Button variant="contained" color="primary" disabled={loading} onClick={commitText}>
                    {t(`${SS}search`)}
                </Button>
                {/* The mock's "עוד מסננים ▾" is a stub (`:183` — no handler, no panel). V1 ships it
                    DISABLED rather than wired to nothing: a button that opens nothing teaches the user
                    the screen is broken. CONTRACT §4.2 explicitly permits the stub. */}
                <Button variant="outlined" disabled title={t(`${SS}moreFilters`)}>
                    {t(`${SS}moreFilters`)}
                </Button>
            </Box>

            {/* ── row 2: segmented row-kind · clear all · >1-year opt-in ── */}
            <Box
                style={{
                    display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center',
                    marginTop: 12, paddingTop: 11, borderTop: '1px dashed #e0e0e0',
                }}
            >
                <ButtonGroup size="small" role="group" aria-label={t(`${SS}kind.all`)}>
                    {KIND_ORDER.map((k) => {
                        const on = value.RowKind === k;
                        return (
                            <Button
                                key={k}
                                onClick={() => onChange({ RowKind: k })}
                                aria-pressed={on}
                                style={{
                                    // --blue #0371AD when selected (`Mock-v3:58 .seg button.on`).
                                    background: on ? '#0371AD' : '#fff',
                                    color: on ? '#fff' : '#3b4754',
                                    fontWeight: on ? 700 : 400,
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                {t(`${SS}${KIND_KEY[k]}`)}
                            </Button>
                        );
                    })}
                </ButtonGroup>

                <Button variant="text" onClick={onClearAll} style={{ color: '#0371AD', textDecoration: 'underline' }}>
                    {t(`${SS}clearAll`)}
                </Button>

                {/* Pinned to the far (logical) end — `margin-inline-start:auto` in the mock (`:195`).
                    `marginInlineStart` is used, not marginLeft, so the pin follows the RTL direction. */}
                <FormControlLabel
                    style={{ marginInlineStart: 'auto', color: '#5b6b7b' }}
                    control={
                        <Checkbox
                            color="primary"
                            size="small"
                            checked={value.IncludeOverOneYear}
                            onChange={(e) => onChange({ IncludeOverOneYear: e.target.checked })}
                        />
                    }
                    label={
                        // The label states the COST ("זמן החיפוש ארוך יותר") — it is an opt-in that
                        // widens the query past the 12-month partition (§2.2 @prm_IncludeOverOneYear).
                        <Typography component="span" style={{ fontSize: 13, color: '#5b6b7b' }}>
                            {t(`${SS}includeOverOneYear`)}
                        </Typography>
                    }
                />
            </Box>
        </Box>
    );
};

export default SendSearchFilters;
