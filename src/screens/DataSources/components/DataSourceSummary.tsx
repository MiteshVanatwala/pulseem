import { useMemo } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography, Grid, Divider
} from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import {
    DataSourceDetails, ResultsJson, ResultsJsonChannel,
    DataSourceColumn, ClientFieldOption, CLIENT_FIELD_CATALOGUE
} from '../../../Models/DataSources/DataSource';
import { useDsDialogStyles } from './dialogStyles';

interface DataSourceSummaryProps {
    classes: { [key: string]: string };
    open: boolean;
    details: DataSourceDetails | null;
    /**
     * [CFT] The active version's columns, so the summary can state which recipient fields the
     * operator asked to update. Optional: a caller that has not got them yet renders the summary
     * exactly as it did before, and a client running ahead of the SQL script gets columns whose
     * ClientFieldTarget is `undefined` — both collapse to "no write-backs" rather than to a crash.
     */
    columns?: DataSourceColumn[];
    /**
     * [CFT] The account's own names for ExtraField1..13 / ExtraDate1..4 (Account/GetExtraFields).
     * Optional for the same reason it is optional in the wizard: without it the extra-field targets
     * fall back to their physical slot name ("שדה נוסף 3") instead of the account's label. Degraded
     * but never wrong, and never a bare id.
     */
    extraFieldOptions?: ClientFieldOption[];
    onClose: () => void;
}

// Same tokens the wizard / list already use, kept local so the summary matches the feature without a theme change.
const BORDER = '#e3ebf3';
const ROW_LINE = '#eef3f8';
const PANEL_BG = '#f6f9fc';
const TEXT_STRONG = '#344054';
const TEXT_MUTED = '#5b6b7b';
const TEXT_QUIET = '#a9bdd4';

// Per-channel upload summary. ResultsJson is parsed defensively (any missing field renders '—'), so a
// malformed or partial blob never crashes the dialog. truncatedCells is shown only when > 0.
const DataSourceSummary = ({ classes, open, details, columns, extraFieldOptions, onClose }: DataSourceSummaryProps) => {
    const { t, i18n } = useTranslation();
    const isRtl = (i18n.dir?.() ?? 'rtl') === 'rtl';
    const dsDialog = useDsDialogStyles();

    const parsed: ResultsJson = useMemo(() => {
        if (!details?.ResultsJson) return {};
        // Guard valid-but-non-object JSON too (e.g. the literal "null" from a serialized null object).
        try { const p = JSON.parse(details.ResultsJson); return (p && typeof p === 'object') ? (p as ResultsJson) : {}; } catch { return {}; }
    }, [details]);

    /* [CFT] The write-backs the operator asked for, resolved for display.
       WHY THIS EXISTS: until now the ONLY place a mapping was ever visible was step 3 of the upload
       wizard — a dialog that is closed by the time this summary opens. An operator who mapped a
       column and then wanted to check what they had done had no surface anywhere in the product
       that would tell them, and the mutation this describes has no undo.
       Ordered by the file's own column order (Ordinal), not by field id: the operator reviews this
       against the spreadsheet in front of them, and the spreadsheet is in column order.
       An unresolvable target — a mapping to an extra-field slot the account has since un-named, or
       a client that has the id but not the catalogue — is DROPPED rather than rendered as a bare
       number. `extraFieldSlot`/`extraDateSlot` already give every extra id a physical fallback name,
       so in practice only a target outside the known ranges disappears, and one of those is a bug
       upstream, not something to surface here. */
    /* [CFT] Can this dialog even ANSWER the question? Only if the API sent the field.
       The read path did not carry ClientFieldTarget until the DataSources_Get / _GetRows scripts are
       deployed, and a client running ahead of them receives columns with the property ABSENT — not
       null. Without this check the empty state would state, flatly, "no client-field update was
       requested in this upload" for every source in the product during that window, including ones
       that requested several. Asserting that is worse than saying nothing: it is the same silent
       wrong answer this whole section exists to remove.
       `in`, not a null-check, is what separates the two: the API's global serializer keeps nulls
       (NullValueHandling.Ignore appears only in WhatsApp-local serializers), so an unmapped column
       arrives as `ClientFieldTarget: null` and a pre-script API omits the key entirely. */
    const targetsKnown = (columns ?? []).some(c => 'ClientFieldTarget' in c);

    const clientFieldMappings = useMemo(() => {
        const catalogue: ClientFieldOption[] = [...CLIENT_FIELD_CATALOGUE, ...(extraFieldOptions ?? [])];
        return (columns ?? [])
            .filter(c => c.ClientFieldTarget != null)
            .slice()
            .sort((a, b) => a.Ordinal - b.Ordinal)
            .map(c => {
                const id = c.ClientFieldTarget as number;
                const opt = catalogue.find(o => o.Id === id);
                // Same qualifier the wizard's review box uses: an account may name an extra field
                // exactly like a built-in one, and then the label alone does not identify the CRM
                // column that was overwritten.
                const slot = (id >= 101 && id <= 113) ? { key: 'extraFieldSlot', n: id - 100 }
                    : (id >= 201 && id <= 204) ? { key: 'extraDateSlot', n: id - 200 }
                        : null;
                const base = opt?.AccountLabel
                    ? opt.AccountLabel
                    : opt?.LabelKey ? t(`DataSources.wizard.clientFields.${opt.LabelKey}`)
                        : slot ? '' : null;
                if (base === null) return null;
                const qualifier = slot ? t(`DataSources.wizard.${slot.key}`, { n: slot.n }) : '';
                // trim(), because a recipient target has no qualifier and would otherwise carry a
                // trailing space into a bold label — visible in RTL as a gap before the divider.
                return { id, column: c.DisplayName, field: `${base} ${qualifier}`.trim() };
            })
            .filter((m): m is { id: number; column: string; field: string } => m != null);
    }, [columns, extraFieldOptions, t]);

    const num = (v: number | undefined | null) => (v === undefined || v === null) ? '—' : v.toLocaleString();
    // Zero / missing figures are dimmed so the numbers that actually say something carry the eye.
    const quiet = (v: number | undefined | null) => v === undefined || v === null || v === 0;

    // Headline figure: big number with its caption directly underneath, so it reads as a KPI instead of a
    // full-width row whose value ends up flung to the far edge of the dialog.
    const renderTotal = (label: string, value: number | undefined | null) => (
        <Grid item xs={6}>
            <Box style={{ background: PANEL_BG, border: `1px solid ${BORDER}`, borderRadius: 8, padding: '10px 14px', height: '100%' }}>
                <Typography style={{ fontSize: 26, fontWeight: 700, lineHeight: 1.25, color: quiet(value) ? TEXT_QUIET : TEXT_STRONG }}>{num(value)}</Typography>
                <Typography style={{ fontSize: 15, color: TEXT_MUTED }}>{label}</Typography>
            </Box>
        </Grid>
    );

    // Label and value stay paired inside the (half-width) channel card: the value keeps its own narrow
    // column so the five figures line up, and the hairline carries the eye from label to number.
    const renderMetric = (label: string, value: number | undefined | null, last?: boolean) => (
        <Box style={{ display: 'flex', alignItems: 'baseline', padding: '7px 0', borderBottom: last ? undefined : `1px solid ${ROW_LINE}` }}>
            <Typography style={{ flex: 1, minWidth: 0, color: TEXT_MUTED }}>{label}</Typography>
            <Typography style={{ flexShrink: 0, minWidth: 40, marginInlineStart: 12, textAlign: 'end', fontSize: 18, fontWeight: 700, color: quiet(value) ? TEXT_QUIET : TEXT_STRONG }}>{num(value)}</Typography>
        </Box>
    );

    const renderChannel = (title: string, ch?: ResultsJsonChannel) => (
        <Grid item xs={12} sm={6}>
            <Box style={{ border: `1px solid ${BORDER}`, borderRadius: 8, height: '100%', overflow: 'hidden' }}>
                <Box style={{ background: PANEL_BG, borderBottom: `1px solid ${BORDER}`, padding: '8px 14px' }}>
                    <Typography style={{ fontWeight: 700, color: TEXT_STRONG }}>{title}</Typography>
                </Box>
                <Box style={{ padding: '2px 14px 6px' }}>
                    {renderMetric(t('DataSources.summary.matched'), ch?.matched)}
                    {renderMetric(t('DataSources.summary.created'), ch?.created)}
                    {renderMetric(t('DataSources.summary.notFound'), ch?.notFound)}
                    {renderMetric(t('DataSources.summary.duplicates'), ch?.duplicates)}
                    {renderMetric(t('DataSources.summary.noValue'), ch?.noValue, true)}
                </Box>
            </Box>
        </Grid>
    );

    return (
        // Reactive dir, not hardcoded "rtl" — see UploadWizardDialog.tsx for why the attribute is
        // mandatory on a portalled Dialog and why hardcoding it broke en/pl.
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" dir={isRtl ? 'rtl' : 'ltr'} scroll="body" PaperProps={{ className: dsDialog.paper }}>
            <DialogTitle>{t('DataSources.summary.title')}</DialogTitle>
            <DialogContent style={{ overflowY: 'visible', height: 'auto' }}>
                <Grid container spacing={2}>
                    {renderTotal(t('DataSources.summary.totalRows'), details?.TotalRows ?? (parsed.rows ? parsed.rows.total : undefined))}
                    {renderTotal(t('DataSources.summary.noIdentity'), details?.NoIdentityRows)}
                </Grid>
                {/* 20px, not 10 — the Grid gutters above and below eat 8px of it each. */}
                <Divider style={{ margin: '20px 0' }} />
                <Grid container spacing={2}>
                    {renderChannel(t('DataSources.summary.emailSection'), parsed.email)}
                    {renderChannel(t('DataSources.summary.cellSection'), parsed.cell)}
                </Grid>
                {/* [CFT] The recipient-record write-backs. Rendered UNCONDITIONALLY — the empty state is
                    the whole point of the section. "which fields did I ask to update" is a question an
                    operator asks precisely when they are not sure they mapped anything, and a section
                    that hides itself when the answer is "none" answers that question with silence, which
                    is indistinguishable from the section not existing. It also renders when `columns` was
                    not supplied at all, which is deliberately the same message: this dialog cannot tell
                    "nothing was mapped" apart from "nobody told me", and claiming the stronger one would
                    be a guess about a mutation with no undo.
                    Wording is "asked to update", not "updated": what is provably known here is the
                    operator's REQUEST. Whether each field was actually written depends on the engine —
                    clientsUpdated below is the figure that answers that, and it is the one to read. */}
                <Box style={{ marginTop: 16, border: `1px solid ${BORDER}`, borderRadius: 8, overflow: 'hidden' }}>
                    <Box style={{ background: PANEL_BG, borderBottom: `1px solid ${BORDER}`, padding: '8px 14px' }}>
                        <Typography style={{ fontWeight: 700, color: TEXT_STRONG }}>{t('DataSources.summary.clientFieldsTitle')}</Typography>
                    </Box>
                    <Box style={{ padding: '2px 14px 8px' }}>
                        {clientFieldMappings.length === 0 ? (
                            // Two different empty states, deliberately: "none were requested" is a claim,
                            // "this version cannot tell you" is an admission. See targetsKnown above.
                            <Typography style={{ padding: '7px 0', color: TEXT_QUIET }}>
                                {t(targetsKnown ? 'DataSources.summary.clientFieldsNone' : 'DataSources.summary.clientFieldsUnknown')}
                            </Typography>
                        ) : (
                            <>
                                {clientFieldMappings.map((m, i) => (
                                    <Box key={m.id} style={{ display: 'flex', alignItems: 'baseline', padding: '7px 0', borderBottom: i === clientFieldMappings.length - 1 ? undefined : `1px solid ${ROW_LINE}` }}>
                                        <Typography style={{ flex: 1, minWidth: 0, fontWeight: 700, color: TEXT_STRONG }}>{m.field}</Typography>
                                        <Typography style={{ flexShrink: 0, marginInlineStart: 12, textAlign: 'end', color: TEXT_MUTED }}>
                                            {t('DataSources.summary.clientFieldsFromColumn', { column: m.column })}
                                        </Typography>
                                    </Box>
                                ))}
                                {/* The reality check next to the request. Sourced from ResultsJson.clientsUpdated,
                                    which the engine has always emitted. Counts UPDATEs only, so a file that only
                                    CREATED recipients legitimately reports 0 while having written every mapped
                                    field — hence the caption naming updates specifically, and hence this sitting
                                    under the created/matched figures above rather than replacing them. */}
                                <Box style={{ display: 'flex', alignItems: 'baseline', paddingTop: 8, marginTop: 2, borderTop: `1px solid ${ROW_LINE}` }}>
                                    <Typography style={{ flex: 1, minWidth: 0, color: TEXT_MUTED }}>{t('DataSources.summary.clientsUpdated')}</Typography>
                                    <Typography style={{ flexShrink: 0, minWidth: 40, marginInlineStart: 12, textAlign: 'end', fontSize: 18, fontWeight: 700, color: quiet(parsed.clientsUpdated) ? TEXT_QUIET : TEXT_STRONG }}>{num(parsed.clientsUpdated)}</Typography>
                                </Box>
                            </>
                        )}
                    </Box>
                </Box>
                {typeof parsed.truncatedCells === 'number' && parsed.truncatedCells > 0 && (
                    <Box style={{ display: 'flex', alignItems: 'baseline', marginTop: 16, padding: '8px 14px', background: '#fff4e5', border: '1px solid #f5d9b0', borderRadius: 8 }}>
                        <Typography style={{ color: '#b54708' }}>{t('DataSources.summary.truncated')}</Typography>
                        <Typography style={{ fontSize: 18, fontWeight: 700, color: '#b54708', marginInlineStart: 10 }}>{num(parsed.truncatedCells)}</Typography>
                    </Box>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>{t('common.close')}</Button>
            </DialogActions>
        </Dialog>
    );
};

export default DataSourceSummary;
