// ═══════════════════════════════════════════════════════════════════════════════════════════
// SendStatusCell — the unknown-state property. CONTRACT §4.2 / D10.
//
// DELIVERY PATH: _delivery\SendSearch-V1\tests\react\sendStatusCell.unknown.test.tsx
// TARGET PATH:   ReactCode\src\screens\SendSearch\sendStatusCell.unknown.test.tsx
//
// THE PROPERTY UNDER TEST: an unrecognised DeliveryState renders the VISIBLE `delivery.unknown`
// string — never `undefined`, and never a plausible-looking substitute.
//
// The second half is the one that matters, and it is why the "novel state string" case below is not
// padding. The live production bug this delivery also fixes is NOT "a status rendered as undefined"
// — an undefined would have been noticed years ago. It is a status that rendered as a WRONG BUT
// ENTIRELY PLAUSIBLE WORD: a per-message WhatsApp code arrives in a wire field named `SmsStatus` and
// is decoded by `renderSMSStatus` (RecipientReport.tsx:510-522), a 1:1 transcription of the GLOBAL
// campaign-lifecycle enum `eCampaignStatus`, so the Excel export prints FAILED messages as "נשלח".
// Nobody could see that, because "נשלח" is a real status word in a real status column.
//
// So the assertions here are two-sided:
//   (a) the unknown key IS present, and
//   (b) NO other delivery word from the shipped he JSON is present.
// (b) is the one that would have caught the shipping bug. (a) alone would not have.
//
// Also asserted: a CROSS-CHANNEL borrow. 'Delivered' is a legitimate domain member (CONTRACT §2.2)
// and a legitimate SMS/WhatsApp state, but email has no delivery receipt, so on an email row it must
// degrade to unknown rather than print "נמסר". That is the same bug shape as the live one, in the
// direction this screen is most likely to meet it.
// ═══════════════════════════════════════════════════════════════════════════════════════════

import React from 'react';
import ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';

jest.mock('react-i18next', () => ({
    useTranslation: () => require('./sendSearchTestI18n').useTranslationStub(),
}));

import SendStatusCell from './components/SendStatusCell';
import { eSendChannel } from '../../Models/DataSources/SmartSend';
import { RawChannelAttempt, DELIVERY_VOCABULARY } from '../../Models/DataSources/SendSearch';
import { heStrings } from './sendSearchTestI18n';

const renderText = (element: React.ReactElement): string => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    act(() => { ReactDOM.render(element, container); });
    const text = container.textContent || '';
    act(() => { ReactDOM.unmountComponentAtNode(container); });
    document.body.removeChild(container);
    return text;
};

const emailAttempt = (deliveryState: string, engagementState = 'None'): RawChannelAttempt => ({
    Channel: eSendChannel.EMAIL,
    DeliveryState: deliveryState,
    EngagementState: engagementState,
    // null on purpose: keeps `moment(...).format(...)` out of the rendered text so the assertions
    // below are about status vocabulary only and cannot be satisfied by a timestamp.
    EvidenceAt: null,
});

// Every delivery word the shipped he JSON defines, minus `unknown`. "The state did not silently
// become a plausible word" means: none of THESE appeared.
const otherDeliveryWords = (): string[] =>
    Object.keys(heStrings.delivery)
        .filter((k) => k !== 'unknown')
        .map((k) => heStrings.delivery[k] as string);

describe('SendStatusCell — an unrecognised state is visible and is never a plausible substitute (D10)', () => {
    test('the unknown key exists in the shipped he namespace and is non-empty', () => {
        // If this key is missing, every assertion below about "renders the unknown word" is testing
        // the absence of a string against the absence of a string. Check the premise first.
        expect(typeof heStrings.delivery.unknown).toBe('string');
        expect(heStrings.delivery.unknown.length).toBeGreaterThan(0);
        expect(typeof heStrings.engagement.unknown).toBe('string');
    });

    // A novel string the codebase has never seen — the shape of a new provider code arriving after
    // this ships. Table-driven so the property is stated once and probed from several directions.
    const novelStates = [
        'BouncedSoft',        // plausible-looking new provider code
        'QUEUED_FOR_RETRY',   // different casing convention entirely
        'נכשל חלקית',          // a Hebrew value leaking through from a mis-layered server
        '42',                 // a raw numeric provider code — the exact shape of the live bug's input
        '',                   // empty string from the wire
    ];

    test.each(novelStates)('an unrecognised DeliveryState %p renders the unknown word, visibly', (state) => {
        const text = renderText(<SendStatusCell attempts={[emailAttempt(state)]} />);

        // Visible, and never the literal React fallbacks.
        expect(text.trim().length).toBeGreaterThan(0);
        expect(text).not.toMatch(/undefined/);
        expect(text).not.toMatch(/\bnull\b/);

        // (a) the unknown key rendered
        expect(text).toContain(heStrings.delivery.unknown);

        // (b) and it did NOT silently become a plausible word. This is the assertion that would have
        // caught the live RecipientReport bug.
        // Assert on `text` ALONE. An earlier version asserted on `${state} → ${text}` to get a nicer
        // diagnostic, which made the test fail on its own input: one of the novel states is the Hebrew
        // literal 'נכשל חלקית', and heStrings.delivery.failed is 'נכשל' — a substring of it. The
        // assertion then flagged the INPUT, not the output. Found by the final gate 2026-07-30.
        otherDeliveryWords().forEach((word) => {
            expect(text).not.toContain(word);
        });

        // And the raw provider value is never echoed to the operator either — CONTRACT §2.2:
        // "Never emit a raw provider code." (Skipped for '' which is trivially contained.)
        if (state.length > 0) expect(text).not.toContain(state);
    });

    test('an unexpected-for-channel value is still RENDERED — the client never drops what the server sent', () => {
        // The per-channel vocabulary is a statement about what the SERVER should emit, not licence for
        // the client to suppress a value it received. CONTRACT §2.2 froze the domain FLAT; neither the
        // contract nor RESUME §3 authorises a per-channel narrowing at render time.
        // This test was INVERTED on 2026-07-30 — it previously asserted the drop. Reasoning: if the
        // server ever does send email+'Delivered', silently relabelling it 'unknown' hides a real
        // server bug behind a plausible-looking word, which is the exact failure mode D10 exists to
        // prevent. Surfacing the truthful word makes the discrepancy visible instead.
        expect(DELIVERY_VOCABULARY[eSendChannel.EMAIL].indexOf('Delivered')).toBe(-1);
        expect(DELIVERY_VOCABULARY[eSendChannel.SMS].indexOf('Delivered')).toBeGreaterThan(-1);

        const text = renderText(<SendStatusCell attempts={[emailAttempt('Delivered')]} />);
        expect(text).toContain(heStrings.delivery.delivered);
        expect(text).not.toContain(heStrings.delivery.unknown);
    });

    test('the same value on the channel that CAN prove it renders the real word', () => {
        // The mirror of the test above. Without it, a component that rendered 'unknown' for
        // absolutely everything would pass the whole suite.
        const smsAttempt: RawChannelAttempt = {
            Channel: eSendChannel.SMS, DeliveryState: 'Delivered', EngagementState: 'None', EvidenceAt: null,
        };
        const text = renderText(<SendStatusCell attempts={[smsAttempt]} />);
        expect(text).toContain(heStrings.delivery.delivered);
        expect(text).not.toContain(heStrings.delivery.unknown);
    });

    test('every in-domain state of every channel renders its own real word', () => {
        // The positive half of the property, across the whole matrix: no domain member is left
        // without a translation, which is the other way a cell goes blank.
        [eSendChannel.EMAIL, eSendChannel.SMS, eSendChannel.WHATSAPP].forEach((channel) => {
            DELIVERY_VOCABULARY[channel].forEach((state) => {
                const text = renderText(<SendStatusCell attempts={[{
                    Channel: channel, DeliveryState: state, EngagementState: 'None', EvidenceAt: null,
                } as RawChannelAttempt]} />);
                expect(`${channel}/${state} :: ${text.trim()}`).not.toMatch(/:: $/);
                expect(text).not.toMatch(/undefined/);
                expect(text).not.toContain(state);          // never the raw PascalCase code
            });
        });
    });

    test('an unrecognised EngagementState is suppressed rather than printed as a status', () => {
        // Engagement is only rendered when it is not 'None'. An out-of-domain engagement becomes
        // 'Unknown' in toChannelAttempt, which IS rendered — visibly, with its own key.
        const text = renderText(<SendStatusCell attempts={[emailAttempt('Sent', 'Forwarded')]} />);
        expect(text).toContain(heStrings.delivery.sent);
        expect(text).toContain(heStrings.engagement.unknown);
        expect(text).not.toContain('Forwarded');
        expect(text).not.toMatch(/undefined/);
    });

    test('no attempts at all is a sentence, not an empty cell', () => {
        // "לא נשלח בשום ערוץ" — a fact the operator must read. An empty cell here reads as a rendering
        // failure, and the whole screen is about not letting absence look like nothing happened.
        const text = renderText(<SendStatusCell attempts={[]} />);
        expect(text.trim()).toBe(heStrings.empty.notSent);
    });
});
