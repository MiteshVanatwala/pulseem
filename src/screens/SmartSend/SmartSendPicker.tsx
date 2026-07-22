import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { Box, Typography, Button, Chip } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import DefaultScreen from '../DefaultScreen';
import useRedirect from '../../helpers/Routes/Redirect';
import { sitePrefix } from '../../config';
import { ClassesType } from '../Classes.types';
import { PulseemFeatures } from '../../model/PulseemFields/Fields';
import ChannelSelector from './components/ChannelSelector';
import CampaignPicker, { CampaignRow } from './components/CampaignPicker';

// Smart-Send picker (§7). Route: `${sitePrefix}SmartSend` — no :id, this is where the campaign
// is chosen. Step 1 channel → step 2 campaign → continue to the mapping screen at
// `${sitePrefix}Campaigns/SmartSend/:id`. The screen owns no server state of its own: the channel
// lives in smartSendSlice and the campaign list is fetched and owned by CampaignPicker.

const SmartSendPicker = ({ classes }: ClassesType) => {
    const { t } = useTranslation();
    const Redirect = useRedirect();
    const [searchParams] = useSearchParams();
    // Entry A (§11.2): ?dataSourceId= is carried through to the mapping screen untouched — that
    // screen is the only consumer (and validates it there). The one thing this screen does with
    // it is the purely informational "sending from source" chip below.
    const dataSourceId = searchParams.get('dataSourceId');

    const { accountFeatures } = useSelector((state: any) => state.common);
    const dataSourceList = useSelector((s: any) => s.dataSources.list);
    const [campaign, setCampaign] = useState<CampaignRow | null>(null);

    useEffect(() => {
        // `accountFeatures?.length &&` — the house precedent (DataSources.tsx:90,
        // DataSourceView.tsx:73), and all the feature gates must agree or the same user gets
        // bounced by one screen and admitted by another.
        // What the store actually does: `commonSlice.js:239` initialises accountFeatures to
        // `null`, and `:294` assigns `data?.Account?.AccountFeatures?.map(String)` on
        // getCommonFeatures.fulfilled — an array, or `undefined` when that payload carries no
        // AccountFeatures. There is NO `[]`-during-load state, so the load window is already
        // covered by plain falsiness; `?.length` is not what protects it.
        // What `?.length` adds is the empty array: an `[]` (or the `undefined` above) means the
        // features answer told us nothing, and we decline to evict the user on it — the route
        // guard and the API are the authoritative gates, and a wrong redirect here is
        // unrecoverable for the user while a wrong admission is not.
        if (accountFeatures?.length && accountFeatures.indexOf(PulseemFeatures.DATA_SOURCES) === -1) {
            // `sitePrefix` is `string | undefined` (it comes straight from process.env), so it
            // needs the same `?? ''` the other feature-gate redirects use — see
            // DataSources.tsx:91.
            Redirect({ url: sitePrefix ?? '', openNewTab: false });
        }
    }, [accountFeatures]);

    // Name of the source the user arrived from, for the informational chip. Resolved ONLY from
    // an already-loaded `dataSources.list` — this screen deliberately does not fetch it (the
    // mapping screen's SourcePicker owns that fetch), so on a cold entry the list is simply
    // absent. An unloaded list or an id that is not in it renders NOTHING: a bare numeric id is
    // meaningless to the user, and the chip carries no behaviour worth degrading for.
    const fromSourceName: string | null = useMemo(() => {
        const idNum = Number(dataSourceId);
        if (!dataSourceId || Number.isNaN(idNum) || idNum <= 0) return null;
        const items: any[] = dataSourceList?.items ?? [];
        return items.find((it: any) => it.DataSourceID === idNum)?.Name ?? null;
    }, [dataSourceId, dataSourceList]);

    const goToMapping = () => {
        if (!campaign) return;
        // No setChannel dispatch here: ChannelSelector already dispatches on every selection, and
        // the value would only be read back out of the same slice and written straight into it.
        // encodeURIComponent rather than raw interpolation: the value is passed straight through
        // from the address bar, so a stray '&' or '#' would otherwise rewrite the query we build.
        const query = dataSourceId ? `?dataSourceId=${encodeURIComponent(dataSourceId)}` : '';
        Redirect({ url: `${sitePrefix}Campaigns/SmartSend/${campaign.CampaignID}${query}`, openNewTab: false });
    };

    return (
        <DefaultScreen currentPage="groups" subPage="smartSend" classes={classes} containerClass={clsx(classes.management, classes.mb50)}>
            <Box style={{ padding: 16 }}>
                <Typography variant="h5" style={{ marginBottom: fromSourceName ? 8 : 24 }}>{t('DataSources.send.picker.title')}</Typography>

                {/* Entry A context (§11.2). Informational only — the source is not chosen here and
                    this chip changes nothing; it just tells the user which source the campaign they
                    are about to pick will be sent from. Rendered only when the name resolves. */}
                {fromSourceName && (
                    <Box style={{ marginBottom: 24 }}>
                        <Chip size="small" variant="outlined" label={t('DataSources.send.picker.fromSource', { name: fromSourceName })} />
                    </Box>
                )}

                {/* Step 1 — channel. Deliberately no `source` prop: no source is known on this
                    screen, so ChannelSelector simply omits the per-channel recipient counts. */}
                {/* display="block" — MUI v4 renders the `overline` variant as a <span>, which
                    would otherwise share its line with whatever follows. */}
                <Typography variant="overline" color="textSecondary" display="block">{t('DataSources.send.picker.step1')}</Typography>
                <ChannelSelector />

                {/* Step 2 — campaign. This heading is the section title: CampaignPicker renders
                    none of its own. It owns the fetch and its own loading / empty / no-results /
                    error states, exactly as SourcePicker does on the mapping screen. */}
                <Box style={{ marginTop: 24 }}>
                    <Typography variant="overline" color="textSecondary" display="block">{t('DataSources.send.picker.step2')}</Typography>
                    <CampaignPicker value={campaign?.CampaignID ?? null} onChange={setCampaign} />
                </Box>

                <Box style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginTop: 24, borderTop: '1px solid #e0e0e0', paddingTop: 18 }}>
                    <Button variant="contained" color="primary" disabled={!campaign} onClick={goToMapping}>
                        {t('DataSources.send.picker.continue')}
                    </Button>
                    {/* The chosen campaign can scroll out of view — or out of the filtered list
                        after a later search — so the CTA restates what is about to be sent. The
                        name alone carries it; no label key needed. */}
                    {campaign && <Chip label={campaign.Name} onDelete={() => setCampaign(null)} />}
                </Box>
            </Box>
        </DefaultScreen>
    );
};

export default SmartSendPicker;
