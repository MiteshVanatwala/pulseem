import React from 'react';
import { useSelector } from 'react-redux';
import { Button } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import InlineBanner from './InlineBanner';

// §16 · two mismatch cases share this banner:
//  • Mismatch=true  → the synthetic group was dropped/merged (re-save repairs it).
//  • ForeignSyntheticGroupID set (clone, PO decision #6) → the campaign was duplicated
//    with a foreign PulseemDS_ group but no mapping; the user must pick a source + remap.
// The clone case keys on ForeignSyntheticGroupID, NEVER on Mismatch (Gate-0 RS1 rule).
// `onRepair` is wired at M9 (re-save / focus the source picker); until then the banner
// is explanatory only (the §16 requirement is the in-UI explanation).
const MappingMismatchBanner: React.FC<{ onRepair?: () => void }> = ({ onRepair }) => {
    const { t } = useTranslation();
    const { mismatch, foreignSyntheticGroupId, foreignSyntheticGroupName } =
        useSelector((s: any) => s.smartSend);
    const isClone = !!foreignSyntheticGroupId;
    if (!mismatch && !isClone) return null;

    const title = isClone ? t('DataSources.send.mismatch.cloneTitle') : t('DataSources.send.mismatch.title');
    const body = isClone
        ? t('DataSources.send.mismatch.cloneBody', { name: foreignSyntheticGroupName ?? '' })
        : t('DataSources.send.mismatch.body');

    const action = onRepair
        ? <Button size="small" variant="outlined" color="primary" onClick={onRepair}>{t('DataSources.send.mismatch.repair')}</Button>
        : undefined;

    return <InlineBanner severity="error" role="alert" title={title} body={body} action={action} />;
};

export default MappingMismatchBanner;
