import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { Loader } from '../../../components/Loader/Loader';
import { getSampleValues, getNewsletterPreviewWrapped } from '../../../redux/reducers/smartSendSlice';

// §11.1/§13 step 7 · DISPLAY-ONLY preview. Fetches the campaign HTML through the WRAPPED
// preview thunk (obeys USE_SEND_MOCK — never the real self-dispatching EmailPreviewComponent,
// the §7.1 trap) and replaces ##tokens## with the sample row's values (getSampleValues).
// Two token classes (TierGraph handoff §9): TEXT tokens are replaced byte-for-byte; GRAPH
// tokens live URL-ENCODED inside the pulseemmonitorgraph pN params, so they are handled per
// §ד2 — decode pN → replace → re-encode (NEVER a raw-HTML replace, and cfg is never touched).
// A mapped token whose sample value is empty/NULL renders as an empty string (NEVER raw
// ##..##, §7.2); an UNMAPPED token has no sample value and stays raw (the sender can't resolve
// it) — UnmappedTokensWarning blocks send. Rendered in a shadow DOM, clicks suppressed.

const GRAPH_URL_RE = /pulseemmonitorgraph[^"'\s>]*/g;
const GRAPH_PARAM_RE = /([?&;])(p\d+=)([^&"'\s>]*)/g;
const TOKEN_RE = /##([^#]+)##/g;

const escapeHtml = (s: string) =>
    String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Replace graph tokens inside one pulseemmonitorgraph URL: decode each pN, substitute mapped
// tokens with the (URL-encoded) sample value, re-encode. Unmapped/absent → left as-is.
const replaceGraphTokens = (url: string, values: { [k: string]: string }) =>
    url.replace(GRAPH_PARAM_RE, (_m, sep, key, val) => {
        let decoded: string;
        try { decoded = decodeURIComponent(val); } catch { decoded = val; }
        const resolved = decoded.replace(TOKEN_RE, (raw, name) =>
            Object.prototype.hasOwnProperty.call(values, name) ? values[name] : raw);
        return sep + key + encodeURIComponent(resolved);
    });

export const replaceTokensForPreview = (html: string, values: { [k: string]: string }) => {
    if (!html) return '';
    const safe = values || {};
    // Graph tokens first (inside the img src pN params), then raw text tokens in the body.
    let out = html.replace(GRAPH_URL_RE, (url) => replaceGraphTokens(url, safe));
    out = out.replace(TOKEN_RE, (raw, name) =>
        Object.prototype.hasOwnProperty.call(safe, name) ? escapeHtml(safe[name]) : raw);
    return out;
};

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
        <Box style={{ position: 'relative', height, overflow: 'auto', border: '1px solid #e0e0e0', borderRadius: 4, background: '#fff', direction: 'ltr' }}>
            <div ref={hostRef} style={{ width: '100%' }} aria-label={t('DataSources.send.preview')} onClickCapture={(e) => e.preventDefault()} />
            <Loader isOpen={loading} showBackdrop={true} />
        </Box>
    );
};

export default SmartSendPreview;
