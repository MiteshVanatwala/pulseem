// ═══════════════════════════════════════════════════════════════════════════════════════════
// EmptyStates — all three of them (14-W3 §2).
//
// The seed script was cancelled in v12: THE DATABASE IS BORN COMPLETELY EMPTY. So the very first
// screen an editor ever sees is this file, and the two inner empty states are not decoration —
// without them a category with no sub-groups, and a sub-group with no items, are dead ends with
// no visible way forward.
//
// ⚠️ THE TWO ROUTES IN MUST CARRY EQUAL VISUAL WEIGHT (§2.2): same size, same `variant`, side by
// side, no "recommended" badge, and NO `autoFocus` on either — an autofocused button is a
// recommendation the design explicitly refuses to make. "אתחיל ממבנה משלי" creates nothing at
// all; it just opens the inline "new category" field with focus.
// ═══════════════════════════════════════════════════════════════════════════════════════════

import React from 'react';
import { Box, Button, LinearProgress, Typography } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { CC } from '../../../Models/ClalCenter/ClalCenter';

const panelStyle: React.CSSProperties = {
    background: '#fff',
    border: '1px solid #e3e8ee',
    borderRadius: 10,
    padding: '34px 26px',
    textAlign: 'center'
};

interface FirstScreenProps {
    /** { n, total } while the template is running; null otherwise. */
    progress: { n: number; total: number } | null;
    onRunTemplate: () => void;
    onStartOwn: () => void;
}

export const FirstScreen = ({ progress, onRunTemplate, onStartOwn }: FirstScreenProps) => {
    const { t } = useTranslation();
    const running = !!progress;

    return (
        <Box style={panelStyle}>
            <Typography component="h2" style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>
                {t(`${CC}empty.firstTitle`)}
            </Typography>
            <Typography style={{ fontSize: 15, color: '#5b6b7b', maxWidth: 620, margin: '0 auto 22px' }}>
                {t(`${CC}empty.firstBody`)}
            </Typography>

            {running ? (
                <Box style={{ maxWidth: 420, margin: '0 auto' }} role="status" aria-live="polite">
                    <Typography style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>
                        {t(`${CC}empty.starterProgress`, { n: progress!.n, total: progress!.total })}
                    </Typography>
                    <LinearProgress
                        variant="determinate"
                        value={Math.round((progress!.n / progress!.total) * 100)}
                        style={{ height: 8, borderRadius: 4 }}
                    />
                </Box>
            ) : (
                <Box style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                    {/* identical size + variant on purpose — see the header */}
                    <Button
                        variant="outlined"
                        size="large"
                        onClick={onRunTemplate}
                        style={{ minWidth: 220, fontWeight: 700, borderColor: '#FF1744', color: '#FF1744' }}
                    >
                        {t(`${CC}empty.firstTemplate`)}
                    </Button>
                    <Button
                        variant="outlined"
                        size="large"
                        onClick={onStartOwn}
                        style={{ minWidth: 220, fontWeight: 700, borderColor: '#FF1744', color: '#FF1744' }}
                    >
                        {t(`${CC}empty.firstOwn`)}
                    </Button>
                </Box>
            )}
        </Box>
    );
};

interface EmptyCategoryProps {
    onAddSubGroup: () => void;
}

export const EmptyCategory = ({ onAddSubGroup }: EmptyCategoryProps) => {
    const { t } = useTranslation();
    return (
        <Box style={{ padding: '18px 4px', textAlign: 'center' }}>
            <Typography style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>
                {t(`${CC}empty.categoryTitle`)}
            </Typography>
            <Typography style={{ fontSize: 13, color: '#7a8794', marginBottom: 12 }}>
                {t(`${CC}empty.categoryHint`)}
            </Typography>
            <Button variant="contained" color="primary" onClick={onAddSubGroup} style={{ fontWeight: 700 }}>
                {t(`${CC}addSubGroupNew`)}
            </Button>
        </Box>
    );
};

interface EmptySubGroupProps {
    onAddItem: () => void;
}

export const EmptySubGroup = ({ onAddItem }: EmptySubGroupProps) => {
    const { t } = useTranslation();
    return (
        <Box style={{ padding: '14px 4px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <Typography style={{ fontSize: 13.5, color: '#7a8794' }}>
                {t(`${CC}empty.subGroupTitle`)}
            </Typography>
            <Button
                size="small"
                onClick={onAddItem}
                style={{ color: '#FF1744', fontWeight: 700 }}
            >
                {t(`${CC}empty.subGroupCta`)}
            </Button>
        </Box>
    );
};
