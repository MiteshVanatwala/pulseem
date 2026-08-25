// ═══════════════════════════════════════════════════════════════════════════════════════════
// CLAL CENTER — the starter template (11-CONTRACTS v12 §C1 "אין seed", 14-W3 §2.1).
//
// The database is born COMPLETELY EMPTY. There is no seed script. The first screen an editor
// ever sees is this one, offering two EQUALLY WEIGHTED ways in: run this template, or start from
// nothing. So these strings are DEFAULT CONTENT the editor may rename, reorder, move or delete —
// they are not system values, and no code may branch on them (§C7: `GroupKind` is gone; a
// category is `ParentGroupID === null` and nothing else).
//
// Why it lives in code and not in i18n: it is seed CONTENT for a single Hebrew tenant, editable
// the moment it lands in the DB. Translating it would imply the tree changes with the UI
// language, which is false — the tree is rows in `ClalCenter_Groups`.
//
// ⚠️ CREATION ORDER IS A REAL TRAP — see `STARTER_CATEGORY_ORDER` at the bottom.
// ═══════════════════════════════════════════════════════════════════════════════════════════

export interface StarterCategory {
    title: string;
    subGroups: string[];
}

const SUB_GROUPS = ['מוצרים', 'מידע מקצועי', 'קישורים שימושיים', 'מסמכים'];

/** 7 categories × 4 sub-groups = 35 `SaveGroup` calls. */
export const STARTER_TREE: ReadonlyArray<StarterCategory> = [
    { title: 'מרכז מידע לסוכן', subGroups: SUB_GROUPS.slice() },
    { title: 'השקעות ופיננסים', subGroups: SUB_GROUPS.slice() },
    { title: 'חיסכון ארוך טווח', subGroups: SUB_GROUPS.slice() },
    { title: 'כלל זהב', subGroups: SUB_GROUPS.slice() },
    { title: 'פנסיה', subGroups: SUB_GROUPS.slice() },
    { title: 'בריאות', subGroups: SUB_GROUPS.slice() },
    { title: 'ביטוח כללי', subGroups: SUB_GROUPS.slice() }
];

/** 7 + 7×4. The progress bar counts against this and the copy names it. */
export const STARTER_CALL_COUNT =
    STARTER_TREE.length + STARTER_TREE.reduce((n, c) => n + c.subGroups.length, 0);

/**
 * The categories, in the order they must be SENT — reversed (C6 v12 §13, 14-W3 §2.3).
 *
 * SP2 branch (ג) inserts a new CATEGORY at the HEAD (`ISNULL(MIN(siblings),20)-10`), which is
 * approved behaviour carried over from the mock: the category you just made is the one you are
 * about to work on. Branch (ד) appends a new SUB-GROUP at the TAIL (`ISNULL(MAX,0)+10`), because
 * a sub-group is an addition to a structure that already exists. The asymmetry is deliberate and
 * is NOT to be "fixed".
 *
 * The consequence: sending the 7 categories in template order renders them upside down. Sending
 * them last-first lands them in template order on screen — with no 36th `ReorderGroups` call and
 * no change to any stored procedure. Sub-groups go in natural order (branch ד appends).
 */
export const STARTER_CATEGORY_ORDER: ReadonlyArray<StarterCategory> = STARTER_TREE.slice().reverse();
