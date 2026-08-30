// ═══════════════════════════════════════════════════════════════════════════════════════════
// GroupRow — one row of the tree, at EITHER level. A sub-group is a category as far as
// capabilities go (14-W3 §1): handle · ↑↓ · inline rename · visibility toggle · item count ·
// history · delete. The only asymmetry is deliberate:
//
//   · "＋ תת-קבוצה" appears on a CATEGORY row ONLY. The three-level cap is communicated by the
//     ABSENCE of the control on a sub-group row — not a disabled button, not an explanatory
//     tooltip (§1, owner/UX decision). The positive sentence above the tree carries the rule.
//   · "+ הוספה ל…" appears on a SUB-GROUP row only, because items only ever live in sub-groups.
//
// ⚠️ The delete affordance has TWO shapes and the parent chooses (§4): `deleteMode="inline"` for
// an empty group (two-step confirm right in the row, with a timeout back to normal, exactly like
// the mock) and `deleteMode="dialog"` when there are children or items to account for. The
// mock's disabled-delete-with-a-tooltip is gone.
//
// Search active ⇒ the handle and the nudge buttons are NOT RENDERED AT ALL (§3.8). Sending a
// FILTERED list to SP3/SP6 would leave the hidden rows holding stale SortOrder values that
// collide with the new ones — silent corruption that only shows up on the portal.
// ═══════════════════════════════════════════════════════════════════════════════════════════

import React, { useEffect, useRef, useState } from 'react';
import { Box, Button, IconButton, TextField, Tooltip, Typography } from '@material-ui/core';
import {
    Edit, Visibility, VisibilityOff, DeleteOutline, History, ExpandMore, ChevronLeft, ChevronRight
} from '@material-ui/icons';
import { useTranslation } from 'react-i18next';
import { CC, GroupDto } from '../../../Models/ClalCenter/ClalCenter';
import { HandleProps, useHandleStyles } from './SortableRow';

const INLINE_CONFIRM_MS = 4000;

interface Props {
    group: GroupDto;
    level: 1 | 2;
    position: number;
    total: number;
    itemCount: number;
    liveCount: number;
    draftCount: number;
    /** Level 1 only. */
    isOpen?: boolean;
    /** Level 2 only — the category holds exactly one sub-group (C4 §1). */
    isSingleSubGroup?: boolean;
    /** Hidden itself, or sitting under a hidden ancestor. */
    effectivelyHidden: boolean;
    searchActive: boolean;
    isRTL: boolean;
    handleProps: HandleProps;
    canMoveUp: boolean;
    canMoveDown: boolean;
    deleteMode: 'inline' | 'dialog';
    onToggleOpen?: () => void;
    onNudge: (delta: -1 | 1) => void;
    onRename: (title: string) => void;
    onToggleVisibility: () => void;
    onDelete: () => void;
    onHistory: () => void;
    onAddSubGroup?: () => void;
    onAddItem?: () => void;
}

const GroupRow = ({
    group, level, position, total, itemCount, liveCount, draftCount, isOpen, isSingleSubGroup,
    effectivelyHidden, searchActive, isRTL, handleProps, canMoveUp, canMoveDown, deleteMode,
    onToggleOpen, onNudge, onRename, onToggleVisibility, onDelete, onHistory, onAddSubGroup, onAddItem
}: Props) => {
    const { t } = useTranslation();
    const styles = useHandleStyles();
    const [renaming, setRenaming] = useState(false);
    const [draft, setDraft] = useState(group.Title);
    const [confirming, setConfirming] = useState(false);
    const confirmTimer = useRef<any>(null);
    const committed = useRef(false);

    useEffect(() => () => clearTimeout(confirmTimer.current), []);

    const startRename = () => {
        committed.current = false;
        setDraft(group.Title);
        setRenaming(true);
    };

    const commitRename = () => {
        // blur fires after Enter as well; the guard stops a double SaveGroup.
        if (committed.current) return;
        committed.current = true;
        setRenaming(false);
        const next = draft.trim();
        if (next && next !== group.Title) onRename(next);
    };

    const cancelRename = () => {
        committed.current = true;
        setRenaming(false);
    };

    const armDelete = () => {
        if (deleteMode === 'dialog') { onDelete(); return; }
        setConfirming(true);
        clearTimeout(confirmTimer.current);
        confirmTimer.current = setTimeout(() => setConfirming(false), INLINE_CONFIRM_MS);
    };

    const isCategory = level === 1;
    // The accordion chevron points at the inline-start edge when closed — mirrored, never rotated
    // (E3 RTL_NOTES 9).
    const ClosedChevron = isRTL ? ChevronLeft : ChevronRight;

    const meta: string[] = [];
    if (itemCount === 0) meta.push(t(`${CC}group.itemsNone`));
    else meta.push(itemCount === 1 ? t(`${CC}group.itemsOne`) : t(`${CC}group.itemsMany`, { n: itemCount }));
    if (liveCount) meta.push(t(`${CC}group.live`, { n: liveCount }));

    return (
        <Box
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: isCategory ? '10px 14px' : '8px 6px',
                background: isCategory ? '#fff' : 'transparent',
                opacity: effectivelyHidden ? 0.62 : 1,
                flexWrap: 'wrap'
            }}
        >
            {!searchActive && (
                <>
                    <Tooltip
                        title={t(`${CC}reorder.${isCategory ? 'handleCategory' : 'handleSubGroup'}`, {
                            name: group.Title, pos: position, total
                        })}
                        PopperProps={{ style: { direction: isRTL ? 'rtl' : 'ltr' } }}
                    >
                        <button
                            type="button"
                            className={styles.handle}
                            {...handleProps}
                            aria-label={t(`${CC}reorder.${isCategory ? 'handleCategory' : 'handleSubGroup'}`, {
                                name: group.Title, pos: position, total
                            })}
                        >
                            ⋮⋮
                        </button>
                    </Tooltip>
                    {/* Disabled at the ends, NOT silently inert (§3.6). */}
                    <button
                        type="button"
                        className={styles.nudge}
                        disabled={!canMoveUp}
                        aria-label={t(`${CC}reorder.up`)}
                        onClick={() => onNudge(-1)}
                    >
                        ↑
                    </button>
                    <button
                        type="button"
                        className={styles.nudge}
                        disabled={!canMoveDown}
                        aria-label={t(`${CC}reorder.down`)}
                        onClick={() => onNudge(1)}
                    >
                        ↓
                    </button>
                </>
            )}

            {isCategory && (
                <IconButton
                    size="small"
                    aria-expanded={!!isOpen}
                    aria-label={t(`${CC}group.${isOpen ? 'collapse' : 'expand'}`)}
                    onClick={onToggleOpen}
                >
                    {isOpen ? <ExpandMore fontSize="small" /> : <ClosedChevron fontSize="small" />}
                </IconButton>
            )}

            {renaming ? (
                <TextField
                    autoFocus
                    variant="outlined"
                    size="small"
                    value={draft}
                    // Groups.Title is nvarchar(255) — cap the input rather than truncate silently in T-SQL.
                    inputProps={{ 'aria-label': t(`${CC}group.renameLabel`), maxLength: 255 }}
                    onChange={e => setDraft(e.target.value)}
                    onBlur={commitRename}
                    onKeyDown={e => {
                        if (e.key === 'Enter') { e.preventDefault(); commitRename(); }
                        // stopPropagation: Esc must cancel the rename, not close the whole screen's
                        // topmost surface.
                        else if (e.key === 'Escape') { e.stopPropagation(); cancelRename(); }
                    }}
                    style={{ maxWidth: 260, background: '#fff' }}
                />
            ) : (
                <Typography
                    component={isCategory ? 'h3' : 'h4'}
                    style={{
                        margin: 0,
                        fontWeight: isCategory ? 700 : 600,
                        fontSize: isCategory ? 16 : 13.5,
                        color: isCategory ? '#151b21' : '#5b6b7b',
                        letterSpacing: isCategory ? undefined : '.02em'
                    }}
                >
                    {group.Title}
                </Typography>
            )}

            {effectivelyHidden && (
                <Typography component="span" style={{ fontSize: 12, color: '#7a8794', background: '#eef1f4', borderRadius: 999, padding: '1px 9px' }}>
                    {t(`${CC}group.hiddenBadge`)}
                </Typography>
            )}

            <Typography component="span" style={{ fontSize: 13, color: '#7a8794' }}>
                {meta.join(' · ')}
                {draftCount > 0 && (
                    <Typography component="span" style={{ fontSize: 13, color: '#b7791f' }}>
                        {' · ' + (draftCount === 1
                            ? t(`${CC}group.draftsOne`)
                            : t(`${CC}group.drafts`, { n: draftCount }))}
                    </Typography>
                )}
            </Typography>

            {/* The portal will not print this title (C4 §1). The admin only SAYS so — it changes
                nothing about the structure. */}
            {isSingleSubGroup && (
                <Typography component="span" style={{ fontSize: 12, color: '#0B6E4F', background: '#f2f7f4', borderRadius: 6, padding: '1px 9px' }}>
                    {t(`${CC}group.singleSubGroupNote`)}
                </Typography>
            )}

            <Box style={{ flex: 1 }} />

            {confirming ? (
                <Box style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Typography component="span" style={{ fontSize: 13, color: '#c62828', fontWeight: 700 }}>
                        {t(`${CC}deleteGroup.inlineQuestion`)}
                    </Typography>
                    <Button
                        size="small"
                        onClick={() => { setConfirming(false); onDelete(); }}
                        style={{ color: '#c62828', fontWeight: 700, minHeight: 32 }}
                    >
                        {t(`${CC}yes`)}
                    </Button>
                    <Button size="small" onClick={() => setConfirming(false)} style={{ color: '#5b6b7b', minHeight: 32 }}>
                        {t(`${CC}cancel`)}
                    </Button>
                </Box>
            ) : (
                <Box style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {!isCategory && onAddItem && (
                        <Button size="small" onClick={onAddItem} style={{ color: '#FF1744', fontWeight: 600, fontSize: 12.5 }}>
                            {t(`${CC}addItemTo`, { name: group.Title })}
                        </Button>
                    )}
                    {isCategory && onAddSubGroup && (
                        <Button size="small" onClick={onAddSubGroup} style={{ color: '#FF1744', fontWeight: 600, fontSize: 12.5 }}>
                            {t(`${CC}addSubGroup`)}
                        </Button>
                    )}
                    <Tooltip title={t(`${CC}group.rename`)} PopperProps={{ style: { direction: isRTL ? 'rtl' : 'ltr' } }}>
                        <IconButton size="small" onClick={startRename} aria-label={t(`${CC}group.rename`)}>
                            <Edit fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip
                        title={t(`${CC}group.${group.IsHidden ? 'show' : 'hide'}`)}
                        PopperProps={{ style: { direction: isRTL ? 'rtl' : 'ltr' } }}
                    >
                        <IconButton
                            size="small"
                            onClick={onToggleVisibility}
                            aria-label={t(`${CC}group.${group.IsHidden ? 'show' : 'hide'}`)}
                            aria-pressed={!!group.IsHidden}
                        >
                            {group.IsHidden ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={t(`${CC}group.history`)} PopperProps={{ style: { direction: isRTL ? 'rtl' : 'ltr' } }}>
                        <IconButton size="small" onClick={onHistory} aria-label={t(`${CC}group.history`)}>
                            <History fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={t(`${CC}group.delete`)} PopperProps={{ style: { direction: isRTL ? 'rtl' : 'ltr' } }}>
                        <IconButton size="small" onClick={armDelete} aria-label={t(`${CC}group.delete`)}>
                            <DeleteOutline fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Box>
            )}
        </Box>
    );
};

export default GroupRow;
