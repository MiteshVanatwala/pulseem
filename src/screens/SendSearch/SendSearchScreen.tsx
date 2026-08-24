// ═══════════════════════════════════════════════════════════════════════════════════════════
// SendSearchScreen (דוח מקורות) — the STANDALONE route.
//
// The screen body now lives in `SendSearchPanel.tsx`, because the same view also renders as the last
// tab of the DataSources screen (מקורות | קמפיינים לשליחה ממקור | חיפוש סוכנים ומפקחים — a
// permission-gated strip, so 1–3 tabs wide). The tab is labelled "חיפוש סוכנים ומפקחים" and this
// route "דוח מקורות": two names for one view, on purpose (PO decision), so do not "fix" the drift.
// This file is what the panel needs and the tab does not: the page shell and the feature gate.
//
// Shape and conventions follow the house style of `screens/SmartSend/SmartSendScreen.tsx`:
// `({ classes }: ClassesType)`, `DefaultScreen` wrapper, and the feature gate + `Redirect` pattern
// from SmartSendScreen.tsx:111-122.
// ═══════════════════════════════════════════════════════════════════════════════════════════

import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import clsx from 'clsx';
import DefaultScreen from '../DefaultScreen';
import { ClassesType } from '../Classes.types';
import useRedirect from '../../helpers/Routes/Redirect';
import { sitePrefix } from '../../config';
import { PulseemFeatures } from '../../model/PulseemFields/Fields';
import SendSearchPanel from './SendSearchPanel';

const SendSearchScreen = ({ classes }: ClassesType) => {
    const Redirect = useRedirect();
    const { accountFeatures } = useSelector((state: any) => state.common);

    // Feature gate — identical to SmartSendScreen.tsx:111-122, including the two traps documented
    // there: `accountFeatures?.length &&` (the cookie-backed list is null until it loads, and a bare
    // truthiness check would let an unentitled user through on `undefined`) and `sitePrefix ?? ''`
    // (it comes straight from process.env and is `string | undefined`).
    // CONTRACT §7 notes the deployed gate is feature 76 via `AccountFeatures` while the mirror shows
    // `FeatureTierLogic` — this screen depends on NEITHER: it reuses the same DATA_SOURCES entitlement
    // the rest of the feature already gates on, so there is nothing here to "fix" later.
    useEffect(() => {
        if (accountFeatures?.length && accountFeatures.indexOf(PulseemFeatures.DATA_SOURCES) === -1) {
            Redirect({ url: sitePrefix ?? '', openNewTab: false });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [accountFeatures]);

    return (
        <DefaultScreen
            currentPage="groups"
            subPage="sendSearch"
            classes={classes}
            containerClass={clsx(classes.management, classes.mb50)}
        >
            {/* showTitle only here — inside the DataSources tab the page already has a heading. */}
            <SendSearchPanel showTitle />
        </DefaultScreen>
    );
};

export default SendSearchScreen;
