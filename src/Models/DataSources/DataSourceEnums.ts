// ═══════════════════════════════════════════════════════════════════════════════════════════
// NEUTRAL enum module — the shared filter/type vocabulary of the DataSources family.
//
// WHY THIS FILE EXISTS
// `eFilterOperator` used to be declared TWICE: a three-value copy in `DataSource.ts` (EQUALS /
// STARTS_WITH / CONTAINS) and the full eight-value copy in `SendSearch.ts`. The wire values agreed,
// so nothing broke at runtime — but any file importing both failed to compile, and `FiltersBar.tsx`
// imported the SHORT one, so its operator menu could never grow past 1/2/3 no matter what the
// server accepted.
//
// The obvious fix — delete the copy in `DataSource.ts` and import from `SendSearch.ts` — creates a
// DIRECT IMPORT CYCLE: `SendSearch.ts` already imports `eDataType` from `DataSource.ts`, and
// `DataSource.ts` (`RowsFilter.Operator`) consumes `eFilterOperator`. So the shared vocabulary was
// lifted DOWNWARD into this leaf module instead, and both sides import from here.
//
// ⚠️ THIS MODULE MUST IMPORT NOTHING LOCAL — not `./DataSource`, not `./SendSearch`, not
// `./SmartSend`, not a helper. It is the bottom of the graph; the moment it imports a sibling the
// cycle it was created to break comes straight back. Values only, no types that reference a model.
// ═══════════════════════════════════════════════════════════════════════════════════════════

// Column data type. Values are the WIRE values of dbo.LU_DataSourceDataType / the tinyint carried by
// `DataSourceColumns.DataType`. Never renumber — every saved version stores the NUMBER.
export enum eDataType {
    TEXT = 1,
    NUMBER = 2,
    DATE = 3,
    EMAIL = 4,
    PHONE = 5
}

// Filter operator — ONE definition for both filter surfaces.
//
// The wire values are the tinyint values of `dbo.SendSearchFilterType.Operator` (SendSearch
// CONTRACT §2). APPEND-ONLY, never reorder: a stored/bookmarked clause carries the NUMBER, not the
// name. 1/2/3 are additionally the whitelist that `DataSources_GetRows` enforces, which is why the
// two surfaces could ever share an enum in the first place — the low three mean the same thing to
// both stored procedures.
//
// 4 and 10 are RESERVED AND DELIBERATELY ABSENT — they are `NOT_EQUALS` / `NOT_CONTAINS`, which are
// not expressible against `DataSourceRowSearchValues`: it does not index empty values
// (`UpdateColumnMeta:176`), so "this recipient has no value" and "this recipient is not in the
// index" are the same fact, and a negative operator would silently claim the first.
// They are left as holes rather than renumbered so that if they ever become expressible they can be
// added without moving an existing value (LEDGER #7).
//
// ⚠️ A CONSUMER MAY NOT OFFER EVERY MEMBER. The enum is the union of what the FAMILY understands,
// not a menu. `DataSources_GetRows` (the old DataSources filter bar) accepts 1/2/3 ONLY and rejects
// anything else, so `FiltersBar.tsx` offers exactly those three. Ask
// `SendSearch.operatorsForType(dataType)` for the set a SendSearch column may offer — never assume
// "all of them".
export enum eFilterOperator {
    EQUALS = 1,
    STARTS_WITH = 2,
    CONTAINS = 3,
    // 4 = NOT_EQUALS      — RESERVED, not expressible in v1 (see above)
    GT = 5,
    LT = 6,
    GTE = 7,
    LTE = 8,
    BETWEEN = 9,
    // 10 = NOT_CONTAINS   — RESERVED, not expressible in v1 (see above)
}

// The operators `dbo.DataSources_GetRows` accepts — the ONLY set the DataSources row filter
// (`FiltersBar.tsx` / `RowsFilter`) may send. Declared here, beside the enum, so the two cannot
// drift: widening the enum for SendSearch must never silently widen that screen's menu.
//
// [NUMFILT] 2026-08-23 — this used to be a flat three-value list. It is now keyed by the COLUMN's
// DataType, because the numeric comparisons are legal on a NUMBER column and on nothing else.
// Kept as a flat export as well, because `DataSource.ts:20` re-exports the name and something
// outside this repo may be importing it.
//
// THE SERVER SIDE OF THIS LIST IS NOT ADVISORY. `DataSources_GetRows` does NOT reject an operator
// it cannot implement: `@FilterCount` counts the filter anyway and the final
// `HAVING COUNT(DISTINCT ColID) = @FilterCount` then matches nothing — so an operator this list
// admits before the SQL ships comes back as an EMPTY GRID with HTTP 200, not as an error.
// Deploy order is SQL → C# → React, and this file is the last step.
export const GET_ROWS_OPERATORS: readonly eFilterOperator[] = [
    eFilterOperator.EQUALS,
    eFilterOperator.STARTS_WITH,
    eFilterOperator.CONTAINS,
];

// NUMBER additionally gets GT/LT/GTE/LTE.
//
// DELIBERATE DEVIATION, so it is not read as an oversight: `fn_DataSourceNormalizeValue:67` states
// the family contract as "NUMBER(2) -> operators 1,5,6,7,8,9", i.e. WITHOUT 2 (starts-with) and 3
// (contains). Those two are kept here anyway. They work on this screen today — operator 3 scans
// RowJson and never looks at the column type at all — and silently removing a control an operator
// may be using is a regression this change was not asked to make. This screen is additive only.
//
// BETWEEN (9) is absent everywhere: `dbo.DataSourceFilterType` carries ONE value per clause, and a
// table type cannot be ALTERed. It also cannot be faked with two clauses on one column — the SP
// counts DISTINCT columns, so two clauses on the same column behave as OR, not AND.
const GET_ROWS_OPERATORS_BY_TYPE: { [dt: number]: readonly eFilterOperator[] } = {
    [eDataType.TEXT]: GET_ROWS_OPERATORS,
    [eDataType.NUMBER]: [
        eFilterOperator.EQUALS,
        eFilterOperator.STARTS_WITH,
        eFilterOperator.CONTAINS,
        eFilterOperator.GT,
        eFilterOperator.LT,
        eFilterOperator.GTE,
        eFilterOperator.LTE,
    ],
    [eDataType.DATE]: GET_ROWS_OPERATORS,
    [eDataType.EMAIL]: GET_ROWS_OPERATORS,
    [eDataType.PHONE]: GET_ROWS_OPERATORS,
};

/**
 * The operators the row filter may offer for a column of this type.
 *
 * An unknown / missing type degrades to the three text operators rather than to the widest set —
 * the same direction `SendSearch.operatorsForType` chose. Offering `>` on a column whose type we
 * could not read would be answered by the SP with ReturnCode -10, i.e. a red error on a control
 * the UI itself put in front of the user.
 */
export const getRowsOperatorsForType = (
    dt: eDataType | number | null | undefined
): readonly eFilterOperator[] => GET_ROWS_OPERATORS_BY_TYPE[dt as number] ?? GET_ROWS_OPERATORS;

/** True for the operators that compare numerically — the ones that need a NUMBER column. */
export const isNumericOperator = (op: eFilterOperator | number): boolean =>
    op === eFilterOperator.GT || op === eFilterOperator.LT ||
    op === eFilterOperator.GTE || op === eFilterOperator.LTE;
