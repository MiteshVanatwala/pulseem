// ═══════════════════════════════════════════════════════════════════════════════════════════
// EmailPreviewDialog — "צפה במייל שנשלח" (CONTRACT §1).
//
// TARGET PATH: ReactCode\src\screens\SendSearch\components\EmailPreviewDialog.tsx
//
// This is an IFRAME over the existing `PreviewCampaign.aspx`, not a client-side merge (LEDGER #1).
// The page already renders per-agent (`:71` security-checked fetch, `:87` SmartSendLoad, `:127`
// ReplacePlaceHolders, `:136` AttachProductsForClient); a second renderer in the browser would know
// less than the first and would drift from it, and every drift would be an invented email presented
// as a record of what was sent.
//
// The URL is minted SERVER-SIDE and arrives on the row as `PreviewUrl`. This component never builds
// one, never appends a query parameter, and never renders an iframe whose src it did not receive:
//   • `PreviewUrl == null` ⇒ the BUTTON is disabled (AgentDrawer) and this dialog is not reachable;
//   • if it is somehow opened with no URL anyway, it renders the explanation, NOT an iframe.
//     `<iframe src="">` loads the HOSTING page inside itself — the operator would see the report
//     nested in the report and read it as "this is the email".
// `noTrack=1` is already on the URL (server side): without it every manager who opened this dialog
// marked the agent as having opened the mail and overwrote their IP/User-Agent — the report would
// have been changing the data it reports (LEDGER #2), and the injected capture listener neutralises
// every link so the manager cannot unsubscribe the agent by clicking around inside (LEDGER #4).
// ═══════════════════════════════════════════════════════════════════════════════════════════

import React from 'react';
import {
    Box, Dialog, DialogContent, DialogTitle, IconButton, Typography,
} from '@material-ui/core';
import { Close } from '@material-ui/icons';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import { DateFormats } from '../../../helpers/Constants';
import { SS } from '../../../Models/DataSources/SendSearch';
import VersionBadge from './VersionBadge';

interface Props {
    open: boolean;
    onClose: () => void;
    // Already validated by `previewUrlOf` at the call site. Null is still handled here rather than
    // trusted away: this component is the last thing between a null and an <iframe>.
    url: string | null;
    recipientName: string;
    recipientEmail: string;
    sentAt: string | null;
    VersionNumber: number | null;
    ProvenanceSource: string;
    VersionState: string;
}

const EmailPreviewDialog: React.FC<Props> = ({
    open, onClose, url, recipientName, recipientEmail, sentAt,
    VersionNumber, ProvenanceSource, VersionState,
}) => {
    const { t, i18n } = useTranslation();
    // Same idiom as DataSources.tsx:113 — fallback 'rtl', Hebrew is the default locale.
    const isRtl = (i18n.dir?.() ?? 'rtl') === 'rtl';

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            aria-labelledby="sendsearch-preview-title"
            // ~80vh, as specified. `PaperProps` rather than a class: this file may not add a
            // stylesheet, and the height has to reach the Paper, not the content.
            PaperProps={{ style: { height: '80vh', maxHeight: '80vh' } }}
        >
            <DialogTitle id="sendsearch-preview-title" disableTypography style={{ paddingBottom: 8 }}>
                <Box style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <Box style={{ flex: 1, minWidth: 0 }}>
                        <Typography component="div" style={{ fontSize: 17, fontWeight: 800 }}>
                            {t(`${SS}preview.title`)}
                        </Typography>
                        {/* WHO / WHEN / WHICH VERSION — the three facts that make this a record rather
                            than a rendering. The contact line and the timestamp are forced LTR
                            (an address and a 24h clock reorder under RTL), and `textAlign` is branched
                            because `direction:'ltr'` makes `start` resolve to LEFT. */}
                        <Typography
                            component="div"
                            style={{
                                fontSize: 13, color: '#5b6b7b', marginTop: 4,
                                direction: 'ltr', textAlign: isRtl ? 'right' : 'left',
                                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                            }}
                        >
                            {[recipientName, recipientEmail].filter((v) => !!v).join(' · ')}
                        </Typography>
                        <Box style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginTop: 6 }}>
                            <Typography component="span" style={{ fontSize: 13, color: '#5b6b7b', direction: 'ltr' }}>
                                {sentAt ? moment(sentAt).format(DateFormats.DATE_TIME_24) : '—'}
                            </Typography>
                            {/* The version travels with the mail, never in a separate tab: "which
                                version" and "what did it look like" are one answer. Never blank. */}
                            <VersionBadge
                                VersionNumber={VersionNumber}
                                ProvenanceSource={ProvenanceSource}
                                VersionState={VersionState}
                            />
                        </Box>
                    </Box>
                    <IconButton size="small" onClick={onClose} aria-label={t(`${SS}preview.close`)}>
                        <Close fontSize="small" />
                    </IconButton>
                </Box>
            </DialogTitle>

            <DialogContent style={{ padding: 0, display: 'flex', flexDirection: 'column' }}>
                {/* Fixed-height, horizontally scrollable frame host. Sent HTML is table-based and
                    routinely wider than a dialog; `overflow-x:auto` lets the operator scroll to the
                    right-hand column instead of seeing it clipped and concluding the mail was
                    malformed. The height is fixed (flex:1 inside an 80vh Paper) because an iframe
                    with no height collapses to 150px in every browser. */}
                <Box
                    style={{
                        flex: 1, minHeight: 0, overflowX: 'auto', overflowY: 'hidden',
                        background: '#f4f6f8', borderTop: '1px solid #e0e0e0',
                    }}
                >
                    {url ? (
                        <iframe
                            src={url}
                            title={t(`${SS}preview.frameTitle`)}
                            style={{ display: 'block', width: '100%', height: '100%', minWidth: 640, border: 0, background: '#fff' }}
                        />
                    ) : (
                        // Never an empty frame. An `<iframe src="">` loads the hosting document, so
                        // the operator would be looking at the report inside the report and would
                        // read it as the email. This branch should be unreachable — the button is
                        // disabled without a URL — and it exists because "should be" is not "is".
                        <Box style={{ padding: 24 }}>
                            <Typography component="div" style={{ fontSize: 14, color: '#B42318', fontWeight: 700 }}>
                                {t(`${SS}preview.disabled`)}
                            </Typography>
                        </Box>
                    )}
                </Box>

                {/* States what the operator is looking at: a non-tracking render whose links do
                    nothing. Without it a manager clicking "הסר מרשימת התפוצה" inside the frame would
                    assume it worked — or assume it did not and click again elsewhere. */}
                <Typography
                    component="div"
                    style={{ fontSize: 12, color: '#5b6b7b', padding: '8px 16px', borderTop: '1px solid #e0e0e0' }}
                >
                    {t(`${SS}preview.noTrackNote`)}
                </Typography>
            </DialogContent>
        </Dialog>
    );
};

export default EmailPreviewDialog;
