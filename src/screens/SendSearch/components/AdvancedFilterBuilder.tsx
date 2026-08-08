// ═══════════════════════════════════════════════════════════════════════════════════════════
// AdvancedFilterBuilder — the third row of the filter card (CONTRACT §2).
//
// TARGET PATH: ReactCode\src\screens\SendSearch\components\AdvancedFilterBuilder.tsx
//
// One rule = field → operator → value(s). The operator list is DERIVED from the field's DataType
// and the value control swaps with the pair, so there is no state in which the user can express a
// filter the SP cannot run. Add / remove / clear-all.
//
// THREE THINGS THIS COMPONENT REFUSES TO DO SILENTLY:
//  1. A field that exists in only SOME of the campaigns on screen SAYS SO, on the field, in words
//     ("חל על 2 מתוך 4 קמפיינים"). Filtering on such a field drops every row from the campaigns
//     that lack it — the user asked to narrow by a value and silently narrowed the POPULATION.
//  2. No searchable fields at all ⇒ an empty state that names the FIX (mark a column as searchable
//     on the data source) instead of an empty box that reads as a broken screen.
//  3. An incomplete rule is kept on screen but excluded from the request (`isRuleComplete`), never
//     sent with a blank value — a blank CONTAINS matches everything, which widens the result set
//     the user believes they just narrowed.
//
// MUI v4 only (`@material-ui/core`), CONTRACT §4.1. No grouped `Select` is used here, so the
// `ListSubheader` onClick trap (§4.5) does not apply; if a group is ever added, the guard
// `if (e.target.value === undefined) return;` becomes mandatory.
// ═══════════════════════════════════════════════════════════════════════════════════════════

import React from 'react';
import {
    Box, Button, IconButton, MenuItem, TextField, Tooltip, Typography,
} from '@material-ui/core';
import { Add, DeleteOutline, InfoOutlined } from '@material-ui/icons';
import { useTranslation } from 'react-i18next';
import { SS } from '../../../Models/DataSources/SendSearch';
import {
    SendSearchField,
    SendSearchFilterRule,
    SendSearchSort,
    SortDir,
    fieldByKey,
    isPartialCoverage,
    isRuleComplete,
    newFilterRule,
    operatorsFor,
    valueKindFor,
} from './SendSearchAdvanced';

interface Props {
    fields: SendSearchField[];
    rules: SendSearchFilterRule[];
    onRulesChange: (rules: SendSearchFilterRule[]) => void;
    sort: SendSearchSort;
    onSortChange: (sort: SendSearchSort) => void;
    onApply: () => void;
    loading?: boolean;
}

const AdvancedFilterBuilder: React.FC<Props> = ({
    fields, rules, onRulesChange, sort, onSortChange, onApply, loading,
}) => {
    const { t } = useTranslation();

    // ── empty state ──────────────────────────────────────────────────────────────────────────
    // No searchable columns anywhere in scope. This is a legitimate configuration, not an error, so
    // it is not an error banner — but it MUST point at the fix. An empty panel with an inert "add"
    // button teaches the user the feature is broken and there is nothing they can do.
    if (fields.length === 0) {
        return (
            <Box style={{ padding: '14px 4px' }}>
                <Typography component="div" style={{ fontSize: 14, fontWeight: 700, color: '#3b4754' }}>
                    {t(`${SS}adv.empty.title`)}
                </Typography>
                <Typography component="div" style={{ fontSize: 13, color: '#5b6b7b', marginTop: 6, maxWidth: '70ch' }}>
                    {t(`${SS}adv.empty.body`)}
                </Typography>
            </Box>
        );
    }

    const patch = (id: string, next: Partial<SendSearchFilterRule>) =>
        onRulesChange(rules.map((r) => (r.Id === id ? { ...r, ...next } : r)));

    // Changing the FIELD may invalidate the operator (a text field has no BETWEEN) and always
    // invalidates the values (a date typed into what is now a number box). Both are reset here
    // rather than left to look valid: a rule showing "מ־2024-01-01" under a numeric field is a
    // filter the user believes is running and which the server would reject or ignore.
    const onFieldChange = (r: SendSearchFilterRule) => (e: any) => {
        const key = String(e.target.value);
        const f = fieldByKey(fields, key);
        const ops = operatorsFor(f ? f.DataType : null);
        patch(r.Id, { FieldKey: key, Operator: ops[0], Value1: '', Value2: '' });
    };

    // Changing the OPERATOR only clears the SECOND value, and only when leaving a range: going
    // 5→9 (GT→BETWEEN) keeps the lower bound the user already typed, which is what they meant.
    const onOperatorChange = (r: SendSearchFilterRule, f: SendSearchField | null) => (e: any) => {
        const op = Number(e.target.value);
        const wasRange = valueKindFor(f ? f.DataType : null, r.Operator);
        const isRange = valueKindFor(f ? f.DataType : null, op);
        const keepV2 = wasRange === isRange;
        patch(r.Id, { Operator: op, Value2: keepV2 ? r.Value2 : '' });
    };

    const addRule = () => {
        const f = fields[0];
        onRulesChange([...rules, newFilterRule(f.FieldKey, operatorsFor(f.DataType)[0])]);
    };

    const removeRule = (id: string) => onRulesChange(rules.filter((r) => r.Id !== id));

    // The value control(s) for one rule. `type` is chosen from the (DataType, Operator) pair, and
    // the number/date inputs are forced LTR: a policy number or an ISO date reorders on screen
    // under RTL and the user would be reading a different number than the one they typed.
    const renderValue = (r: SendSearchFilterRule, f: SendSearchField | null) => {
        const kind = valueKindFor(f ? f.DataType : null, r.Operator);
        const htmlType = (kind === 'number' || kind === 'numberRange')
            ? 'number'
            : ((kind === 'date' || kind === 'dateRange') ? 'date' : 'text');
        const ltr = htmlType !== 'text';
        const common = {
            variant: 'outlined' as const,
            size: 'small' as const,
            type: htmlType,
            InputLabelProps: htmlType === 'date' ? { shrink: true } : undefined,
        };
        const isRange = kind === 'numberRange' || kind === 'dateRange';
        return (
            <>
                <TextField
                    {...common}
                    label={isRange ? t(`${SS}adv.valueFrom`) : t(`${SS}adv.value`)}
                    value={r.Value1}
                    onChange={(e) => patch(r.Id, { Value1: e.target.value })}
                    style={{ width: isRange ? 150 : 210, direction: ltr ? 'ltr' : undefined }}
                    inputProps={{ 'aria-label': t(`${SS}adv.value`), autoComplete: 'off' }}
                />
                {isRange && (
                    <TextField
                        {...common}
                        label={t(`${SS}adv.valueTo`)}
                        value={r.Value2}
                        onChange={(e) => patch(r.Id, { Value2: e.target.value })}
                        style={{ width: 150, direction: ltr ? 'ltr' : undefined }}
                        inputProps={{ 'aria-label': t(`${SS}adv.valueTo`), autoComplete: 'off' }}
                    />
                )}
            </>
        );
    };

    const renderRule = (r: SendSearchFilterRule) => {
        const f = fieldByKey(fields, r.FieldKey);
        const ops = operatorsFor(f ? f.DataType : null);
        const partial = isPartialCoverage(f);
        const complete = isRuleComplete(r, f);
        return (
            <Box key={r.Id} style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 8 }}>
                <TextField
                    select
                    variant="outlined"
                    size="small"
                    label={t(`${SS}adv.field`)}
                    value={r.FieldKey}
                    onChange={onFieldChange(r)}
                    style={{ minWidth: 220 }}
                >
                    {fields.map((x) => (
                        <MenuItem key={x.FieldKey} value={x.FieldKey}>{x.DisplayName || x.FieldKey}</MenuItem>
                    ))}
                </TextField>

                <TextField
                    select
                    variant="outlined"
                    size="small"
                    label={t(`${SS}adv.operator`)}
                    value={r.Operator}
                    onChange={onOperatorChange(r, f)}
                    style={{ minWidth: 165 }}
                >
                    {/* Key CONSTRUCTION from the frozen operator number — `SendSearch.adv.op.9`. No
                        operator→label table in this component (CONTRACT §4 / D10): a table here is a
                        second place that has to learn about operator 10 when it is added. */}
                    {ops.map((op) => (
                        <MenuItem key={op} value={op}>{t(`${SS}adv.op.${op}`)}</MenuItem>
                    ))}
                </TextField>

                {renderValue(r, f)}

                {/* COVERAGE. Stated on the rule that is affected, not once at the top of the panel:
                    the panel can hold five rules and only one of them may be partial. */}
                {partial && f && (
                    <Tooltip title={t(`${SS}adv.partialWarning`) as string}>
                        <Box style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#B54708' }}>
                            <InfoOutlined style={{ fontSize: 17 }} />
                            <Typography component="span" style={{ fontSize: 12.5, fontWeight: 700 }}>
                                {t(`${SS}adv.coverage`, { count: f.CampaignCount, total: f.TotalCampaigns })}
                            </Typography>
                        </Box>
                    </Tooltip>
                )}

                {/* An incomplete rule is not an error the user must fix before anything works — the
                    other rules still run — so it is a quiet note, not a red field. It exists because
                    a rule that is simply IGNORED, with no explanation, looks like a filter that ran
                    and found everything. */}
                {!complete && (
                    <Typography component="span" style={{ fontSize: 12.5, color: '#5b6b7b' }}>
                        {t(`${SS}adv.incomplete`)}
                    </Typography>
                )}

                <IconButton size="small" onClick={() => removeRule(r.Id)} aria-label={t(`${SS}adv.removeRule`)}>
                    <DeleteOutline fontSize="small" />
                </IconButton>
            </Box>
        );
    };

    return (
        <Box style={{ paddingTop: 4 }}>
            {rules.map(renderRule)}

            <Box style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginTop: 4 }}>
                <Button size="small" startIcon={<Add />} onClick={addRule} style={{ color: '#0371AD' }}>
                    {t(`${SS}adv.addRule`)}
                </Button>
                <Button
                    size="small"
                    variant="text"
                    disabled={rules.length === 0}
                    onClick={() => onRulesChange([])}
                    style={{ color: rules.length === 0 ? undefined : '#B42318' }}
                >
                    {t(`${SS}adv.clear`)}
                </Button>

                {/* ── SORT PICKER ──────────────────────────────────────────────────────────────
                    Sorting by a field that is NOT a visible grid column needs a DELIBERATE
                    affordance: a column header cannot express it, because there is no header to
                    click. `TableSortLabel` appears ZERO times in this codebase, so a header-click
                    idiom would also be brand new AND invisible for exactly the fields this feature
                    exists to sort by. A picker states the sort in words, and the grid's
                    SortValueDisplay column shows the value being sorted on — the user can SEE the
                    ordering they asked for. Recorded in LEDGER. */}
                <TextField
                    select
                    variant="outlined"
                    size="small"
                    label={t(`${SS}sort.label`)}
                    value={sort.FieldKey}
                    onChange={(e) => onSortChange({ ...sort, FieldKey: String(e.target.value) })}
                    style={{ minWidth: 210, marginInlineStart: 'auto' }}
                >
                    <MenuItem value="">{t(`${SS}sort.none`)}</MenuItem>
                    {fields.map((x) => (
                        <MenuItem key={x.FieldKey} value={x.FieldKey}>{x.DisplayName || x.FieldKey}</MenuItem>
                    ))}
                </TextField>
                <TextField
                    select
                    variant="outlined"
                    size="small"
                    label={t(`${SS}sort.dir`)}
                    value={sort.Dir}
                    disabled={!sort.FieldKey}
                    onChange={(e) => onSortChange({ ...sort, Dir: String(e.target.value) as SortDir })}
                    style={{ width: 120 }}
                >
                    <MenuItem value="asc">{t(`${SS}sort.asc`)}</MenuItem>
                    <MenuItem value="desc">{t(`${SS}sort.desc`)}</MenuItem>
                </TextField>

                <Button variant="contained" color="primary" size="small" disabled={loading} onClick={onApply}>
                    {t(`${SS}adv.apply`)}
                </Button>
            </Box>

            {/* Says WHERE the sort value will be visible. Without it, sorting by a hidden field
                reorders the grid for no reason the user can see, which reads as a bug. */}
            {!!sort.FieldKey && (
                <Typography component="div" style={{ fontSize: 12.5, color: '#5b6b7b', marginTop: 8 }}>
                    {t(`${SS}sort.hiddenFieldNote`)}
                </Typography>
            )}
        </Box>
    );
};

export default AdvancedFilterBuilder;
