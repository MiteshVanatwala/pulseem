import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import InlineBanner from './InlineBanner';

// §16 · shows when the locked source version is stale (a newer version was published).
// Re-locking happens ONLY on an explicit save (§16) — this banner is informational.
const StaleVersionBanner: React.FC = () => {
    const { t } = useTranslation();
    const isStale = useSelector((s: any) => s.smartSend.isStale);
    if (!isStale) return null;
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
