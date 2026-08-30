// ═══════════════════════════════════════════════════════════════════════════════════════════
// GroupPathPicker — ONE Autocomplete over FLAT PATHS ("קטגוריה › תת-קבוצה"). 14-W3 §5.
//
// ⚠️ THE MOCK IS DEAD HERE — DO NOT COPY IT. `clal-center-demo.html:621,628` drives two dependent
// `<select>`s from a hard-coded `SUBKINDS` array of four names. That array does not exist any
// more: in v12 the tree is fully editable content and a category may hold any sub-groups the
// editor invents (§C7). Two dependent selects over a free tree also cost two interactions to
// express one fact.
//
// One flat Autocomplete instead: typing filters BOTH halves of the path, and an item always lands
// in a sub-group — never directly under a category (14-W3 §1).
//
// THE INLINE "＋ יצירת תת-קבוצה חדשה…" OPTION IS NOT A NICETY. Without it, a category that has no
// sub-groups yet is a DEAD END: the editor opens the drawer to file an item, finds nothing to
// file it into, and has no way out of the drawer that creates one.
//
// Hidden groups DO appear, marked "(מוסתרת)" — saving into hidden content is a legitimate,
// deliberate act (§5), so it is shown rather than silently filtered away.
//
// The same picker is reused by the delete dialog's "העברת הפריטים ל…" (case ג) — one component,
// one behaviour.
// ═══════════════════════════════════════════════════════════════════════════════════════════

import React, { useMemo, useState } from 'react';
import {
    Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, TextField, Typography
} from '@material-ui/core';
import { Autocomplete } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { CC, GroupDto } from '../../../Models/ClalCenter/ClalCenter';
import { norm } from '../searchNormalizer';
import { NameSuggestField } from './KeywordChips';

const CREATE_OPTION_ID = -1;

export interface PathOption {
    id: number;
    label: string;
    categoryId: number;
    categoryTitle: string;
    subTitle: string;
    hidden: boolean;
}

/** Flatten the tree into "category › sub-group" rows, in display order. */
export function buildPathOptions(groups: GroupDto[]): PathOption[] {
    const categories = groups
        .filter(g => !g.ParentGroupID)
        .slice()
        .sort((a, b) => a.SortOrder - b.SortOrder);
    const out: PathOption[] = [];
    categories.forEach(cat => {
        groups
            .filter(g => g.ParentGroupID === cat.GroupID)
            .slice()
            .sort((a, b) => a.SortOrder - b.SortOrder)
            .forEach(sub => {
                out.push({
                    id: sub.GroupID,
                    label: `${cat.Title} › ${sub.Title}`,
                    categoryId: cat.GroupID,
                    categoryTitle: cat.Title,
                    subTitle: sub.Title,
                    // A sub-group under a hidden category is effectively hidden too — the publish
                    // step skips the whole hidden subtree (§C2 step 2).
                    hidden: !!sub.IsHidden || !!cat.IsHidden
                });
            });
    });
    return out;
}

/** Every sub-group NAME in the tree with how many categories use it (§6.1). */
export function buildNameUsage(groups: GroupDto[]): Array<{ name: string; usage: number }> {
    const counts: { [key: string]: { name: string; usage: number } } = {};
    groups
        .filter(g => !!g.ParentGroupID)
        .forEach(g => {
            const key = norm(g.Title);
            if (!key) return;
            if (!counts[key]) counts[key] = { name: g.Title, usage: 0 };
            counts[key].usage += 1;
        });
    return Object.keys(counts)
        .map(k => counts[k])
        .sort((a, b) => b.usage - a.usage || a.name.localeCompare(b.name));
}

interface Props {
    groups: GroupDto[];
    value: number | null;
    isRTL: boolean;
    label?: string;
    disabled?: boolean;
    /** Pre-selected category for the "create" panel — the one the editor was working in. */
    defaultCategoryId?: number | null;
    onChange: (groupId: number) => void;
    /** Returns the new GroupID, or null if the create failed (the caller toasts). */
    onCreateSubGroup: (categoryId: number, title: string) => Promise<number | null>;
}

const GroupPathPicker = ({
    groups, value, isRTL, label, disabled, defaultCategoryId, onChange, onCreateSubGroup
}: Props) => {
    const { t } = useTranslation();
    const options = useMemo(() => buildPathOptions(groups), [groups]);
    const nameUsage = useMemo(() => buildNameUsage(groups), [groups]);
    const categories = useMemo(
        () => groups.filter(g => !g.ParentGroupID).slice().sort((a, b) => a.SortOrder - b.SortOrder),
        [groups]
    );

    const [createOpen, setCreateOpen] = useState(false);
    const [createCategoryId, setCreateCategoryId] = useState<number | ''>('');
    const [createName, setCreateName] = useState('');
    const [creating, setCreating] = useState(false);

    const selected = options.find(o => o.id === value) ?? null;

    const openCreate = () => {
        const preset = defaultCategoryId ?? selected?.categoryId ?? categories[0]?.GroupID ?? '';
        setCreateCategoryId(preset === undefined ? '' : preset);
        setCreateName('');
        setCreateOpen(true);
    };

    const submitCreate = async () => {
        if (!createCategoryId || !createName.trim() || creating) return;
        setCreating(true);
        const newId = await onCreateSubGroup(Number(createCategoryId), createName.trim());
        setCreating(false);
        if (newId) {
            setCreateOpen(false);
            onChange(newId); // the freshly created sub-group is selected automatically
        }
    };

    // The create row is modelled as an OPTION rather than a button beside the field, so it is
    // reachable by keyboard in the same pass as the real options.
    const createOption: PathOption = {
        id: CREATE_OPTION_ID,
        label: t(`${CC}picker.createOption`),
        categoryId: 0,
        categoryTitle: '',
        subTitle: '',
        hidden: false
    };

    return (
        <Box>
            <Autocomplete
                options={options.concat(createOption) as PathOption[]}
                value={selected}
                disabled={disabled}
                openOnFocus
                getOptionLabel={(option: any) => option?.label ?? ''}
                isOptionEqualToValue={(option: any, val: any) => option?.id === val?.id}
                componentsProps={{ paper: { dir: isRTL ? 'rtl' : 'ltr' } }}
                noOptionsText={t(`${CC}picker.noOptions`)}
                filterOptions={(opts: any[], state: any) => {
                    const q = norm(state.inputValue);
                    if (!q) return opts;
                    // Filters on BOTH halves of the path — "מסמכים" and "פנסיה" both find
                    // "פנסיה › מסמכים".
                    return opts.filter(
                        o => o.id === CREATE_OPTION_ID || norm(o.label).indexOf(q) > -1
                    );
                }}
                onChange={(_e, next: any) => {
                    if (!next) return;
                    if (next.id === CREATE_OPTION_ID) { openCreate(); return; }
                    onChange(next.id);
                }}
                renderOption={(props: any, option: any) => (
                    <li {...props} key={option.id}>
                        {option.id === CREATE_OPTION_ID ? (
                            <Typography component="span" style={{ color: '#FF1744', fontWeight: 700 }}>
                                {option.label}
                            </Typography>
                        ) : (
                            <Box style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
                                <Typography component="span">{option.label}</Typography>
                                {option.hidden && (
                                    <Typography component="span" style={{ fontSize: 12.5, color: '#7a8794' }}>
                                        {t(`${CC}picker.hiddenSuffix`)}
                                    </Typography>
                                )}
                            </Box>
                        )}
                    </li>
                )}
                renderInput={(params: any) => (
                    <TextField
                        {...params}
                        label={label ?? t(`${CC}picker.label`)}
                        placeholder={t(`${CC}picker.placeholder`)}
                        variant="outlined"
                    />
                )}
            />

            <Dialog
                open={createOpen}
                onClose={creating ? undefined : () => setCreateOpen(false)}
                maxWidth="xs"
                fullWidth
                dir={isRTL ? 'rtl' : 'ltr'}
                aria-labelledby="cc-create-subgroup-title"
            >
                <DialogTitle id="cc-create-subgroup-title" disableTypography>
                    <Typography component="h2" style={{ fontSize: 18, fontWeight: 800 }}>
                        {t(`${CC}picker.createTitle`)}
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    <TextField
                        select
                        fullWidth
                        variant="outlined"
                        margin="dense"
                        label={t(`${CC}picker.createCategory`)}
                        value={createCategoryId}
                        onChange={e => setCreateCategoryId(Number(e.target.value))}
                        SelectProps={{ MenuProps: { PaperProps: { dir: isRTL ? 'rtl' : 'ltr' } } }}
                    >
                        {categories.map(c => (
                            <MenuItem key={c.GroupID} value={c.GroupID}>{c.Title}</MenuItem>
                        ))}
                    </TextField>
                    <Box style={{ marginTop: 12 }}>
                        {/* Suggests names already used elsewhere, with a usage count — the tree's
                            only defence against "מסמכים" and "מסמכים " (§6.1). Advisory only. */}
                        <NameSuggestField
                            value={createName}
                            options={nameUsage}
                            isRTL={isRTL}
                            autoFocus
                            label={t(`${CC}picker.createName`)}
                            onChange={setCreateName}
                            onEnter={submitCreate}
                        />
                    </Box>
                </DialogContent>
                <DialogActions style={{ padding: '12px 20px 18px', gap: 8 }}>
                    <Button onClick={() => setCreateOpen(false)} disabled={creating} style={{ color: '#5b6b7b' }}>
                        {t(`${CC}cancel`)}
                    </Button>
                    <Button
                        onClick={submitCreate}
                        disabled={creating || !createName.trim() || !createCategoryId}
                        variant="contained"
                        color="primary"
                        style={{ fontWeight: 700 }}
                    >
                        {t(`${CC}picker.create`)}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default GroupPathPicker;
