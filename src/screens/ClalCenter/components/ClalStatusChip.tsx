// ═══════════════════════════════════════════════════════════════════════════════════════════
// ClalStatusChip — the ONLY component allowed to render `eClalItemStatus`.
//
// ⚠️ WHY THIS EXISTS AND WHY `StatusChip` MAY NOT BE REUSED (C6 v12 §4, 14-W3 "תוצרים"):
// `screens/DataSources/components/StatusChip.tsx` takes `eDataSourceStatus`
// (PENDING=0 · PROCESSING=1 · READY=2 · FAIL=3 · CANCELLED=4). TypeScript accepts a numeric
// literal wherever a numeric enum is expected, so passing a ClalCenter status COMPILES CLEANLY —
// and then paints "טיוטה"(0) as "ממתין", "פורסם"(1) as "בעיבוד" and "מוסתר"(2) as "מוכן" in
// green. A silent, type-checked lie. Hence a separate chip with its own enum.
//
// Colours are chosen EXPLICITLY here. The palette quoted in `04-EXPERTS\E3-admin-ux.md` is only
// partly real: `#eef1f4` does NOT exist anywhere in `src` (verified), so nothing is "reused" —
// the three pairs below are declared and owned by this file.
// ═══════════════════════════════════════════════════════════════════════════════════════════

import React from 'react';
import { Box, Typography } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { CC, eClalItemStatus } from '../../../Models/ClalCenter/ClalCenter';

const PALETTE: { [status: number]: { bg: string; fg: string } } = {
    [eClalItemStatus.DRAFT]: { bg: '#fff8e1', fg: '#b7791f' },
    [eClalItemStatus.PUBLISHED]: { bg: '#e6f4ec', fg: '#067647' },
    [eClalItemStatus.HIDDEN]: { bg: '#eef1f4', fg: '#7a8794' }
};

/** The accent stripe a row gets on its inline-start edge. `null` ⇒ no stripe (published rows). */
export const rowStripeColor = (status: eClalItemStatus): string | null => {
    if (status === eClalItemStatus.DRAFT) return '#b7791f';
    if (status === eClalItemStatus.HIDDEN) return '#b6c0c9';
    return null;
};

interface Props {
    status: eClalItemStatus;
    /**
     * `Status === PUBLISHED && UpdatedDate > Config.LastPublishedOn` — the item is live but what
     * is live is not what is on screen. Rendered as a suffix, never as a fourth status.
     */
    pendingChanges?: boolean;
}

const ClalStatusChip = ({ status, pendingChanges = false }: Props) => {
    const { t } = useTranslation();
    const colors = PALETTE[status] ?? PALETTE[eClalItemStatus.DRAFT];
    const label = t(`${CC}status.${status}`);

    return (
        <Box
            role="status"
            component="span"
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                background: colors.bg,
                color: colors.fg,
                borderRadius: 999,
                padding: '2px 11px',
                fontSize: 12.5,
                fontWeight: 600,
                whiteSpace: 'nowrap'
            }}
        >
            <Typography component="span" style={{ fontSize: 12.5, fontWeight: 600, color: 'inherit' }}>
                {label}
            </Typography>
            {pendingChanges && (
                <Typography
                    component="span"
                    style={{ fontSize: 12, fontWeight: 600, color: '#b7791f' }}
                >
                    {'· ' + t(`${CC}status.pendingChanges`)}
                </Typography>
            )}
        </Box>
    );
};

export default ClalStatusChip;
