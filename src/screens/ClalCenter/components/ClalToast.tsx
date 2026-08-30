// ═══════════════════════════════════════════════════════════════════════════════════════════
// ClalToast — the toast surface for CLAL CENTER, plus the `useClalToast` queue.
//
// ⚠️ DECLARED EXTRA FILE. It is not in the 14-W3 "תוצרים" list, and it is inside W3's own folder
// with zero blast radius, but it is called out in LEDGER-W3 so the addition is on the record.
//
// WHY THE HOUSE TOAST CANNOT DO THIS JOB: `components/Toast/Toast.component.js` renders a bare
// MUI `Alert` from a `{severity,color,message,showAnimtionCheck}` object and takes NO action
// slot. The contract needs toasts that CARRY ACTIONS:
//   · "לעדכן את האתר עכשיו?"  →  [ עדכון האתר ] [ לא עכשיו ]   (§C6, after every site-affecting op)
//   · "הקטגוריה נמחקה"        →  [ ביטול ]                     (14-W3 §4, real undo via SP16/SP17)
// A toast that states a consequence and offers no way to act on it is exactly the "טוסט נדחה ≠
// אינדיקציה" failure the plan already fixed once with the persistent badge.
//
// RTL: `Snackbar` is portalled to document.body, outside App.js's `<div dir>`, so it carries its
// own `dir` (E3 RTL_NOTES 2). The anchor is top-CENTER, which is direction-neutral and therefore
// needs no isRtl branch — unlike a corner anchor, which would (RTL_NOTES 3).
// ═══════════════════════════════════════════════════════════════════════════════════════════

import React, { useCallback, useRef, useState } from 'react';
import { Box, Button, Snackbar, Typography } from '@material-ui/core';
import { Alert } from '@material-ui/lab';

export interface ClalToastAction {
    label: string;
    onClick: () => void;
}

export interface ClalToastData {
    /** Bumped on every raise so an identical message re-opens the Snackbar. */
    id: number;
    message: string;
    severity: 'success' | 'error' | 'info';
    actions?: ClalToastAction[];
}

const AUTO_HIDE_PLAIN = 3600;
/** Long enough to read a question and decide; a 3.6s window to answer "update the site?" is not one. */
const AUTO_HIDE_WITH_ACTIONS = 9000;

export function useClalToast() {
    const [toast, setToast] = useState<ClalToastData | null>(null);
    const seq = useRef(0);

    const show = useCallback(
        (message: string, severity: 'success' | 'error' | 'info' = 'success', actions?: ClalToastAction[]) => {
            seq.current += 1;
            setToast({ id: seq.current, message, severity, actions });
        },
        []
    );

    const showError = useCallback((message: string) => show(message, 'error'), [show]);
    const dismiss = useCallback(() => setToast(null), []);

    return { toast, show, showError, dismiss };
}

interface Props {
    toast: ClalToastData | null;
    isRTL: boolean;
    onDismiss: () => void;
}

const ClalToast = ({ toast, isRTL, onDismiss }: Props) => {
    if (!toast) return null;
    const hasActions = !!toast.actions?.length;

    return (
        <Snackbar
            key={toast.id}
            open
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            autoHideDuration={hasActions ? AUTO_HIDE_WITH_ACTIONS : AUTO_HIDE_PLAIN}
            // 'clickaway' is excluded: any click anywhere on the screen would otherwise close a
            // toast that is asking a question, before the user reaches its buttons.
            onClose={(_e: any, reason?: string) => {
                if (reason === 'clickaway') return;
                onDismiss();
            }}
            style={{ top: 70, zIndex: 2000 }}
        >
            <Alert
                severity={toast.severity}
                elevation={6}
                variant="filled"
                dir={isRTL ? 'rtl' : 'ltr'}
                onClose={onDismiss}
                style={{ fontSize: 15, fontWeight: 700, alignItems: 'center' }}
            >
                <Box style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                    <Typography component="span" style={{ fontSize: 15, fontWeight: 700, color: 'inherit' }}>
                        {toast.message}
                    </Typography>
                    {toast.actions?.map(action => (
                        <Button
                            key={action.label}
                            size="small"
                            onClick={() => {
                                onDismiss();
                                action.onClick();
                            }}
                            style={{
                                background: 'rgba(255,255,255,.22)',
                                color: '#fff',
                                fontWeight: 700,
                                minHeight: 32
                            }}
                        >
                            {action.label}
                        </Button>
                    ))}
                </Box>
            </Alert>
        </Snackbar>
    );
};

export default ClalToast;
