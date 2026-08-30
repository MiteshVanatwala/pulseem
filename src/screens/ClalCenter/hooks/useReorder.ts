// ═══════════════════════════════════════════════════════════════════════════════════════════
// useReorder — the ONE function every reordering input path goes through (14-W3 §3.6, §3.7).
//
// Drag, ↑/↓ on a focused row, and the coarse-pointer nudge buttons all call `reorder()`. There is
// no second code path to forget about, which is the entire point of the section.
//
// WHAT IT GUARANTEES:
//  · OPTIMISTIC: state moves before the network does.
//  · DEBOUNCE 400ms PER LIST (`listId = level:parentId`) — five drags in one list are one call.
//  · SINGLE-FLIGHT PER LIST: one request in the air at a time; the next waits. Without this a
//    slow earlier response lands after a fast later one and an OLD order overwrites a NEW one.
//  · FULL-ARRAY COMMITMENT: always every id of the list, in order — never a delta. SP3/SP6 write
//    `SortOrder` ONLY for the ids they receive, so a partial list leaves the omitted rows holding
//    stale values that collide with the new ones. That is the silent data corruption §3.8 is
//    about, and it is why the search filter also disables reordering entirely.
//  · SNAP-BACK ON FAILURE to the tree as it was BEFORE the burst (not before the last drag), with
//    a 200ms cue so the eye actually sees the change being undone.
//
// ⚠️ AND WHAT IT DELIBERATELY DOES NOT DO: refresh `GetTree` (C6 v12 §7). The client SENT the
// order; a refresh returns exactly what is already on screen, and if it lands mid-gesture it
// re-renders the list under the cursor. The client applies the same `(index+1)*10` formula the
// stored procedures use, so the local `SortOrder` values are not an approximation — they are the
// same numbers. `PendingSiteUpdate` is therefore computed client-side by the caller.
// ═══════════════════════════════════════════════════════════════════════════════════════════

import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    applyLocalGroupOrder,
    applyLocalItemOrder,
    reorderClalGroups,
    reorderClalItems,
    restoreTreeSnapshot
} from '../../../redux/reducers/clalCenterSlice';
import { GroupDto, ItemDto } from '../../../Models/ClalCenter/ClalCenter';
import { DragLevel } from '../components/SortableRow';

export interface ReorderTarget {
    level: DragLevel;
    /** null ⇒ the root list of categories. */
    parentId: number | null;
}

export const listIdOf = (target: ReorderTarget): string =>
    `${target.level}:${target.parentId === null ? 'root' : target.parentId}`;

export const REORDER_DEBOUNCE_MS = 400;
export const SNAP_BACK_MS = 200;

interface PendingEntry {
    timer: any;
    ids: number[];
    target: ReorderTarget;
    /** The tree as it was before the FIRST optimistic change of this burst. */
    snapshot: { groups: GroupDto[]; items: ItemDto[] } | null;
    inflight: boolean;
    queued: boolean;
}

interface Options {
    /** Called with the error key when a commit fails, after the snap-back has been dispatched. */
    onError: (errorKey: string) => void;
}

export function useReorder({ onError }: Options) {
    const dispatch = useDispatch<any>();
    const { groups, items } = useSelector((state: any) => state.clalCenter);
    const pending = useRef<{ [listId: string]: PendingEntry }>({});
    /** The list currently playing the snap-back cue, so the screen can style it. */
    const [snapBackListId, setSnapBackListId] = useState<string | null>(null);

    // The latest tree, readable from inside the debounce timer without stale-closure risk.
    const treeRef = useRef({ groups, items });
    treeRef.current = { groups, items };

    useEffect(() => {
        const table = pending.current;
        return () => {
            Object.keys(table).forEach(key => clearTimeout(table[key].timer));
        };
    }, []);

    const commit = useCallback(
        async (listId: string) => {
            const entry = pending.current[listId];
            if (!entry) return;
            if (entry.inflight) { entry.queued = true; return; }

            entry.inflight = true;
            const ids = entry.ids.slice();
            const target = entry.target;

            const action =
                target.level === 3
                    ? reorderClalItems({ GroupID: target.parentId as number, OrderedItemIds: ids })
                    : reorderClalGroups({ ParentGroupID: target.parentId, OrderedGroupIds: ids });

            const result: any = await dispatch(action);
            entry.inflight = false;

            if (result?.error) {
                const snapshot = entry.snapshot;
                delete pending.current[listId];
                if (snapshot) dispatch(restoreTreeSnapshot(snapshot));
                setSnapBackListId(listId);
                setTimeout(() => setSnapBackListId(current => (current === listId ? null : current)), SNAP_BACK_MS);
                onError(result?.payload?.error ?? 'server_error');
                return;
            }

            if (entry.queued) {
                // Another burst landed while this one was in the air — send the latest order.
                entry.queued = false;
                commit(listId);
                return;
            }
            delete pending.current[listId];
        },
        [dispatch, onError]
    );

    /**
     * @param target      which list is being reordered
     * @param orderedIds  the COMPLETE new order of that list
     */
    const reorder = useCallback(
        (target: ReorderTarget, orderedIds: number[]) => {
            const listId = listIdOf(target);
            const existing = pending.current[listId];

            const entry: PendingEntry = existing ?? {
                timer: null,
                ids: orderedIds,
                target,
                // Captured ONCE per burst: snapping back has to undo the whole burst, not the last
                // gesture of it.
                snapshot: {
                    groups: treeRef.current.groups.map((g: GroupDto) => ({ ...g })),
                    items: treeRef.current.items.map((i: ItemDto) => ({ ...i }))
                },
                inflight: false,
                queued: false
            };
            entry.ids = orderedIds;
            entry.target = target;
            pending.current[listId] = entry;

            // optimistic, before the network
            if (target.level === 3) {
                dispatch(applyLocalItemOrder({ groupId: target.parentId as number, orderedIds }));
            } else {
                dispatch(applyLocalGroupOrder({ parentId: target.parentId, orderedIds }));
            }

            clearTimeout(entry.timer);
            entry.timer = setTimeout(() => commit(listId), REORDER_DEBOUNCE_MS);
        },
        [commit, dispatch]
    );

    /**
     * Flush every debounced list immediately. Used when the screen is about to do something that
     * must not race a queued reorder — publishing, or leaving the screen.
     */
    const flushReorders = useCallback(async () => {
        const listIds = Object.keys(pending.current);
        await Promise.all(
            listIds.map(listId => {
                const entry = pending.current[listId];
                if (!entry) return Promise.resolve();
                clearTimeout(entry.timer);
                return commit(listId);
            })
        );
    }, [commit]);

    return { reorder, flushReorders, snapBackListId };
}

export default useReorder;
