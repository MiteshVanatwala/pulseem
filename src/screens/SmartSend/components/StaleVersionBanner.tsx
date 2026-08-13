import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import InlineBanner from './InlineBanner';

// §16 · shows when the locked source version is stale (a newer version was published).
// Re-locking happens ONLY on an explicit save (§16) — this banner is informational.
const StaleVersionBanner: React.FC = () => {
    const { t } = useTranslation();
    const isStale = useSelector((s: any) => s.smartSend.isStale);
    // `isMapped &&` scopes the warning to the mapping it actually describes. isStale is computed by
    // the server for the campaign's SAVED source and is written only by getMapping.fulfilled —
    // selectSource does not touch it — so after switching from a stale source A to a fresh source B
    // this banner would otherwise keep warning about A over B's columns.
    // SCOPE THE DISPLAY, NEVER CLEAR THE FACT: clearing isStale in selectSource instead would kill a
    // TRUE warning on the A->B->A return, and the campaign would silently re-lock to a new version
    // with nothing on screen saying so. A false negative here is the dangerous direction.
    const isMapped = useSelector((s: any) => s.smartSend.isMapped);
    if (!isStale || !isMapped) return null;
    return (
        <InlineBanner
            severity="warning"
            role="status"
            title={t('DataSources.send.stale.title')}
            body={t('DataSources.send.stale.body')}
        />
    );
};

export default StaleVersionBanner;
