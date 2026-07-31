// ═══════════════════════════════════════════════════════════════════════════════════════════
// VersionBadge — the new VERSION column (CONTRACT §4.2).
//
// DELIVERY PATH: _delivery\SendSearch-V1\react\screens\SendSearch\components\VersionBadge.tsx
// TARGET PATH:   ReactCode\src\screens\SendSearch\components\VersionBadge.tsx
//
// THE ONE INVARIANT: this component NEVER renders an empty cell. Every combination of
// ProvenanceSource (Recorded | Inferred | Unverifiable) × VersionState (Available | Purged |
// Scrubbed) — and every out-of-domain value, and a NULL version number — produces visible text.
//
// Why that is the requirement and not a nicety: a blank cell in this column reads as "nothing was
// sent". A purged version, a scrubbed version and an unverifiable provenance are all cases where
// something WAS sent and the version row is simply no longer intact (CONTRACT D8:
// "A blank cell currently reads as 'nothing was sent'"). Rendering nothing is the exact class of
// invisible failure this screen exists to prevent, so the empty return is not reachable: the last
// branch of `text()` is unconditional.
// ═══════════════════════════════════════════════════════════════════════════════════════════

import React from 'react';
import { Box, Tooltip, Typography } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import {
    SS,
    ProvenanceSource,
    VersionState,
    isProvenanceSource,
    isVersionState,
} from '../../../Models/DataSources/SendSearch';

// Tone per provenance (CONTRACT §4.2): Recorded = neutral, Inferred = subdued, Unverifiable = warning.
// Colours are the mock's own tokens (`SendSearch-Mock-v3.html:11-14`): --ink2 #3b4754 (neutral),
// --muted #5b6b7b (subdued), --warn #B54708 / --warn-bg #FCF0E6 (warning).
const TONE: { [k in ProvenanceSource]: { color: string; background: string; weight: number } } = {
    Recorded: { color: '#3b4754', background: 'transparent', weight: 700 },
    Inferred: { color: '#5b6b7b', background: 'transparent', weight: 400 },
    Unverifiable: { color: '#B54708', background: '#FCF0E6', weight: 700 },
};

interface Props {
    VersionNumber: number | null;
    // Wire values (plain strings, per the C# DTO). Narrowed here — this is the render boundary.
    ProvenanceSource: string;
    VersionState: string;
    // Optional, drawer-only: the provenance history row carries IsOutdated + LatestVersionNumber
    // (CONTRACT §3.1). The main grid's SendSearchRow does not, so both default to "not known".
    IsOutdated?: boolean;
    LatestVersionNumber?: number | null;
}

const VersionBadge: React.FC<Props> = ({
    VersionNumber, ProvenanceSource: sourceRaw, VersionState: stateRaw, IsOutdated, LatestVersionNumber,
}) => {
    const { t } = useTranslation();

    // An out-of-domain ProvenanceSource degrades to 'Unverifiable' — the CONSERVATIVE end of the
    // ladder. Degrading to 'Recorded' or 'Inferred' would be a claim of confidence the server never
    // made, which is the same failure mode as the WhatsApp status bug (D10). 'Unverifiable' overstates
    // nothing: it says "we cannot vouch for this", which is exactly true of a value we do not know.
    const source: ProvenanceSource = isProvenanceSource(sourceRaw) ? sourceRaw : 'Unverifiable';

    // An out-of-domain VersionState is NOT degraded to a domain member: 'Available' would be a lie
    // (invented availability) and 'Purged'/'Scrubbed' would be a plausible substitute — the exact
    // thing D10 forbids. It becomes `null`, which suppresses the state WORD but keeps the number and
    // forces warning styling + the unverifiable tooltip. Still never empty.
    const state: VersionState | null = isVersionState(stateRaw) ? stateRaw : null;
    const stateUnknown = state === null;

    const tone = TONE[stateUnknown ? 'Unverifiable' : source];

    const sourceLabel = t(`${SS}version.source.${source.charAt(0).toLowerCase()}${source.slice(1)}`);
    const stateLabel = state ? t(`${SS}version.state.${state.charAt(0).toLowerCase()}${state.slice(1)}`) : '';

    // ── the text, in strict fallback order. The final `else` has no condition. ──
    const parts: string[] = [];
    if (VersionNumber != null) {
        // The interpolation variable is `n`, matching the shipped strings (`SendSearch.he.json`
        // `version.number` = "V{{n}}"). i18next does NOT throw on an unknown variable — it leaves the
        // placeholder in place, so `{ number: … }` rendered the literal text "V{{n}}" in the version
        // column of every row. Exactly the silent, visible-only-at-runtime failure this screen exists
        // to prevent, and invisible to tsc.
        parts.push(t(`${SS}version.number`, { n: VersionNumber }));
    }
    // A version whose rows are gone must SAY so in the cell, not only in a tooltip — a tooltip is
    // invisible on a printout, in an export and on touch.
    if (state === 'Purged' || state === 'Scrubbed') {
        parts.push(stateLabel);
    }
    if (parts.length === 0) {
        // Version columns are NULL exactly when there is no mapping row at all (CONTRACT §2.2
        // precedence step 3 ⇒ ProvenanceSource = 'Unverifiable'). The provenance word is then the
        // whole content of the cell — it is what the user needs to read, and it is never ''.
        parts.push(sourceLabel);
    }
    const text = parts.join(' · ');

    // Tooltip: the provenance sentence always, plus the state word (so 'Available' is reachable
    // somewhere in the UI, which is why §4.1 defines a key for it), plus the outdated/latest line
    // when the caller knows it.
    const tipLines: string[] = [t(`${SS}version.tooltip.${source.charAt(0).toLowerCase()}${source.slice(1)}`)];
    if (state) tipLines.push(stateLabel);
    if (IsOutdated && LatestVersionNumber != null) {
        tipLines.push(t(`${SS}version.outdated`));
        tipLines.push(t(`${SS}version.latest`, { n: LatestVersionNumber }));   // `version.latest` = "הגרסה העדכנית: V{{n}}"
    }
    const tip = tipLines.join(' · ');

    const badge = (
        <Box
            component="span"
            style={{
                display: 'inline-flex', alignItems: 'baseline', gap: 4,
                padding: tone.background === 'transparent' ? 0 : '1px 8px',
                borderRadius: 11, background: tone.background,
                // The NUMBER is LTR ("גרסה 7" keeps its digit on the correct side in an RTL row) —
                // same treatment SmartSendManageTab.tsx:150-155 gives its version chip.
                direction: 'ltr', unicodeBidi: 'isolate',
            }}
        >
            <Typography
                component="span"
                style={{ fontSize: 13.5, fontWeight: tone.weight, color: tone.color, whiteSpace: 'nowrap' }}
            >
                {text}
            </Typography>
            {IsOutdated && (
                <Typography
                    component="span"
                    style={{ fontSize: 11.5, fontWeight: 800, color: '#B54708', whiteSpace: 'nowrap' }}
                >
                    {t(`${SS}version.outdated`)}
                </Typography>
            )}
        </Box>
    );

    // Recorded is neutral and needs no explanation, but a tooltip key exists for it (§4.1) and the
    // state word only lives in the tooltip for 'Available' — so every row gets one. Tooltip wraps a
    // <span>, not a bare string, because MUI v4 Tooltip requires a DOM-holding child.
    return <Tooltip title={tip}><span>{badge}</span></Tooltip>;
};

export default VersionBadge;
