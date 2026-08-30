// ═══════════════════════════════════════════════════════════════════════════════════════════
// SortableRow — the single `useSortable` wrapper for all three levels (14-W3 §3).
//
// THREE THINGS LIVE HERE AND NOWHERE ELSE:
//
// 1. `data: { level, parentId }` on every draggable node. The collision filter in the screen
//    reads it to keep exactly ONE level active at a time: same `level` ALWAYS, same `parentId`
//    ONLY at level 3 (C6 v12 §12 — "same level and same parent" was self-contradictory at level
//    2, where a sub-group legitimately crosses categories).
//
// 2. ⚠️ THE RTL TRANSFORM FIX (§3.5). `useSortable` returns a transform carrying an `x`, and it
//    is written as an INLINE style. `jss-rtl` only rewrites the styles JSS itself generates — it
//    never touches inline styles — so a positive `x` crawls the wrong way on an RTL page. We zero
//    it: `translate3d(0, y, 0)`. Every list on this screen is vertical, so nothing is lost.
//
// 3. The drag handle is ALWAYS VISIBLE — never revealed on hover. A hover-revealed handle does
//    not exist on a touch device, and this screen has to be usable on a tablet (E3 / mock finding
//    #21). Under `any-pointer: coarse` the handle grows to a 44px target; note `any-pointer`, NOT
//    `pointer` — a hybrid laptop with a mouse attached still reports `pointer: fine` and would
//    otherwise lose the touch affordances (§3.6).
//
// The dnd-kit id is a NAMESPACED STRING ("g-12" / "i-12"), because group ids and item ids come
// from two different IDENTITY columns and collide constantly.
// ═══════════════════════════════════════════════════════════════════════════════════════════

import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { makeStyles } from '@material-ui/core/styles';

export type DragLevel = 1 | 2 | 3;

export interface SortableData {
    level: DragLevel;
    /** null for a category; the parent GroupID otherwise. */
    parentId: number | null;
}

export const groupDragId = (groupId: number): string => `g-${groupId}`;
export const itemDragId = (itemId: number): string => `i-${itemId}`;
/** The always-present level-2 landing strip inside a category (§3.4). */
export const stripDropId = (categoryId: number): string => `strip-${categoryId}`;

export const parseDragId = (id: string): { kind: 'group' | 'item' | 'strip'; id: number } | null => {
    if (typeof id !== 'string') return null;
    if (id.indexOf('g-') === 0) return { kind: 'group', id: Number(id.slice(2)) };
    if (id.indexOf('i-') === 0) return { kind: 'item', id: Number(id.slice(2)) };
    if (id.indexOf('strip-') === 0) return { kind: 'strip', id: Number(id.slice(6)) };
    return null;
};

export const useHandleStyles = makeStyles({
    handle: {
        cursor: 'grab',
        color: '#8fa0ae',
        userSelect: 'none',
        padding: '2px 5px',
        fontSize: 15,
        lineHeight: 1,
        border: 0,
        background: 'none',
        borderRadius: 4,
        letterSpacing: '-1px',
        fontFamily: 'inherit',
        touchAction: 'none', // required by dnd-kit's PointerSensor, or the browser scrolls instead
        '&:hover': { background: '#eef1f4', color: '#5b6b7b' },
        '&:active': { cursor: 'grabbing' },
        '@media (any-pointer: coarse)': { minWidth: 44, minHeight: 44 }
    },
    nudge: {
        border: '1px solid #dbe3ea',
        background: '#fff',
        borderRadius: 5,
        cursor: 'pointer',
        font: 'inherit',
        color: '#5b6b7b',
        lineHeight: 1,
        padding: '2px 7px',
        '&:disabled': { color: '#c3ccd4', cursor: 'not-allowed' },
        '@media (any-pointer: coarse)': { minWidth: 44, minHeight: 44 }
    }
});

export interface HandleProps {
    ref: (element: HTMLElement | null) => void;
    [key: string]: any;
}

interface Props {
    id: string;
    level: DragLevel;
    parentId: number | null;
    /** Search active ⇒ reordering is off entirely (§3.8) — the handle is not rendered at all. */
    disabled?: boolean;
    children: (args: { handleProps: HandleProps; isDragging: boolean }) => React.ReactNode;
}

const SortableRow = ({ id, level, parentId, disabled = false, children }: Props) => {
    const {
        attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging
    } = useSortable({ id, disabled, data: { level, parentId } as SortableData });

    const style: React.CSSProperties = {
        // x is deliberately dropped — see (2) in the header.
        transform: transform ? `translate3d(0, ${Math.round(transform.y)}px, 0)` : undefined,
        transition: transition || undefined,
        // The dragged row leaves a hole exactly its own size while the DragOverlay copy follows
        // the cursor. NOT a half-transparent ghost left in place plus an insertion line (§3.5).
        opacity: isDragging ? 0 : 1,
        position: 'relative',
        zIndex: isDragging ? 0 : undefined
    };

    const handleProps: HandleProps = {
        ref: setActivatorNodeRef,
        ...attributes,
        ...listeners
    };

    return (
        <div ref={setNodeRef} style={style}>
            {children({ handleProps, isDragging })}
        </div>
    );
};

export default SortableRow;

// ── the level-2 landing strip (§3.4) ─────────────────────────────────────────────────────────
// There is NO auto-expand-on-hover on this screen. A hover delay is a bet on what the user meant,
// and with unsteady hands it is miserable. Instead: while a SUB-GROUP is being dragged, EVERY
// category shows a fixed 44px dashed strip that says "גררו לכאן" — including a collapsed
// category and an empty one. It appears on `onDragStart` and disappears on drag end, and it does
// NOT depend on where the cursor is.

interface DropStripProps {
    categoryId: number;
    label: string;
}

export const DropStrip = ({ categoryId, label }: DropStripProps) => {
    const { setNodeRef, isOver } = useDroppable({
        id: stripDropId(categoryId),
        data: { level: 2, parentId: categoryId } as SortableData
    });

    return (
        <div
            ref={setNodeRef}
            style={{
                height: 44,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: `2px dashed ${isOver ? '#FF1744' : '#cfd7df'}`,
                background: isOver ? '#fff5f7' : 'transparent',
                borderRadius: 8,
                color: isOver ? '#FF1744' : '#8fa0ae',
                fontSize: 13,
                fontWeight: 600,
                margin: '8px 0'
            }}
        >
            {label}
        </div>
    );
};
