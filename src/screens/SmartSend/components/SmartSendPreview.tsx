import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { Loader } from '../../../components/Loader/Loader';
import { getSampleValues, getNewsletterPreviewWrapped } from '../../../redux/reducers/smartSendSlice';
import { replaceTokensForPreview } from '../../../helpers/Functions/tokenPreview';

// §11.1/§13 step 7 · DISPLAY-ONLY preview. Fetches the campaign HTML through the WRAPPED
// preview thunk (obeys USE_SEND_MOCK — never the real self-dispatching EmailPreviewComponent,
// the §7.1 trap) and replaces ##tokens## with the sample row's values (getSampleValues).
// Two token classes (TierGraph handoff §9): TEXT tokens are replaced byte-for-byte; GRAPH
// tokens live URL-ENCODED inside the pulseemmonitorgraph pN params, so they are handled per
// §ד2 — decode pN → replace → re-encode (NEVER a raw-HTML replace, and cfg is never touched).
// A mapped token whose sample value is empty/NULL renders as an empty string (NEVER raw
// ##..##, §7.2); an UNMAPPED token has no sample value and stays raw (the sender can't resolve
// it) — UnmappedTokensWarning blocks send. Rendered in a shadow DOM, clicks suppressed.

// The token-merge logic MOVED to helpers/Functions/tokenPreview.ts (step A1) so the SendSearch
// per-recipient sent-email preview can share it verbatim instead of forking a second copy.
// Re-exported here because existing importers reference this path — do NOT remove the re-export
// without updating every call site.
export { replaceTokensForPreview };

const SmartSendPreview: React.FC<{ campaignId: number; height?: number | string }> = ({ campaignId, height = 400 }) => {
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const hostRef = useRef<HTMLDivElement | null>(null);
    const [loading, setLoading] = useState(true);
    const [rawHtml, setRawHtml] = useState('');
    const sampleValues = useSelector((s: any) => s.smartSend.sampleValues) as { [k: string]: string } | null;

    useEffect(() => {
        if (!campaignId) return;
        let cancelled = false;
        setLoading(true);
        dispatch(getSampleValues(campaignId));
        (async () => {
            const res: any = await dispatch(getNewsletterPreviewWrapped(campaignId));
            if (cancelled) return;
            const data = res?.payload?.Data;
            setRawHtml(data ? (data.AmpData || data.HTMLtoSend || data.HTML || '') : '');
            setLoading(false);
        })();
        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [campaignId]);

    const rendered = useMemo(() => replaceTokensForPreview(rawHtml, sampleValues || {}), [rawHtml, sampleValues]);

    useEffect(() => {
        if (!hostRef.current) return;
        const shadow = hostRef.current.shadowRoot || hostRef.current.attachShadow({ mode: 'open' });
        shadow.innerHTML = rendered;
    }, [rendered]);

    return (
        // SUPERVISOR-BOXSIZING: boxSizing is load-bearing, not tidiness. This app ships no global
        // reset — no CssBaseline anywhere in src/, and index.css has no `*` rule — so the default
        // is content-box. With height:'100%' plus a 1px border the box is 2px TALLER than its slot.
        // Those 2px escape the minHeight:0 flex parent and are caught by the first scroll container
        // above (SendSummaryDialog's `col`, overflowY:auto), which then paints a SECOND, near-empty
        // scrollbar beside the preview's real one. In RTL they land on opposite edges, because this
        // box forces direction:'ltr' so the email renders in its own direction.
        <Box style={{ position: 'relative', height, boxSizing: 'border-box', overflow: 'auto', border: '1px solid #e0e0e0', borderRadius: 4, background: '#fff', direction: 'ltr' }}>
            <div ref={hostRef} style={{ width: '100%' }} aria-label={t('DataSources.send.preview')} onClickCapture={(e) => e.preventDefault()} />
            <Loader isOpen={loading} showBackdrop={true} />
        </Box>
    );
};

export default SmartSendPreview;
