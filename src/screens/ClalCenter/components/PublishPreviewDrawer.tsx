// ═══════════════════════════════════════════════════════════════════════════════════════════
// PublishPreviewDrawer — the BODY of the preview level (chrome: `ClalDrawerStack`).
//
// THE DIFF IS REAL, AND IT IS PER-ITEM (§C6):
//   · the "before" is the item AS IT WAS WHEN THE EDIT DRAWER OPENED — a client-side snapshot,
//     exactly like the mock. There is NO server GET for "what is currently published"; the
//     published state lives in a JSON file on disk, and inventing an endpoint for it is not in
//     the contract.
//   · the diff is computed against that snapshot and nothing else.
// The mock originally shipped a HARD-CODED diff line, which read as fake to every reviewer
// (05-REVIEW-PANEL P1 #11). If nothing changed, this says so.
//
// The publish button here is TWO CALLS in order: `SaveItem`, then `Publish{ItemIds:[id]}`. If the
// first succeeds and the second fails the copy MUST be the partial one — "נשמר, אך הפרסום נכשל"
// — never "האתר לא השתנה", because the save did happen. The screen owns that branch; this file
// only asks for it.
// ═══════════════════════════════════════════════════════════════════════════════════════════

import React from 'react';
import { Box, Button, Typography } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { CC, eClalItemType } from '../../../Models/ClalCenter/ClalCenter';
import { norm } from '../searchNormalizer';
import { ItemDraft } from './ItemDrawer';

/** Returns the ready-to-render diff sentence. */
export function describeDiff(
    draft: ItemDraft,
    snapshot: ItemDraft | null,
    t: (key: string, opts?: any) => string
): string {
    if (!draft.ItemID || !snapshot) return t(`${CC}preview.diffNew`);

    const parts: string[] = [];
    if (draft.Title.trim() !== snapshot.Title.trim()) parts.push(t(`${CC}preview.diffTitle`));

    // Keyword comparison uses the FROZEN normaliser, so re-typing "קופ״ג" as "קופג" is correctly
    // reported as no change — the search engine cannot tell them apart either.
    const before = snapshot.Keywords.map(norm);
    const now = draft.Keywords.map(norm);
    const added = now.filter(k => before.indexOf(k) === -1).length;
    const removed = before.filter(k => now.indexOf(k) === -1).length;
    if (added) {
        parts.push(added === 1
            ? t(`${CC}preview.diffKeywordsAddedOne`)
            : t(`${CC}preview.diffKeywordsAddedMany`, { n: added }));
    }
    if (removed) {
        parts.push(removed === 1
            ? t(`${CC}preview.diffKeywordsRemovedOne`)
            : t(`${CC}preview.diffKeywordsRemovedMany`, { n: removed }));
    }

    if (draft.ItemType !== snapshot.ItemType) parts.push(t(`${CC}preview.diffType`));
    else if (draft.ItemType === eClalItemType.LINK && draft.Url.trim() !== snapshot.Url.trim()) {
        parts.push(t(`${CC}preview.diffUrl`));
    } else if (draft.ItemType === eClalItemType.FILE && draft.FileRef) {
        parts.push(t(`${CC}preview.diffFile`));
    } else if (draft.ItemType === eClalItemType.INFO && draft.InfoText.trim() !== snapshot.InfoText.trim()) {
        parts.push(t(`${CC}preview.diffInfo`));
    }

    if (draft.GroupID !== snapshot.GroupID) parts.push(t(`${CC}preview.diffLocation`));

    return parts.length ? t(`${CC}preview.diffPrefix`) + parts.join(' · ') : t(`${CC}preview.diffNone`);
}

interface Props {
    draft: ItemDraft;
    snapshot: ItemDraft | null;
    /** Path label of the destination, so the preview says where it will land. */
    pathLabel: string;
    busy: boolean;
    isRTL: boolean;
    /**
     * Opened from the 👁 in a row rather than from the edit drawer: LOOK ONLY. No diff (there is
     * nothing to diff against) and NO publish button.
     *
     * ⚠️ This flag is why the mock's most dangerous bug cannot come back: there, 👁 opened the
     * live publish drawer against an EMPTY form, so confirming it overwrote the item, wiped its
     * keywords and moved it into a sub-group with a blank name (05-REVIEW-PANEL P1 #1).
     */
    previewOnly?: boolean;
    onPublish: () => void;
    onBack: () => void;
}

const PublishPreviewDrawer = ({
    draft, snapshot, pathLabel, busy, isRTL, previewOnly = false, onPublish, onBack
}: Props) => {
    const { t } = useTranslation();

    const typeLabel = t(`${CC}type.${draft.ItemType}`);
    const fileName = draft.FileRef?.OriginalName ?? draft.ExistingFileName ?? '';

    return (
        <Box style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Typography style={{ fontSize: 12.5, color: '#7a8794' }}>{pathLabel}</Typography>

            {/* The portal card, as the agent will see it */}
            <Box
                style={{
                    border: '1px solid #dbe3ea', borderRadius: 10, padding: '14px 16px',
                    display: 'flex', alignItems: 'center', gap: 12, background: '#fff'
                }}
            >
                <Typography
                    component="span"
                    style={{ fontSize: 11.5, background: '#0B6E4F', color: '#fff', borderRadius: 4, padding: '1px 8px' }}
                >
                    {typeLabel}
                </Typography>
                <Typography component="b" style={{ flex: 1, fontWeight: 700 }}>
                    {draft.Title.trim() || '—'}
                </Typography>
                <Typography component="span" style={{ color: '#0B6E4F' }}>{isRTL ? '‹' : '›'}</Typography>
            </Box>

            {draft.ItemType === eClalItemType.LINK && !!draft.Url && (
                <Typography style={{ fontSize: 13, direction: 'ltr', textAlign: isRTL ? 'right' : 'left', color: '#5b6b7b' }}>
                    {draft.Url}
                </Typography>
            )}
            {draft.ItemType === eClalItemType.FILE && !!fileName && (
                <Typography style={{ fontSize: 13, direction: 'ltr', textAlign: isRTL ? 'right' : 'left', color: '#5b6b7b' }}>
                    {fileName}
                </Typography>
            )}
            {draft.ItemType === eClalItemType.INFO && !!draft.InfoText && (
                <Typography style={{ fontSize: 14, color: '#44525e', whiteSpace: 'pre-wrap' }}>
                    {draft.InfoText}
                </Typography>
            )}

            {!!draft.Keywords.length && (
                <Box style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {draft.Keywords.map(k => (
                        <Typography
                            key={k}
                            component="span"
                            style={{
                                fontSize: 12, background: '#f0f4f8', border: '1px solid #dbe3ea',
                                borderRadius: 999, padding: '0 9px', color: '#44525e'
                            }}
                        >
                            {k}
                        </Typography>
                    ))}
                </Box>
            )}

            {!previewOnly && (
                <Typography style={{ fontSize: 13, color: '#7a8794' }}>
                    {describeDiff(draft, snapshot, t)}
                </Typography>
            )}

            <Box style={{ display: 'flex', gap: 10, flexWrap: 'wrap', paddingTop: 4 }}>
                {!previewOnly && (
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={onPublish}
                        disabled={busy || !draft.Title.trim()}
                        style={{ fontWeight: 700 }}
                    >
                        {t(`${CC}preview.publish`)}
                    </Button>
                )}
                <Button onClick={onBack} disabled={busy} style={{ color: '#5b6b7b', fontWeight: 600 }}>
                    {previewOnly ? t(`${CC}close`) : t(`${CC}preview.backToEdit`)}
                </Button>
            </Box>
        </Box>
    );
};

export default PublishPreviewDrawer;
