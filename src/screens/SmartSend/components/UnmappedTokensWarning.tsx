import React from 'react';
import { FormControlLabel, Checkbox } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import InlineBanner from './InlineBanner';

// §11.1/§16 · blocks "send" until every token is mapped, OR the user explicitly confirms
// sending with raw unmapped tokens. The screen gates the send button on
// (unmappedTokens.length === 0 || confirmed). Presentational — the screen computes
// unmappedTokens via selectUnmappedTokens and owns the `confirmed` state.
const UnmappedTokensWarning: React.FC<{
    tokens: string[];
    confirmed: boolean;
    onConfirmChange: (v: boolean) => void;
}> = ({ tokens, confirmed, onConfirmChange }) => {
    const { t } = useTranslation();
    if (!tokens.length) return null;
    return (
        <InlineBanner
            severity="warning"
            role="alert"
            title={t('DataSources.send.unmapped.title')}
            body={t('DataSources.send.unmapped.body', { tokens: tokens.join(', ') })}
            action={
                <FormControlLabel
                    control={<Checkbox checked={confirmed} onChange={(e) => onConfirmChange(e.target.checked)} color="primary" />}
                    label={t('DataSources.send.unmapped.confirm')}
                />
            }
        />
    );
};

export default UnmappedTokensWarning;
