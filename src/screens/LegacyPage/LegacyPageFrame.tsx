import React from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { iframeURL } from '../../config';
import DefaultScreen from '../DefaultScreen';
import clsx from 'clsx';

interface LegacyPageFrameProps {
    /** The .aspx page path relative to the /Pulseem/ base, e.g. "AutoSendPlans.aspx" */
    path: string;
    /** Any extra query params to append after fromreact=true, e.g. "Culture=he-IL" */
    extraQuery?: string;
    classes?: any;
}

const isLocalHost = () => {
    if (typeof window === 'undefined') {
        return false;
    }

    return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
};

const LegacyPageRenderer: React.FC<{ src: string; title?: string; classes?: any }> = ({ src, title, classes }) => {
    return (
        <>
            <DefaultScreen
                subPage={''}
                currentPage='reports'
                classes={classes}
                containerClass={clsx(classes.management, classes.mb50)}>
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
            </DefaultScreen>
        </>
    );
};

/**
 * Renders a legacy .NET (.aspx) page inside a full-height iframe.
 * Uses `actionURL` from config so it correctly targets the .NET server
 * in both local development (REACT_APP_ACTION_URL) and production.
 */
const LegacyPageFrame: React.FC<LegacyPageFrameProps> = ({ path, extraQuery, classes }) => {
    const { search } = useLocation();
    const params = new URLSearchParams(search);
    params.delete('fromreact');
    const fromLocation = params.toString();
    const extra = [extraQuery, fromLocation].filter(Boolean).join('&');
    const qs = extra ? `&${extra}` : '';
    const src = `${iframeURL}${path}?fromreact=true${qs}`;
    // const src = `https://www.clients.stage.pulseem.co.il/Pulseem/${path}?fromreact=true${qs}`;

    return <LegacyPageRenderer title={path} src={src} classes={classes} />;
};

/**
 * Generic wildcard handler for routes matching /Pulseem/:aspxPage
 * Preserves the original query string (minus fromreact) so the .NET page
 * receives parameters like Culture, AutomationID etc.
 */
export const LegacyPageWild: React.FC = () => {
    const { aspxPage } = useParams<{ aspxPage: string }>();
    const { search } = useLocation();

    const params = new URLSearchParams(search);
    params.delete('fromreact');
    const extra = params.toString();
    const src = `${iframeURL}${aspxPage}?fromreact=true${extra ? `&${extra}` : ''}`;
    // const src = `https://www.clients.stage.pulseem.co.il/Pulseem/${aspxPage}?fromreact=true${extra ? `&${extra}` : ''}`;

    return <LegacyPageRenderer title={aspxPage} src={src} />;
};

export default LegacyPageFrame;
