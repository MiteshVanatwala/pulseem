import React, { useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { actionURL } from '../../config';

interface LegacyPageFrameProps {
    /** The .aspx page path relative to the /Pulseem/ base, e.g. "AutoSendPlans.aspx" */
    path: string;
    /** Any extra query params to append after fromreact=true, e.g. "Culture=he-IL" */
    extraQuery?: string;
}

const isLocalHost = () => {
    if (typeof window === 'undefined') {
        return false;
    }

    return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
};

const LegacyPageRenderer: React.FC<{ src: string; title?: string }> = ({ src, title }) => {
    const shouldRedirect = isLocalHost();

    useEffect(() => {
        // In local dev, legacy servers commonly block framing from localhost.
        // Redirecting avoids frame policy issues while preserving navigation.
        if (shouldRedirect) {
            window.location.href = src;
        }
    }, [shouldRedirect, src]);

    if (shouldRedirect) {
        return null;
    }

    return (
        <iframe
            title={title}
            src={src}
            style={{
                width: '100%',
                height: 'calc(100vh - 64px)',
                border: 'none',
                display: 'block',
            }}
        />
    );
};

/**
 * Renders a legacy .NET (.aspx) page inside a full-height iframe.
 * Uses `actionURL` from config so it correctly targets the .NET server
 * in both local development (REACT_APP_ACTION_URL) and production.
 */
const LegacyPageFrame: React.FC<LegacyPageFrameProps> = ({ path, extraQuery }) => {
    const qs = extraQuery ? `&${extraQuery}` : '';
    const src = `${actionURL}${path}?fromreact=true${qs}`;

    return <LegacyPageRenderer title={path} src={src} />;
};

/**
 * Generic wildcard handler for routes matching /Pulseem/:aspxPage
 * Preserves the original query string (minus fromreact) so the .NET page
 * receives parameters like Culture, AutomationID etc.
 */
export const LegacyPageWild: React.FC = () => {
    const { aspxPage } = useParams<{ aspxPage: string }>();
    const { search } = useLocation();

    // Strip any existing fromreact param then rebuild cleanly
    const params = new URLSearchParams(search);
    params.delete('fromreact');
    const extra = params.toString();
    const src = `${actionURL}${aspxPage}?fromreact=true${extra ? `&${extra}` : ''}`;

    return <LegacyPageRenderer title={aspxPage} src={src} />;
};

export default LegacyPageFrame;
