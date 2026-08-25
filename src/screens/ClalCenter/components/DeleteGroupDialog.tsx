// ═══════════════════════════════════════════════════════════════════════════════════════════
// DeleteGroupDialog — cases (ב) and (ג) of the three-case delete flow (14-W3 §4).
//
// Case (א), an empty group, never reaches here: it is a two-step confirm inline in the row
// (`GroupRow`, `deleteMode="inline"`), because a modal for "delete this empty thing" is heavier
// than the decision.
//
//   (ב) children exist but all are empty  → one confirm that NAMES THE NUMBER.
//   (ג) items exist                        → two ways out, not a wall:
//         · "העברת הפריטים ל…"  — the primary path, reusing the SAME GroupPathPicker as the item
//           drawer, so there is one location control on this screen and not two.
//         · "מחיקה כולל התוכן" — destructive, deliberately NOT the visually primary button, and
//           behind a SECOND confirm that names the item count.
//
// ⚠️ THE SERVER NEVER CHANGED. SP13 still returns −1 ⇒ 400 `group_not_empty` for a non-empty
// group, and it never deletes content that was not explicitly asked for. This dialog is how the
// editor expresses that explicit ask; it is not a client-side bypass, and `group_not_empty` stays
// in the copy table because the UI must never be the only thing standing between a click and the
// data.
//
// ⚠️ MOVE ORDER IS LOAD-BEARING (§4): items go one at a time, IN ASCENDING `SortOrder`, and NOT
// through `Promise.all`. SP5 assigns `MAX+10` in the target group, so the arrival order IS the
// resulting order — firing them in parallel shuffles the sequence the editor built.
// ═══════════════════════════════════════════════════════════════════════════════════════════

import React, { useState } from 'react';
import {
    Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, LinearProgress, Typography
} from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { CC, GroupDto } from '../../../Models/ClalCenter/ClalCenter';
import GroupPathPicker from './GroupPathPicker';

interface Props {
    open: boolean;
    group: GroupDto | null;
    /** Case (ב): how many empty descendant groups go with it. */
    emptyChildCount: number;
    /** Case (ג): how many live items sit in the subtree. */
    itemCount: number;
    groups: GroupDto[];
    isRTL: boolean;
    busy: boolean;
    /** Shown while the sequential move is running. */
    progress: { n: number; total: number } | null;
    onCancel: () => void;
    onDeleteEmptyTree: () => void;
    onMoveItems: (targetGroupId: number) => void;
    onDeleteWithContent: () => void;
    onCreateSubGroup: (categoryId: number, title: string) => Promise<number | null>;
}

const DeleteGroupDialog = ({
    open, group, emptyChildCount, itemCount, groups, isRTL, busy, progress,
    onCancel, onDeleteEmptyTree, onMoveItems, onDeleteWithContent, onCreateSubGroup
}: Props) => {
    const { t } = useTranslation();
    const [target, setTarget] = useState<number | null>(null);
    const [confirmDestroy, setConfirmDestroy] = useState(false);

    if (!group) return null;
    const hasItems = itemCount > 0;

    const close = () => {
        setTarget(null);
        setConfirmDestroy(false);
        onCancel();
    };

    // Moving into the group that is about to be deleted, or into one of its descendants, would be
    // a round trip to nowhere — those options are filtered out of the picker.
    const descendantIds = (() => {
        const out: number[] = [group.GroupID];
        const walk = (id: number) => {
            groups.filter(g => g.ParentGroupID === id).forEach(child => {
                out.push(child.GroupID);
                walk(child.GroupID);
            });
        };
        walk(group.GroupID);
        return out;
    })();
    const pickerGroups = groups.filter(g => descendantIds.indexOf(g.GroupID) === -1);

    return (
        <Dialog
            open={open}
            onClose={busy ? undefined : close}
            maxWidth="sm"
            fullWidth
            dir={isRTL ? 'rtl' : 'ltr'}
            aria-labelledby="cc-delete-group-title"
        >
            <DialogTitle id="cc-delete-group-title" disableTypography>
                <Typography component="h2" style={{ fontSize: 18, fontWeight: 800 }}>
                    {t(`${CC}deleteGroup.title`, { name: group.Title })}
                </Typography>
            </DialogTitle>

            <DialogContent>
                {!hasItems ? (
                    <Typography style={{ fontSize: 15, color: '#44525e' }}>
                        {emptyChildCount === 1
                            ? t(`${CC}deleteGroup.childrenBodyOne`, { name: group.Title })
                            : t(`${CC}deleteGroup.childrenBodyMany`, { name: group.Title, n: emptyChildCount })}
                    </Typography>
                ) : confirmDestroy ? (
                    <Typography style={{ fontSize: 15, color: '#c62828', fontWeight: 600 }}>
                        {itemCount === 1
                            ? t(`${CC}deleteGroup.confirmContentOne`)
                            : t(`${CC}deleteGroup.confirmContentMany`, { n: itemCount })}
                    </Typography>
                ) : (
                    <Box>
                        <Typography style={{ fontSize: 15, color: '#44525e', marginBottom: 14 }}>
                            {itemCount === 1
                                ? t(`${CC}deleteGroup.withItemsBodyOne`, { name: group.Title })
                                : t(`${CC}deleteGroup.withItemsBodyMany`, { name: group.Title, n: itemCount })}
                        </Typography>
                        <Typography style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>
                            {t(`${CC}deleteGroup.moveItems`)}
                        </Typography>
                        <GroupPathPicker
                            groups={pickerGroups}
                            value={target}
                            isRTL={isRTL}
                            label={t(`${CC}picker.label`)}
                            disabled={busy}
                            onChange={setTarget}
                            onCreateSubGroup={onCreateSubGroup}
                        />
                        {progress && (
                            <Box style={{ marginTop: 14 }} role="status" aria-live="polite">
                                <Typography style={{ fontSize: 13, marginBottom: 6 }}>
                                    {t(`${CC}deleteGroup.movingItems`, { n: progress.n, total: progress.total })}
                                </Typography>
                                <LinearProgress
                                    variant="determinate"
                                    value={Math.round((progress.n / progress.total) * 100)}
                                    style={{ height: 6, borderRadius: 3 }}
                                />
                            </Box>
                        )}
                    </Box>
                )}
            </DialogContent>

            <DialogActions style={{ padding: '12px 20px 18px', gap: 8, flexWrap: 'wrap' }}>
                <Button onClick={close} disabled={busy} style={{ color: '#5b6b7b' }}>
                    {t(`${CC}cancel`)}
                </Button>

                {!hasItems && (
                    <Button
                        onClick={onDeleteEmptyTree}
                        disabled={busy}
                        variant="contained"
                        color="primary"
                        style={{ fontWeight: 700 }}
                    >
                        {t(`${CC}delete`)}
                    </Button>
                )}

                {hasItems && !confirmDestroy && (
                    <>
                        {/* destructive, and deliberately the NON-primary of the two */}
                        <Button
                            onClick={() => setConfirmDestroy(true)}
                            disabled={busy}
                            variant="outlined"
                            style={{ color: '#c62828', borderColor: '#c62828', fontWeight: 700 }}
                        >
                            {t(`${CC}deleteGroup.deleteWithContent`)}
                        </Button>
                        <Button
                            onClick={() => target && onMoveItems(target)}
                            disabled={busy || !target}
                            variant="contained"
                            color="primary"
                            style={{ fontWeight: 700 }}
                        >
                            {t(`${CC}deleteGroup.moveAndDelete`)}
                        </Button>
                    </>
                )}

                {hasItems && confirmDestroy && (
                    <>
                        <Button onClick={() => setConfirmDestroy(false)} disabled={busy} style={{ color: '#5b6b7b' }}>
                            {t(`${CC}deleteGroup.backToOptions`)}
                        </Button>
                        <Button
                            onClick={onDeleteWithContent}
                            disabled={busy}
                            variant="outlined"
                            style={{ color: '#c62828', borderColor: '#c62828', fontWeight: 700 }}
                        >
                            {t(`${CC}deleteGroup.confirmContentAction`)}
                        </Button>
                    </>
                )}
            </DialogActions>
        </Dialog>
    );
};

export default DeleteGroupDialog;
