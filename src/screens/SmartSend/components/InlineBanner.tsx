import React from 'react';
import { Box, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Warning, InfoOutlined, NewReleases } from '@material-ui/icons';

// Small inline notice used by the SmartSend banners (stale version, mapping mismatch)
// and inline warnings. MUI v4 core only (no @material-ui/lab Alert dependency), RTL-safe
// (flex + logical gap), theme-aware colors. role="status" (polite) or "alert" (assertive).

const SEVERITY = {
    info: { bg: '#e8f0fe', border: '#b3d1ff', color: '#1a56db', Icon: InfoOutlined },
    warning: { bg: '#fff8e1', border: '#ffe082', color: '#b7791f', Icon: NewReleases },
    error: { bg: '#fdecea', border: '#f5c6cb', color: '#c0392b', Icon: Warning },
};

const useStyles = makeStyles((theme) => ({
    banner: {
        display: 'flex', alignItems: 'flex-start', gap: theme.spacing(1),
        padding: theme.spacing(1.5, 2), borderRadius: 6, marginBottom: theme.spacing(2),
        border: '1px solid',
    },
    icon: { marginTop: 2, flexShrink: 0 },
    text: { flex: 1, minWidth: 0 },
    title: { fontWeight: 600 },
    action: { flexShrink: 0, alignSelf: 'center' },
}));

interface Props {
    severity: 'info' | 'warning' | 'error';
    title: string;
    body: string;
    role?: 'status' | 'alert';
    action?: React.ReactNode;
}

const InlineBanner: React.FC<Props> = ({ severity, title, body, role = 'status', action }) => {
    const classes = useStyles();
    const s = SEVERITY[severity];
    const Icon = s.Icon;
    return (
        <Box className={classes.banner} role={role} style={{ background: s.bg, borderColor: s.border }}>
            <Icon className={classes.icon} fontSize="small" style={{ color: s.color }} />
            <Box className={classes.text}>
                <Typography variant="body2" className={classes.title} style={{ color: s.color }}>{title}</Typography>
                <Typography variant="body2" color="textSecondary">{body}</Typography>
            </Box>
            {action && <Box className={classes.action}>{action}</Box>}
        </Box>
    );
};

export default InlineBanner;
