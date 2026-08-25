// ═══════════════════════════════════════════════════════════════════════════════════════════
// ClalCenterScreen — "מרכז כלל", the CMS for the Clal agent portal.
// Built against 11-CONTRACTS v12 (§C2 shapes, §C5 search, §C6 behaviour) and 14-W3-ADMIN.
//
// THE FIVE THINGS THAT STOPPED PREVIOUS BUILDERS, and where each is handled:
//  1. `tsc` baseline is ONE known error, not a wall — nothing here may add a second.
//  2. `DrawerStack` is COPIED (`ClalDrawerStack.tsx`), never imported — its Level union is closed.
//  3. `StatusChip` is NOT reused — `ClalStatusChip` exists because the other chip's enum compiles
//     against ours and then lies.
//  4. EVERY call is wrapped, not just uploads: `PulseemReactAPI.ts:74-81` dereferences
//     `error.response.status` unguarded, so a timeout arrives as a TypeError. `toErrorKey` in the
//     slice is the single funnel.
//  5. The menu entry is TOP-LEVEL, and this screen declares `currentPage="clalCenter"` with NO
//     `subPage` — `DefaultScreen.js:42` does `route[0].options.filter(...)` and a top-level record
//     has no `options`, so passing a subPage crashes it.
//
// THE REFRESH RULE (§C6, and the one exception): every structure/status/publish action re-reads
// `GetTree`, because the server computes SortOrder and PendingSiteUpdate and the client must not
// guess them. REORDER IS THE EXCEPTION (C6 v12 §7): the client SENT the order, a refresh returns
// what is already on screen, and one landing mid-gesture re-renders the list under the cursor.
// There, `PendingSiteUpdate` is raised client-side instead — conservatively, never lowered.
// ═══════════════════════════════════════════════════════════════════════════════════════════

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import {
    Badge, Box, Button, CircularProgress, Collapse, Dialog, DialogActions, DialogContent,
    DialogTitle, IconButton, InputAdornment, TextField, Tooltip, Typography
} from '@material-ui/core';
import {
    Search, Clear, Edit, DeleteOutline, History, Visibility, VisibilityOff, ExpandMore, ChevronRight
} from '@material-ui/icons';
import {
    DndContext, DragOverlay, PointerSensor, closestCenter, useSensor, useSensors
} from '@dnd-kit/core';
import type { CollisionDetection, DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';

import DefaultScreen from '../DefaultScreen';
import { ClassesType } from '../Classes.types';
import useRedirect from '../../helpers/Routes/Redirect';
import { sitePrefix } from '../../config';
import { PulseemFeatures } from '../../model/PulseemFields/Fields';
import i18n from '../../i18n';
import {
    CC, GroupDto, ItemDto, eClalEntityType, eClalItemStatus, eClalItemType
} from '../../Models/ClalCenter/ClalCenter';
import {
    getClalTree, saveClalGroup, deleteClalGroup, restoreClalGroup, setClalGroupVisibility,
    saveClalItem, setClalItemStatus, deleteClalItem, restoreClalItem, publishClalCenter,
    reorderClalGroups, applyLocalGroupReparent, markPendingSiteUpdate
} from '../../redux/reducers/clalCenterSlice';

import ClalDrawerStack, { ClalDrawerEntry } from './components/ClalDrawerStack';
import ClalStatusChip, { rowStripeColor } from './components/ClalStatusChip';
import ClalToast, { useClalToast } from './components/ClalToast';
import ConfirmDialog from './components/ConfirmDialog';
import DeleteGroupDialog from './components/DeleteGroupDialog';
import { EmptyCategory, EmptySubGroup, FirstScreen } from './components/EmptyStates';
import GroupRow from './components/GroupRow';
import { buildNameUsage, buildPathOptions } from './components/GroupPathPicker';
import HistoryDrawer from './components/HistoryDrawer';
import ItemDrawer, {
    ItemDraft, clearDraftSession, draftFromItem, draftValidationError, emptyDraft,
    loadDraftFromSession, saveDraftToSession
} from './components/ItemDrawer';
import { NameSuggestField } from './components/KeywordChips';
import PublishPreviewDrawer from './components/PublishPreviewDrawer';
import SortableRow, {
    DragLevel, DropStrip, SortableData, groupDragId, itemDragId, parseDragId, useHandleStyles
} from './components/SortableRow';
import useReorder, { listIdOf } from './hooks/useReorder';
import { MIN_QUERY_CHARS, SEARCH_DEBOUNCE_MS, matchesTokens, norm, tokenize, verifyC5Vectors } from './searchNormalizer';
import { STARTER_CALL_COUNT, STARTER_CATEGORY_ORDER } from './starterTree';

const USE_CC_MOCK = true;

const handleDomId = (dragId: string) => `cc-handle-${dragId}`;

interface DeleteTarget {
    group: GroupDto;
    emptyChildCount: number;
    itemCount: number;
    itemIds: number[];
}

const ClalCenterScreen = ({ classes }: ClassesType) => {
    const { t } = useTranslation();
    const dispatch = useDispatch<any>();
    const Redirect = useRedirect();
    const handleStyles = useHandleStyles();

    const { accountFeatures } = useSelector((state: any) => state.common);
    const { groups, items, config, loadStatus } = useSelector((state: any) => state.clalCenter);
    const { toast, show, dismiss } = useClalToast();

    const isRTL = (i18n.dir?.() ?? 'rtl') === 'rtl';

    // ── screen state ─────────────────────────────────────────────────────────────────────────
    const [openCategories, setOpenCategories] = useState<number[]>([]);
    const [searchInput, setSearchInput] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [busy, setBusy] = useState(false);
    const [announcement, setAnnouncement] = useState('');
    const [vocabOpen, setVocabOpen] = useState(false);
    const [addingCategory, setAddingCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [starterProgress, setStarterProgress] = useState<{ n: number; total: number } | null>(null);
    const [addSubGroupFor, setAddSubGroupFor] = useState<GroupDto | null>(null);
    const [newSubGroupName, setNewSubGroupName] = useState('');
    const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
    const [moveProgress, setMoveProgress] = useState<{ n: number; total: number } | null>(null);
    const [pendingItemDelete, setPendingItemDelete] = useState<number | null>(null);
    const [confirmDiscard, setConfirmDiscard] = useState(false);
    const [rovingIndex, setRovingIndex] = useState<{ [listId: string]: number }>({});

    // drawers
    const [stack, setStack] = useState<ClalDrawerEntry[]>([]);
    const [draft, setDraft] = useState<ItemDraft | null>(null);
    const [snapshot, setSnapshot] = useState<ItemDraft | null>(null);
    const [restoredFromSession, setRestoredFromSession] = useState(false);
    const [previewOnly, setPreviewOnly] = useState(false);
    const [historyTarget, setHistoryTarget] = useState<{ type: eClalEntityType; id: number; title: string } | null>(null);

    // drag
    const [activeDrag, setActiveDrag] = useState<{ id: string; level: DragLevel; title: string } | null>(null);

    const pendingDeleteTimer = useRef<any>(null);
    const itemDeleteTimer = useRef<any>(null);

    // ── error / toast helpers ────────────────────────────────────────────────────────────────
    const showErrorKey = useCallback(
        (key: string) => show(t(`${CC}error.${key}`), 'error'),
        [show, t]
    );

    const { reorder, flushReorders, snapBackListId } = useReorder({
        onError: key => {
            show(t(`${CC}toast.reorderFailed`), 'error');
            if (key !== 'server_error') showErrorKey(key);
        }
    });

    // ── feature gate (identical to the sidebar gate in routes.tsx and the route gate in App.js) ─
    useEffect(() => {
        if (accountFeatures?.length && accountFeatures.indexOf(PulseemFeatures.CLAL_CENTER) === -1) {
            Redirect({ url: sitePrefix ?? '', openNewTab: false });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [accountFeatures]);

    const refresh = useCallback(async () => {
        await dispatch(getClalTree());
    }, [dispatch]);

    useEffect(() => {
        refresh();
    }, [refresh]);

    // The eight C5 equivalence vectors, run as CODE (an acceptance criterion) rather than as a
    // claim in a document. Printed only while the mock switch is on; the W5 flip removes this
    // block along with the flag. `verifyC5Vectors` itself is pure and ships either way.
    useEffect(() => {
        if (!USE_CC_MOCK) return;
        const { allPass, results } = verifyC5Vectors();
        // eslint-disable-next-line no-console
        console.log(`[ClalCenter] C5 vectors: ${results.filter(r => r.pass).length}/${results.length} pass — ${allPass ? 'ALL PASS' : 'FAILURE'}`);
        // eslint-disable-next-line no-console
        console.table(results.map(r => ({ '#': r.index, a: r.a, b: r.b, 'norm(a)': r.normA, 'norm(b)': r.normB, pass: r.pass })));
    }, []);

    // debounced search — same 150ms and same 2-character minimum as the portal (§C5)
    useEffect(() => {
        const timer = setTimeout(() => setSearchQuery(searchInput), SEARCH_DEBOUNCE_MS);
        return () => clearTimeout(timer);
    }, [searchInput]);

    useEffect(() => () => {
        clearTimeout(pendingDeleteTimer.current);
        clearTimeout(itemDeleteTimer.current);
    }, []);

    // ── derived tree ─────────────────────────────────────────────────────────────────────────
    const categories: GroupDto[] = useMemo(
        () => (groups as GroupDto[]).filter(g => !g.ParentGroupID).slice().sort((a, b) => a.SortOrder - b.SortOrder),
        [groups]
    );

    const subGroupsOf = useCallback(
        (categoryId: number): GroupDto[] =>
            (groups as GroupDto[]).filter(g => g.ParentGroupID === categoryId).slice().sort((a, b) => a.SortOrder - b.SortOrder),
        [groups]
    );

    const itemsOf = useCallback(
        (groupId: number): ItemDto[] =>
            (items as ItemDto[]).filter(i => i.GroupID === groupId).slice().sort((a, b) => a.SortOrder - b.SortOrder),
        [items]
    );

    const groupById = useCallback(
        (id: number): GroupDto | undefined => (groups as GroupDto[]).find(g => g.GroupID === id),
        [groups]
    );

    const tokens = useMemo(() => tokenize(searchQuery), [searchQuery]);
    const searchActive = tokens.length > 0;

    /** Pre-normalised haystack per item — normalising every row on every keystroke is the one hot spot. */
    const haystacks = useMemo(() => {
        const map: { [itemId: number]: string } = {};
        (items as ItemDto[]).forEach(i => {
            map[i.ItemID] = norm([i.Title, i.Description ?? '', (i.Keywords ?? []).join(' ')].join(' '));
        });
        return map;
    }, [items]);

    const itemMatches = useCallback(
        (item: ItemDto) => !searchActive || matchesTokens(haystacks[item.ItemID] ?? '', tokens),
        [haystacks, searchActive, tokens]
    );

    const visibleItemsOf = useCallback(
        (groupId: number) => itemsOf(groupId).filter(itemMatches),
        [itemMatches, itemsOf]
    );

    const searchTotal = useMemo(
        () => (searchActive ? (items as ItemDto[]).filter(itemMatches).length : 0),
        [itemMatches, items, searchActive]
    );

    const anyLiveItem = useMemo(
        () => (items as ItemDto[]).some(i => i.Status === eClalItemStatus.PUBLISHED),
        [items]
    );

    const groupHasLive = useCallback(
        (groupId: number) => itemsOf(groupId).some(i => i.Status === eClalItemStatus.PUBLISHED),
        [itemsOf]
    );

    /** A group is effectively hidden if it, or any ancestor, carries IsHidden. */
    const effectivelyHidden = useCallback(
        (group: GroupDto): boolean => {
            let cursor: GroupDto | undefined = group;
            while (cursor) {
                if (cursor.IsHidden) return true;
                cursor = cursor.ParentGroupID ? groupById(cursor.ParentGroupID) : undefined;
            }
            return false;
        },
        [groupById]
    );

    const subtreeItems = useCallback(
        (groupId: number): ItemDto[] => {
            const ids = [groupId];
            const walk = (id: number) => subGroupsOf(id).forEach(child => { ids.push(child.GroupID); walk(child.GroupID); });
            walk(groupId);
            return (items as ItemDto[]).filter(i => ids.indexOf(i.GroupID) > -1);
        },
        [items, subGroupsOf]
    );

    const keywordPool = useMemo(() => {
        const out: string[] = [];
        (items as ItemDto[]).forEach(i => (i.Keywords ?? []).forEach(k => out.push(k)));
        return out;
    }, [items]);

    const nameUsage = useMemo(() => buildNameUsage(groups as GroupDto[]), [groups]);
    const pathOptions = useMemo(() => buildPathOptions(groups as GroupDto[]), [groups]);

    const pathLabelOf = useCallback(
        (groupId: number | null): string => {
            if (!groupId) return '';
            const found = pathOptions.find(p => p.id === groupId);
            return found?.label ?? groupById(groupId)?.Title ?? '';
        },
        [groupById, pathOptions]
    );

    const draftCount = useMemo(
        () => (items as ItemDto[]).filter(i => i.Status === eClalItemStatus.DRAFT).length,
        [items]
    );

    const pendingChangesOn = useCallback(
        (item: ItemDto): boolean =>
            item.Status === eClalItemStatus.PUBLISHED &&
            !!item.UpdatedDate &&
            !!config?.LastPublishedOn &&
            item.UpdatedDate > config.LastPublishedOn,
        [config]
    );

    // ── site-update helpers ──────────────────────────────────────────────────────────────────

    const runSiteUpdate = useCallback(async () => {
        setBusy(true);
        // A queued reorder must not land after the snapshot the publish takes.
        await flushReorders();
        const result: any = await dispatch(publishClalCenter({}));
        if (result?.error) showErrorKey(result?.payload?.error ?? 'publish_failed');
        else show(t(`${CC}toast.siteUpdated`));
        await refresh();
        setBusy(false);
    }, [dispatch, flushReorders, refresh, show, showErrorKey, t]);

    /**
     * "<what happened> · לעדכן את האתר עכשיו?" with the two frozen actions.
     *
     * ⚠️ `leadingActions` exists because raising two toasts in a row DESTROYS the first one, and
     * for a delete the first one is the UNDO — which 14-W3 §4 requires on the delete toast. So a
     * delete that also affected live content emits ONE toast carrying [ביטול] as well as the
     * frozen [עדכון האתר] / [לא עכשיו] pair, instead of an undo the editor never gets to click.
     */
    const offerSiteUpdate = useCallback(
        (message: string, leadingActions: Array<{ label: string; onClick: () => void }> = []) => {
            show(`${message} · ${t(`${CC}toast.updateSiteQuestion`)}`, 'success', [
                ...leadingActions,
                { label: t(`${CC}toast.updateSiteAction`), onClick: () => { runSiteUpdate(); } },
                { label: t(`${CC}toast.notNow`), onClick: () => undefined }
            ]);
        },
        [runSiteUpdate, show, t]
    );

    // ── group operations ─────────────────────────────────────────────────────────────────────

    const createCategory = async () => {
        const title = newCategoryName.trim();
        if (!title) { show(t(`${CC}toast.categoryNameRequired`), 'error'); return; }
        setBusy(true);
        const result: any = await dispatch(saveClalGroup({ Title: title }));
        setBusy(false);
        if (result?.error) { showErrorKey(result?.payload?.error ?? 'server_error'); return; }
        setNewCategoryName('');
        setAddingCategory(false);
        await refresh();
        // SP2 branch (ג) puts a new category at the HEAD — so it is the first row, and it opens.
        const newId = result?.payload?.GroupID;
        if (newId) setOpenCategories(prev => (prev.indexOf(newId) > -1 ? prev : prev.concat(newId)));
        show(t(`${CC}toast.categoryAdded`));
    };

    const createSubGroup = useCallback(
        async (categoryId: number, title: string): Promise<number | null> => {
            const result: any = await dispatch(saveClalGroup({ ParentGroupID: categoryId, Title: title }));
            if (result?.error) { showErrorKey(result?.payload?.error ?? 'server_error'); return null; }
            await refresh();
            show(t(`${CC}toast.subGroupAdded`));
            return result?.payload?.GroupID ?? null;
        },
        [dispatch, refresh, show, showErrorKey, t]
    );

    const submitAddSubGroup = async () => {
        if (!addSubGroupFor || !newSubGroupName.trim()) return;
        setBusy(true);
        const id = await createSubGroup(addSubGroupFor.GroupID, newSubGroupName.trim());
        setBusy(false);
        if (id) {
            setAddSubGroupFor(null);
            setNewSubGroupName('');
            setOpenCategories(prev =>
                prev.indexOf(addSubGroupFor.GroupID) > -1 ? prev : prev.concat(addSubGroupFor.GroupID));
        }
    };

    const renameGroup = async (group: GroupDto, title: string) => {
        setBusy(true);
        // Rename ONLY — `NewParentGroupID` is deliberately absent, so SP2 takes branch (א) and
        // ParentGroupID is never touched.
        const result: any = await dispatch(saveClalGroup({ GroupID: group.GroupID, Title: title }));
        setBusy(false);
        if (result?.error) { showErrorKey(result?.payload?.error ?? 'server_error'); return; }
        await refresh();
        const isCategory = !group.ParentGroupID;
        const message = t(`${CC}toast.${isCategory ? 'categoryRenamed' : 'subGroupRenamed'}`);
        if (anyLiveItem) offerSiteUpdate(message);
        else show(message);
    };

    const toggleGroupVisibility = async (group: GroupDto) => {
        const nextHidden = !group.IsHidden;
        setBusy(true);
        const result: any = await dispatch(
            setClalGroupVisibility({ GroupID: group.GroupID, IsHidden: nextHidden })
        );
        setBusy(false);
        if (result?.error) { showErrorKey(result?.payload?.error ?? 'server_error'); return; }
        const hadLive = subtreeItems(group.GroupID).some(i => i.Status === eClalItemStatus.PUBLISHED);
        await refresh();
        // No live content underneath ⇒ nothing to remove from the site ⇒ no offer, no Publish.
        if (!hadLive) { show(t(`${CC}toast.${nextHidden ? 'groupHiddenQuiet' : 'groupShownQuiet'}`)); return; }
        offerSiteUpdate(t(`${CC}toast.${nextHidden ? 'groupHidden' : 'groupShown'}`));
    };

    const openDeleteFlow = (group: GroupDto) => {
        const children = subGroupsOf(group.GroupID);
        const inSubtree = subtreeItems(group.GroupID);
        setDeleteTarget({
            group,
            emptyChildCount: children.length,
            itemCount: inSubtree.length,
            itemIds: inSubtree.slice().sort((a, b) => a.SortOrder - b.SortOrder).map(i => i.ItemID)
        });
    };

    /** Case (א) and (ב): the group holds no items, so SP13 will accept it. */
    const deleteEmptyGroup = async (group: GroupDto) => {
        setBusy(true);
        const result: any = await dispatch(deleteClalGroup({ GroupID: group.GroupID }));
        setBusy(false);
        setDeleteTarget(null);
        if (result?.error) { showErrorKey(result?.payload?.error ?? 'server_error'); return; }
        await refresh();
        const isCategory = !group.ParentGroupID;
        const message = t(`${CC}toast.${isCategory ? 'categoryDeleted' : 'subGroupDeleted'}`);
        // Real undo: SP17 restores the group and every descendant group.
        show(message, 'success', [{
            label: t(`${CC}toast.undo`),
            onClick: async () => {
                const undo: any = await dispatch(restoreClalGroup({ GroupID: group.GroupID }));
                if (undo?.error) showErrorKey(undo?.payload?.error ?? 'server_error');
                else show(t(`${CC}toast.undone`));
                await refresh();
            }
        }]);
    };

    /** Case (ג) (א): move the items out, THEN delete the emptied group. */
    const moveItemsAndDelete = async (targetGroupId: number) => {
        if (!deleteTarget) return;
        const { group, itemIds } = deleteTarget;
        setBusy(true);
        // ⚠️ SEQUENTIAL, IN ASCENDING SortOrder. SP5 assigns MAX+10 in the target group, so the
        // order the calls arrive in IS the resulting order. `Promise.all` would shuffle it.
        for (let index = 0; index < itemIds.length; index++) {
            setMoveProgress({ n: index + 1, total: itemIds.length });
            const item = (items as ItemDto[]).find(i => i.ItemID === itemIds[index]);
            if (!item) continue;
            const result: any = await dispatch(saveClalItem({
                ItemID: item.ItemID,
                GroupID: targetGroupId,
                ItemType: item.ItemType,
                Title: item.Title,
                Description: item.Description ?? null,
                Keywords: item.Keywords ?? [],
                Url: item.ItemType === eClalItemType.LINK ? item.Url ?? null : null,
                InfoText: item.ItemType === eClalItemType.INFO ? item.InfoText ?? null : null,
                Status: item.Status
            }));
            if (result?.error) {
                setMoveProgress(null);
                setBusy(false);
                showErrorKey(result?.payload?.error ?? 'server_error');
                await refresh();
                return;
            }
        }
        setMoveProgress(null);
        const result: any = await dispatch(deleteClalGroup({ GroupID: group.GroupID }));
        setBusy(false);
        setDeleteTarget(null);
        if (result?.error) { showErrorKey(result?.payload?.error ?? 'server_error'); await refresh(); return; }
        await refresh();
        // Nothing was destroyed here, so there is nothing to undo — just say what happened.
        if (anyLiveItem) offerSiteUpdate(t(`${CC}toast.itemsMoved`));
        else show(t(`${CC}toast.itemsMoved`));
    };

    /** Case (ג) (ב): N×DeleteItem, then DeleteGroup. Undo is N×RestoreItem, then RestoreGroup. */
    const deleteGroupWithContent = async () => {
        if (!deleteTarget) return;
        const { group, itemIds } = deleteTarget;
        setBusy(true);
        for (let index = 0; index < itemIds.length; index++) {
            const result: any = await dispatch(deleteClalItem({ ItemID: itemIds[index] }));
            if (result?.error) {
                setBusy(false);
                showErrorKey(result?.payload?.error ?? 'server_error');
                await refresh();
                return;
            }
        }
        const result: any = await dispatch(deleteClalGroup({ GroupID: group.GroupID }));
        setBusy(false);
        setDeleteTarget(null);
        if (result?.error) { showErrorKey(result?.payload?.error ?? 'server_error'); await refresh(); return; }
        const hadLive = itemIds.some(id =>
            (items as ItemDto[]).find(i => i.ItemID === id)?.Status === eClalItemStatus.PUBLISHED);
        await refresh();
        const isCategory = !group.ParentGroupID;
        const message = t(`${CC}toast.${isCategory ? 'categoryDeleted' : 'subGroupDeleted'}`);
        // SP17 restores groups only — SP13 never deletes items, so the item restores are the
        // CLIENT's job, and this screen is the only place that knows which ids went with it.
        // Order per §C1 SP17: N×RestoreItem, then RestoreGroup.
        const undoAction = {
            label: t(`${CC}toast.undo`),
            onClick: async () => {
                for (let index = 0; index < itemIds.length; index++) {
                    await dispatch(restoreClalItem({ ItemID: itemIds[index] }));
                }
                const undo: any = await dispatch(restoreClalGroup({ GroupID: group.GroupID }));
                if (undo?.error) showErrorKey(undo?.payload?.error ?? 'server_error');
                else show(t(`${CC}toast.undone`));
                await refresh();
            }
        };
        // One toast, not two — the second would wipe the undo before it could be clicked.
        if (hadLive) offerSiteUpdate(message, [undoAction]);
        else show(message, 'success', [undoAction]);
    };

    // ── starter template ─────────────────────────────────────────────────────────────────────

    const runStarterTemplate = async () => {
        setStarterProgress({ n: 0, total: STARTER_CALL_COUNT });
        let done = 0;
        // ⚠️ CATEGORIES IN REVERSE (C6 v12 §13). SP2 branch (ג) inserts a new category at the
        // HEAD, so sending them last-first is what makes them render in template order — with no
        // 36th ReorderGroups call.
        for (let index = 0; index < STARTER_CATEGORY_ORDER.length; index++) {
            const category = STARTER_CATEGORY_ORDER[index];
            const created: any = await dispatch(saveClalGroup({ Title: category.title }));
            if (created?.error) {
                // Partial failure: STOP, do not roll back. What was created stays.
                setStarterProgress(null);
                await refresh();
                show(t(`${CC}empty.starterPartial`, { n: done, total: STARTER_CALL_COUNT }), 'error');
                return;
            }
            done++;
            setStarterProgress({ n: done, total: STARTER_CALL_COUNT });
            const categoryId = created?.payload?.GroupID;
            // Sub-groups in natural order — branch (ד) appends at the tail.
            for (let sub = 0; sub < category.subGroups.length; sub++) {
                const child: any = await dispatch(
                    saveClalGroup({ ParentGroupID: categoryId, Title: category.subGroups[sub] })
                );
                if (child?.error) {
                    setStarterProgress(null);
                    await refresh();
                    show(t(`${CC}empty.starterPartial`, { n: done, total: STARTER_CALL_COUNT }), 'error');
                    return;
                }
                done++;
                setStarterProgress({ n: done, total: STARTER_CALL_COUNT });
            }
        }
        setStarterProgress(null);
        const result: any = await dispatch(getClalTree());
        const freshCategories: GroupDto[] = (result?.payload?.Groups ?? [])
            .filter((g: GroupDto) => !g.ParentGroupID)
            .sort((a: GroupDto, b: GroupDto) => a.SortOrder - b.SortOrder);
        if (freshCategories[0]) setOpenCategories([freshCategories[0].GroupID]);
        show(t(`${CC}empty.starterDone`));
    };

    // ── item drawer ──────────────────────────────────────────────────────────────────────────

    const openItemDrawer = (item: ItemDto | null, groupId: number | null) => {
        const base = item ? draftFromItem(item) : emptyDraft(groupId);
        // A session draft beats the server copy: it exists only because the editor was mid-edit
        // when the session died (§C6 session protection).
        const saved = loadDraftFromSession(base.ItemID);
        const next = saved ?? base;
        setDraft(next);
        // The "before" for the diff is always the SERVER state at open time, never the restored
        // draft — otherwise a restored session would report "no changes".
        setSnapshot(base);
        setRestoredFromSession(!!saved);
        setPreviewOnly(false);
        setStack([{
            Level: 'item',
            RowKey: String(base.ItemID ?? 'new'),
            Crumb: pathLabelOf(next.GroupID) || t(`${CC}drawer.new`),
            Title: item ? t(`${CC}drawer.edit`) : t(`${CC}drawer.new`)
        }]);
    };

    const patchDraft = (patch: Partial<ItemDraft>) => {
        setDraft(current => {
            if (!current) return current;
            const next = { ...current, ...patch };
            saveDraftToSession(next);
            return next;
        });
    };

    const isDirty = useMemo(() => {
        if (!draft || !snapshot) return false;
        return JSON.stringify(draft) !== JSON.stringify(snapshot);
    }, [draft, snapshot]);

    const closeDrawers = useCallback((discardSession = true) => {
        if (discardSession && draft) clearDraftSession(draft.ItemID);
        setStack([]);
        setDraft(null);
        setSnapshot(null);
        setHistoryTarget(null);
        setPreviewOnly(false);
        setRestoredFromSession(false);
    }, [draft]);

    /** Esc and the ✕ are DRAFT-AWARE: unsaved edits get a confirm, never a silent discard. */
    const requestCloseDrawers = useCallback(() => {
        if (stack.length && stack[stack.length - 1].Level === 'item' && isDirty) {
            setConfirmDiscard(true);
            return;
        }
        closeDrawers();
    }, [closeDrawers, isDirty, stack]);

    const popDrawer = useCallback(() => {
        if (stack.length > 1) { setStack(stack.slice(0, -1)); setPreviewOnly(false); return; }
        requestCloseDrawers();
    }, [requestCloseDrawers, stack]);

    /** SaveItem (+ SetStatus for the hide switch). Returns the saved DTO, or null on failure. */
    const persistItem = async (current: ItemDraft): Promise<ItemDto | null> => {
        const validation = draftValidationError(current);
        if (validation) { showErrorKey(validation); return null; }
        if (!current.GroupID) { showErrorKey('server_error'); return null; }

        const result: any = await dispatch(saveClalItem({
            ItemID: current.ItemID ?? undefined,
            GroupID: current.GroupID,
            ItemType: current.ItemType,
            Title: current.Title.trim(),
            Description: current.Description || null,
            Keywords: current.Keywords,
            Url: current.ItemType === eClalItemType.LINK ? current.Url.trim() : null,
            FileRef: current.FileRef ?? undefined,
            InfoText: current.ItemType === eClalItemType.INFO ? current.InfoText : null,
            // Applied on CREATE only — on update the server ignores it and status moves through
            // SetStatus, which is what protects PrevStatus.
            Status: current.ItemID
                ? current.Status
                : (current.Hidden ? eClalItemStatus.HIDDEN : eClalItemStatus.DRAFT)
        }));
        if (result?.error) { showErrorKey(result?.payload?.error ?? 'server_error'); return null; }

        const saved: ItemDto = result.payload;
        if (current.ItemID) {
            const isHidden = saved.Status === eClalItemStatus.HIDDEN;
            if (current.Hidden && !isHidden) {
                await dispatch(setClalItemStatus({ ItemID: saved.ItemID, Status: eClalItemStatus.HIDDEN }));
            } else if (!current.Hidden && isHidden) {
                await dispatch(setClalItemStatus({
                    ItemID: saved.ItemID,
                    Status: saved.PrevStatus ?? eClalItemStatus.DRAFT
                }));
            }
        }
        return saved;
    };

    const saveDraftOnly = async () => {
        if (!draft) return;
        setBusy(true);
        const saved = await persistItem(draft);
        setBusy(false);
        if (!saved) return;
        clearDraftSession(draft.ItemID);
        closeDrawers(false);
        await refresh();
        if (draft.Hidden) { show(t(`${CC}toast.savedHidden`)); return; }
        // C6 v12 §6: saving a LIVE item does not demote it — and the toast must not say the site
        // is unaffected, because the edit WILL go up on the next update.
        if (saved.Status === eClalItemStatus.PUBLISHED) show(t(`${CC}toast.savedLive`));
        else show(t(`${CC}toast.savedDraft`));
    };

    const openPreview = () => {
        if (!draft) return;
        // Hidden ⇒ the primary button is a SAVE, not a publish. Nothing goes to the site.
        if (draft.Hidden) { saveDraftOnly(); return; }
        setPreviewOnly(false);
        setStack(current => current.concat({
            Level: 'preview',
            RowKey: String(draft.ItemID ?? 'new'),
            Crumb: t(`${CC}preview.crumb`),
            Title: t(`${CC}preview.title`)
        }));
    };

    const publishFromPreview = async () => {
        if (!draft) return;
        setBusy(true);
        const saved = await persistItem(draft);
        if (!saved) { setBusy(false); return; }
        // Two calls, in this order. If the second fails the save DID happen, so the copy must be
        // the partial one — never "האתר לא השתנה".
        const result: any = await dispatch(publishClalCenter({ ItemIds: [saved.ItemID] }));
        setBusy(false);
        clearDraftSession(draft.ItemID);
        closeDrawers(false);
        await refresh();
        if (result?.error) show(t(`${CC}toast.savePublishPartial`), 'error');
        else show(t(`${CC}toast.publishedOk`), 'success', [{
            label: t(`${CC}viewPortal`),
            onClick: () => { if (config?.PortalUrl) window.open(config.PortalUrl, '_blank', 'noopener'); }
        }]);
    };

    const openQuickPreview = (item: ItemDto) => {
        const asDraft = draftFromItem(item);
        setDraft(asDraft);
        setSnapshot(asDraft);
        setPreviewOnly(true);
        setStack([{
            Level: 'preview',
            RowKey: String(item.ItemID),
            Crumb: pathLabelOf(item.GroupID),
            Title: t(`${CC}preview.title`)
        }]);
    };

    const openHistory = (type: eClalEntityType, id: number, title: string) => {
        setHistoryTarget({ type, id, title });
        setStack(current => current.concat({
            Level: 'history',
            RowKey: `${type}-${id}`,
            Crumb: title,
            Title: t(`${CC}history.title`)
        }));
    };

    // ── item status / delete ─────────────────────────────────────────────────────────────────

    const toggleItemHidden = async (item: ItemDto) => {
        // ⚠️ Captured BEFORE the call: the refresh that follows erases the evidence of what the
        // item used to be, and the copy branches on exactly that (§C6).
        const wasStatus = item.Status;
        const prevStatus = item.PrevStatus ?? eClalItemStatus.DRAFT;
        const goingHidden = wasStatus !== eClalItemStatus.HIDDEN;

        setBusy(true);
        const result: any = await dispatch(setClalItemStatus({
            ItemID: item.ItemID,
            Status: goingHidden ? eClalItemStatus.HIDDEN : prevStatus
        }));
        setBusy(false);
        if (result?.error) { showErrorKey(result?.payload?.error ?? 'server_error'); return; }
        await refresh();

        if (goingHidden) {
            // Hiding a DRAFT changes nothing on the site — a toast, and NO offer, NO Publish.
            if (wasStatus !== eClalItemStatus.PUBLISHED) { show(t(`${CC}toast.savedHidden`)); return; }
            offerSiteUpdate(t(`${CC}toast.itemHidden`));
            return;
        }
        // Restoring to a draft cannot appear on the site, so promising an update would be a lie.
        if (prevStatus === eClalItemStatus.PUBLISHED) offerSiteUpdate(t(`${CC}toast.itemRestoredLive`));
        else show(t(`${CC}toast.itemRestoredDraft`));
    };

    const removeItem = async (item: ItemDto) => {
        const wasLive = item.Status === eClalItemStatus.PUBLISHED;
        setBusy(true);
        const result: any = await dispatch(deleteClalItem({ ItemID: item.ItemID }));
        setBusy(false);
        if (result?.error) { showErrorKey(result?.payload?.error ?? 'server_error'); return; }
        await refresh();
        const undoAction = {
            label: t(`${CC}toast.undo`),
            onClick: async () => {
                // SP16 brings it back as a DRAFT — never straight back onto the site.
                const undo: any = await dispatch(restoreClalItem({ ItemID: item.ItemID }));
                if (undo?.error) showErrorKey(undo?.payload?.error ?? 'server_error');
                else show(t(`${CC}toast.itemRestoredDraft`));
                await refresh();
            }
        };
        // Same rule as the group delete: one toast, so the undo survives long enough to use.
        if (wasLive) offerSiteUpdate(t(`${CC}toast.itemDeleted`), [undoAction]);
        else show(t(`${CC}toast.itemDeleted`), 'success', [undoAction]);
    };

    const armItemDelete = (item: ItemDto) => {
        if (pendingItemDelete !== item.ItemID) {
            setPendingItemDelete(item.ItemID);
            clearTimeout(itemDeleteTimer.current);
            itemDeleteTimer.current = setTimeout(() => setPendingItemDelete(null), 4000);
            return;
        }
        clearTimeout(itemDeleteTimer.current);
        setPendingItemDelete(null);
        removeItem(item);
    };

    // ── reordering ───────────────────────────────────────────────────────────────────────────

    const announce = (message: string) => setAnnouncement(message);

    const focusHandleLater = (dragId: string) => {
        setTimeout(() => document.getElementById(handleDomId(dragId))?.focus(), 0);
    };

    const reorderCategories = (fromIndex: number, toIndex: number) => {
        const ids = categories.map(c => c.GroupID);
        if (toIndex < 0 || toIndex >= ids.length || fromIndex === toIndex) return;
        const next = arrayMove(ids, fromIndex, toIndex);
        reorder({ level: 1, parentId: null }, next);
        // Category order changes the JSON only when there is live content to reorder.
        if (anyLiveItem) { dispatch(markPendingSiteUpdate()); show(t(`${CC}toast.orderUpdated`)); }
        announce(t(`${CC}reorder.announceCategory`, {
            name: categories[fromIndex].Title, pos: toIndex + 1, total: ids.length
        }));
        focusHandleLater(groupDragId(categories[fromIndex].GroupID));
    };

    const reorderSubGroups = (categoryId: number, fromIndex: number, toIndex: number) => {
        const list = subGroupsOf(categoryId);
        const ids = list.map(g => g.GroupID);
        if (toIndex < 0 || toIndex >= ids.length || fromIndex === toIndex) return;
        const next = arrayMove(ids, fromIndex, toIndex);
        reorder({ level: 2, parentId: categoryId }, next);
        // C6 v12 §14: sub-group operations are classified with the CATEGORY branch — conservative,
        // and aligned with SP14 clause (ד).
        if (anyLiveItem) { dispatch(markPendingSiteUpdate()); show(t(`${CC}toast.orderUpdated`)); }
        announce(t(`${CC}reorder.announceSubGroup`, {
            name: list[fromIndex].Title, pos: toIndex + 1, total: ids.length
        }));
        focusHandleLater(groupDragId(list[fromIndex].GroupID));
    };

    const reorderItems = (groupId: number, fromIndex: number, toIndex: number) => {
        const list = itemsOf(groupId);
        const ids = list.map(i => i.ItemID);
        if (toIndex < 0 || toIndex >= ids.length || fromIndex === toIndex) return;
        const next = arrayMove(ids, fromIndex, toIndex);
        reorder({ level: 3, parentId: groupId }, next);
        // Item order matters to the site only if THIS group actually has something live in it.
        if (groupHasLive(groupId)) { dispatch(markPendingSiteUpdate()); show(t(`${CC}toast.orderUpdated`)); }
        announce(t(`${CC}reorder.announceItem`, {
            name: list[fromIndex].Title, pos: toIndex + 1, total: ids.length
        }));
        focusHandleLater(itemDragId(list[fromIndex].ItemID));
    };

    /**
     * Level 2 crossing categories — TWO CALLS, IN THIS ORDER (§3.2):
     *   (1) SaveGroup{GroupID, NewParentGroupID, Title} — SP2 branch (ב) lands it at the TAIL.
     *   (2) ReorderGroups on the TARGET category — this is the one that honours the exact drop
     *       position. If it fails, the sub-group is in the right category but at the end, which is
     *       a true and recoverable state; we say so and re-read the tree.
     */
    const moveSubGroupToCategory = async (group: GroupDto, targetCategoryId: number, insertAt: number) => {
        const targetIds = subGroupsOf(targetCategoryId).map(g => g.GroupID);
        const nextIds = targetIds.slice();
        nextIds.splice(Math.max(0, Math.min(insertAt, nextIds.length)), 0, group.GroupID);

        // Optimistic first, so the row does not snap back to its old category for a beat.
        dispatch(applyLocalGroupReparent({
            groupId: group.GroupID, newParentId: targetCategoryId, orderedIds: nextIds
        }));

        setBusy(true);
        const moved: any = await dispatch(saveClalGroup({
            GroupID: group.GroupID,
            NewParentGroupID: targetCategoryId,
            Title: group.Title
        }));
        if (moved?.error) {
            setBusy(false);
            showErrorKey(moved?.payload?.error ?? 'server_error');
            await refresh();
            return;
        }
        // Call (2) — the one that honours the exact drop position.
        const reordered: any = await dispatch(reorderClalGroups({
            ParentGroupID: targetCategoryId,
            OrderedGroupIds: nextIds
        }));
        setBusy(false);
        if (reordered?.error) {
            show(t(`${CC}toast.subGroupMovedPartial`), 'error');
            await refresh();
            return;
        }
        if (anyLiveItem) { dispatch(markPendingSiteUpdate()); offerSiteUpdate(t(`${CC}toast.subGroupMoved`)); }
        else show(t(`${CC}toast.subGroupMoved`));
        announce(t(`${CC}reorder.announceSubGroupMoved`, {
            name: group.Title,
            parent: groupById(targetCategoryId)?.Title ?? '',
            pos: nextIds.indexOf(group.GroupID) + 1,
            total: nextIds.length
        }));
    };

    // ── dnd-kit wiring ───────────────────────────────────────────────────────────────────────

    const sensors = useSensors(
        // A small activation distance so a click on the handle is still a click, and dnd-kit's own
        // KeyboardSensor is DELIBERATELY NOT REGISTERED (§3.6): "pick up, move, drop" is a second
        // interaction model to learn. ↑/↓ on a focused row move it immediately instead.
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
    );

    /**
     * ONE LEVEL IS ACTIVE AT A TIME (§3.1, C6 v12 §12): same `level` ALWAYS; same `parentId` ONLY
     * at level 3. Level 2 must be allowed to cross categories, which is why the parent test is not
     * applied there.
     */
    const collisionDetection: CollisionDetection = useCallback(args => {
        const active = args.active?.data?.current as SortableData | undefined;
        if (!active) return closestCenter(args);
        const containers = args.droppableContainers.filter(container => {
            const data = container.data?.current as SortableData | undefined;
            if (!data) return false;
            if (data.level !== active.level) return false;
            if (active.level === 3) return data.parentId === active.parentId;
            return true;
        });
        return closestCenter({ ...args, droppableContainers: containers });
    }, []);

    const onDragStart = (event: DragStartEvent) => {
        const data = event.active.data.current as SortableData | undefined;
        const parsed = parseDragId(String(event.active.id));
        if (!data || !parsed) return;
        const title = parsed.kind === 'item'
            ? (items as ItemDto[]).find(i => i.ItemID === parsed.id)?.Title ?? ''
            : groupById(parsed.id)?.Title ?? '';
        setActiveDrag({ id: String(event.active.id), level: data.level, title });
    };

    const onDragEnd = (event: DragEndEvent) => {
        const activeData = event.active.data.current as SortableData | undefined;
        setActiveDrag(null);
        if (!activeData || !event.over) return;

        const activeParsed = parseDragId(String(event.active.id));
        const overParsed = parseDragId(String(event.over.id));
        const overData = event.over.data.current as SortableData | undefined;
        if (!activeParsed || !overParsed) return;
        if (String(event.active.id) === String(event.over.id)) return;

        if (activeData.level === 1) {
            const ids = categories.map(c => c.GroupID);
            reorderCategories(ids.indexOf(activeParsed.id), ids.indexOf(overParsed.id));
            return;
        }

        if (activeData.level === 3) {
            const groupId = activeData.parentId as number;
            const ids = itemsOf(groupId).map(i => i.ItemID);
            reorderItems(groupId, ids.indexOf(activeParsed.id), ids.indexOf(overParsed.id));
            return;
        }

        // level 2 — the only level that crosses parents
        const sourceParent = activeData.parentId as number;
        const targetParent = (overData?.parentId ?? null) as number | null;
        if (targetParent === null) return;
        const group = groupById(activeParsed.id);
        if (!group) return;

        if (targetParent === sourceParent) {
            const ids = subGroupsOf(sourceParent).map(g => g.GroupID);
            // Dropped on its OWN category's landing strip ⇒ "put it last here", not a no-op.
            const to = overParsed.kind === 'strip' ? ids.length - 1 : ids.indexOf(overParsed.id);
            reorderSubGroups(sourceParent, ids.indexOf(activeParsed.id), to);
            return;
        }
        // Dropped on the strip ⇒ the end of that category; dropped on a row ⇒ that row's index.
        const targetIds = subGroupsOf(targetParent).map(g => g.GroupID);
        const insertAt = overParsed.kind === 'strip' ? targetIds.length : Math.max(0, targetIds.indexOf(overParsed.id));
        moveSubGroupToCategory(group, targetParent, insertAt);
    };

    // ── roving tabindex (one Tab stop per list) ──────────────────────────────────────────────

    const rovingFor = (listId: string, index: number) => (rovingIndex[listId] ?? 0) === index ? 0 : -1;
    const setRoving = (listId: string, index: number) =>
        setRovingIndex(current => (current[listId] === index ? current : { ...current, [listId]: index }));

    // ── render helpers ───────────────────────────────────────────────────────────────────────

    const toggleCategory = (categoryId: number) =>
        setOpenCategories(current =>
            current.indexOf(categoryId) > -1 ? current.filter(id => id !== categoryId) : current.concat(categoryId));

    const snapBackStyle = (listId: string): React.CSSProperties =>
        snapBackListId === listId ? { transition: 'opacity 200ms ease', opacity: 0.45 } : {};

    /**
     * The item list.
     *
     * ⚠️ IT IS A GRID, NOT A `<table>`, AND THAT IS A DRAG REQUIREMENT — not a style preference.
     * `useSortable` moves rows with a CSS `transform`, and `transform` on `display: table-row` is
     * undefined behaviour that browsers implement inconsistently. Inside a real table the only
     * thing that could carry the transform is a wrapper inside the first cell, which means the
     * title cell slides while type / keywords / status / actions stay put, and the dragged row
     * "disappears" one column at a time. So the rows are grid rows with explicit ARIA table roles:
     * same semantics for a screen reader, reliable transforms for the pointer.
     */
    const renderItemsTable = (subGroup: GroupDto, dimmed: boolean) => {
        const listId = listIdOf({ level: 3, parentId: subGroup.GroupID });
        const rows = visibleItemsOf(subGroup.GroupID);
        const allRows = itemsOf(subGroup.GroupID);

        if (!allRows.length) {
            return <EmptySubGroup onAddItem={() => openItemDrawer(null, subGroup.GroupID)} />;
        }
        if (!rows.length) return null;

        const gridColumns = 'minmax(220px, 38%) 92px minmax(150px, 1fr) 170px 210px';
        const rowStyle: React.CSSProperties = {
            display: 'grid',
            gridTemplateColumns: gridColumns,
            alignItems: 'center',
            gap: 8,
            padding: '8px 6px',
            borderBottom: '1px solid #f4f6f8'
        };
        const headerCell: React.CSSProperties = { fontSize: 12.5, color: '#7a8794', fontWeight: 600 };

        return (
            <Box
                role="table"
                aria-label={subGroup.Title}
                style={{ overflowX: 'auto', opacity: dimmed ? 0.62 : 1, ...snapBackStyle(listId) }}
            >
                <Box role="row" style={{ ...rowStyle, borderBottom: '1px solid #eef1f4' }}>
                    <Typography role="columnheader" component="span" style={headerCell}>{t(`${CC}table.colTitle`)}</Typography>
                    <Typography role="columnheader" component="span" style={headerCell}>{t(`${CC}table.colType`)}</Typography>
                    <Typography role="columnheader" component="span" style={headerCell}>{t(`${CC}table.colKeywords`)}</Typography>
                    <Typography role="columnheader" component="span" style={headerCell}>{t(`${CC}table.colStatus`)}</Typography>
                    <Typography role="columnheader" component="span" style={headerCell}>{t(`${CC}table.colActions`)}</Typography>
                </Box>

                <SortableContext
                    items={(searchActive ? rows : allRows).map(i => itemDragId(i.ItemID))}
                    strategy={verticalListSortingStrategy}
                >
                    {rows.map(item => {
                        const index = allRows.findIndex(i => i.ItemID === item.ItemID);
                        const stripe = rowStripeColor(item.Status);
                        const dragId = itemDragId(item.ItemID);
                        return (
                            <SortableRow
                                key={item.ItemID}
                                id={dragId}
                                level={3}
                                parentId={subGroup.GroupID}
                                disabled={searchActive}
                            >
                                {({ handleProps }) => (
                                    <Box
                                        role="row"
                                        style={{
                                            ...rowStyle,
                                            opacity: item.Status === eClalItemStatus.HIDDEN ? 0.62 : 1,
                                            borderInlineStart: stripe ? `3px solid ${stripe}` : '3px solid transparent'
                                        }}
                                    >
                                        <Box role="cell" style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                                            {!searchActive && (
                                                <>
                                                    <button
                                                        type="button"
                                                        className={handleStyles.handle}
                                                        {...handleProps}
                                                        id={handleDomId(dragId)}
                                                        tabIndex={rovingFor(listId, index)}
                                                        onFocus={() => setRoving(listId, index)}
                                                        onKeyDown={e => {
                                                            // ↑/↓ move the row IMMEDIATELY — no
                                                            // pick-up/drop mode to learn (§3.6).
                                                            if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
                                                            e.preventDefault();
                                                            const delta = e.key === 'ArrowUp' ? -1 : 1;
                                                            setRoving(listId, index + delta);
                                                            reorderItems(subGroup.GroupID, index, index + delta);
                                                        }}
                                                        aria-label={t(`${CC}reorder.handleItem`, {
                                                            name: item.Title, pos: index + 1, total: allRows.length
                                                        })}
                                                    >
                                                        ⋮⋮
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className={handleStyles.nudge}
                                                        disabled={index === 0}
                                                        aria-label={t(`${CC}reorder.up`)}
                                                        onClick={() => reorderItems(subGroup.GroupID, index, index - 1)}
                                                    >
                                                        ↑
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className={handleStyles.nudge}
                                                        disabled={index === allRows.length - 1}
                                                        aria-label={t(`${CC}reorder.down`)}
                                                        onClick={() => reorderItems(subGroup.GroupID, index, index + 1)}
                                                    >
                                                        ↓
                                                    </button>
                                                </>
                                            )}
                                            <Typography
                                                component="b"
                                                style={{ fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                                                title={item.Title}
                                            >
                                                {item.Title}
                                            </Typography>
                                        </Box>

                                        <Box role="cell">
                                            <Typography
                                                component="span"
                                                style={{ fontSize: 12, color: '#5b6b7b', background: '#eef1f4', borderRadius: 4, padding: '1px 8px' }}
                                            >
                                                {t(`${CC}type.${item.ItemType}`)}
                                            </Typography>
                                        </Box>

                                        <Box role="cell" style={{ minWidth: 0 }}>
                                            {(item.Keywords ?? []).slice(0, 3).map(k => (
                                                <Typography
                                                    key={k}
                                                    component="span"
                                                    style={{
                                                        display: 'inline-block', fontSize: 12, background: '#f0f4f8',
                                                        border: '1px solid #dbe3ea', borderRadius: 999, padding: '0 9px',
                                                        marginInlineEnd: 4, color: '#44525e'
                                                    }}
                                                >
                                                    {k}
                                                </Typography>
                                            ))}
                                            {(item.Keywords ?? []).length > 3 && (
                                                <Typography
                                                    component="span"
                                                    style={{
                                                        display: 'inline-block', fontSize: 12, border: '1px dashed #dbe3ea',
                                                        borderRadius: 999, padding: '0 9px', color: '#44525e'
                                                    }}
                                                >
                                                    {t(`${CC}table.moreKeywords`, { n: (item.Keywords ?? []).length - 3 })}
                                                </Typography>
                                            )}
                                        </Box>

                                        <Box role="cell">
                                            <ClalStatusChip status={item.Status} pendingChanges={pendingChangesOn(item)} />
                                        </Box>

                                        <Box role="cell" style={{ whiteSpace: 'nowrap' }}>
                                            <Tooltip title={t(`${CC}item.preview`)} PopperProps={{ style: { direction: isRTL ? 'rtl' : 'ltr' } }}>
                                                <IconButton size="small" onClick={() => openQuickPreview(item)} aria-label={t(`${CC}item.preview`)}>
                                                    <Visibility fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title={t(`${CC}item.edit`)} PopperProps={{ style: { direction: isRTL ? 'rtl' : 'ltr' } }}>
                                                <IconButton size="small" onClick={() => openItemDrawer(item, item.GroupID)} aria-label={t(`${CC}item.edit`)}>
                                                    <Edit fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title={t(`${CC}item.history`)} PopperProps={{ style: { direction: isRTL ? 'rtl' : 'ltr' } }}>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => openHistory(eClalEntityType.ITEM, item.ItemID, item.Title)}
                                                    aria-label={t(`${CC}item.history`)}
                                                >
                                                    <History fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip
                                                title={t(`${CC}item.${item.Status === eClalItemStatus.HIDDEN ? 'unhide' : 'hide'}`)}
                                                PopperProps={{ style: { direction: isRTL ? 'rtl' : 'ltr' } }}
                                            >
                                                <IconButton
                                                    size="small"
                                                    onClick={() => toggleItemHidden(item)}
                                                    aria-label={t(`${CC}item.${item.Status === eClalItemStatus.HIDDEN ? 'unhide' : 'hide'}`)}
                                                >
                                                    {item.Status === eClalItemStatus.HIDDEN
                                                        ? <VisibilityOff fontSize="small" />
                                                        : <Visibility fontSize="small" style={{ opacity: 0.55 }} />}
                                                </IconButton>
                                            </Tooltip>
                                            {/* Two-step inline confirm, with a timeout back to the
                                                bin icon — same as the mock, no modal for one row. */}
                                            {pendingItemDelete === item.ItemID ? (
                                                <Button
                                                    size="small"
                                                    onClick={() => armItemDelete(item)}
                                                    style={{ color: '#c62828', fontWeight: 700, fontSize: 12.5 }}
                                                >
                                                    {t(`${CC}item.confirmDeleteInline`)}
                                                </Button>
                                            ) : (
                                                <Tooltip title={t(`${CC}item.delete`)} PopperProps={{ style: { direction: isRTL ? 'rtl' : 'ltr' } }}>
                                                    <IconButton size="small" onClick={() => armItemDelete(item)} aria-label={t(`${CC}item.delete`)}>
                                                        <DeleteOutline fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                        </Box>
                                    </Box>
                                )}
                            </SortableRow>
                        );
                    })}
                </SortableContext>
            </Box>
        );
    };

    const draggingLevel = activeDrag?.level ?? null;

    const renderCategoryBody = (category: GroupDto) => {
        const subGroups = subGroupsOf(category.GroupID);
        const listId = listIdOf({ level: 2, parentId: category.GroupID });
        const single = subGroups.length === 1;

        return (
            <Box style={{ borderTop: '1px solid #eef1f4', padding: '4px 18px 16px', ...snapBackStyle(listId) }}>
                <SortableContext items={subGroups.map(g => groupDragId(g.GroupID))} strategy={verticalListSortingStrategy}>
                    {subGroups.map((subGroup, index) => {
                        const dragId = groupDragId(subGroup.GroupID);
                        const groupItems = itemsOf(subGroup.GroupID);
                        const hasVisible = !searchActive || visibleItemsOf(subGroup.GroupID).length > 0;
                        if (searchActive && !hasVisible) return null;
                        return (
                            <SortableRow
                                key={subGroup.GroupID}
                                id={dragId}
                                level={2}
                                parentId={category.GroupID}
                                disabled={searchActive}
                            >
                                {({ handleProps }) => (
                                    <Box style={{ marginTop: 10 }}>
                                        <GroupRow
                                            group={subGroup}
                                            level={2}
                                            position={index + 1}
                                            total={subGroups.length}
                                            itemCount={groupItems.length}
                                            liveCount={groupItems.filter(i => i.Status === eClalItemStatus.PUBLISHED).length}
                                            draftCount={groupItems.filter(i => i.Status === eClalItemStatus.DRAFT).length}
                                            isSingleSubGroup={single}
                                            effectivelyHidden={effectivelyHidden(subGroup)}
                                            searchActive={searchActive}
                                            isRTL={isRTL}
                                            handleProps={{
                                                ...handleProps,
                                                id: handleDomId(dragId),
                                                tabIndex: rovingFor(listId, index),
                                                onFocus: () => setRoving(listId, index),
                                                onKeyDown: (e: React.KeyboardEvent) => {
                                                    if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
                                                    e.preventDefault();
                                                    const delta = e.key === 'ArrowUp' ? -1 : 1;
                                                    setRoving(listId, index + delta);
                                                    reorderSubGroups(category.GroupID, index, index + delta);
                                                }
                                            }}
                                            canMoveUp={index > 0}
                                            canMoveDown={index < subGroups.length - 1}
                                            deleteMode={
                                                groupItems.length === 0 && subGroupsOf(subGroup.GroupID).length === 0
                                                    ? 'inline' : 'dialog'
                                            }
                                            onNudge={delta => reorderSubGroups(category.GroupID, index, index + delta)}
                                            onRename={title => renameGroup(subGroup, title)}
                                            onToggleVisibility={() => toggleGroupVisibility(subGroup)}
                                            onDelete={() => {
                                                if (groupItems.length === 0 && subGroupsOf(subGroup.GroupID).length === 0) {
                                                    deleteEmptyGroup(subGroup);
                                                } else {
                                                    openDeleteFlow(subGroup);
                                                }
                                            }}
                                            onHistory={() => openHistory(eClalEntityType.GROUP, subGroup.GroupID, subGroup.Title)}
                                            onAddItem={() => openItemDrawer(null, subGroup.GroupID)}
                                        />
                                        {/* Dragging a SUB-GROUP renders sub-groups as headers only —
                                            the items disappear while the categories stay open (§3.3). */}
                                        {draggingLevel !== 2 && renderItemsTable(subGroup, effectivelyHidden(subGroup))}
                                    </Box>
                                )}
                            </SortableRow>
                        );
                    })}
                </SortableContext>

                {/* Fixed landing strip, present on EVERY category while a sub-group is in flight —
                    including a collapsed or empty one. It does not follow the cursor (§3.4). */}
                {draggingLevel === 2 && <DropStrip categoryId={category.GroupID} label={t(`${CC}group.dropHere`)} />}

                {!subGroups.length && draggingLevel !== 2 && (
                    <EmptyCategory onAddSubGroup={() => { setAddSubGroupFor(category); setNewSubGroupName(''); }} />
                )}
            </Box>
        );
    };

    // ── screen ───────────────────────────────────────────────────────────────────────────────

    const topDrawer = stack.length ? stack[stack.length - 1] : null;
    const treeEmpty = loadStatus === 'succeeded' && categories.length === 0;

    /**
     * The item level's crumb FOLLOWS the location picker (mock `updateBc()`): choosing a different
     * sub-group — or creating one inline — has to be reflected immediately, or the breadcrumb
     * keeps promising the place the item is about to leave.
     */
    const displayStack = stack.map(entry =>
        entry.Level === 'item' && draft
            ? { ...entry, Crumb: pathLabelOf(draft.GroupID) || entry.Crumb }
            : entry
    );

    return (
        <DefaultScreen
            // ⚠️ NO subPage. `DefaultScreen.js:42` calls `route[0].options.filter(...)` and the
            // ClalCenter record is a TOP-LEVEL entry with no `options` — passing one crashes it.
            currentPage="clalCenter"
            key="clalCenter"
            classes={classes}
            containerClass={clsx(classes.management, classes.mb50)}
        >
            {/* the aria-live channel; the wording is prescribed in §3.6 */}
            <Box
                role="status"
                aria-live="polite"
                style={{ position: 'absolute', width: 1, height: 1, margin: -1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}
            >
                {announcement}
            </Box>

            <Box
                style={{
                    background: '#fff', border: '1px solid #e3e8ee', borderRadius: 10,
                    padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap'
                }}
            >
                <Typography component="h1" style={{ fontSize: 21, margin: 0, fontWeight: 700 }}>
                    {t(`${CC}title`)}
                </Typography>

                {draftCount > 0 && (
                    <Typography
                        component="span"
                        style={{
                            fontSize: 12.5, fontWeight: 600, borderRadius: 999, padding: '2px 11px',
                            background: '#fff8e1', color: '#b7791f'
                        }}
                    >
                        {draftCount === 1
                            ? t(`${CC}draftsWaitingOne`)
                            : t(`${CC}draftsWaitingMany`, { n: draftCount })}
                    </Typography>
                )}

                <Box style={{ flex: 1 }} />

                <TextField
                    variant="outlined"
                    size="small"
                    value={searchInput}
                    placeholder={t(`${CC}searchPlaceholder`)}
                    inputProps={{ 'aria-label': t(`${CC}searchPlaceholder`), type: 'search' }}
                    onChange={e => setSearchInput(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start"><Search fontSize="small" /></InputAdornment>
                        ),
                        endAdornment: searchInput ? (
                            <InputAdornment position="end">
                                <IconButton size="small" onClick={() => setSearchInput('')} aria-label={t(`${CC}clearSearch`)}>
                                    <Clear fontSize="small" />
                                </IconButton>
                            </InputAdornment>
                        ) : undefined
                    }}
                    style={{ width: 260, background: '#fff' }}
                />

                {/* The PERSISTENT indicator. A dismissed toast is not an indication, and a portal
                    that is quietly out of date is a client-facing failure (LEDGER R5). */}
                <Badge color="error" variant="dot" invisible={!config?.PendingSiteUpdate}>
                    <Button
                        variant="outlined"
                        disabled={busy}
                        onClick={runSiteUpdate}
                        title={config?.PendingSiteUpdate ? t(`${CC}updateSitePending`) : undefined}
                        style={{ fontWeight: 700, borderColor: '#FF1744', color: '#FF1744' }}
                    >
                        {t(`${CC}updateSite`)}
                    </Button>
                </Badge>

                {!!config?.PortalUrl && (
                    <Button
                        onClick={() => window.open(config.PortalUrl, '_blank', 'noopener')}
                        style={{ color: '#5b6b7b', fontWeight: 600 }}
                    >
                        {t(`${CC}viewPortal`)}
                    </Button>
                )}

                <Button
                    variant="contained"
                    color="primary"
                    disabled={!pathOptions.length}
                    onClick={() => openItemDrawer(null, pathOptions[0]?.id ?? null)}
                    style={{ fontWeight: 700 }}
                >
                    {t(`${CC}addItem`)}
                </Button>
            </Box>

            {/* The depth rule is stated POSITIVELY here, once — instead of a disabled button on
                every sub-group row (§1, owner/UX decision). */}
            <Typography style={{ fontSize: 12.5, color: '#7a8794', margin: '8px 2px 0' }}>
                {t(`${CC}structureNote`)}
            </Typography>

            {searchActive && (
                <Typography style={{ fontSize: 12.5, color: '#b7791f', background: '#fff8e1', borderRadius: 8, padding: '7px 12px', marginTop: 8 }}>
                    {t(`${CC}reorderLockedBySearch`)}
                </Typography>
            )}
            {!!searchInput && !searchActive && searchInput.trim().length < MIN_QUERY_CHARS && (
                <Typography style={{ fontSize: 12.5, color: '#7a8794', marginTop: 8 }}>
                    {t(`${CC}searchMinChars`)}
                </Typography>
            )}

            {/* vocabulary aid — read-only, advisory, collapsed by default (§6.3) */}
            {!!nameUsage.length && (
                <Box style={{ marginTop: 10 }}>
                    <Button
                        size="small"
                        onClick={() => setVocabOpen(v => !v)}
                        startIcon={vocabOpen ? <ExpandMore fontSize="small" /> : <ChevronRight fontSize="small" />}
                        style={{ color: '#5b6b7b', fontWeight: 600 }}
                        aria-expanded={vocabOpen}
                    >
                        {t(`${CC}vocab.title`)}
                    </Button>
                    <Collapse in={vocabOpen}>
                        <Box style={{ background: '#fff', border: '1px solid #e3e8ee', borderRadius: 8, padding: '10px 14px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            {nameUsage.map(entry => (
                                <Typography
                                    key={entry.name}
                                    component="span"
                                    style={{ fontSize: 12.5, color: '#44525e', background: '#f0f4f8', borderRadius: 999, padding: '2px 10px' }}
                                >
                                    {entry.usage === 1
                                        ? t(`${CC}vocab.usageOne`, { name: entry.name })
                                        : t(`${CC}vocab.usageMany`, { name: entry.name, n: entry.usage })}
                                </Typography>
                            ))}
                        </Box>
                    </Collapse>
                </Box>
            )}

            {loadStatus === 'loading' && (
                <Box style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 24 }}>
                    <CircularProgress size={20} />
                    <Typography>{t(`${CC}loading`)}</Typography>
                </Box>
            )}

            {treeEmpty ? (
                <Box style={{ marginTop: 14 }}>
                    <FirstScreen
                        progress={starterProgress}
                        onRunTemplate={runStarterTemplate}
                        onStartOwn={() => { setAddingCategory(true); setNewCategoryName(''); }}
                    />
                    {addingCategory && (
                        <Box style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                            <TextField
                                autoFocus
                                variant="outlined"
                                size="small"
                                value={newCategoryName}
                                placeholder={t(`${CC}newCategoryName`)}
                                inputProps={{ 'aria-label': t(`${CC}newCategoryName`) }}
                                onChange={e => setNewCategoryName(e.target.value)}
                                onKeyDown={e => {
                                    if (e.key === 'Enter') { e.preventDefault(); createCategory(); }
                                    else if (e.key === 'Escape') { e.stopPropagation(); setAddingCategory(false); }
                                }}
                                style={{ flex: 1, minWidth: 220, background: '#fff' }}
                            />
                            <Button variant="contained" color="primary" onClick={createCategory} disabled={busy}>
                                {t(`${CC}add`)}
                            </Button>
                            <Button onClick={() => setAddingCategory(false)} style={{ color: '#5b6b7b' }}>
                                {t(`${CC}cancel`)}
                            </Button>
                        </Box>
                    )}
                </Box>
            ) : (
                <DndContext
                    sensors={sensors}
                    collisionDetection={collisionDetection}
                    onDragStart={onDragStart}
                    onDragEnd={onDragEnd}
                    onDragCancel={() => setActiveDrag(null)}
                    // Our own aria-live region carries the prescribed wording; dnd-kit's default
                    // announcements would speak over it with a second, different sentence.
                    accessibility={{
                        announcements: {
                            onDragStart: () => undefined,
                            onDragOver: () => undefined,
                            onDragEnd: () => undefined,
                            onDragCancel: () => undefined
                        }
                    }}
                >
                    <Box style={{ marginTop: 12, ...snapBackStyle(listIdOf({ level: 1, parentId: null })) }}>
                        <SortableContext
                            items={categories.map(c => groupDragId(c.GroupID))}
                            strategy={verticalListSortingStrategy}
                        >
                            {categories.map((category, index) => {
                                const dragId = groupDragId(category.GroupID);
                                const listId = listIdOf({ level: 1, parentId: null });
                                const subGroups = subGroupsOf(category.GroupID);
                                const allItems = subtreeItems(category.GroupID);
                                const matchCount = searchActive ? allItems.filter(itemMatches).length : 0;
                                if (searchActive && matchCount === 0) return null;
                                // Dragging a CATEGORY collapses every category to a header — 7 rows
                                // instead of 200 (§3.3). A search hit force-opens its category.
                                const isOpen = draggingLevel === 1
                                    ? false
                                    : (searchActive ? true : openCategories.indexOf(category.GroupID) > -1);

                                return (
                                    <SortableRow key={category.GroupID} id={dragId} level={1} parentId={null} disabled={searchActive}>
                                        {({ handleProps }) => (
                                            <Box
                                                style={{
                                                    background: '#fff', border: '1px solid #e3e8ee', borderRadius: 10,
                                                    marginTop: 12, overflow: 'hidden'
                                                }}
                                            >
                                                <GroupRow
                                                    group={category}
                                                    level={1}
                                                    position={index + 1}
                                                    total={categories.length}
                                                    itemCount={allItems.length}
                                                    liveCount={allItems.filter(i => i.Status === eClalItemStatus.PUBLISHED).length}
                                                    draftCount={allItems.filter(i => i.Status === eClalItemStatus.DRAFT).length}
                                                    isOpen={isOpen}
                                                    effectivelyHidden={effectivelyHidden(category)}
                                                    searchActive={searchActive}
                                                    isRTL={isRTL}
                                                    handleProps={{
                                                        ...handleProps,
                                                        id: handleDomId(dragId),
                                                        tabIndex: rovingFor(listId, index),
                                                        onFocus: () => setRoving(listId, index),
                                                        onKeyDown: (e: React.KeyboardEvent) => {
                                                            if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
                                                            e.preventDefault();
                                                            const delta = e.key === 'ArrowUp' ? -1 : 1;
                                                            setRoving(listId, index + delta);
                                                            reorderCategories(index, index + delta);
                                                        }
                                                    }}
                                                    canMoveUp={index > 0}
                                                    canMoveDown={index < categories.length - 1}
                                                    deleteMode={subGroups.length === 0 && allItems.length === 0 ? 'inline' : 'dialog'}
                                                    onToggleOpen={() => toggleCategory(category.GroupID)}
                                                    onNudge={delta => reorderCategories(index, index + delta)}
                                                    onRename={title => renameGroup(category, title)}
                                                    onToggleVisibility={() => toggleGroupVisibility(category)}
                                                    onDelete={() => {
                                                        if (subGroups.length === 0 && allItems.length === 0) deleteEmptyGroup(category);
                                                        else openDeleteFlow(category);
                                                    }}
                                                    onHistory={() => openHistory(eClalEntityType.GROUP, category.GroupID, category.Title)}
                                                    onAddSubGroup={() => { setAddSubGroupFor(category); setNewSubGroupName(''); }}
                                                />
                                                {/* Even a COLLAPSED category shows its landing strip
                                                    while a sub-group is being dragged (§3.4). */}
                                                {(isOpen || draggingLevel === 2) && renderCategoryBody(category)}
                                            </Box>
                                        )}
                                    </SortableRow>
                                );
                            })}
                        </SortableContext>
                    </Box>

                    {/* ⚠️ `dropAnimation={null}` is REQUIRED here, not a preference. dnd-kit's
                        default drop animation flies the overlay back to the ORIGINAL rect of the
                        row — but the reorder is optimistic, so by the time the pointer is released
                        the row has already moved, and the flight lands on the wrong place. Worse:
                        the overlay only unmounts when that animation reports `finish`, so on a
                        throttled tab (background, or a hidden pane) it can be left on screen — a
                        z-index 999, pointer-events:auto rectangle sitting over the UI. Reproduced
                        during verification. Dropping instantly is both correct and safe. */}
                    <DragOverlay dropAnimation={null}>
                        {activeDrag && (
                            <Box
                                style={{
                                    background: '#fff', border: '1px solid #FF1744', borderRadius: 8,
                                    padding: '10px 16px', fontWeight: 700, boxShadow: '0 6px 18px rgba(0,0,0,.18)'
                                }}
                            >
                                {activeDrag.title}
                            </Box>
                        )}
                    </DragOverlay>
                </DndContext>
            )}

            {!treeEmpty && (
                <Box style={{ marginTop: 14 }}>
                    {addingCategory ? (
                        <Box
                            style={{
                                display: 'flex', gap: 8, background: '#fff', border: '1px solid #e3e8ee',
                                borderRadius: 10, padding: 12, flexWrap: 'wrap'
                            }}
                        >
                            <TextField
                                autoFocus
                                variant="outlined"
                                size="small"
                                value={newCategoryName}
                                placeholder={t(`${CC}newCategoryName`)}
                                inputProps={{ 'aria-label': t(`${CC}newCategoryName`) }}
                                onChange={e => setNewCategoryName(e.target.value)}
                                onKeyDown={e => {
                                    if (e.key === 'Enter') { e.preventDefault(); createCategory(); }
                                    else if (e.key === 'Escape') { e.stopPropagation(); setAddingCategory(false); }
                                }}
                                style={{ flex: 1, minWidth: 220 }}
                            />
                            <Button variant="contained" color="primary" onClick={createCategory} disabled={busy}>
                                {t(`${CC}add`)}
                            </Button>
                            <Button onClick={() => setAddingCategory(false)} style={{ color: '#5b6b7b' }}>
                                {t(`${CC}cancel`)}
                            </Button>
                        </Box>
                    ) : (
                        <Button
                            onClick={() => { setAddingCategory(true); setNewCategoryName(''); }}
                            style={{
                                width: '100%', border: '2px dashed #cfd7df', background: '#fff', color: '#5b6b7b',
                                fontWeight: 600, borderRadius: 10, padding: 12
                            }}
                        >
                            {t(`${CC}addCategory`)}
                        </Button>
                    )}
                </Box>
            )}

            {searchActive && searchTotal === 0 && (
                <Box
                    style={{
                        textAlign: 'center', color: '#5b6b7b', padding: 18, background: '#fff',
                        border: '1px solid #e3e8ee', borderRadius: 10, marginTop: 12
                    }}
                >
                    <Typography>{t(`${CC}searchNoResults`, { q: searchInput })}</Typography>
                    <Button onClick={() => setSearchInput('')} style={{ color: '#FF1744', fontWeight: 700 }}>
                        {t(`${CC}clearSearch`)}
                    </Button>
                </Box>
            )}

            {/* ── drawers ── */}
            <ClalDrawerStack stack={displayStack} isRTL={isRTL} onPop={popDrawer} onClose={requestCloseDrawers}>
                {topDrawer?.Level === 'item' && draft && (
                    <ItemDrawer
                        draft={draft}
                        groups={groups as GroupDto[]}
                        keywordPool={keywordPool}
                        isRTL={isRTL}
                        busy={busy}
                        restoredFromSession={restoredFromSession}
                        onChange={patchDraft}
                        onSave={saveDraftOnly}
                        onPreviewAndPublish={openPreview}
                        onCancel={requestCloseDrawers}
                        onError={showErrorKey}
                        onToast={message => show(message)}
                        onCreateSubGroup={createSubGroup}
                    />
                )}
                {topDrawer?.Level === 'preview' && draft && (
                    <PublishPreviewDrawer
                        draft={draft}
                        snapshot={snapshot}
                        pathLabel={pathLabelOf(draft.GroupID)}
                        busy={busy}
                        isRTL={isRTL}
                        previewOnly={previewOnly}
                        onPublish={publishFromPreview}
                        onBack={popDrawer}
                    />
                )}
                {topDrawer?.Level === 'history' && historyTarget && (
                    <HistoryDrawer
                        entityType={historyTarget.type}
                        entityId={historyTarget.id}
                        isRTL={isRTL}
                        onError={showErrorKey}
                    />
                )}
            </ClalDrawerStack>

            {/* ── dialogs ── */}
            <DeleteGroupDialog
                open={!!deleteTarget}
                group={deleteTarget?.group ?? null}
                emptyChildCount={deleteTarget?.emptyChildCount ?? 0}
                itemCount={deleteTarget?.itemCount ?? 0}
                groups={groups as GroupDto[]}
                isRTL={isRTL}
                busy={busy}
                progress={moveProgress}
                onCancel={() => setDeleteTarget(null)}
                onDeleteEmptyTree={() => deleteTarget && deleteEmptyGroup(deleteTarget.group)}
                onMoveItems={moveItemsAndDelete}
                onDeleteWithContent={deleteGroupWithContent}
                onCreateSubGroup={createSubGroup}
            />

            <Dialog
                open={!!addSubGroupFor}
                onClose={busy ? undefined : () => setAddSubGroupFor(null)}
                maxWidth="xs"
                fullWidth
                dir={isRTL ? 'rtl' : 'ltr'}
                aria-labelledby="cc-add-subgroup-title"
            >
                <DialogTitle id="cc-add-subgroup-title" disableTypography>
                    <Typography component="h2" style={{ fontSize: 18, fontWeight: 800 }}>
                        {t(`${CC}addSubGroupNew`)}
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    <Typography style={{ fontSize: 13, color: '#7a8794', marginBottom: 10 }}>
                        {addSubGroupFor?.Title}
                    </Typography>
                    {/* freeSolo with usage counts: adopting an existing name is one click, and
                        inventing a new one is never blocked or warned about (§6.1). */}
                    <NameSuggestField
                        value={newSubGroupName}
                        options={nameUsage}
                        isRTL={isRTL}
                        autoFocus
                        label={t(`${CC}newSubGroupName`)}
                        onChange={setNewSubGroupName}
                        onEnter={submitAddSubGroup}
                    />
                </DialogContent>
                <DialogActions style={{ padding: '12px 20px 18px', gap: 8 }}>
                    <Button onClick={() => setAddSubGroupFor(null)} disabled={busy} style={{ color: '#5b6b7b' }}>
                        {t(`${CC}cancel`)}
                    </Button>
                    <Button
                        onClick={submitAddSubGroup}
                        disabled={busy || !newSubGroupName.trim()}
                        variant="contained"
                        color="primary"
                        style={{ fontWeight: 700 }}
                    >
                        {t(`${CC}add`)}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Esc / ✕ on a dirty drawer asks first — the mock discarded silently, and the review
                panel made a draft-aware Esc a requirement. */}
            <ConfirmDialog
                open={confirmDiscard}
                title={t(`${CC}unsaved.title`)}
                body={t(`${CC}unsaved.body`)}
                confirmLabel={t(`${CC}unsaved.leave`)}
                cancelLabel={t(`${CC}unsaved.stay`)}
                danger
                isRTL={isRTL}
                onConfirm={() => { setConfirmDiscard(false); closeDrawers(); }}
                onCancel={() => setConfirmDiscard(false)}
            />

            <ClalToast toast={toast} isRTL={isRTL} onDismiss={dismiss} />
        </DefaultScreen>
    );
};

export default ClalCenterScreen;
