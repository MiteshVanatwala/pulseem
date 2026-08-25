// ═══════════════════════════════════════════════════════════════════════════════════════════
// CLAL CENTER — the mock server. DELETED BY THE W5 FLIP COMMIT.
//
// ⚠️ THE FOLDER `_mocks/` IS SHARED AND MUST SURVIVE — `dataSourcesMock.ts` and `smartSendMock.ts`
// live here and are imported by live slices. The flip deletes THIS FILE ONLY (11-CONTRACTS §C8).
//
// Everything here answers in the EXACT C2 v12 wire shapes (PascalCase, `PrevStatus`,
// `FileRelativePath`, `Config`, and NO `GroupKind` anywhere), and reproduces the server-side
// semantics that the screen visibly depends on, because a mock that is merely "shaped right" lets
// ordering and status bugs through to the flip:
//
//   · SP2 branch (ג) new CATEGORY  → SortOrder = ISNULL(MIN(siblings),20) − 10   (lands FIRST)
//   · SP2 branch (ד) new SUB-GROUP → SortOrder = ISNULL(MAX(siblings),0) + 10    (lands LAST)
//   · SP2 branch (ב) reparent      → SortOrder = MAX(target siblings)+10, and depth gate → −2
//   · SP3/SP6 reorder              → SortOrder = ([key]+1)*10 for the ids RECEIVED only
//   · SP5 insert / group move      → SortOrder = ISNULL(MAX,0)+10; @Status honoured on INSERT ONLY;
//                                    file fields COALESCE on update; type conversions clear fields
//   · SP7 SetStatus                → →2 stores PrevStatus; leaving 2 clears it
//   · SP13 DeleteGroup             → recursive non-empty check ⇒ 400 group_not_empty
//   · SP16 RestoreItem             → comes back as a DRAFT, never to its old status
//   · SP17 RestoreGroup            → group + descendant GROUPS only; never touches items
//   · SP14 pending-site-update     → site-affecting changes only; draft work never lights it
//
// Errors are thrown in the shape the axios response interceptor rejects with — the parsed
// `PulseemResponse` body — so the slice's error path is exercised for real, not bypassed.
//
// TWO DEV LEVERS (documented in FLIP-NOTES.md; both vanish with this file):
//   localStorage['cc_mock_empty'] = '1'   → boot with an EMPTY tree (the first-screen path)
//   window.__ccMockFail = { saveGroupAfter?: n, reorder?: bool, publish?: bool, upload?: bool }
// ═══════════════════════════════════════════════════════════════════════════════════════════

import {
    GroupDto,
    ItemDto,
    ChangeRowDto,
    GetTreeResponse,
    SaveGroupRequest,
    ReorderGroupsRequest,
    ReorderItemsRequest,
    SaveItemRequest,
    PublishRequest,
    PublishResult,
    UpdatedResult,
    SaveGroupResult,
    UploadFileResponse,
    eClalItemType,
    eClalItemStatus,
    eClalEntityType
} from '../../../Models/ClalCenter/ClalCenter';

// ── config the "server" would carry in appSettings ───────────────────────────────────────────
const PUBLIC_BASE_URL = 'https://clalcenter.pulseem.co.il'; // no trailing slash, per §C2
const CHANGED_BY = 'דוד כהן';

const LATENCY_MS = 140;

interface MockFailures {
    saveGroupAfter?: number;
    reorder?: boolean;
    publish?: boolean;
    upload?: boolean;
}

const failures = (): MockFailures => (window as any).__ccMockFail || {};

const delay = <T,>(value: T): Promise<T> =>
    new Promise(resolve => setTimeout(() => resolve(value), LATENCY_MS));

/** Thrown in the shape the response interceptor rejects with: the PulseemResponse body. */
const fail = (key: string, statusCode = 400): Promise<never> =>
    new Promise((_resolve, reject) =>
        setTimeout(() => reject({ StatusCode: statusCode, Message: key, Data: null }), LATENCY_MS)
    );

/** Server clock, ISO with T and WITHOUT Z — exactly what Json.NET emits by default (§C2). */
const stamp = (d: Date = new Date()): string => {
    const p = (n: number) => String(n).padStart(2, '0');
    return (
        d.getFullYear() +
        '-' + p(d.getMonth() + 1) +
        '-' + p(d.getDate()) +
        'T' + p(d.getHours()) +
        ':' + p(d.getMinutes()) +
        ':' + p(d.getSeconds())
    );
};

const minutesAgo = (n: number): string => stamp(new Date(Date.now() - n * 60000));

// ── the "tables" ─────────────────────────────────────────────────────────────────────────────

interface GroupRow extends GroupDto {
    IsDeleted: boolean;
}
interface ItemRow extends ItemDto {
    IsDeleted: boolean;
}
interface ChangeRow extends ChangeRowDto {
    EntityType: eClalEntityType;
    EntityID: number;
}

let groups: GroupRow[] = [];
let items: ItemRow[] = [];
let changeLog: ChangeRow[] = [];
let nextGroupId = 1;
let nextItemId = 1;
let nextPublicationId = 1;
let lastPublishedOn: string | null = null;
/** `Publications.PromotedItemIds` of the last successful publication (the forward-repair basis). */
let promotedItemIds: number[] = [];

const logChange = (
    entityType: eClalEntityType,
    entityId: number,
    fieldName: string,
    oldValue: string | null,
    newValue: string | null
) => {
    changeLog.unshift({
        EntityType: entityType,
        EntityID: entityId,
        FieldName: fieldName,
        OldValue: oldValue,
        NewValue: newValue,
        ChangedBy: CHANGED_BY,
        OnDate: stamp()
    });
};

// ── seed content (the DEMO tree — not a DB seed; the real DB is born empty) ───────────────────

const addGroup = (title: string, parentId: number | null, sortOrder: number, isHidden = false): GroupRow => {
    const g: GroupRow = {
        GroupID: nextGroupId++,
        ParentGroupID: parentId,
        Title: title,
        SortOrder: sortOrder,
        IsHidden: isHidden,
        IsDeleted: false,
        UpdatedBy: null,
        UpdatedDate: null
    };
    groups.push(g);
    return g;
};

const addItem = (partial: Partial<ItemRow> & { GroupID: number; Title: string }): ItemRow => {
    const siblings = items.filter(i => i.GroupID === partial.GroupID && !i.IsDeleted);
    const maxSort = siblings.reduce((m, i) => Math.max(m, i.SortOrder), 0);
    const it: ItemRow = {
        ItemID: nextItemId++,
        GroupID: partial.GroupID,
        ItemType: partial.ItemType ?? eClalItemType.LINK,
        Title: partial.Title,
        Description: partial.Description ?? null,
        Keywords: partial.Keywords ?? [],
        Url: partial.Url ?? null,
        FileRelativePath: partial.FileRelativePath ?? null,
        FileName: partial.FileName ?? null,
        Mime: partial.Mime ?? null,
        SizeBytes: partial.SizeBytes ?? null,
        InfoText: partial.InfoText ?? null,
        SortOrder: maxSort + 10,
        Status: partial.Status ?? eClalItemStatus.DRAFT,
        PrevStatus: partial.PrevStatus ?? null,
        IsDeleted: false,
        UpdatedBy: CHANGED_BY,
        UpdatedDate: partial.UpdatedDate ?? minutesAgo(600)
    };
    items.push(it);
    return it;
};

function seedDemoTree() {
    // Categories are listed in display order; SortOrder is written explicitly so the seed does not
    // depend on the head-insert rule that only applies to interactive creation.
    const c1 = addGroup('מרכז מידע לסוכן', null, 10);
    const c2 = addGroup('השקעות ופיננסים', null, 20);
    const c3 = addGroup('חיסכון ארוך טווח', null, 30);
    const c4 = addGroup('כלל זהב', null, 40);
    const c5 = addGroup('פנסיה', null, 50);
    const c6 = addGroup('בריאות', null, 60);
    const c7 = addGroup('ביטוח כללי', null, 70);

    const c1s1 = addGroup('קישורים שימושיים', c1.GroupID, 10);
    const c1s2 = addGroup('מסמכים', c1.GroupID, 20);

    const c2s1 = addGroup('מידע מקצועי', c2.GroupID, 10);
    const c2s2 = addGroup('קישורים שימושיים', c2.GroupID, 20);
    const c2s3 = addGroup('מסמכים', c2.GroupID, 30);

    const c3s1 = addGroup('מוצרים', c3.GroupID, 10);

    // c4 has EXACTLY ONE sub-group — this is the fixture for the "single sub-group" meta line
    // (C4 §1 / 14-W3 §1): the portal will not print its title, and the admin says so.
    const c4s1 = addGroup('מוצרים', c4.GroupID, 10);

    const c5s1 = addGroup('מידע מקצועי', c5.GroupID, 10);
    // a HIDDEN sub-group, so the eye-slash affordance has something to show on load
    const c5s2 = addGroup('מסמכים ישנים', c5.GroupID, 20, true);

    const c6s1 = addGroup('מוצרים', c6.GroupID, 10);
    const c7s1 = addGroup('קישורים שימושיים', c7.GroupID, 10);

    addItem({
        GroupID: c1s1.GroupID, ItemType: eClalItemType.LINK, Title: 'פורטל הסוכנים של כלל',
        Keywords: ['כניסה', 'פורטל', 'אזור אישי'], Url: 'https://www.clalbit.co.il/agents/',
        Status: eClalItemStatus.PUBLISHED
    });
    addItem({
        GroupID: c1s2.GroupID, ItemType: eClalItemType.FILE, Title: 'מדריך עמלות לסוכן 2026',
        Keywords: ['עמלות', 'תגמול'], FileRelativePath: 'files/6f1c2a90d4b34e0e9f5a1b2c3d4e5f60.pdf',
        FileName: 'agent-fees-2026.pdf', Mime: 'application/pdf', SizeBytes: 2202009,
        Status: eClalItemStatus.DRAFT
    });
    addItem({
        GroupID: c2s1.GroupID, ItemType: eClalItemType.INFO, Title: 'מידע על מסלולי השקעה',
        Keywords: ['מסלולים', 'תשואות'],
        InfoText: 'סקירה מקצועית של מסלולי ההשקעה בכלל, מעודכן לרבעון האחרון.',
        Status: eClalItemStatus.PUBLISHED
    });
    addItem({
        GroupID: c2s2.GroupID, ItemType: eClalItemType.LINK, Title: 'מסלולי השקעה בכלל',
        Keywords: ['השקעות', 'מסלולים', 'קופ״ג', 'גמל'], Url: 'https://www.clalbit.co.il/investments/',
        Status: eClalItemStatus.PUBLISHED
    });
    addItem({
        GroupID: c2s3.GroupID, ItemType: eClalItemType.FILE, Title: 'דוח כספי שנתי',
        Keywords: ['דוחות', 'כספים'], FileRelativePath: 'files/11aa22bb33cc44dd55ee66ff77aa88bb.pdf',
        FileName: 'annual-report.pdf', Mime: 'application/pdf', SizeBytes: 5033164,
        Status: eClalItemStatus.PUBLISHED
    });
    addItem({
        GroupID: c3s1.GroupID, ItemType: eClalItemType.LINK, Title: 'קרן השתלמות לעצמאים',
        Keywords: ['השתלמות', 'קה"ש', 'חסכון', 'עצמאים'], Url: 'https://www.clalbit.co.il/hishtalmut/',
        Status: eClalItemStatus.PUBLISHED
    });
    addItem({
        GroupID: c3s1.GroupID, ItemType: eClalItemType.FILE, Title: 'טופס הצטרפות לקופת גמל',
        Keywords: ['קופ"ג', 'גמל', 'הצטרפות', 'טפסים'],
        FileRelativePath: 'files/99cc88dd77ee66ff55aa44bb33cc22dd.pdf',
        FileName: 'gemel-join-form.pdf', Mime: 'application/pdf', SizeBytes: 629145,
        Status: eClalItemStatus.PUBLISHED
    });
    addItem({
        GroupID: c4s1.GroupID, ItemType: eClalItemType.LINK, Title: 'Clal PAY — כרטיס אשראי',
        Keywords: ['כלל פיי', 'קלאל פיי', 'אשראי', 'הטבות'], Url: 'https://www.clalbit.co.il/clalpay/',
        Status: eClalItemStatus.PUBLISHED
    });
    addItem({
        GroupID: c5s1.GroupID, ItemType: eClalItemType.INFO, Title: 'מסלולי הפנסיה החדשים',
        Keywords: ['פנסיה', 'מסלולים', 'ברירת מחדל'],
        InfoText: 'הסבר על מסלולי ברירת המחדל החדשים ומה חשוב לדעת לקראת פגישת לקוח.',
        Status: eClalItemStatus.PUBLISHED
    });
    // hidden, and it WAS published — so "החזרה" has a PrevStatus=1 path to demonstrate
    addItem({
        GroupID: c5s1.GroupID, ItemType: eClalItemType.FILE, Title: 'טופס העברת קרן פנסיה',
        Keywords: ['ניוד', 'העברה', 'טפסים'],
        FileRelativePath: 'files/aa11bb22cc33dd44ee55ff66aa77bb88.pdf',
        FileName: 'pension-transfer.pdf', Mime: 'application/pdf', SizeBytes: 943718,
        Status: eClalItemStatus.HIDDEN, PrevStatus: eClalItemStatus.PUBLISHED
    });
    addItem({
        GroupID: c5s2.GroupID, ItemType: eClalItemType.FILE, Title: 'טופס ניוד ישן (2019)',
        Keywords: ['ארכיון'], FileRelativePath: 'files/cc33dd44ee55ff66aa77bb88cc99dd00.pdf',
        FileName: 'pension-transfer-2019.pdf', Mime: 'application/pdf', SizeBytes: 411041,
        Status: eClalItemStatus.PUBLISHED
    });
    addItem({
        GroupID: c6s1.GroupID, ItemType: eClalItemType.LINK, Title: 'ביטוח בריאות פרט',
        Keywords: ['בריאות', 'בטוח', 'פרט'], Url: 'https://www.clalbit.co.il/health/',
        Status: eClalItemStatus.PUBLISHED
    });
    addItem({
        GroupID: c7s1.GroupID, ItemType: eClalItemType.LINK, Title: 'הפקת פוליסת רכב',
        Keywords: ['רכב', 'פוליסה', 'הפקה'], Url: 'https://www.clalbit.co.il/car/',
        Status: eClalItemStatus.DRAFT
    });

    // A prior publication, so the "published · pending changes" chip and the badge have a baseline.
    lastPublishedOn = minutesAgo(720);
    promotedItemIds = items.filter(i => i.Status === eClalItemStatus.PUBLISHED).map(i => i.ItemID);
    nextPublicationId = 12;

    // Two history rows, so the history drawer is not empty on first open.
    changeLog.push({
        EntityType: eClalEntityType.ITEM, EntityID: 1, FieldName: 'Status',
        OldValue: '0', NewValue: '1', ChangedBy: CHANGED_BY, OnDate: minutesAgo(730)
    });
    changeLog.push({
        EntityType: eClalEntityType.ITEM, EntityID: 1, FieldName: 'Title',
        OldValue: 'פורטל הסוכנים', NewValue: 'פורטל הסוכנים של כלל', ChangedBy: CHANGED_BY,
        OnDate: minutesAgo(1440)
    });
}

const bootEmpty = (): boolean => {
    try {
        return window.localStorage.getItem('cc_mock_empty') === '1';
    } catch (e) {
        return false;
    }
};

if (!bootEmpty()) seedDemoTree();

// ── helpers that mirror the SP predicates ────────────────────────────────────────────────────

const liveGroups = (): GroupRow[] => groups.filter(g => !g.IsDeleted);
const liveItems = (): ItemRow[] => items.filter(i => !i.IsDeleted);
const groupById = (id: number): GroupRow | undefined => groups.find(g => g.GroupID === id);
const childrenOf = (id: number): GroupRow[] => liveGroups().filter(g => g.ParentGroupID === id);

/** Every live group in the subtree rooted at `id`, `id` included. */
const subtreeGroupIds = (id: number): number[] => {
    const out = [id];
    childrenOf(id).forEach(c => out.push(...subtreeGroupIds(c.GroupID)));
    return out;
};

const itemsInSubtree = (id: number): ItemRow[] => {
    const ids = subtreeGroupIds(id);
    return liveItems().filter(i => ids.indexOf(i.GroupID) > -1);
};

/** DB stores the relative path; the absolute display URL is composed on the way out. */
const toDto = (row: ItemRow): ItemDto => {
    const { IsDeleted, ...dto } = row;
    if (row.ItemType === eClalItemType.FILE && row.FileRelativePath) {
        return { ...dto, Url: PUBLIC_BASE_URL + '/' + row.FileRelativePath, Keywords: row.Keywords.slice() };
    }
    return { ...dto, Keywords: row.Keywords.slice() };
};

const groupToDto = (row: GroupRow): GroupDto => {
    const { IsDeleted, ...dto } = row;
    return dto;
};

const isUnderHiddenGroup = (groupId: number): boolean => {
    let g = groupById(groupId);
    while (g) {
        if (g.IsHidden) return true;
        g = g.ParentGroupID ? groupById(g.ParentGroupID) : undefined;
    }
    return false;
};

const after = (when: string | null | undefined, since: string | null): boolean => {
    if (!when) return false;
    if (!since) return true; // SP14: a null baseline means every clause is judged without the date test
    return when > since;
};

/** SP14 — site-affecting changes only. Draft work never lights the badge. */
function computePendingSiteUpdate(): boolean {
    const anyLive = liveItems().some(i => i.Status === eClalItemStatus.PUBLISHED);

    for (const i of items) {
        if (!i.IsDeleted && i.Status === eClalItemStatus.PUBLISHED && after(i.UpdatedDate, lastPublishedOn)) return true;
        if (!i.IsDeleted && i.Status === eClalItemStatus.HIDDEN && i.PrevStatus === eClalItemStatus.PUBLISHED &&
            after(i.UpdatedDate, lastPublishedOn)) return true;
        if (i.IsDeleted && i.Status === eClalItemStatus.PUBLISHED && after(i.UpdatedDate, lastPublishedOn)) return true;
    }

    const structural = ['SortOrder', 'Title', 'ParentGroupID', 'IsHidden'];
    for (const row of changeLog) {
        if (row.EntityType !== eClalEntityType.GROUP) continue;
        if (structural.indexOf(row.FieldName) === -1) continue;
        if (!after(row.OnDate, lastPublishedOn)) continue;
        // item reorder inside a real group ⇒ only if THAT group holds a published item
        const g = groupById(row.EntityID);
        if (row.FieldName === 'SortOrder' && g && !childrenOf(row.EntityID).length) {
            if (liveItems().some(i => i.GroupID === row.EntityID && i.Status === eClalItemStatus.PUBLISHED)) return true;
            continue;
        }
        // root reorder (EntityID = 0) and category-level operations ⇒ any live content at all
        if (anyLive) return true;
    }
    return false;
}

const buildConfig = () => ({
    PublicBaseUrl: PUBLIC_BASE_URL,
    PortalUrl: PUBLIC_BASE_URL,
    LastPublishedOn: lastPublishedOn,
    PendingSiteUpdate: computePendingSiteUpdate()
});

// ── the endpoints ────────────────────────────────────────────────────────────────────────────

export function mockGetTree(): Promise<GetTreeResponse> {
    const g = liveGroups()
        .slice()
        .sort((a, b) => {
            const pa = a.ParentGroupID ?? 0;
            const pb = b.ParentGroupID ?? 0;
            return pa - pb || a.SortOrder - b.SortOrder;
        })
        .map(groupToDto);
    return delay({ Groups: g, Items: liveItems().map(toDto), Config: buildConfig() });
}

let saveGroupCalls = 0;

export function mockSaveGroup(req: SaveGroupRequest): Promise<SaveGroupResult> {
    saveGroupCalls++;
    const f = failures();
    if (typeof f.saveGroupAfter === 'number' && saveGroupCalls > f.saveGroupAfter) {
        return fail('server_error', 500);
    }
    if (!req.Title || !req.Title.trim()) return fail('title_required');

    // (ב) reparent — the ONLY path that moves a group between categories
    if (req.GroupID && req.NewParentGroupID) {
        const target = groupById(req.NewParentGroupID);
        if (!target) return fail('server_error', 500);
        if (target.ParentGroupID) return fail('depth_exceeded'); // SP2 returns −2
        const row = groupById(req.GroupID);
        if (!row) return fail('server_error', 500);
        const siblings = childrenOf(req.NewParentGroupID).filter(g => g.GroupID !== req.GroupID);
        const maxSort = siblings.reduce((m, g) => Math.max(m, g.SortOrder), 0);
        logChange(eClalEntityType.GROUP, row.GroupID, 'ParentGroupID',
            String(row.ParentGroupID ?? ''), String(req.NewParentGroupID));
        if (row.Title !== req.Title) {
            logChange(eClalEntityType.GROUP, row.GroupID, 'Title', row.Title, req.Title);
            row.Title = req.Title;
        }
        row.ParentGroupID = req.NewParentGroupID;
        row.SortOrder = maxSort + 10;
        row.UpdatedDate = stamp();
        row.UpdatedBy = CHANGED_BY;
        return delay({ GroupID: row.GroupID });
    }

    // (א) rename only — ParentGroupID is NOT touched, ever
    if (req.GroupID) {
        const row = groupById(req.GroupID);
        if (!row) return fail('server_error', 500);
        if (row.Title !== req.Title) {
            logChange(eClalEntityType.GROUP, row.GroupID, 'Title', row.Title, req.Title);
            row.Title = req.Title;
            row.UpdatedDate = stamp();
            row.UpdatedBy = CHANGED_BY;
        }
        return delay({ GroupID: row.GroupID });
    }

    // (ד) insert sub-group — appends at the TAIL
    if (req.ParentGroupID) {
        const parent = groupById(req.ParentGroupID);
        if (!parent) return fail('server_error', 500);
        if (parent.ParentGroupID) return fail('depth_exceeded');
        const siblings = childrenOf(req.ParentGroupID);
        const maxSort = siblings.reduce((m, g) => Math.max(m, g.SortOrder), 0);
        const row = addGroup(req.Title, req.ParentGroupID, maxSort + 10);
        logChange(eClalEntityType.GROUP, row.GroupID, 'Title', null, req.Title);
        return delay({ GroupID: row.GroupID });
    }

    // (ג) insert category — lands at the HEAD (approved asymmetry, see starterTree.ts)
    const roots = liveGroups().filter(g => !g.ParentGroupID);
    const minSort = roots.length ? roots.reduce((m, g) => Math.min(m, g.SortOrder), roots[0].SortOrder) : 20;
    const row = addGroup(req.Title, null, minSort - 10);
    logChange(eClalEntityType.GROUP, row.GroupID, 'Title', null, req.Title);
    return delay({ GroupID: row.GroupID });
}

export function mockDeleteGroup(req: { GroupID: number }): Promise<UpdatedResult> {
    const row = groupById(req.GroupID);
    if (!row) return fail('server_error', 500);
    if (itemsInSubtree(req.GroupID).length) return fail('group_not_empty'); // SP13 returns −1
    const ids = subtreeGroupIds(req.GroupID);
    ids.forEach(id => {
        const g = groupById(id);
        if (g) {
            g.IsDeleted = true;
            g.UpdatedDate = stamp();
            g.UpdatedBy = CHANGED_BY;
        }
    });
    logChange(eClalEntityType.GROUP, req.GroupID, 'IsDeleted', '0', '1');
    return delay({ Updated: ids.length });
}

export function mockRestoreGroup(req: { GroupID: number }): Promise<UpdatedResult> {
    // SP17 restores the group and every DESCENDANT GROUP. It never touches items — SP13 refuses
    // to delete a group that still holds one, so no item is ever deleted "as part of" a group.
    const restore = (id: number) => {
        const g = groupById(id);
        if (!g) return 0;
        g.IsDeleted = false;
        let n = 1;
        groups.filter(c => c.ParentGroupID === id && c.IsDeleted).forEach(c => { n += restore(c.GroupID); });
        return n;
    };
    const n = restore(req.GroupID);
    if (!n) return fail('server_error', 500);
    logChange(eClalEntityType.GROUP, req.GroupID, 'IsDeleted', '1', '0');
    return delay({ Updated: n });
}

export function mockReorderGroups(req: ReorderGroupsRequest): Promise<UpdatedResult> {
    if (failures().reorder) return fail('server_error', 500);
    const parentId = req.ParentGroupID ?? null;
    const before = liveGroups()
        .filter(g => (g.ParentGroupID ?? null) === parentId)
        .sort((a, b) => a.SortOrder - b.SortOrder)
        .map(g => g.GroupID)
        .join(',');
    let updated = 0;
    req.OrderedGroupIds.forEach((id, index) => {
        const g = groupById(id);
        if (!g) return;
        g.SortOrder = (index + 1) * 10; // SP3: ([key]+1)*10
        updated++;
    });
    logChange(eClalEntityType.GROUP, parentId ?? 0, 'SortOrder', before, req.OrderedGroupIds.join(','));
    return delay({ Updated: updated });
}

export function mockSetGroupVisibility(req: { GroupID: number; IsHidden: boolean }): Promise<UpdatedResult> {
    const g = groupById(req.GroupID);
    if (!g) return fail('server_error', 500);
    if (g.IsHidden === req.IsHidden) return delay({ Updated: 0 });
    logChange(eClalEntityType.GROUP, g.GroupID, 'IsHidden', g.IsHidden ? '1' : '0', req.IsHidden ? '1' : '0');
    // Written on the group ONLY. Descendants are skipped at RENDER time, so unhiding restores the
    // previous state exactly (SP15).
    g.IsHidden = req.IsHidden;
    g.UpdatedDate = stamp();
    g.UpdatedBy = CHANGED_BY;
    return delay({ Updated: 1 });
}

export function mockSaveItem(req: SaveItemRequest): Promise<ItemDto> {
    if (!req.Title || !req.Title.trim()) return fail('title_required');
    if (req.ItemType === eClalItemType.LINK) {
        if (!req.Url) return fail('url_required');
        if (!/^https:\/\//i.test(req.Url)) return fail('url_invalid');
    }
    if (req.ItemType === eClalItemType.INFO && !req.InfoText) return fail('infotext_required');
    if (req.Keywords && (req.Keywords.length > 15 || req.Keywords.join(',').length > 400)) {
        return fail('keywords_too_long');
    }

    const existing = req.ItemID ? items.find(i => i.ItemID === req.ItemID) : undefined;
    if (req.ItemID && !existing) return fail('server_error', 500);

    if (req.ItemType === eClalItemType.FILE && !req.FileRef && !existing?.FileRelativePath) {
        return fail('file_required');
    }

    if (!existing) {
        const created = addItem({
            GroupID: req.GroupID,
            ItemType: req.ItemType,
            Title: req.Title.trim(),
            Description: req.Description ?? null,
            Keywords: (req.Keywords || []).slice(),
            Url: req.ItemType === eClalItemType.LINK ? req.Url ?? null : req.FileRef?.RelativePath ?? null,
            FileRelativePath: req.FileRef?.RelativePath ?? null,
            FileName: req.FileRef?.OriginalName ?? null,
            Mime: req.FileRef?.Mime ?? null,
            SizeBytes: req.FileRef?.SizeBytes ?? null,
            InfoText: req.ItemType === eClalItemType.INFO ? req.InfoText ?? null : null,
            Status: req.Status, // honoured on INSERT only
            UpdatedDate: stamp()
        });
        logChange(eClalEntityType.ITEM, created.ItemID, 'Title', null, created.Title);
        return delay(toDto(created));
    }

    const row = existing;
    const log = (field: string, oldV: string | null, newV: string | null) => {
        if (oldV !== newV) logChange(eClalEntityType.ITEM, row.ItemID, field, oldV, newV);
    };

    log('Title', row.Title, req.Title.trim());
    log('Description', row.Description ?? null, req.Description ?? null);
    log('SearchKeywords', row.Keywords.join(','), (req.Keywords || []).join(','));

    if (req.GroupID !== row.GroupID) {
        log('GroupID', String(row.GroupID), String(req.GroupID));
        const siblings = liveItems().filter(i => i.GroupID === req.GroupID);
        row.SortOrder = siblings.reduce((m, i) => Math.max(m, i.SortOrder), 0) + 10; // SP5: MAX+10
        row.GroupID = req.GroupID;
    }

    // type conversions (SP5): 2→1 clears file meta and sets Url; 2→3 clears all four;
    // 1→3 clears Url; anything→2 requires a file (checked above).
    const oldType = row.ItemType;
    if (oldType !== req.ItemType) {
        log('ItemType', String(oldType), String(req.ItemType));
        if (oldType === eClalItemType.FILE) {
            row.FileRelativePath = null;
            row.FileName = null;
            row.Mime = null;
            row.SizeBytes = null;
        }
        if (req.ItemType !== eClalItemType.LINK) row.Url = null;
        if (req.ItemType !== eClalItemType.INFO) row.InfoText = null;
    }
    row.ItemType = req.ItemType;
    row.Title = req.Title.trim();
    row.Description = req.Description ?? null;
    row.Keywords = (req.Keywords || []).slice();

    if (req.ItemType === eClalItemType.LINK) {
        log('Url', row.Url ?? null, req.Url ?? null);
        row.Url = req.Url ?? null;
    } else if (req.ItemType === eClalItemType.FILE) {
        // COALESCE: a title-only edit with no re-upload must NOT wipe the file, and must NOT
        // write a false ChangeLog row (SP5 preservation rules).
        if (req.FileRef) {
            log('FileName', row.FileName ?? null, req.FileRef.OriginalName);
            row.FileRelativePath = req.FileRef.RelativePath;
            row.Url = req.FileRef.RelativePath;
            row.FileName = req.FileRef.OriginalName;
            row.Mime = req.FileRef.Mime;
            row.SizeBytes = req.FileRef.SizeBytes;
        }
    } else {
        log('InfoText', row.InfoText ?? null, req.InfoText ?? null);
        row.InfoText = req.InfoText ?? null;
    }

    // @Status is applied on INSERT ONLY — status moves through SetStatus, never through here.
    row.UpdatedDate = stamp();
    row.UpdatedBy = CHANGED_BY;
    return delay(toDto(row));
}

export function mockSetStatus(req: { ItemID: number; Status: eClalItemStatus }): Promise<UpdatedResult> {
    const row = items.find(i => i.ItemID === req.ItemID);
    if (!row) return fail('server_error', 500);
    if (row.Status === req.Status) return delay({ Updated: 0 });
    logChange(eClalEntityType.ITEM, row.ItemID, 'Status', String(row.Status), String(req.Status));
    if (req.Status === eClalItemStatus.HIDDEN) row.PrevStatus = row.Status;
    else if (row.Status === eClalItemStatus.HIDDEN) row.PrevStatus = null;
    row.Status = req.Status;
    row.UpdatedDate = stamp();
    row.UpdatedBy = CHANGED_BY;
    return delay({ Updated: 1 });
}

export function mockDeleteItem(req: { ItemID: number }): Promise<UpdatedResult> {
    const row = items.find(i => i.ItemID === req.ItemID);
    if (!row) return fail('server_error', 500);
    row.IsDeleted = true;
    row.UpdatedDate = stamp();
    row.UpdatedBy = CHANGED_BY;
    logChange(eClalEntityType.ITEM, row.ItemID, 'IsDeleted', '0', '1');
    return delay({ Updated: 1 });
}

export function mockRestoreItem(req: { ItemID: number }): Promise<UpdatedResult> {
    const row = items.find(i => i.ItemID === req.ItemID);
    if (!row) return fail('server_error', 500);
    row.IsDeleted = false;
    // SP16: an item that comes back comes back as a DRAFT. It never returns to the site without
    // an explicit decision.
    row.Status = eClalItemStatus.DRAFT;
    row.PrevStatus = null;
    row.UpdatedDate = stamp();
    row.UpdatedBy = CHANGED_BY;
    logChange(eClalEntityType.ITEM, row.ItemID, 'IsDeleted', '1', '0');
    return delay({ Updated: 1 });
}

export function mockReorderItems(req: ReorderItemsRequest): Promise<UpdatedResult> {
    if (failures().reorder) return fail('server_error', 500);
    const before = liveItems()
        .filter(i => i.GroupID === req.GroupID)
        .sort((a, b) => a.SortOrder - b.SortOrder)
        .map(i => i.ItemID)
        .join(',');
    let updated = 0;
    req.OrderedItemIds.forEach((id, index) => {
        const row = items.find(i => i.ItemID === id);
        if (!row) return;
        row.SortOrder = (index + 1) * 10; // SP6
        updated++;
    });
    logChange(eClalEntityType.GROUP, req.GroupID, 'SortOrder', before, req.OrderedItemIds.join(','));
    return delay({ Updated: updated });
}

const EXT_MIME: { [ext: string]: string } = {
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ppt: 'application/vnd.ms-powerpoint',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    mp3: 'audio/mpeg',
    mp4: 'video/mp4',
    wav: 'audio/wav'
};

export function mockUploadFile(file: File): Promise<UploadFileResponse> {
    if (failures().upload) return fail('server_error', 500);
    const ext = (file.name.split('.').pop() || '').toLowerCase();
    if (!EXT_MIME[ext]) return fail('ext_not_allowed');
    if (file.size > 25 * 1024 * 1024) return fail('file_too_large');
    const guid = 'ffffffffffffffffffffffffffffffff'
        .split('')
        .map(() => '0123456789abcdef'[Math.floor(Math.random() * 16)])
        .join('');
    const relativePath = 'files/' + guid + '.' + ext;
    return new Promise(resolve =>
        setTimeout(
            () =>
                resolve({
                    StorageName: guid + '.' + ext,
                    RelativePath: relativePath,
                    Url: PUBLIC_BASE_URL + '/' + relativePath,
                    OriginalName: file.name,
                    Mime: EXT_MIME[ext],
                    SizeBytes: file.size
                }),
            700
        )
    );
}

export function mockPublish(req: PublishRequest): Promise<PublishResult> {
    if (failures().publish) return fail('publish_failed', 500);

    // (0) forward repair — anything the previous publication promoted but never got to stamp.
    promotedItemIds.forEach(id => {
        const row = items.find(i => i.ItemID === id);
        if (row && !row.IsDeleted && row.Status === eClalItemStatus.DRAFT) {
            row.Status = eClalItemStatus.PUBLISHED;
            logChange(eClalEntityType.ITEM, row.ItemID, 'Status', '0', '1');
        }
    });

    // (2) candidate set = (Status=1 ∪ requested) ∖ hidden ∖ deleted ∖ anything under a hidden group
    const requested = req.ItemIds || [];
    const candidates = liveItems().filter(i => {
        const inSet = i.Status === eClalItemStatus.PUBLISHED || requested.indexOf(i.ItemID) > -1;
        if (!inSet) return false;
        if (i.Status === eClalItemStatus.HIDDEN) return false; // a hidden id in the request is ignored
        if (isUnderHiddenGroup(i.GroupID)) return false;
        return true;
    });

    const publicationId = nextPublicationId++;
    // (2.5) PromotedItemIds is written BEFORE the file is written — the whole basis of forward repair
    promotedItemIds = candidates.map(i => i.ItemID);
    const createdDate = stamp();

    // (5) only after the write succeeds
    candidates.forEach(i => {
        if (i.Status !== eClalItemStatus.PUBLISHED) {
            logChange(eClalEntityType.ITEM, i.ItemID, 'Status', String(i.Status), '1');
            i.Status = eClalItemStatus.PUBLISHED;
            i.PrevStatus = null;
        }
    });

    // LastPublishedOn is the publication's CreatedDate — never its CompletedDate (§C2).
    lastPublishedOn = createdDate;

    return delay({
        PublicationID: publicationId,
        ItemCount: candidates.length,
        PublishedUrl: PUBLIC_BASE_URL + '/content/published.json'
    });
}

export function mockGetHistory(entityType: eClalEntityType, entityId: number, top = 50): Promise<ChangeRowDto[]> {
    const rows = changeLog
        .filter(r => r.EntityType === entityType && r.EntityID === entityId)
        .slice(0, top)
        .map(r => ({
            FieldName: r.FieldName,
            OldValue: r.OldValue,
            NewValue: r.NewValue,
            ChangedBy: r.ChangedBy,
            OnDate: r.OnDate
        }));
    return delay(rows);
}
