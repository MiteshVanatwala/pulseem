import React from 'react';
import {
    Box,
    Typography,
    Grid,
    Button,
    Chip,
} from '@material-ui/core';
import {
    Settings as SettingsIcon,
    Visibility as VisibilityIcon,
    Edit as EditIcon,
    FileCopy as FileCopyIcon,
    Code as CodeIcon,
    Delete as DeleteIcon,
    PersonPin as PersonPinIcon,
    CheckCircleOutline as CheckCircleOutlineIcon,
    TrendingUp as TrendingUpIcon,
    StayCurrentPortrait as StayCurrentPortraitIcon,
    Computer as ComputerIcon,
} from '@material-ui/icons';
import { useTranslation } from 'react-i18next';

export type PopUpStatus = "Active" | "Inactive" | "Draft";

export interface PopUp {
    id: number;
    title: string;
    url: string;
    status: PopUpStatus;
    stats: {
        allViewers: number | null;
        identifiedViewers: number | null;
        conversions: number | null;
        conversionRate: number | null;
        mobileViewer: number | null;
        desktopViewer: number | null;
    };
}

interface PopUpCardProps {
    popup: PopUp;
    classes: Record<string, string>;
}

interface StatItemProps {
    icon: React.ReactNode;
    title: string;
    value: string | number;
    mobileValue: string | number;
    desktopValue: string | number;
}

const PopUpCard: React.FC<PopUpCardProps> = ({ popup, classes }) => {
    const { t } = useTranslation();

    const getStatusChip = (status: PopUpStatus) => {
        switch (status) {
            case 'Active':
                return <Chip label={t('landingPages.popupManagement.filters.active')} className={classes.activeChip} size="small" />;
            case 'Inactive':
                return <Chip label={t('landingPages.popupManagement.filters.inactive')} className={classes.inactiveChip} size="small" />;
            case 'Draft':
                return <Chip label={t('landingPages.popupManagement.filters.draft')} className={classes.draftChip} size="small" />;
            default:
                return <Chip label={status} size="small" />;
        }
    };

    const StatItem: React.FC<StatItemProps> = ({ icon, title, value, mobileValue, desktopValue }) => (
        <Grid item xs={6} sm={3} className={classes.statItem}>
            <Box ml={1} textAlign="center" alignItems="center" display="flex">
                {icon}
                <Typography variant="caption" className={classes.mleft5} color="textSecondary">
                    {title}
                </Typography>
            </Box>
            <Typography variant="h4" style={{ lineHeight: 1.2, fontWeight: 600 }}>
                {value}
            </Typography>
            <Box display="flex" justifyContent="center" alignItems="center" mt={1}>
                <StayCurrentPortraitIcon style={{ fontSize: 14, color: '#F65026', verticalAlign: 'middle' }} />
                <Typography variant="caption" className={classes.mleft5} color="textSecondary">
                    {`${mobileValue}%`}
                </Typography>
                <ComputerIcon style={{ fontSize: 14, color: '#0371AD', verticalAlign: 'middle', marginLeft: 10 }} />
                <Typography variant="caption" className={classes.mleft5} color="textSecondary">
                    {`${desktopValue}%`}
                </Typography>
            </Box>
        </Grid>
    );

    return (
        <Box p={3} className={classes.popupCard}>
            <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={8}>
                    <Typography variant="h6" className={classes.popupTitle}>
                        {popup.title}
                    </Typography>
                    <Typography variant="body2" className={classes.blueLink} color="textSecondary">
                        {popup.url}
                    </Typography>
                </Grid>
                <Grid item xs={12} md={4} style={{ textAlign: 'right' }}>
                    {getStatusChip(popup.status)}
                </Grid>
            </Grid>
            <Box my={2} className={classes.statsContainer}>
                <Grid container spacing={1}>
                    <StatItem icon={<VisibilityIcon color="disabled" />} title={t('landingPages.popupManagement.tableHeaders.allViewers')} value={popup.stats.allViewers?.toLocaleString() ?? '—'} mobileValue={popup.stats.mobileViewer?.toLocaleString() ?? '—'} desktopValue={popup.stats.desktopViewer?.toLocaleString() ?? '—'} />
                    <StatItem icon={<PersonPinIcon color="disabled" />} title={t('landingPages.popupManagement.tableHeaders.identifiedViewers')} value={popup.stats.identifiedViewers?.toLocaleString() ?? '—'} mobileValue={popup.stats.mobileViewer?.toLocaleString() ?? '—'} desktopValue={popup.stats.desktopViewer?.toLocaleString() ?? '—'} />
                    <StatItem icon={<CheckCircleOutlineIcon color="disabled" />} title={t('landingPages.popupManagement.tableHeaders.conversions')} value={popup.stats.conversions?.toLocaleString() ?? '—'} mobileValue={popup.stats.mobileViewer?.toLocaleString() ?? '—'} desktopValue={popup.stats.desktopViewer?.toLocaleString() ?? '—'} />
                    <StatItem icon={<TrendingUpIcon color="disabled" />} title={t('landingPages.popupManagement.tableHeaders.conversionRate')} value={popup.stats.conversionRate ? `${popup.stats.conversionRate}%` : '—'} mobileValue={popup.stats.mobileViewer?.toLocaleString() ?? '—'} desktopValue={popup.stats.desktopViewer?.toLocaleString() ?? '—'} />
                </Grid>
            </Box>
            <Box className={classes.actionsContainer}>
                <Button size="small" className={classes.actionButtonPopupManagement} startIcon={<SettingsIcon />}>
                    {t('landingPages.popupManagement.actions.settings')}
                </Button>
                <Button size="small" className={classes.actionButtonPopupManagement} startIcon={<VisibilityIcon />}>
                    {t('landingPages.popupManagement.actions.preview')}
                </Button>
                <Button size="small" className={classes.actionButtonPopupManagement} startIcon={<EditIcon />}>
                    {t('landingPages.popupManagement.actions.editDesign')}
                </Button>
                <Button size="small" className={classes.actionButtonPopupManagement} startIcon={<FileCopyIcon />}>
                    {t('landingPages.popupManagement.actions.duplicate')}
                </Button>
                <Button size="small" className={classes.actionButtonPopupManagement} startIcon={<CodeIcon />}>
                    {t('landingPages.popupManagement.actions.copySnippet')}
                </Button>
                <Button size="small" color="secondary" className={classes.actionButtonPopupManagement} startIcon={<DeleteIcon />}>
                    {t('landingPages.popupManagement.actions.delete')}
                </Button>
            </Box>
        </Box>
    );
};

export default PopUpCard;