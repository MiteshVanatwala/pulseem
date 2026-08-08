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
    Badge, Box, Button, ButtonGroup, Checkbox, Chip, Collapse, FormControlLabel, InputAdornment,
    MenuItem, TextField, Tooltip, Typography,
} from '@material-ui/core';
import { ExpandLess, ExpandMore, Search } from '@material-ui/icons';
import { useTranslation } from 'react-i18next';
import {
    SS,
    SendSearchFilters as Filters,
    eRoleFilter,
    eRowKind,
} from '../../../Models/DataSources/SendSearch';
import AdvancedFilterBuilder from './AdvancedFilterBuilder';
import {
    SendSearchField,
    SendSearchFilterRule,
    SendSearchSort,
    completeRules,
    defaultSendSearchSort,
    fieldByKey,
} from './SendSearchAdvanced';

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

    // ── advanced filter builder (CONTRACT §2) ────────────────────────────────────────────────
    // ALL OPTIONAL, and that is the degrade path, not laziness: against a server that does not yet
    // project the searchable-field list, `fields` is undefined ⇒ the "עוד מסננים" button stays
    // DISABLED with a tooltip that says why. CONTRACT §2 makes that the CORRECT behaviour rather
    // than a bug — an enabled button over an empty field list is a builder that can express nothing.
    fields?: SendSearchField[];
    rules?: SendSearchFilterRule[];
    onRulesChange?: (rules: SendSearchFilterRule[]) => void;
    sort?: SendSearchSort;
    onSortChange?: (sort: SendSearchSort) => void;
}

const KIND_ORDER: eRowKind[] = [eRowKind.All, eRowKind.Agents, eRowKind.Rollup];
const KIND_KEY: { [k in eRowKind]: string } = {
    [eRowKind.All]: 'kind.all',
    [eRowKind.Agents]: 'kind.agents',
    [eRowKind.Rollup]: 'kind.rollup',
};

const SendSearchFilters: React.FC<Props> = ({
    value, onChange, onSearch, onClearAll, campaigns, loading,
    fields, rules, onRulesChange, sort, onSortChange,
}) => {
    const { t } = useTranslation();

    // ── advanced panel ────────────────────────────────────────────────────────────────────────
    const advFields: SendSearchField[] = fields ?? [];
    const advRules: SendSearchFilterRule[] = rules ?? [];
    const advSort: SendSearchSort = sort ?? defaultSendSearchSort();
    // The builder is reachable only when the server actually offered fields AND the screen wired a
    // change handler. Either missing ⇒ the button stays disabled, exactly as it shipped in V1: a
    // button that opens a panel which can express nothing is worse than a disabled one, because the
    // user concludes the FILTER found nothing rather than that the field list is absent.
    const advAvailable = advFields.length > 0 && !!onRulesChange;
    const [advOpen, setAdvOpen] = useState(false);
    // COUNT = complete rules only. An incomplete rule is not sent (see `isRuleComplete`), so
    // counting it would tell the user a filter is active that is not.
    const activeRules = completeRules(advRules, advFields);
    // A sort on a hidden field is also an active, invisible modification of what the grid shows, so
    // it is counted alongside the rules — otherwise a user who collapses the panel sees a reordered
    // grid with a badge reading 0.
    const activeCount = activeRules.length + (advSort.FieldKey ? 1 : 0);

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
                {/* "עוד מסננים ▾" — was a DISABLED stub in V1 (`Mock-v3:183` has no handler and no
                    panel). It now toggles the advanced builder, and it goes back to being disabled
                    the moment the server offers no searchable fields. That is not a regression to
                    the stub: CONTRACT §2 makes "no fields ⇒ no builder" the correct answer, and the
                    tooltip says which of the two states this is, so a disabled button is never
                    mistaken for a broken one.
                    The Tooltip wraps a <span>, not the Button: MUI attaches its listeners to the
                    child, a disabled button fires no pointer events, and the tooltip that explains
                    WHY it is disabled would be the one tooltip that never appears. */}
                <Tooltip title={(advAvailable ? t(`${SS}moreFilters`) : t(`${SS}adv.unavailable`)) as string}>
                    <span>
                        <Badge
                            color="primary"
                            badgeContent={activeCount}
                            // Hidden while the panel is OPEN: the rules are on screen and counting
                            // them twice is noise. Collapsed, the badge is the only trace that the
                            // grid is being narrowed by something the user cannot see.
                            invisible={advOpen || activeCount === 0}
                        >
                            <Button
                                variant="outlined"
                                disabled={!advAvailable}
                                aria-expanded={advOpen}
                                onClick={() => setAdvOpen((v) => !v)}
                                endIcon={advOpen ? <ExpandLess /> : <ExpandMore />}
                            >
                                {t(`${SS}moreFilters`)}
                            </Button>
                        </Badge>
                    </span>
                </Tooltip>
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

            {/* ── row 3: the advanced builder ──────────────────────────────────────────────────
                INSIDE the same card, with the SAME dashed separator treatment as row 2 — it is a
                third row of one filter, not a second filter mechanism. A separate popover would let
                the user see the grid without the rules that are narrowing it. */}
            {advAvailable && (
                <Collapse in={advOpen} timeout="auto" unmountOnExit>
                    <Box style={{ marginTop: 12, paddingTop: 11, borderTop: '1px dashed #e0e0e0' }}>
                        <AdvancedFilterBuilder
                            fields={advFields}
                            rules={advRules}
                            onRulesChange={onRulesChange!}
                            sort={advSort}
                            onSortChange={onSortChange ?? (() => undefined)}
                            onApply={onSearch}
                            loading={loading}
                        />
                    </Box>
                </Collapse>
            )}

            {/* ── active-filter chips, COLLAPSED ONLY ──────────────────────────────────────────
                When the panel is open the rules themselves are the display. When it is closed these
                chips are the only thing standing between the user and a grid that is silently
                narrowed — so they name the FIELD, not just "3 filters", and each one removes its own
                rule. Rendered only for COMPLETE rules, because only those are actually sent. */}
            {advAvailable && !advOpen && activeCount > 0 && (
                <Box
                    style={{
                        display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center',
                        marginTop: 12, paddingTop: 11, borderTop: '1px dashed #e0e0e0',
                    }}
                >
                    <Typography component="span" style={{ fontSize: 12.5, color: '#5b6b7b' }}>
                        {t(`${SS}adv.activeCount`, { count: activeCount })}
                    </Typography>
                    {activeRules.map((r) => {
                        const f = fieldByKey(advFields, r.FieldKey);
                        const name = f ? (f.DisplayName || f.FieldKey) : r.FieldKey;
                        // Operator label by KEY CONSTRUCTION from the frozen number — the same
                        // `adv.op.<n>` keys the builder's select uses, so the chip and the rule can
                        // never read differently for the same operator.
                        const op = t(`${SS}adv.op.${r.Operator}`);
                        const val = r.Value2 ? `${r.Value1} – ${r.Value2}` : r.Value1;
                        return (
                            <Chip
                                key={r.Id}
                                size="small"
                                // Removing a chip must REFETCH, not just drop the chip: the rule was
                                // narrowing the grid, and leaving the grid narrowed under a chip
                                // that is gone is the exact "silently misled about what you are
                                // looking at" failure this row exists to prevent.
                                onDelete={() => { onRulesChange!(advRules.filter((x) => x.Id !== r.Id)); onSearch(); }}
                                label={`${name} ${op} ${val}`}
                                style={{ backgroundColor: '#E7F1F8', color: '#0e4a6e', fontSize: 12 }}
                            />
                        );
                    })}
                    {!!advSort.FieldKey && (
                        <Chip
                            size="small"
                            onDelete={onSortChange
                                ? () => { onSortChange(defaultSendSearchSort()); onSearch(); }
                                : undefined}
                            label={`${t(`${SS}sort.label`)}: ${
                                (fieldByKey(advFields, advSort.FieldKey)?.DisplayName) || advSort.FieldKey
                            } · ${t(`${SS}sort.${advSort.Dir}`)}`}
                            style={{ backgroundColor: '#F2F4F7', color: '#3b4754', fontSize: 12 }}
                        />
                    )}
                </Box>
            )}
        </Box>
    );
};

export default SendSearchFilters;
