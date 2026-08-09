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
    Paper, TextField, Tooltip, Typography,
} from '@material-ui/core';
import { ExpandLess, ExpandMore, Search } from '@material-ui/icons';
// v4-alpha lab, the same source `GroupSelectorDropDown.tsx:4` uses. Deliberately NOT a
// `<Select multiple>`: a search box placed inside a MUI v4 Select's MenuList fights the list's
// built-in type-ahead, which swallows keystrokes and jumps the highlight on every letter typed.
// Autocomplete's input IS the search box, so there is no second keyboard consumer to fight.
import { Autocomplete } from '@material-ui/lab';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import {
    SS,
    SendSearchFilters as Filters,
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
    // Distinguishes "the server could not give us the list" from "the list is genuinely empty".
    // Without it the picker's empty state would assert, from a failed request, that this account has
    // no campaigns — a claim about the DATA made from a fact about the NETWORK.
    campaignsError?: string | null;
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
    value, onChange, onSearch, onClearAll, campaigns, campaignsError, loading,
    fields, rules, onRulesChange, sort, onSortChange,
}) => {
    const { t } = useTranslation();
    // MUI portals its popups to document.body — outside App's inner <div dir> — and <html dir> is
    // stuck "ltr", so any menu opens LTR unless its own Paper is given a direction. Applied below to
    // the Autocomplete's PaperComponent, exactly as BusinessColumnsPicker (SmartSend) does for a
    // Select. isRTL is the same redux source App uses for the body div.
    const isRTL = useSelector((s: any) => s.core && s.core.isRTL);

    // ── campaign picker value ─────────────────────────────────────────────────────────────────
    // The slice stores IDS; Autocomplete wants the option OBJECTS. Derived here rather than kept as
    // a second piece of state, so there is exactly one source of truth for the selection.
    //
    // 🔴 THE FALLBACK IS THE POINT. An id whose option is not in the list — the catalog has not
    // loaded yet, or the user narrowed the date range so the campaign left scope — still produces a
    // chip, labelled `#id`. Silently dropping it would leave the grid filtered by a campaign with
    // NOTHING on screen to say so: the user would see a near-empty result, no chips, and conclude
    // that nothing was sent. Showing an ugly `#4821` chip they can remove is strictly better than
    // hiding an active filter, and it is the same principle as the advanced-rule chips below.
    const selectedCampaigns: CampaignOption[] = (value.CampaignIDs || []).map(
        (id) => campaigns.filter((c) => c.CampaignID === id)[0]
            ?? { CampaignID: id, CampaignName: '' },
    );

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
        // FIX 2026-08-09: fire ONE fetch per click, not two. onChange -> setFilters makes the
        // `filters` effect in SendSearchPanel refetch on a committed change; calling onSearch()
        // as well produced two identical POST /Search calls per "חפש"/Enter — which, under the
        // (previously) named PK_Match constraint on #Match, also raced into "There is already an
        // object named 'PK_Match'". onSearch() is only needed when the text did NOT change, so the
        // effect will not fire on its own.
        const next = text.trim();
        if (next !== value.SearchText) onChange({ SearchText: next });
        else onSearch();
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

                {/* RoleFilter dropdown REMOVED 2026-08-09. It was a search-text SCOPE ("search agent
                    identity" vs "search supervisor value"), NOT a row filter — inert unless a search
                    term was typed (SP 21_SendSearch_SearchSends_SP.sql:532 wraps its whole clause in
                    `@Search IS NULL OR …`), so on an empty box it changed nothing and read as a broken
                    control. Its options ("סוכן בלבד"/"מפקח בלבד") also duplicated, to the eye, the
                    RowKind segmented control below ("סוכנים בלבד"/"מפקחים בלבד"). In this domain
                    מפקח ≡ נמען-ריכוז, so RowKind already gives the agent/supervisor split the operator
                    wants. `RoleFilter` stays in state at its default eRoleFilter.All (0) and is still
                    sent to the SP unchanged, so text search now always spans BOTH agent and supervisor
                    — the SP's own default. Nothing on the wire or in the SP changed. */}

                {/* ── campaign multi-select ────────────────────────────────────────────────────
                    Was a single <TextField select> holding one CampaignID with a -1 sentinel for
                    "all". It is now a checkbox picker with a search field, writing `CampaignIDs`.

                    NO SENTINEL any more, and that is a simplification rather than a rewrite: an
                    EMPTY selection already means "all campaigns", both on the wire and in the SP
                    (`@HasCampFilter = 0` ⇒ the predicate is inert). The old -1 existed only because
                    MUI's Select cannot hold null; an array has no such problem.

                    `CampaignID` (scalar) is deliberately left untouched at its default null — the
                    SP unions the two, so writing both would be two sources of truth for one filter.

                    The options are the SERVER's list now (result set [1] of the catalog SP), not the
                    campaigns scraped from loaded result rows. That change is what makes the search
                    box honest: it searches every campaign that has actually sent in scope, so
                    "not found" means the campaign does not exist rather than "not fetched yet". */}
                <Autocomplete
                    multiple
                    disableCloseOnSelect
                    size="small"
                    options={campaigns}
                    value={selectedCampaigns}
                    onChange={(_e: any, next: any) => onChange({
                        CampaignIDs: ((next || []) as CampaignOption[]).map((c) => c.CampaignID),
                    })}
                    // A campaign with no name still has to be pickable and, more importantly,
                    // READABLE once picked — an unlabelled chip is a filter the user cannot identify.
                    getOptionLabel={(o: any) => (o && o.CampaignName ? o.CampaignName : `#${o && o.CampaignID}`)}
                    // Identity is the ID, never the object: `selectedCampaigns` rebuilds its objects
                    // on every render, so reference equality would tick nothing.
                    getOptionSelected={(o: any, v: any) => !!o && !!v && o.CampaignID === v.CampaignID}
                    // Beyond two, chips eat the whole filter row. "+N" stays clickable and the full
                    // list is one click away in the open menu.
                    limitTags={2}
                    // The menu is portaled out of App's inner <div dir>, and <html dir> is stuck
                    // "ltr" — same defect the Select menus work around above. Forced on the Paper.
                    PaperComponent={(props: any) => <Paper {...props} dir={isRTL ? 'rtl' : 'ltr'} />}
                    noOptionsText={campaignsError
                        ? t(`${SS}campaign.loadFailed`)
                        : t(`${SS}campaign.none`)}
                    style={{ minWidth: 260, flex: '0 1 320px' }}
                    renderOption={(option: any, { selected }: any) => (
                        <>
                            <Checkbox
                                icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                                checkedIcon={<CheckBoxIcon fontSize="small" />}
                                style={{ marginInlineEnd: 8 }}
                                checked={selected}
                                color="primary"
                            />
                            <Typography component="span" style={{ fontSize: 13.5 }}>
                                {option && option.CampaignName ? option.CampaignName : `#${option && option.CampaignID}`}
                            </Typography>
                        </>
                    )}
                    renderInput={(params: any) => (
                        <TextField
                            {...params}
                            variant="outlined"
                            // The placeholder carries the state: with nothing ticked the filter IS
                            // "all campaigns", and saying so is what replaces the removed menu item.
                            placeholder={selectedCampaigns.length === 0
                                ? t(`${SS}campaign.all`)
                                : t(`${SS}campaign.search`)}
                            inputProps={{
                                ...params.inputProps,
                                'aria-label': t(`${SS}campaign.label`),
                                autoComplete: 'off',
                            }}
                        />
                    )}
                />

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
