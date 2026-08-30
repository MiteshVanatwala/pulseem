// ═══════════════════════════════════════════════════════════════════════════════════════════
// ItemDrawer — the BODY of the edit level (chrome: `ClalDrawerStack`).
//
// CONTROLLED. The screen owns the draft, because the preview level diffs it and the save path
// serialises it; a second copy living in here is a second thing to keep in sync.
//
// THE THINGS IN THIS FILE THAT ARE CONTRACT, NOT TASTE:
//
//  · THE SAVE BUTTON LABEL BRANCHES ON STATUS (C6 v12 §6). On a `Status===1` item it says
//    "שמירה", NOT "שמירה כטיוטה" — saving a live item does not demote it to a draft, and the
//    old label said it did. If the hide switch is on, the publish button becomes
//    "שמירה (הפריט יישאר מוסתר)" and no publish happens at all.
//  · URL VALIDATION IS `https://` ONLY (§C2, owner-decided default). Checked on blur so typing
//    is not fought with, and again before save.
//  · A FILE IS NEVER CLEARED BEFORE A 2xx. On failure the copy is "העלאת הקובץ נכשלה — הקובץ
//    הקודם נשאר", and that has to be TRUE: `FileRef` is only written after the upload resolves.
//    On the server side the matching guarantee is SP5's COALESCE — editing a title without
//    re-uploading must not wipe the file or write a false ChangeLog row.
//  · EVERY upload call is wrapped in try/catch that also catches `TypeError`, because
//    `UploaderAPI.ts:48-55` dereferences `error.response.status` unguarded (platform bug #9). The
//    promised failure toast would otherwise never render.
//  · SIZE AND EXTENSION ARE PRE-CHECKED CLIENT-SIDE against the same limits the server carries in
//    appSettings, purely so the editor gets the frozen copy instantly instead of after a 25MB
//    round trip. THE SERVER REMAINS THE AUTHORITY — it re-checks and its answer wins.
// ═══════════════════════════════════════════════════════════════════════════════════════════

import React, { useRef, useState } from 'react';
import moment from 'moment';
import {
    Box, Button, CircularProgress, LinearProgress, Switch, TextField, Typography
} from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import {
    CC, ClalErrorKey, FileRefDto, GroupDto, ItemDto, eClalItemStatus, eClalItemType
} from '../../../Models/ClalCenter/ClalCenter';
import { uploadClalFile, toErrorKey } from '../../../redux/reducers/clalCenterSlice';
import { DateFormats } from '../../../helpers/Constants';
import { norm } from '../searchNormalizer';
import GroupPathPicker from './GroupPathPicker';
import { KeywordChips, keywordsTooLong, MAX_KEYWORDS } from './KeywordChips';

/** Mirrors `ClalCenter.MaxFileMB` / `ClalCenter.AllowedExtensions`. The server re-checks. */
export const MAX_FILE_MB = 25;
export const ALLOWED_EXTENSIONS = [
    'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
    'png', 'jpg', 'jpeg', 'gif', 'mp3', 'mp4', 'wav'
];

export interface ItemDraft {
    ItemID: number | null;
    GroupID: number | null;
    ItemType: eClalItemType;
    Title: string;
    Description: string;
    Keywords: string[];
    Url: string;
    InfoText: string;
    /** The hide switch. On save this becomes a `SetStatus` call, never a `SaveItem` field. */
    Hidden: boolean;
    /** A file uploaded during THIS editing session. null ⇒ keep whatever the item already has. */
    FileRef: FileRefDto | null;
    ExistingFileName: string | null;
    ExistingFileUrl: string | null;
    /** The item's server-side status — drives the button label, never sent by SaveItem on update. */
    Status: eClalItemStatus;
    /** SPEC §8 / §2 — display only. Never sent back; SaveItem stamps these server-side. */
    UpdatedDate: string | null;
    UpdatedBy: string | null;
}

export const emptyDraft = (groupId: number | null): ItemDraft => ({
    ItemID: null,
    GroupID: groupId,
    ItemType: eClalItemType.LINK,
    Title: '',
    Description: '',
    Keywords: [],
    Url: '',
    InfoText: '',
    Hidden: false,
    FileRef: null,
    ExistingFileName: null,
    ExistingFileUrl: null,
    Status: eClalItemStatus.DRAFT,
    UpdatedDate: null,
    UpdatedBy: null
});

export const draftFromItem = (item: ItemDto): ItemDraft => ({
    ItemID: item.ItemID,
    GroupID: item.GroupID,
    ItemType: item.ItemType,
    Title: item.Title ?? '',
    Description: item.Description ?? '',
    Keywords: (item.Keywords ?? []).slice(),
    Url: item.ItemType === eClalItemType.LINK ? item.Url ?? '' : '',
    InfoText: item.InfoText ?? '',
    Hidden: item.Status === eClalItemStatus.HIDDEN,
    FileRef: null,
    ExistingFileName: item.FileName ?? null,
    ExistingFileUrl: item.ItemType === eClalItemType.FILE ? item.Url ?? null : null,
    Status: item.Status,
    UpdatedDate: item.UpdatedDate ?? null,
    UpdatedBy: item.UpdatedBy ?? null
});

/**
 * The same validations the API runs, returning the SAME error keys — so the copy table is the
 * single source of wording whether the message came from here or from the server.
 */
export function draftValidationError(draft: ItemDraft): ClalErrorKey | null {
    if (!draft.Title.trim()) return 'title_required';
    if (draft.ItemType === eClalItemType.LINK) {
        if (!draft.Url.trim()) return 'url_required';
        if (!/^https:\/\//i.test(draft.Url.trim())) return 'url_invalid';
    }
    if (draft.ItemType === eClalItemType.FILE && !draft.FileRef && !draft.ExistingFileName) {
        return 'file_required';
    }
    if (draft.ItemType === eClalItemType.INFO && !draft.InfoText.trim()) return 'infotext_required';
    if (keywordsTooLong(draft.Keywords)) return 'keywords_too_long';
    return null;
}

// ── sessionStorage protection (§C6) ─────────────────────────────────────────────────────────
// A session expiry drops the user on Login.aspx through the interceptors. Without this, half an
// hour of writing an "מידע" item is gone.

const storageKey = (itemId: number | null) => `clalCenter.drawer.${itemId ?? 'new'}`;

export const saveDraftToSession = (draft: ItemDraft) => {
    try { window.sessionStorage.setItem(storageKey(draft.ItemID), JSON.stringify(draft)); } catch (e) { /* quota / private mode */ }
};
export const loadDraftFromSession = (itemId: number | null): ItemDraft | null => {
    try {
        const raw = window.sessionStorage.getItem(storageKey(itemId));
        return raw ? (JSON.parse(raw) as ItemDraft) : null;
    } catch (e) { return null; }
};
export const clearDraftSession = (itemId: number | null) => {
    try { window.sessionStorage.removeItem(storageKey(itemId)); } catch (e) { /* ignore */ }
};

interface Props {
    draft: ItemDraft;
    groups: GroupDto[];
    /** Every keyword already used in the tree — the chip suggestions. */
    keywordPool: string[];
    isRTL: boolean;
    busy: boolean;
    /** True when a session draft was restored on open, so the editor is told. */
    restoredFromSession: boolean;
    onChange: (patch: Partial<ItemDraft>) => void;
    onSave: () => void;
    onPreviewAndPublish: () => void;
    onCancel: () => void;
    onError: (errorKey: string) => void;
    onToast: (message: string) => void;
    onCreateSubGroup: (categoryId: number, title: string) => Promise<number | null>;
}

const ItemDrawer = ({
    draft, groups, keywordPool, isRTL, busy, restoredFromSession,
    onChange, onSave, onPreviewAndPublish, onCancel, onError, onToast, onCreateSubGroup
}: Props) => {
    const { t } = useTranslation();
    const [urlTouched, setUrlTouched] = useState(false);
    const [progress, setProgress] = useState<number | null>(null);
    const fileInput = useRef<HTMLInputElement | null>(null);

    const titleMissing = !draft.Title.trim();
    const urlBad =
        draft.ItemType === eClalItemType.LINK && urlTouched && !!draft.Url.trim() &&
        !/^https:\/\//i.test(draft.Url.trim());

    const handleFile = async (file: File | null) => {
        if (!file) return;
        const ext = (file.name.split('.').pop() || '').toLowerCase();
        if (ALLOWED_EXTENSIONS.indexOf(ext) === -1) { onError('ext_not_allowed'); return; }
        if (file.size > MAX_FILE_MB * 1024 * 1024) { onError('file_too_large'); return; }

        setProgress(0);
        try {
            const result = await uploadClalFile(file, setProgress);
            // Only NOW is the previous file replaced in the draft — never before a 2xx.
            onChange({
                FileRef: {
                    StorageName: result.StorageName,
                    RelativePath: result.RelativePath,
                    OriginalName: result.OriginalName,
                    Mime: result.Mime,
                    SizeBytes: result.SizeBytes
                },
                ExistingFileName: result.OriginalName,
                ExistingFileUrl: result.Url
            });
            onToast(t(`${CC}toast.fileUploaded`));
        } catch (error: any) {
            // Catches the interceptor's TypeError as well (platform bug #9).
            const key = toErrorKey(error);
            onError(key === 'server_error' ? 'server_error' : key);
            onToast(t(`${CC}toast.fileFailed`));
        } finally {
            setProgress(null);
            if (fileInput.current) fileInput.current.value = '';
        }
    };

    const setType = (next: eClalItemType) => {
        if (next === draft.ItemType) return;
        onChange({ ItemType: next });
    };

    // "יימצא לפי" — title words + keywords, deduped through the frozen normaliser but DISPLAYED
    // in the editor's own words. Showing the normalised form would be showing them the machine.
    const findableWords = (() => {
        const raw = (draft.Title.trim() ? draft.Title.trim().split(/\s+/) : []).concat(draft.Keywords);
        const seen: { [k: string]: true } = {};
        const out: string[] = [];
        raw.forEach(w => {
            const key = norm(w);
            if (!key || seen[key]) return;
            seen[key] = true;
            out.push(w);
        });
        return out;
    })();

    const segButton = (value: eClalItemType) => {
        const active = draft.ItemType === value;
        return (
            <button
                key={value}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setType(value)}
                style={{
                    font: 'inherit',
                    border: 0,
                    background: active ? '#FF1744' : '#fff',
                    color: active ? '#fff' : '#44525e',
                    fontWeight: active ? 600 : 400,
                    padding: '7px 18px',
                    cursor: 'pointer',
                    minHeight: 40
                }}
            >
                {t(`${CC}type.${value}`)}
            </button>
        );
    };

    const saveLabel = draft.Status === eClalItemStatus.PUBLISHED
        ? t(`${CC}drawer.save`)
        : t(`${CC}drawer.saveDraft`);

    return (
        <Box style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {restoredFromSession && (
                <Typography
                    role="status"
                    style={{ fontSize: 13, color: '#b7791f', background: '#fff8e1', borderRadius: 6, padding: '7px 12px' }}
                >
                    {t(`${CC}drawer.restoredNotice`)}
                </Typography>
            )}

            <GroupPathPicker
                groups={groups}
                value={draft.GroupID}
                isRTL={isRTL}
                label={t(`${CC}drawer.fieldLocation`)}
                defaultCategoryId={null}
                onChange={groupId => onChange({ GroupID: groupId })}
                onCreateSubGroup={onCreateSubGroup}
            />

            <TextField
                label={t(`${CC}drawer.fieldTitle`)}
                variant="outlined"
                fullWidth
                required
                value={draft.Title}
                error={titleMissing}
                helperText={titleMissing ? t(`${CC}drawer.titleRequiredField`) : ' '}
                onChange={e => onChange({ Title: e.target.value })}
                // Items.Title is nvarchar(255). The cap PREVENTS over-length input; the server
                // keeps a backstop, but a T-SQL parameter assignment truncates SILENTLY (no 8152),
                // so without this the editor's text is cut with no error anywhere.
                inputProps={{ maxLength: 255 }}
            />

            <Box>
                <Typography id="cc-type-label" style={{ fontSize: 13, fontWeight: 600, color: '#44525e', marginBottom: 5 }}>
                    {t(`${CC}drawer.fieldType`)}
                </Typography>
                <Box
                    role="radiogroup"
                    aria-labelledby="cc-type-label"
                    style={{ display: 'flex', border: '1px solid #cfd7df', borderRadius: 6, overflow: 'hidden', width: 'fit-content' }}
                >
                    {segButton(eClalItemType.LINK)}
                    {segButton(eClalItemType.FILE)}
                    {segButton(eClalItemType.INFO)}
                </Box>
            </Box>

            {draft.ItemType === eClalItemType.LINK && (
                <TextField
                    label={t(`${CC}drawer.fieldUrl`)}
                    variant="outlined"
                    fullWidth
                    value={draft.Url}
                    error={urlBad}
                    helperText={urlBad ? t(`${CC}error.url_invalid`) : t(`${CC}drawer.urlHelp`)}
                    onChange={e => onChange({ Url: e.target.value })}
                    onBlur={() => setUrlTouched(true)}
                    // The value is a URL: it must not reorder inside an RTL paragraph
                    // (E3 RTL_NOTES 6). textAlign is branched, not 'start'.
                    // Items.Url is nvarchar(1000) — see the Title note above.
                    inputProps={{ dir: 'ltr', maxLength: 1000, style: { direction: 'ltr', textAlign: isRTL ? 'right' : 'left' } }}
                />
            )}

            {/* SPEC §3: "אפשרות לפתוח ולבדוק את היעד לפני הפרסום". A file already has this
                (openFile, below); a link had no equivalent, which is why a truncated paste could
                reach the portal unchecked. Rendered only for a URL that passed validation, so this
                never offers to open something the server would reject. */}
            {draft.ItemType === eClalItemType.LINK && !urlBad && /^https:\/\//i.test(draft.Url.trim()) && (
                <Box style={{ marginTop: -8 }}>
                    <a
                        href={draft.Url.trim()}
                        target="_blank"
                        rel="noreferrer noopener"
                        style={{ fontSize: 13, color: '#FF1744', fontWeight: 600 }}
                    >
                        {t(`${CC}drawer.openLink`)}
                    </a>
                </Box>
            )}

            {draft.ItemType === eClalItemType.FILE && (
                <Box>
                    <Typography style={{ fontSize: 13, fontWeight: 600, color: '#44525e', marginBottom: 5 }}>
                        {t(`${CC}drawer.fieldFile`)}
                    </Typography>
                    <Box
                        role="button"
                        tabIndex={0}
                        onDragOver={e => e.preventDefault()}
                        onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files?.[0] ?? null); }}
                        onClick={() => fileInput.current?.click()}
                        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInput.current?.click(); } }}
                        style={{
                            border: '2px dashed #a9bdd4', borderRadius: 12, padding: 24, textAlign: 'center',
                            background: '#fafcff', cursor: 'pointer'
                        }}
                    >
                        <Typography>{t(`${CC}drawer.dropzone`)}</Typography>
                        <Typography style={{ fontSize: 12.5, color: '#7a8794', marginTop: 4 }}>
                            {t(`${CC}drawer.dropzoneHint`)}
                        </Typography>
                        <input
                            ref={fileInput}
                            type="file"
                            accept={ALLOWED_EXTENSIONS.map(e => '.' + e).join(',')}
                            style={{ display: 'none' }}
                            onChange={e => handleFile(e.target.files?.[0] ?? null)}
                        />
                    </Box>
                    {progress !== null && (
                        <Box style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
                            <LinearProgress
                                variant="determinate"
                                value={progress}
                                style={{ flex: 1, height: 6, borderRadius: 3 }}
                            />
                            <CircularProgress size={14} thickness={5} />
                        </Box>
                    )}
                    {!!draft.ExistingFileName && (
                        <Box
                            style={{
                                marginTop: 10, background: '#f8fafb', border: '1px solid #e3e8ee',
                                borderRadius: 6, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 10
                            }}
                        >
                            <Typography component="span">📄</Typography>
                            <Typography
                                component="span"
                                style={{ flex: 1, fontSize: 13.5, direction: 'ltr', textAlign: isRTL ? 'right' : 'left' }}
                            >
                                {draft.ExistingFileName}
                            </Typography>
                            {!!draft.ExistingFileUrl && (
                                <a
                                    href={draft.ExistingFileUrl}
                                    target="_blank"
                                    rel="noreferrer noopener"
                                    style={{ fontSize: 13, color: '#FF1744', fontWeight: 600 }}
                                >
                                    {t(`${CC}drawer.openFile`)}
                                </a>
                            )}
                        </Box>
                    )}
                </Box>
            )}

            {/* C15: Description is wired end to end — column, DTO, published.json, and the portal
                renders it under every card — but no input existed, so it could only ever be NULL.
                Items.Description is nvarchar(500). */}
            <TextField
                label={t(`${CC}drawer.fieldDescription`)}
                variant="outlined"
                fullWidth
                multiline
                minRows={2}
                value={draft.Description}
                helperText={t(`${CC}drawer.descriptionHelp`)}
                onChange={e => onChange({ Description: e.target.value })}
                inputProps={{ maxLength: 500 }}
            />

            {/* SPEC §2 "הצגת מועד העדכון האחרון וסטטוס הפריט" — the status is the chip in the header;
                this is the other half. In the drawer rather than a sixth table column: the approved
                mock is five columns and a date column costs width in RTL. */}
            {!!draft.UpdatedDate && (
                <Typography style={{ fontSize: 12.5, color: '#6b7a88' }}>
                    {draft.UpdatedBy
                        ? t(`${CC}drawer.lastUpdatedBy`, {
                            when: moment(draft.UpdatedDate).format(DateFormats.DATE_TIME_24),
                            who: draft.UpdatedBy
                        })
                        : t(`${CC}drawer.lastUpdated`, {
                            when: moment(draft.UpdatedDate).format(DateFormats.DATE_TIME_24)
                        })}
                </Typography>
            )}

            {draft.ItemType === eClalItemType.INFO && (
                <TextField
                    label={t(`${CC}drawer.fieldInfo`)}
                    variant="outlined"
                    fullWidth
                    multiline
                    minRows={4}
                    value={draft.InfoText}
                    onChange={e => onChange({ InfoText: e.target.value })}
                />
            )}

            <Box>
                <Typography style={{ fontSize: 13, fontWeight: 600, color: '#44525e', marginBottom: 5 }}>
                    {t(`${CC}drawer.fieldKeywords`)}
                </Typography>
                <KeywordChips
                    value={draft.Keywords}
                    options={keywordPool}
                    isRTL={isRTL}
                    onChange={keywords => onChange({ Keywords: keywords })}
                    onCapReached={() => onError('keywords_too_long')}
                />
                <Box style={{ background: '#f2f7f4', borderRadius: 6, padding: '8px 12px', fontSize: 12.5, color: '#0B6E4F', marginTop: 8 }}>
                    {findableWords.length ? (
                        <>
                            <Typography component="span" style={{ fontSize: 12.5, color: '#0B6E4F' }}>
                                {t(`${CC}drawer.findablePrefix`) + ' '}
                            </Typography>
                            <Typography component="span" style={{ fontSize: 12.5, fontWeight: 700, color: '#0B6E4F' }}>
                                {findableWords.slice(0, MAX_KEYWORDS + 6).join(' · ')}
                            </Typography>
                            <Typography style={{ fontSize: 12.5, color: '#5b6b7b' }}>
                                {t(`${CC}drawer.findableHint`)}
                            </Typography>
                        </>
                    ) : (
                        <Typography component="span" style={{ fontSize: 12.5, color: '#0B6E4F' }}>
                            {t(`${CC}drawer.findableEmpty`)}
                        </Typography>
                    )}
                </Box>
            </Box>

            <Box style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Switch
                    color="primary"
                    checked={draft.Hidden}
                    onChange={e => onChange({ Hidden: e.target.checked })}
                    inputProps={{ 'aria-label': t(`${CC}drawer.fieldHidden`) } as any}
                />
                <Typography style={{ fontSize: 14 }}>{t(`${CC}drawer.fieldHidden`)}</Typography>
            </Box>

            <Box
                style={{
                    position: 'sticky', bottom: 0, background: '#f5f6fa', paddingTop: 12,
                    borderTop: '1px solid #e3e8ee', display: 'flex', gap: 10, flexWrap: 'wrap'
                }}
            >
                <Button
                    variant="contained"
                    color="primary"
                    // No sub-group ⇒ nowhere to save to. The picker's inline "＋ יצירת תת-קבוצה
                    // חדשה…" is the way out, which is exactly why it exists (§5).
                    disabled={busy || titleMissing || !draft.GroupID}
                    onClick={onPreviewAndPublish}
                    style={{ fontWeight: 700 }}
                >
                    {/* Hidden ⇒ this is a SAVE, not a publish, and the label says exactly that. */}
                    {draft.Hidden ? t(`${CC}drawer.saveHidden`) : t(`${CC}drawer.previewAndPublish`)}
                </Button>
                <Button
                    variant="outlined"
                    disabled={busy || !draft.GroupID}
                    onClick={onSave}
                    style={{ fontWeight: 700 }}
                >
                    {saveLabel}
                </Button>
                <Button disabled={busy} onClick={onCancel} style={{ color: '#5b6b7b' }}>
                    {t(`${CC}cancel`)}
                </Button>
                {busy && <CircularProgress size={20} style={{ alignSelf: 'center' }} />}
            </Box>
        </Box>
    );
};

export default ItemDrawer;
