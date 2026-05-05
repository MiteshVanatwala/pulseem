import React, { useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { actionURL } from '../../config';
import DefaultScreen from '../DefaultScreen';
import clsx from 'clsx';

interface LegacyPageFrameProps {
    /** The .aspx page path relative to the /Pulseem/ base, e.g. "AutoSendPlans.aspx" */
    path: string;
    /** Any extra query params to append after fromreact=true, e.g. "Culture=he-IL" */
    extraQuery?: string;
    classes?: any;
}

const LegacyPageRenderer: React.FC<{ src: string; title?: string; classes?: any }> = ({ src, title, classes }) => {
    useEffect(() => {
        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            // Show browser-native confirmation before this screen unloads.
            event.preventDefault();
            event.returnValue = '';
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);

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
const buildLegacySrc = (path: string, routeParams: any, search: string, extraQuery?: string) => {
    const searchParams = new URLSearchParams(search);
    searchParams.delete('fromreact');
    searchParams.delete('iframe');
    searchParams.delete('isiframe');

    // Start building the query part with the "Magic Switches"
    const queryParts: string[] = ['fromreact=true', 'iframe=true', 'isiframe=1'];

    // Add Route Params (e.g. :id, :campaignID)
    Object.entries(routeParams).forEach(([key, value]) => {
        if (value && key !== 'aspxPage') {
            queryParts.push(`${key}=${value}`);
        }
    });

    // Add browser search params (Culture etc.)
    const searchStr = searchParams.toString();
    if (searchStr) {
        queryParts.push(searchStr);
    }

    // Add extraQuery if provided
    if (extraQuery) {
        queryParts.push(extraQuery);
    }

    const separator = path.includes('?') ? '&' : '?';
    return `${actionURL}${path}${separator}${queryParts.join('&')}`;
};

/**
 * Renders a legacy .NET (.aspx) page inside a full-height iframe.
 * Uses `actionURL` from config and appends all query strings/parameters.
 */
const LegacyPageFrame: React.FC<LegacyPageFrameProps> = ({ path, extraQuery, classes }) => {
    const routeParams = useParams();
    const { search } = useLocation();

    const src = buildLegacySrc(path, routeParams, search, extraQuery);

    return <LegacyPageRenderer title={path} src={src} classes={classes} />;
};

/**
 * Generic wildcard handler for routes matching /Pulseem/:aspxPage
 * Preserves the original query string and path parameters.
 */
export const LegacyPageWild: React.FC = () => {
    const { aspxPage } = useParams<{ aspxPage: string }>();
    const routeParams = useParams();
    const { search } = useLocation();

    const src = buildLegacySrc(aspxPage || '', routeParams, search);

    return <LegacyPageRenderer title={aspxPage} src={src} />;
};

export default LegacyPageFrame;

