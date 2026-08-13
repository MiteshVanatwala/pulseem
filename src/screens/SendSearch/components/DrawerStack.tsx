// ═══════════════════════════════════════════════════════════════════════════════════════════
// DrawerStack — the drawer CHROME: scrim, panel, breadcrumb, back button, Esc/scrim semantics
// (CONTRACT §4.2, `SendSearch-Mock-v3.html:110-124`, :341-356).
//
// DELIVERY PATH: _delivery\SendSearch-V1\react\screens\SendSearch\components\DrawerStack.tsx
// TARGET PATH:   ReactCode\src\screens\SendSearch\components\DrawerStack.tsx
//
// The three behaviours the mock specifies, and how each is guaranteed here:
//
//  1. `Esc` pops exactly ONE level (`:353,356` — `popD` pops, and only closes when one level is
//     left). MUI v4's Modal already intercepts Escape and reports it as
//     `onClose(event, 'escapeKeyDown')`, so the reason is branched on: escape → onPop,
//     backdrop → onClose. NO extra `document.addEventListener('keydown')` is added — a manual
//     listener alongside the Modal's own would pop TWO levels per keypress, which is exactly the
//     bug this comment exists to prevent someone from re-introducing.
//  2. Scrim click closes ALL levels (`:216,354` — `closeD` empties the stack).
//  3. Body scroll locks while open (`:352` `document.body.style.overflow='hidden'`). MUI's Modal
//     does this itself (`disableScrollLock` defaults to false), and it also RESTORES the previous
//     value on unmount — which the mock's raw assignment does not. So the lock is deliberately NOT
//     re-implemented; touching body.overflow by hand here would fight the Modal's own restore.
//
// Depth is capped at 3 by the slice (MAX_DRAWER_DEPTH), not here — the cap belongs to the state.
// ═══════════════════════════════════════════════════════════════════════════════════════════

import React from 'react';
import { Box, Button, Drawer, IconButton, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Close } from '@material-ui/icons';
import { useTranslation } from 'react-i18next';
import { SS, DrawerEntry } from '../../../Models/DataSources/SendSearch';

// ── THE SCROLL AFFORDANCE, and why it is a stylesheet and not a layout change ────────────────────
// Reported as "the drawer is cut off at the bottom, it must stay at 100% and have a scroll". It is
// already at 100% and it already scrolls — MUI gives the paper `height:100%` and `overflowY:'auto'`
// (Drawer.js:52,:55) and nothing in this repo overrides either, so the panel is exactly the viewport
// height. Measured in Chrome on a faithful copy of the generated CSS: 842px of content in an 800px
// paper, scrollable, and `height:100%` stays exact even under the `body{zoom:0.95}` of
// `src/index.css:11-15`. What was missing is the only thing that TELLS the operator so.
//
// `src/screens/Whatsapp/Chat/css/overrides.css:31-42` declares an UNSCOPED
// `::-webkit-scrollbar { width:6px !important }` with a 20%-black thumb on a ~transparent track, and
// it reaches every screen in the product: `App.js:71` imports WhatsappChat STATICALLY (there is no
// React.lazy anywhere in this app), `WhatsappChat.tsx:3` imports `./css/index.css`, and
// `css/index.css:1` `@import`s that file. Measured: a 16px scrollbar becomes 5 device px under the
// 0.95 zoom. And because this paper is `dir="rtl"`, those 5px sit at x=0 — the browser window's own
// edge — running the full viewport height alongside the white header, so they read as browser chrome
// rather than as "there is more content below". That is the entire defect.
//
// Re-declared below SCOPED TO THIS PAPER. `!important` on the width because the leaking rule carries
// it too and a class selector is what wins the tie. The leak itself is deliberately left alone
// (owner decision, 2026-08-13): un-scoping it would restyle every scrollbar in the product, which is
// a product-wide visual change and not this screen's to make.
//
// 🔴 DO NOT "fix" this by moving the scroll onto the content Box below. `Modal.js:266-268` puts
// `tabIndex="-1"` on the Modal's child and `Slide.js:235-241` clones it onto this paper, so TrapFocus
// focuses THE PAPER on open: the scroller and the focused element are the same node, which is what
// makes PageDown / Space / arrows scroll the drawer today. An inner scroller carries no tabindex, and
// the depth-1 agent drawer has no focusable descendant at all — its preview button ships `disabled`
// while ClientID is 0 (AgentDrawer.tsx:33-38) and the back button exists only at depth ≥ 2 — so the
// panel would become keyboard-unscrollable (WCAG 2.1.1). `overflow:'hidden'` on the paper is out for
// a related reason: per CSS Overflow 3 an `overflow-y:auto` box already computes overflow-x to
// `auto`, so hiding it would clip the LTR subtitle at :151-157 from its start edge in RTL — hiding
// recorded text, which is the one failure mode this screen forbids.
const useStyles = makeStyles({
    paper: {
        '&::-webkit-scrollbar': { width: '10px !important' },
        '&::-webkit-scrollbar-track': { background: '#e9edf2' },
        // The 2px border is what makes a 10px bar read as a rounded thumb with breathing room
        // instead of a solid stripe; it is drawn in the track colour on purpose.
        '&::-webkit-scrollbar-thumb': {
            background: '#98a5b3', borderRadius: 8, border: '2px solid #e9edf2',
        },
        '&::-webkit-scrollbar-thumb:hover': { background: '#7d8b9b' },
    },
});

interface Props {
    stack: DrawerEntry[];
    isRTL: boolean;
    onPop: () => void;
    onClose: () => void;
    children: React.ReactNode;   // the body of the TOP level, chosen by the screen
}

const DrawerStack: React.FC<Props> = ({ stack, isRTL, onPop, onClose, children }) => {
    const { t } = useTranslation();
    const styles = useStyles();

    const open = stack.length > 0;
    const top: DrawerEntry | null = open ? stack[stack.length - 1] : null;
    const parent: DrawerEntry | null = stack.length > 1 ? stack[stack.length - 2] : null;

    return (
        <Drawer
            // The mock pins the panel to `inset-inline-start` (`:112`), i.e. the RIGHT edge in Hebrew.
            // MUI's anchor is physical, so it must be flipped by direction — an anchor hardcoded to
            // 'left' would slide the panel in from the wrong side of an RTL page.
            anchor={isRTL ? 'right' : 'left'}
            open={open}
            onClose={(_event: any, reason: string) => {
                if (reason === 'escapeKeyDown') onPop();
                else onClose();
            }}
            // dir is required and is NOT inherited: MUI v4 portals the Drawer into document.body,
            // outside the <div dir={...}> at App.js:1018, and <html dir> stays "ltr" (App.js:727-730
            // writes it once at mount from i18n.language, still the 'en' default at that moment).
            // Every dialog in the DataSources folder carries the same prop — SmartSendManageTab.tsx:305.
            PaperProps={{
                dir: isRTL ? 'rtl' : 'ltr',
                // MERGED, not overriding: Drawer.js:190 composes
                // clsx(classes.paper, classes.paperAnchorX, PaperProps.className), so the paper keeps
                // MUI's own height:100% / overflowY:auto / position:fixed and only gains the
                // scrollbar rules. Passing this as `classes={{ paper }}` would work identically; it
                // lives here so the three things this file says about the paper stay in one place.
                className: styles.paper,
                style: { width: 'min(780px, 100%)', background: '#f5f6fa' },
            }}
            ModalProps={{ keepMounted: false }}
        >
            {top && (
                <>
                    {/* sticky header: breadcrumb + title + close (`:118-224`) */}
                    <Box
                        style={{
                            background: '#fff', borderBottom: '1px solid #e0e0e0', padding: '14px 22px',
                            position: 'sticky', top: 0, zIndex: 3,
                        }}
                    >
                        <Typography component="div" style={{ fontSize: 12.5, color: '#5b6b7b', marginBottom: 4 }}>
                            {/* The breadcrumb is the ONLY thing that tells the user how deep they are and
                                what popping returns to — the last crumb is the current level, bold. */}
                            {stack.map((s, i) => (
                                <Typography
                                    key={`${s.Level}-${s.RowKey}-${i}`}
                                    component="span"
                                    style={{
                                        fontSize: 12.5,
                                        color: i === stack.length - 1 ? '#151b21' : '#5b6b7b',
                                        fontWeight: i === stack.length - 1 ? 700 : 400,
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
                                           (needed so the subtitle's IDs/emails do not reorder) would
                                           make 'start' resolve to LEFT even in Hebrew. */
                                        style={{ fontSize: 13, color: '#5b6b7b', marginTop: 2, direction: 'ltr', textAlign: isRTL ? 'right' : 'left' }}
                                    >
                                        {top.Subtitle}
                                    </Typography>
                                )}
                            </Box>
                            <IconButton size="small" onClick={onClose} aria-label={t(`${SS}action.close`)}>
                                <Close fontSize="small" />
                            </IconButton>
                        </Box>
                    </Box>

                    <Box style={{ padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: 17 }}>
                        {/* The back button NAMES the level it returns to (`:381-384` — "the back label
                            must name the roll-up you actually came from"). A bare "חזרה" in a 3-level
                            stack does not tell the user where they will land. */}
                        {parent && (
                            <Box>
                                <Button size="small" variant="outlined" onClick={onPop}>
                                    {t(`${SS}action.back`, { name: parent.Crumb })}
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

export default DrawerStack;
