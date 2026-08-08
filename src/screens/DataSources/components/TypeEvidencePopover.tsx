import { useState } from 'react';
import {
    Box, Typography, Popover, IconButton, Select, MenuItem, FormControl
} from '@material-ui/core';
import { InfoOutlined } from '@material-ui/icons';
import { useTranslation } from 'react-i18next';
import { ColumnDetection } from '../../../Models/DataSources/DataSource';
import { eDataType } from '../../../Models/DataSources/DataSourceEnums';
import { isDetectionUncertain } from './columnTypeDetect';

interface TypeEvidencePopoverProps {
    detection: ColumnDetection | null | undefined;
    /** The type currently in effect — the detection's, or whatever the user changed it to. */
    value: eDataType;
    /** Types the user may switch to. Empty / single-entry ⇒ the change control is not rendered. */
    options: eDataType[];
    onChange: (dt: eDataType) => void;
    disabled?: boolean;
}

/**
 * The ℹ️ next to a column's type control.
 *
 * It shows the EVIDENCE, never the rule. "90% of values match Number" plus three of the user's own
 * values is something a person can check against the file in front of them; "a column is a number
 * when ≥90% of its non-empty cells parse as numeric" is a sentence about our implementation that
 * they cannot act on. So: percentage, counts, real samples, and a way to overrule us — nothing else.
 *
 * COLOUR IS THE WHOLE POINT of the icon. At 100% the guess is not interesting and the icon stays
 * quiet grey, because an icon that shouts on every column is an icon nobody reads. Between 85% and
 * 95% is exactly where the guess is most likely WRONG — enough cells fit to clear the threshold,
 * enough do not to mean something else is going on (a "n/a", a total row, a header repeated
 * mid-file) — so there it goes amber and asks to be opened.
 */
const TypeEvidencePopover = ({ detection, value, options, onChange, disabled }: TypeEvidencePopoverProps) => {
    const { t, i18n } = useTranslation();
    const isRtl = (i18n.dir?.() ?? 'rtl') === 'rtl';
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

    if (!detection) return null;

    const noEvidence = detection.total === 0;
    const uncertain = isDetectionUncertain(detection);
    // The user overruled us: the percentage still describes the DETECTED type, so say so instead of
    // implying "92% of your values are dates" about a type nobody detected.
    const overridden = detection.type !== value;
    const iconColor = uncertain && !overridden ? '#b54708' : '#98A2B3';

    const typeName = (dt: eDataType) => t(`DataSources.column.dataTypes.${dt}`);

    return (
        <>
            <IconButton
                size="small"
                aria-label={t('DataSources.column.typeEvidence.ariaLabel')}
                onClick={(e) => setAnchorEl(e.currentTarget)}
                style={{ padding: 2, color: iconColor }}
            >
                <InfoOutlined style={{ fontSize: 17 }} />
            </IconButton>
            <Popover
                open={!!anchorEl}
                anchorEl={anchorEl}
                onClose={() => setAnchorEl(null)}
                // anchorOrigin is a PROP, not CSS: jss-rtl never mirrors it and MUI v4's Popover has
                // no direction handling of its own, so the START edge has to be chosen by hand or the
                // panel opens off the field in en/pl. Same rule as every Select in this folder.
                anchorOrigin={{ vertical: 'bottom', horizontal: isRtl ? 'right' : 'left' }}
                transformOrigin={{ vertical: 'top', horizontal: isRtl ? 'right' : 'left' }}
                PaperProps={{ style: { padding: 14, maxWidth: 320 } }}
            >
                <Box dir={isRtl ? 'rtl' : 'ltr'} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <Typography style={{ fontWeight: 700, color: '#344054' }}>
                        {t('DataSources.column.typeEvidence.title')}
                    </Typography>

                    {noEvidence ? (
                        <Typography style={{ fontSize: 13, color: '#5b6b7b' }}>
                            {t('DataSources.column.typeEvidence.noEvidence')}
                        </Typography>
                    ) : (
                        <>
                            <Typography style={{ fontSize: 13, color: uncertain ? '#b54708' : '#344054' }}>
                                {t('DataSources.column.typeEvidence.match', {
                                    pct: detection.confidence,
                                    type: typeName(detection.type)
                                })}
                            </Typography>
                            <Typography style={{ fontSize: 12, color: '#5b6b7b' }}>
                                {t('DataSources.column.typeEvidence.counts', {
                                    matched: detection.matched,
                                    total: detection.total
                                })}
                            </Typography>
                            {detection.samples.length > 0 && (
                                <Box>
                                    <Typography style={{ fontSize: 12, color: '#5b6b7b', marginBottom: 2 }}>
                                        {t('DataSources.column.typeEvidence.samples')}
                                    </Typography>
                                    {/* The user's own values. direction:'ltr' because a phone, an
                                        amount or an email is never Hebrew and would otherwise be
                                        reordered on screen — the idiom from DataSources.tsx:322. */}
                                    {detection.samples.map((s, i) => (
                                        <Typography key={i} style={{ fontSize: 12.5, fontFamily: 'monospace', direction: 'ltr', textAlign: isRtl ? 'right' : 'left', color: '#344054' }}>
                                            {s}
                                        </Typography>
                                    ))}
                                </Box>
                            )}
                            {uncertain && !overridden && (
                                <Typography style={{ fontSize: 12, color: '#b54708' }}>
                                    {t('DataSources.column.typeEvidence.lowConfidence')}
                                </Typography>
                            )}
                            {overridden && (
                                <Typography style={{ fontSize: 12, color: '#5b6b7b' }}>
                                    {t('DataSources.column.typeEvidence.overridden', { type: typeName(value) })}
                                </Typography>
                            )}
                        </>
                    )}

                    {options.length > 1 && (
                        <Box>
                            <Typography style={{ fontSize: 12, color: '#5b6b7b', marginBottom: 4 }}>
                                {t('DataSources.column.typeEvidence.changeType')}
                            </Typography>
                            <FormControl variant="outlined" size="small" fullWidth>
                                <Select
                                    value={value}
                                    disabled={!!disabled}
                                    style={{ fontSize: 14 }}
                                    MenuProps={{
                                        getContentAnchorEl: null,
                                        anchorOrigin: { vertical: 'bottom', horizontal: isRtl ? 'right' : 'left' },
                                        transformOrigin: { vertical: 'top', horizontal: isRtl ? 'right' : 'left' }
                                    }}
                                    onChange={(e) => {
                                        // Grouped-select guard kept even though this list is flat:
                                        // MUI v4 clones every child with its own onClick, so any node
                                        // that is not an option fires onChange with an undefined
                                        // value, and Number(undefined) would put NaN in DataType.
                                        if (e.target.value === undefined) return;
                                        onChange(Number(e.target.value) as eDataType);
                                    }}
                                >
                                    {options.map(o => <MenuItem key={o} value={o}>{typeName(o)}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Box>
                    )}
                </Box>
            </Popover>
        </>
    );
};

export default TypeEvidencePopover;
