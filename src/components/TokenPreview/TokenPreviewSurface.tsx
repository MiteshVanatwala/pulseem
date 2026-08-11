import React, { useEffect, useRef } from 'react';
import { Box } from '@material-ui/core';
import { Loader } from '../Loader/Loader';

// Shared render surface for merged email HTML — used by SmartSend's "first client from the source"
// preview and by SendSearch's per-recipient sent-email modal (WP-A).
//
// EXTRACTED (step A4a) from screens/SmartSend/components/SmartSendPreview.tsx:72-83, unchanged in
// behaviour. It owns ONLY the rendering; fetching and merging stay with each consumer.
//
// WHY A SHADOW ROOT: a marketing email carries its own <style>. Injected into the page directly it
// would repaint the whole app. `attachShadow({mode:'open'})` scopes those styles to this subtree.
// The root is created once and reused — attachShadow throws if called twice on the same host.
//
// WHY direction:'ltr' ON THE BOX: the app is Hebrew/RTL, but the email must render in ITS OWN
// direction, not the app's. This is the one place a hardcoded physical direction is correct, and
// it matches the established idiom (DataSources.tsx:322 does the same for never-Hebrew values).
//
// WHY onClickCapture preventDefault: this is a PREVIEW. Links inside a real campaign body point at
// tracking redirects; a stray click would register a fake open/click event against a real
// recipient's send record. Capture phase, so it fires before anything inside the shadow root.
//
// SECURITY: `html` reaches innerHTML. Callers MUST merge through
// helpers/Functions/tokenPreview.replaceTokensForPreview, which HTML-escapes every substituted
// value. This component deliberately does NOT sanitise: the campaign body is authored by the
// account itself and is the same HTML the sender already delivered, so stripping it here would
// misrepresent what was sent. Never pass unmerged third-party HTML through this component.

interface TokenPreviewSurfaceProps {
    /** Merged, already-escaped HTML. See the SECURITY note above. */
    html: string;
    loading?: boolean;
    height?: number | string;
    /** Translated label — passed in so this component carries no i18n dependency. */
    ariaLabel?: string;
}

const TokenPreviewSurface: React.FC<TokenPreviewSurfaceProps> = ({
    html, loading = false, height = 400, ariaLabel,
}) => {
    const hostRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!hostRef.current) return;
        const shadow = hostRef.current.shadowRoot || hostRef.current.attachShadow({ mode: 'open' });
        shadow.innerHTML = html;
    }, [html]);

    return (
        // SUPERVISOR-BOXSIZING-SURFACE: identical fix to SmartSendPreview.tsx — this style object was
        // a byte-for-byte copy of it and carried the same latent defect. It has no consumers today,
        // so the defect was dormant rather than live; fixed here so it cannot ship when SendSearch's
        // per-recipient modal wires this surface up. The two components are deliberately NOT merged
        // in this change.
        <Box style={{ position: 'relative', height, boxSizing: 'border-box', overflow: 'auto', border: '1px solid #e0e0e0', borderRadius: 4, background: '#fff', direction: 'ltr' }}>
            <div ref={hostRef} style={{ width: '100%' }} aria-label={ariaLabel} onClickCapture={(e) => e.preventDefault()} />
            <Loader isOpen={loading} showBackdrop={true} />
        </Box>
    );
};

export default TokenPreviewSurface;
