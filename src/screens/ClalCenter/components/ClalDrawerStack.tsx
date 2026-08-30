// ═══════════════════════════════════════════════════════════════════════════════════════════
// ClalDrawerStack — the drawer CHROME for CLAL CENTER: scrim, panel, breadcrumb, back button,
// Esc/scrim semantics.
//
// ⚠️ THIS IS A DELIBERATE COPY OF `screens/SendSearch/components/DrawerStack.tsx:85-186`, NOT AN
// IMPORT (C6 v12 §3, 14-W3 "תוצרים"). Two reasons, both hard:
//   1. `DrawerEntry.Level` there is a CLOSED union — 'rollup' | 'agent' | 'message'. Our levels
//      are item / preview / history, so an import is a TS2322 at every call site.
//   2. Its labels are bound to the `SendSearch.` i18n namespace (`t(`${SS}action.close`)`).
//      Reusing it would mean editing files outside W3's ownership to add ClalCenter strings.
// Everything the original file explains about WHY the chrome behaves the way it does still
// applies and is reproduced below, because those comments are the reason the behaviour survives:
//
//  · `Esc` pops exactly ONE level. MUI v4's Modal already intercepts Escape and reports it as
//    `onClose(event, 'escapeKeyDown')`, so the reason is branched on: escape → onPop, backdrop →
//    onClose. NO extra `document.addEventListener('keydown')` is added — a manual listener
//    alongside the Modal's own pops TWO levels per keypress.
//  · Scrim click closes ALL levels.
//  · Body scroll locks while open — MUI's Modal does it AND restores the previous value on
//    unmount, so it is deliberately not re-implemented here.
//  · `PaperProps.dir` is REQUIRED and is not inherited: MUI v4 portals the Drawer into
//    document.body, outside App.js's `<div dir={...}>`, and `<html dir>` is written once at mount
//    while i18n is still on its 'en' default.
//  · The scoped scrollbar rules exist because `screens/Whatsapp/Chat/css/overrides.css:31-42`
//    declares an UNSCOPED `::-webkit-scrollbar { width:6px !important }` that reaches every
//    screen in the product (App.js imports WhatsappChat statically). Under the `body{zoom:0.95}`
//    of `src/index.css:11-15` that is ~5 device px sitting at the window edge in RTL, which reads
//    as browser chrome rather than "there is more content below". The leak itself is left alone
//    on purpose (owner decision) — un-scoping it would restyle the whole product.
// ═══════════════════════════════════════════════════════════════════════════════════════════

import React from 'react';
import { Box, Button, Drawer, IconButton, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Close } from '@material-ui/icons';
import { useTranslation } from 'react-i18next';
import { CC } from '../../../Models/ClalCenter/ClalCenter';

/** OUR levels. Closed on purpose — the stack is never deeper than three. */
export type ClalDrawerLevel = 'item' | 'preview' | 'history';

export interface ClalDrawerEntry {
    Level: ClalDrawerLevel;
    /** Stable key for the React list — the level plus whatever entity it is showing. */
    RowKey: string;
    Crumb: string;
    Title: string;
    Subtitle?: string;
}

const useStyles = makeStyles({
    paper: {
        '&::-webkit-scrollbar': { width: '10px !important' },
        '&::-webkit-scrollbar-track': { background: '#e9edf2' },
        '&::-webkit-scrollbar-thumb': {
            background: '#98a5b3', borderRadius: 8, border: '2px solid #e9edf2'
        },
        '&::-webkit-scrollbar-thumb:hover': { background: '#7d8b9b' }
    }
});

interface Props {
    stack: ClalDrawerEntry[];
    isRTL: boolean;
    /** Esc and the back button. The ITEM drawer passes a draft-aware handler here. */
    onPop: () => void;
    /** Scrim click and the ✕ — closes the whole stack. */
    onClose: () => void;
    children: React.ReactNode;
}

const ClalDrawerStack = ({ stack, isRTL, onPop, onClose, children }: Props) => {
    const { t } = useTranslation();
    const styles = useStyles();

    const open = stack.length > 0;
    const top: ClalDrawerEntry | null = open ? stack[stack.length - 1] : null;
    const parent: ClalDrawerEntry | null = stack.length > 1 ? stack[stack.length - 2] : null;

    return (
        <Drawer
            // The panel is pinned to the inline-start edge — the RIGHT edge in Hebrew. MUI's anchor
            // is physical, so it has to be flipped by direction.
            anchor={isRTL ? 'right' : 'left'}
            open={open}
            onClose={(_event: any, reason: string) => {
                if (reason === 'escapeKeyDown') onPop();
                else onClose();
            }}
            PaperProps={{
                dir: isRTL ? 'rtl' : 'ltr',
                // MERGED, not overriding: Drawer.js:190 composes
                // clsx(classes.paper, classes.paperAnchorX, PaperProps.className), so the paper
                // keeps MUI's own height:100% / overflowY:auto / position:fixed.
                className: styles.paper,
                style: { width: 'min(780px, 100%)', background: '#f5f6fa' }
            }}
            ModalProps={{ keepMounted: false }}
        >
            {top && (
                <>
                    {/* sticky header: breadcrumb + title + close */}
                    <Box
                        style={{
                            background: '#fff', borderBottom: '1px solid #e0e0e0', padding: '14px 22px',
                            position: 'sticky', top: 0, zIndex: 3
                        }}
                    >
                        <Typography component="div" style={{ fontSize: 12.5, color: '#5b6b7b', marginBottom: 4 }}>
                            {/* The breadcrumb is the only thing that says how deep you are and what
                                popping returns to — the last crumb is the current level, bold. */}
                            {stack.map((s, i) => (
                                <Typography
                                    key={`${s.Level}-${s.RowKey}-${i}`}
                                    component="span"
                                    style={{
                                        fontSize: 12.5,
                                        color: i === stack.length - 1 ? '#151b21' : '#5b6b7b',
                                        fontWeight: i === stack.length - 1 ? 700 : 400
                                    }}
                                >
                                    {i > 0 ? ' › ' : ''}{s.Crumb}
                                </Typography>
                            ))}
                        </Typography>
                        <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                            <Box>
                                <Typography component="h2" style={{ margin: 0, fontSize: 18.5, fontWeight: 800 }}>
                                    {top.Title}
                                </Typography>
                                {top.Subtitle && (
                                    <Typography
                                        component="div"
                                        /* Branched, not 'start': the element's own `direction: ltr`
                                           (needed so URLs and file names do not reorder) would make
                                           'start' resolve to LEFT even in Hebrew. */
                                        style={{ fontSize: 13, color: '#5b6b7b', marginTop: 2, direction: 'ltr', textAlign: isRTL ? 'right' : 'left' }}
                                    >
                                        {top.Subtitle}
                                    </Typography>
                                )}
                            </Box>
                            <IconButton size="small" onClick={onClose} aria-label={t(`${CC}close`)}>
                                <Close fontSize="small" />
                            </IconButton>
                        </Box>
                    </Box>

                    <Box style={{ padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: 17 }}>
                        {/* The back button NAMES the level it returns to — a bare "חזרה" in a
                            three-level stack does not say where you will land. */}
                        {parent && (
                            <Box>
                                <Button size="small" variant="outlined" onClick={onPop}>
                                    {t(`${CC}drawer.back`, { name: parent.Crumb })}
                                </Button>
                            </Box>
                        )}
                        {children}
                    </Box>
                </>
            )}
        </Drawer>
    );
};

export default ClalDrawerStack;
