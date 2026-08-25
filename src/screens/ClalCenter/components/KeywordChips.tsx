// ═══════════════════════════════════════════════════════════════════════════════════════════
// KeywordChips + NameSuggestField — one file, one behaviour, two shapes.
//
// The contract asks for the SAME affordance in two places (14-W3 "תוצרים" + §6): search-keyword
// chips on an item, and the sub-group NAME field, which suggests names already used elsewhere in
// the tree with a usage count. They share the option mechanics and the freeSolo semantics; they
// differ only in `multiple`. Splitting them into two files would have duplicated the suggestion
// logic — which is precisely the vocabulary-drift the section exists to prevent.
//
// MUI v5 Autocomplete on an otherwise-v4 screen: that is the house precedent
// (`SeoSettings.tsx:34-72` imports `Autocomplete` from '@mui/material' beside v4 TextFields) and
// it is the ONLY v5 component allowed here.
//
// ⚠️ WHAT IS *NOT* COPIED FROM `SeoSettings`: its state model. It keeps a comma-joined CSV
// string, double-adds on `onBlur` + `onChange`, and never dedupes (E3 flagged this). Our state is
// `string[]`, exactly as the DTO carries it, and the dedupe is by `norm()` — so "קופ״ג" and
// "קופג" are one keyword, because the search engine cannot tell them apart anyway.
//
// RTL: the popup is portalled, so its Paper carries its own `dir` (E3 RTL_NOTES 2/3).
// ═══════════════════════════════════════════════════════════════════════════════════════════

import React, { useMemo, useState } from 'react';
import { Box, Chip, TextField, Typography } from '@material-ui/core';
import { Autocomplete } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { CC } from '../../../Models/ClalCenter/ClalCenter';
import { norm } from '../searchNormalizer';

/** §C2: >15 keywords or >400 characters ⇒ the server answers `keywords_too_long`, no silent trim. */
export const MAX_KEYWORDS = 15;
export const MAX_KEYWORDS_CHARS = 400;

/** Non-virtualised Autocomplete — the list has to stay short enough to render (§C6). */
const MAX_SUGGESTIONS = 50;

const SPLIT_PASTE = /[,;\n\t]+/;

export const keywordsTooLong = (keywords: string[]): boolean =>
    keywords.length > MAX_KEYWORDS || keywords.join(',').length > MAX_KEYWORDS_CHARS;

/** trim → drop empties → dedupe by the FROZEN normaliser (not by lowercase). */
export function normalizeKeywordList(raw: string[]): string[] {
    const seen: { [k: string]: true } = {};
    const out: string[] = [];
    raw.forEach(value => {
        const trimmed = String(value).trim();
        if (!trimmed) return;
        const key = norm(trimmed);
        if (!key || seen[key]) return;
        seen[key] = true;
        out.push(trimmed);
    });
    return out;
}

interface KeywordChipsProps {
    value: string[];
    options: string[];
    isRTL: boolean;
    onChange: (next: string[]) => void;
    /** Raised when the cap is reached, so the screen can toast `keywords_too_long`. */
    onCapReached?: () => void;
}

export const KeywordChips = ({ value, options, isRTL, onChange, onCapReached }: KeywordChipsProps) => {
    const { t } = useTranslation();
    const [draft, setDraft] = useState('');

    const suggestions = useMemo(() => {
        const taken: { [k: string]: true } = {};
        value.forEach(v => { taken[norm(v)] = true; });
        return normalizeKeywordList(options).filter(o => !taken[norm(o)]).slice(0, MAX_SUGGESTIONS);
    }, [options, value]);

    const commit = (incoming: string[]) => {
        const merged = normalizeKeywordList(value.concat(incoming));
        if (merged.length > MAX_KEYWORDS) {
            onCapReached?.();
            onChange(merged.slice(0, MAX_KEYWORDS));
            return;
        }
        onChange(merged);
    };

    return (
        <Box>
            <Autocomplete
                multiple
                freeSolo
                disableClearable
                options={suggestions}
                value={value}
                inputValue={draft}
                onInputChange={(_e, next, reason) => { if (reason !== 'reset') setDraft(next); }}
                componentsProps={{ paper: { dir: isRTL ? 'rtl' : 'ltr' } }}
                onChange={(_e, next: any) => {
                    // `next` already contains the full list including whatever was just typed or
                    // picked; normalizeKeywordList is what actually enforces trim + dedupe.
                    const merged = normalizeKeywordList(next as string[]);
                    if (merged.length > MAX_KEYWORDS) {
                        onCapReached?.();
                        onChange(merged.slice(0, MAX_KEYWORDS));
                    } else {
                        onChange(merged);
                    }
                    setDraft('');
                }}
                renderTags={(tags: string[], getTagProps: any) =>
                    tags.map((option, index) => (
                        <Chip
                            {...getTagProps({ index })}
                            key={option}
                            label={option}
                            size="small"
                            style={{ background: '#f0f4f8', border: '1px solid #dbe3ea', color: '#44525e' }}
                        />
                    ))
                }
                renderInput={(params: any) => (
                    <TextField
                        {...params}
                        id="cc-keywords"
                        variant="outlined"
                        placeholder={value.length ? '' : t(`${CC}drawer.keywordsPlaceholder`)}
                        onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {
                            // A comma is a commit key, exactly like Enter. Autocomplete handles
                            // Enter itself; the comma has to be intercepted before it reaches the
                            // input, or it lands inside the keyword.
                            if (e.key === ',') {
                                e.preventDefault();
                                if (draft.trim()) { commit([draft]); setDraft(''); }
                            }
                        }}
                        onPaste={(e: React.ClipboardEvent<HTMLDivElement>) => {
                            const text = e.clipboardData?.getData('text') ?? '';
                            if (!SPLIT_PASTE.test(text)) return; // a single word pastes normally
                            e.preventDefault();
                            commit(text.split(SPLIT_PASTE));
                            setDraft('');
                        }}
                    />
                )}
            />
            <Typography style={{ fontSize: 12.5, color: '#7a8794', marginTop: 5 }}>
                {t(`${CC}drawer.keywordsCount`, { n: value.length, max: MAX_KEYWORDS })}
                {' · '}
                {t(`${CC}drawer.keywordsHint`)}
            </Typography>
        </Box>
    );
};

interface NameSuggestFieldProps {
    value: string;
    /** [name, howManyCategoriesUseIt] — the count is the whole point (§6.1). */
    options: Array<{ name: string; usage: number }>;
    label?: string;
    placeholder?: string;
    autoFocus?: boolean;
    isRTL: boolean;
    onChange: (next: string) => void;
    onEnter?: () => void;
}

/**
 * The sub-group name field. freeSolo: picking a suggestion ADOPTS an existing name, typing
 * anything else creates a new one — with zero complaint, zero blocking and zero warnings. The
 * tools here are advisory only (§6 opening line).
 */
export const NameSuggestField = ({
    value, options, label, placeholder, autoFocus, isRTL, onChange, onEnter
}: NameSuggestFieldProps) => {
    const { t } = useTranslation();
    const names = useMemo(() => options.slice(0, MAX_SUGGESTIONS), [options]);

    return (
        <Autocomplete
            freeSolo
            options={names}
            getOptionLabel={(option: any) => (typeof option === 'string' ? option : option.name)}
            filterOptions={(opts: any[], state: any) => {
                const q = norm(state.inputValue);
                if (!q) return opts;
                return opts.filter(o => norm(o.name).indexOf(q) > -1);
            }}
            componentsProps={{ paper: { dir: isRTL ? 'rtl' : 'ltr' } }}
            inputValue={value}
            onInputChange={(_e, next) => onChange(next)}
            onChange={(_e, next: any) => onChange(typeof next === 'string' ? next : next?.name ?? '')}
            renderOption={(props: any, option: any) => (
                <li {...props} key={option.name}>
                    <Box style={{ display: 'flex', gap: 8, alignItems: 'baseline', width: '100%' }}>
                        <Typography component="span" style={{ fontWeight: 600 }}>{option.name}</Typography>
                        <Typography component="span" style={{ fontSize: 12.5, color: '#7a8794' }}>
                            {option.usage === 1
                                ? t(`${CC}picker.suggestionUsageOne`)
                                : t(`${CC}picker.suggestionUsageMany`, { n: option.usage })}
                        </Typography>
                    </Box>
                </li>
            )}
            renderInput={(params: any) => (
                <TextField
                    {...params}
                    label={label}
                    placeholder={placeholder}
                    variant="outlined"
                    autoFocus={autoFocus}
                    onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {
                        if (e.key === 'Enter' && onEnter) { e.preventDefault(); onEnter(); }
                    }}
                />
            )}
        />
    );
};

export default KeywordChips;
