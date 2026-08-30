// ═══════════════════════════════════════════════════════════════════════════════════════════
// ConfirmDialog — the small local confirm. There is NO shared ConfirmDialog in this repo
// (E3 REUSE_INVENTORY: "Confirms hand-rolled: DataSources.tsx:311-332 — make a small local one"),
// so this is it, scoped to ClalCenter.
//
// MUI's Dialog gives the real focus trap and the `aria-modal` semantics the review panel asked
// for; what it does NOT give is `dir`, because it is portalled to document.body outside App.js's
// `<div dir>` (E3 RTL_NOTES 2) — hence the explicit prop.
// ═══════════════════════════════════════════════════════════════════════════════════════════

import React from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { CC } from '../../../Models/ClalCenter/ClalCenter';

interface Props {
    open: boolean;
    title: string;
    body?: React.ReactNode;
    confirmLabel: string;
    cancelLabel?: string;
    /** Renders the confirm button as destructive: red, and NOT the visually primary choice. */
    danger?: boolean;
    busy?: boolean;
    isRTL: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

const ConfirmDialog = ({
    open, title, body, confirmLabel, cancelLabel, danger = false, busy = false, isRTL, onConfirm, onCancel
}: Props) => {
    const { t } = useTranslation();

    return (
        <Dialog
            open={open}
            onClose={busy ? undefined : onCancel}
            maxWidth="xs"
            fullWidth
            dir={isRTL ? 'rtl' : 'ltr'}
            aria-labelledby="cc-confirm-title"
        >
            <DialogTitle id="cc-confirm-title" disableTypography>
                <Typography component="h2" style={{ fontSize: 18, fontWeight: 800 }}>{title}</Typography>
            </DialogTitle>
            {body && (
                <DialogContent>
                    {typeof body === 'string'
                        ? <Typography style={{ fontSize: 15, color: '#44525e' }}>{body}</Typography>
                        : body}
                </DialogContent>
            )}
            <DialogActions style={{ padding: '12px 20px 18px', gap: 8 }}>
                <Button onClick={onCancel} disabled={busy} style={{ color: '#5b6b7b', fontWeight: 600 }}>
                    {cancelLabel || t(`${CC}cancel`)}
                </Button>
                <Button
                    onClick={onConfirm}
                    disabled={busy}
                    variant={danger ? 'outlined' : 'contained'}
                    color={danger ? 'default' : 'primary'}
                    style={danger
                        ? { color: '#c62828', borderColor: '#c62828', fontWeight: 700 }
                        : { fontWeight: 700 }}
                >
                    {confirmLabel}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ConfirmDialog;
