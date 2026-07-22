import React, { useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Typography, Chip, Tooltip } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Email, Sms, WhatsApp } from '@material-ui/icons';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { CHANNELS, eSendChannel, ChannelDescriptor } from '../../../Models/DataSources/SmartSend';
import { setChannel, selectResolvedCountForChannel } from '../../../redux/reducers/smartSendSlice';

// Channel selector (§12.2). Email active + default-selected; SMS/WhatsApp are visually
// present but disabled with a "בקרוב" chip + tooltip. EVERYTHING is driven by the CHANNELS
// descriptor (Models/DataSources/SmartSend.ts) — no channel field name is hardcoded here, so
// flipping enabled:false→true on a descriptor row lights up the whole UI flow with NO change
// in this file (the M7 flip-readiness acceptance). Channel-dependent numbers are read via the
// descriptor field NAMES (resolvedCountField / identityFlag), never a channel-specific literal.
// a11y: a real radiogroup (roving tabindex, arrow keys, Enter/Space), RTL-aware.

const ICONS: { [k: string]: any } = { email: Email, sms: Sms, whatsapp: WhatsApp };

const useStyles = makeStyles((theme) => ({
    group: { display: 'flex', flexWrap: 'wrap', gap: theme.spacing(2), marginTop: theme.spacing(1) },
    option: {
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        boxSizing: 'border-box', minWidth: 150, padding: theme.spacing(2), borderRadius: 8,
        border: '2px solid #e0e0e0', cursor: 'pointer', outline: 'none', userSelect: 'none',
        transition: 'border-color .15s, box-shadow .15s, background .15s',
        '&:hover': { borderColor: theme.palette.primary.light },
        // Visible keyboard focus (§ה a11y): keep it on both :focus and :focus-visible.
        '&:focus, &:focus-visible': { boxShadow: `0 0 0 3px ${theme.palette.primary.light}` },
    },
    selected: { borderColor: theme.palette.primary.main, background: 'rgba(0, 0, 0, 0.02)' },
    disabled: {
        cursor: 'not-allowed', opacity: 0.55,
        '&:hover': { borderColor: '#e0e0e0' },
        // A disabled option must never look actionable: strip the focus ring (it is
        // still mouse-focusable via tabIndex -1; onMouseDown-preventDefault below also
        // blocks that focus, this is belt-and-suspenders).
        '&:focus, &:focus-visible': { boxShadow: 'none' },
    },
    icon: { fontSize: 34, marginBottom: theme.spacing(0.5) },
    label: { fontWeight: 600 },
    hint: { marginTop: theme.spacing(0.5), textAlign: 'center' },
    chip: { marginTop: theme.spacing(0.5) },
    // MUI v4 Tooltip cannot attach to a disabled/non-interactive target — wrap in a <span>.
    tooltipSpan: { display: 'inline-flex' },
    // Visually-hidden text: carries the coming-soon reason to screen readers via
    // aria-describedby, since a disabled (tabIndex -1) option's hover Tooltip is
    // keyboard-unreachable and the Chip is not part of the accessible name.
    srOnly: {
        position: 'absolute', width: 1, height: 1, padding: 0, margin: -1,
        overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap', border: 0,
    },
}));

interface Props {
    // OPTIONAL. The selected source row (dataSources GetMany shape) — when present, per-channel
    // recipient counts + the "no cellphone column" hint light up. The picker screen renders this
    // selector BEFORE any source is known and passes nothing at all; in that case those two
    // source-derived extras are simply omitted and everything else (selection, keyboard a11y,
    // coming-soon chips) behaves identically. Defaulted to null so `undefined` and "no source"
    // are one case for every guard below.
    source?: any;
}

const ChannelSelector: React.FC<Props> = ({ source = null }) => {
    const classes = useStyles();
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const selectedChannel = useSelector((s: any) => s.smartSend.selectedChannel) as eSendChannel;
    const optionRefs = useRef<Array<HTMLDivElement | null>>([]);

    const enabledIdx = CHANNELS.reduce<number[]>((acc, c, i) => (c.enabled ? [...acc, i] : acc), []);

    const select = (c: ChannelDescriptor) => { if (c.enabled) dispatch(setChannel(c.channel)); };

    // Move focus+selection to the next/prev ENABLED channel (roving tabindex radiogroup).
    const moveFocus = (fromIdx: number, dir: 1 | -1) => {
        if (!enabledIdx.length) return;
        const pos = enabledIdx.indexOf(fromIdx);
        const nextIdx = enabledIdx[(pos + dir + enabledIdx.length) % enabledIdx.length];
        optionRefs.current[nextIdx]?.focus();
        dispatch(setChannel(CHANNELS[nextIdx].channel));
    };

    const onKeyDown = (e: React.KeyboardEvent, idx: number, c: ChannelDescriptor) => {
        if (!c.enabled) return;
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(c); return; }
        // RTL horizontal group: ArrowLeft = next (visual flow right→left), ArrowRight = prev.
        if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') { e.preventDefault(); moveFocus(idx, 1); }
        else if (e.key === 'ArrowUp' || e.key === 'ArrowRight') { e.preventDefault(); moveFocus(idx, -1); }
    };

    return (
        <Box>
            <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
                {t('DataSources.send.channel.title')}
            </Typography>
            <Box className={classes.group} role="radiogroup" aria-label={t('DataSources.send.channel.selectAria')}>
                {CHANNELS.map((c, idx) => {
                    const Icon = ICONS[c.icon] || Email;
                    const isSelected = c.channel === selectedChannel;
                    const hasIdentity = source ? !!source[c.identityFlag] : true;
                    const count = source ? selectResolvedCountForChannel(source, c.channel) : null;
                    const showCount = source != null && (c.enabled || hasIdentity);
                    const tooltip = c.enabled
                        ? ''
                        : (source && !hasIdentity
                            ? t('DataSources.send.channel.comingSoonNoCell')
                            : t('DataSources.send.channel.comingSoonTooltip'));

                    const option = (
                        <div
                            ref={(el) => { optionRefs.current[idx] = el; }}
                            className={clsx(classes.option, isSelected && classes.selected, !c.enabled && classes.disabled)}
                            role="radio"
                            aria-checked={isSelected}
                            aria-disabled={c.enabled ? undefined : true}
                            aria-label={t(c.labelKey)}
                            aria-describedby={!c.enabled ? `smartsend-chan-desc-${c.channel}` : undefined}
                            tabIndex={c.enabled ? (isSelected ? 0 : -1) : -1}
                            data-channel={c.channel}
                            // Disabled options: don't grab focus on mouse-down (they are
                            // non-actionable — no focus ring, no focus theft).
                            onMouseDown={c.enabled ? undefined : (e) => e.preventDefault()}
                            onClick={() => select(c)}
                            onKeyDown={(e) => onKeyDown(e, idx, c)}
                        >
                            <Icon className={classes.icon} color={isSelected ? 'primary' : 'inherit'} />
                            <Typography className={classes.label}>{t(c.labelKey)}</Typography>
                            {c.comingSoon && (
                                <Chip size="small" label={t('DataSources.send.channel.comingSoon')} className={classes.chip} />
                            )}
                            {showCount && count != null && (
                                <Typography variant="caption" color="textSecondary" className={classes.hint}>
                                    {t('DataSources.send.channel.recipientsAvailable', { count })}
                                </Typography>
                            )}
                            {/* SR-only reason (a11y): mirrors the hover Tooltip for keyboard/AT users. */}
                            {!c.enabled && (
                                <span id={`smartsend-chan-desc-${c.channel}`} className={classes.srOnly}>{tooltip}</span>
                            )}
                        </div>
                    );

                    // Disabled channels: wrap in a <span> so the coming-soon Tooltip attaches
                    // (MUI v4). Enabled channels render bare (no tooltip needed).
                    return c.enabled
                        ? <React.Fragment key={c.channel}>{option}</React.Fragment>
                        : (
                            <Tooltip key={c.channel} title={tooltip}>
                                <span className={classes.tooltipSpan}>{option}</span>
                            </Tooltip>
                        );
                })}
            </Box>
        </Box>
    );
};

export default ChannelSelector;
