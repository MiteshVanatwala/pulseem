// ═══════════════════════════════════════════════════════════════════════════════════════════
// SendStatusCell — the "ערוצים ותוצאה" column (CONTRACT §4.2, D10).
//
// DELIVERY PATH: _delivery\SendSearch-V1\react\screens\SendSearch\components\SendStatusCell.tsx
// TARGET PATH:   ReactCode\src\screens\SendSearch\components\SendStatusCell.tsx
//
// THIS FILE CONTAINS NO STATUS DICTIONARY, MAP, SWITCH OR LOOKUP TABLE OF PROVIDER CODES.
// Search it: there is no object literal keyed by a status, no `switch (status)`, no array of code
// labels. It renders the SERVER-SUPPLIED `DeliveryState` / `EngagementState` string through i18n:
//     t('SendSearch.delivery.' + camelCaseState(state))
// and an unrecognised value has already become the string 'Unknown' in `toChannelAttempt`
// (Models/DataSources/SendSearch.ts) — so it renders the VISIBLE `delivery.unknown` /
// `engagement.unknown` key. Never `undefined`. Never a plausible substitute.
//
// WHY THIS IS A HARD RULE AND NOT A STYLE PREFERENCE: a live production bug exists today because a
// per-message WhatsApp code arrives in a wire field named `SmsStatus` and is decoded by
// `renderSMSStatus` (RecipientReport.tsx:510-522) — a component-local 1:1 transcription of the
// GLOBAL campaign-lifecycle enum `eCampaignStatus`. The Excel export therefore prints FAILED
// WhatsApp messages as "נשלח". The DECODING IN THE COMPONENT, not the typo, is the bug, and the fix
// is that the meaning is decided once, on the server (D10) — never here.
//
// The mock's per-channel vocabulary rule ("email may never say נמסר, SMS may never say נפתח" —
// `:92-96`, `:229-238`) is a rule about what the SERVER emits, and CONTRACT §2.2 froze the domain
// FLAT. This component therefore renders every value the server sends, including one that looks
// wrong for its channel: hiding it would delete the only evidence that the server is emitting it.
// The per-channel unions survive in `Models/DataSources/SendSearch.ts` as documentation of that
// server-side expectation; they are not a runtime filter.
//
// Rendering rules from the mock, all enforced here:
//   • ONE LINE PER CHANNEL ACTUALLY ATTEMPTED. A channel never tried has NO line — there is no
//     dash matrix and no cross-channel cell (`:233-238`). `attempts` is the list of what happened;
//     this component never invents a row for a missing channel.
//   • WORDS, NOT GLYPHS, and the channel is NAMED. "A design that needs a legend has failed"
//     (`:91-101`) — ⌁/⌾ are indistinguishable to an operator, so the channel label comes from
//     `getChannelDescriptor().labelKey`, the same i18n key SmartSend already uses.
//   • NO PERCENTAGES anywhere — the denominator differs per channel (`:443`).
// ═══════════════════════════════════════════════════════════════════════════════════════════

import React from 'react';
import { Box, Typography } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import { DateFormats } from '../../../helpers/Constants';
import { eSendChannel, getChannelDescriptor } from '../../../Models/DataSources/SmartSend';
import {
    SS,
    RawChannelAttempt,
    ChannelAttempt,
    StateTone,
    toChannelAttempt,
    camelCaseState,
    deliveryTone,
    engagementTone,
} from '../../../Models/DataSources/SendSearch';

// Tone → colour. Colour only; carries no meaning of its own. Mock tokens: --ok #067647,
// --risk #B42318, --warn #B54708, --muted #5b6b7b (`Mock-v3:11-14`, `.ch.g/.ch.r/.ch.w2/.ch.m`).
const TONE_COLOR: { [k in StateTone]: string } = {
    ok: '#067647',
    bad: '#B42318',
    warn: '#B54708',
    muted: '#5b6b7b',
};

interface Props {
    // What was actually attempted, in the wire shape. Order is preserved by the caller
    // (email · SMS · WhatsApp — the mock's fixed order).
    attempts: RawChannelAttempt[];
    // Compact rendering for the roster table inside the roll-up drawer (`Mock-v3:472` "ערוצים").
    dense?: boolean;
}

const SendStatusCell: React.FC<Props> = ({ attempts, dense }) => {
    const { t } = useTranslation();

    // No attempt in any channel is a FACT the user must read, not an empty cell (`Mock-v3:234`:
    // "לא נשלח בשום ערוץ"). §4.1's `empty.notSent` is that sentence.
    if (!attempts || attempts.length === 0) {
        return (
            <Typography component="span" style={{ fontSize: 13, color: '#a8b2bb' }}>
                {t(`${SS}empty.notSent`)}
            </Typography>
        );
    }

    const renderLine = (raw: RawChannelAttempt, index: number) => {
        // The single narrowing point. After this line, `a.DeliveryState` / `a.EngagementState` are
        // guaranteed members of the frozen §2.2 domain — never NULL, never a raw provider code — so
        // every key built from them below is a key §4.1 actually defines.
        const a: ChannelAttempt = toChannelAttempt(raw);

        // Both labels go through i18n by key CONSTRUCTION, not by table lookup. `camelCaseState`
        // lower-cases the first character of the server's PascalCase domain member; the resulting
        // key is guaranteed to exist because §4.1 defines one key per domain member, `unknown`
        // included.
        const deliveryLabel = t(`${SS}delivery.${camelCaseState(a.DeliveryState)}`);
        const hasEngagement = a.EngagementState !== 'None';
        const engagementLabel = hasEngagement ? t(`${SS}engagement.${camelCaseState(a.EngagementState)}`) : '';

        // The line's tone is the STRONGEST evidence it carries: a real engagement outranks the
        // delivery state (an opened mail is proof; "sent" is only a statement about us).
        const tone: StateTone = hasEngagement ? engagementTone(a.EngagementState) : deliveryTone(a.DeliveryState);

        const words = hasEngagement ? `${deliveryLabel} · ${engagementLabel}` : deliveryLabel;
        const when = a.EvidenceAt ? moment(a.EvidenceAt).format(DateFormats.DATE_TIME_24) : '';

        return (
            <Box
                key={`${a.Channel}-${index}`}
                style={{ display: 'flex', gap: 6, alignItems: 'baseline', whiteSpace: 'nowrap', lineHeight: 1.35 }}
            >
                {/* The channel NAME. Reuses the existing DataSources channel keys via the
                    ChannelDescriptor so this screen and SmartSend can never disagree about what a
                    channel is called (Models/DataSources/SmartSend.ts:22-24). `unicodeBidi: isolate`
                    keeps a Latin name ("SMS") from reordering the RTL line (`Mock-v3:102`). */}
                <Typography
                    component="span"
                    style={{
                        fontSize: 12, color: '#5b6b7b', width: dense ? 44 : 52, flex: 'none',
                        textAlign: 'right', unicodeBidi: 'isolate',
                    }}
                >
                    {t(getChannelDescriptor(a.Channel as eSendChannel).labelKey)}
                </Typography>
                <Typography
                    component="span"
                    style={{
                        fontSize: dense ? 13 : 13.5,
                        fontWeight: tone === 'muted' ? 400 : 700,
                        color: TONE_COLOR[tone],
                    }}
                >
                    {words}
                </Typography>
                {when && (
                    <Typography
                        component="span"
                        style={{ fontSize: 12, color: '#5b6b7b', direction: 'ltr', unicodeBidi: 'isolate' }}
                    >
                        {when}
                    </Typography>
                )}
            </Box>
        );
    };

    return (
        <Box style={{ display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'flex-start', textAlign: 'right' }}>
            {attempts.map(renderLine)}
        </Box>
    );
};

export default SendStatusCell;
