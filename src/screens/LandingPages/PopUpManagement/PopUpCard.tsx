import React, { Dispatch, SetStateAction } from 'react';
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
  Delete as DeleteIcon,
  PersonPin as PersonPinIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  TrendingUp as TrendingUpIcon,
  StayCurrentPortrait as StayCurrentPortraitIcon,
  Computer as ComputerIcon,
} from '@material-ui/icons';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { Page, togglePopupStatus } from '../../../../src/redux/reducers/popUpManagementSlice';
import clsx from 'clsx';
import { Switch } from '../../../components/managment';
import { sitePrefix } from '../../../config';
import { DialogType } from './PopUpManagement';
import { useNavigate } from 'react-router-dom';

interface PopUpCardProps {
  popup: Page;
  classes: Record<string, string>;
  setDialogType: Dispatch<SetStateAction<DialogType | null>>;
}

interface StatItemProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  subtitles?: (string | number | null)[];
  trend?: number;
  mobilePercent?: number;
  desktopPercent?: number;
  onValueClick?: () => void;
  onSubtitleClick?: (index: number) => void;
}

const PopUpCard: React.FC<PopUpCardProps> = ({ popup, classes, setDialogType }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch<any>();
  const navigate = useNavigate();

  const handleStatusChange = () => {
    const newStatus = popup.StatusName === 'Active' ? 5 : 2;
    (dispatch as any)(togglePopupStatus({ ID: popup.ID, Status: newStatus }));
  };

  const handleSettings = () => {
    navigate(`${sitePrefix}Popups/Create/${popup.ID}`);
  };

  const handlePreview = () => {
    const previewLink = `${sitePrefix}previewer/popup/${popup.ID}`;
    window.open(previewLink, '_blank');
  };

  const handleEdit = () => {
    navigate(`${sitePrefix}popupeditor/${popup.ID}`);
  };

  const handleDuplicate = () => {
    setDialogType({
      type: 'duplicate',
      data: popup.ID
    });
  };

  const handleDelete = () => {
    setDialogType({ type: 'delete', data: popup.ID });
  };

  const handleIdentifiedViewersClick = () => {
    // TODO: Implement navigation or action for identified viewers
    console.log('Identified Viewers clicked for popup:', popup.ID);
  };

  const handleIdentifiedConversionsClick = () => {
    // TODO: Implement navigation or action for identified conversions
    console.log('Identified Conversions clicked for popup:', popup.ID);
  };

  const renderStatusControl = () => {
    if (popup.StatusName === 'Draft') {
      return <Chip label={t('landingPages.popupManagement.filters.draft')} className={classes.draftChip} size="small" />;
    }

    const IsActive = popup.StatusName === 'Active';
    const statuses: { [key: string]: string } = {
      'true': t('automations.AutomationActiveStatusText'),
      'false': t('automations.AutomatoionInActiveStatusText'),
    };

    return (
      <Box display="flex" alignItems="center" justifyContent="flex-end">
        <Typography
          className={clsx(
            classes.middleText,
            classes.txtCenter,
            {
              [classes.switchActive]: IsActive,
              [classes.switchInactive]: !IsActive,
            }
          )}
          style={{ marginRight: '10px' }}
        >
          {statuses[String(IsActive)]}
        </Typography>
        <Switch
          checked={IsActive}
          onChange={handleStatusChange}
          color="primary"
          name="statusSwitch"
          inputProps={{ 'aria-label': 'status switch' }}
        />
      </Box>
    );
  };

  const StatItem: React.FC<StatItemProps> = ({ 
    icon, 
    title, 
    value, 
    subtitles, 
    trend, 
    mobilePercent, 
    desktopPercent,
    onValueClick,
    onSubtitleClick
  }) => (
    <Grid item xs={6} sm={3} className={classes.statItem}>
      <Box ml={1} textAlign="center" alignItems="center" display="flex">
        {icon}
        <Typography variant="caption" className={classes.mleft5} color="textSecondary">
          {title}
        </Typography>
      </Box>
      <Typography 
        variant="h4" 
        style={{ 
          lineHeight: 1.2, 
          fontWeight: 600,
          cursor: onValueClick ? 'pointer' : 'default',
          color: onValueClick ? '#0371AD' : 'inherit',
        }}
        onClick={onValueClick}
      >
        {value}
      </Typography>
      {subtitles?.map((subtitle, index) =>
        subtitle ? (
          <Typography 
            key={index} 
            variant="body2" 
            color="textSecondary"
            style={{
              cursor: onSubtitleClick ? 'pointer' : 'default',
              color: onSubtitleClick ? '#0371AD' : undefined,
              textDecoration: onSubtitleClick ? 'underline' : 'none'
            }}
            onClick={() => onSubtitleClick?.(index)}
          >
            {subtitle}
          </Typography>
        ) : null
      )}
      {(mobilePercent !== undefined && desktopPercent !== undefined) && (
        <Box display="flex" justifyContent="center" alignItems="center" mt={1}>
          <StayCurrentPortraitIcon style={{ fontSize: 14, color: '#F65026', verticalAlign: 'middle' }} />
          <Typography variant="caption" className={classes.mleft5} color="textSecondary">
            {`${mobilePercent}%`}
          </Typography>
          <ComputerIcon style={{ fontSize: 14, color: '#0371AD', verticalAlign: 'middle', marginLeft: 10 }} />
          <Typography variant="caption" className={classes.mleft5} color="textSecondary">
            {`${desktopPercent}%`}
          </Typography>
        </Box>
      )}
      {trend !== undefined && (
        <Box display="flex" justifyContent="center" alignItems="center" mt={1}>
          <Typography variant="caption" style={{ color: trend >= 0 ? '#4caf50' : '#ff3343' }}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </Typography>
        </Box>
      )}
    </Grid>
  );

  return (
    <Box p={3} className={classes.popupCard}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} md={8}>
          <Typography variant="h6" className={classes.popupTitle}>
            {popup.Name}
          </Typography>
          {/* <Typography variant="body2" className={classes.blueLink} color="textSecondary">
            {popup.Domains.join(', ')}
          </Typography> */}
        </Grid>
        <Grid item xs={12} md={4} style={{ textAlign: 'right' }}>
          {renderStatusControl()}
        </Grid>
      </Grid>
      <Box my={2} className={classes.statsContainer}>
        <Grid container spacing={1}>
          <StatItem
            icon={<VisibilityIcon color="disabled" />}
            title={t('landingPages.popupManagement.tableHeaders.allViewers')}
            value={popup.AllViews?.toLocaleString() ?? '—'}
            mobilePercent={popup.MobileViewsPercent}
            desktopPercent={popup.DesktopViewsPercent}
          />
          <StatItem
            icon={<PersonPinIcon color="disabled" />}
            title={t('landingPages.popupManagement.tableHeaders.identifiedViewers')}
            value={popup.IdentifiedViewers?.toLocaleString() ?? '—'}
            subtitles={[`${popup.IdentifiedViewersPercent}% of viewers`]}
            onValueClick={handleIdentifiedViewersClick}
          />
          <StatItem
            icon={<CheckCircleOutlineIcon color="disabled" />}
            title={t('landingPages.popupManagement.tableHeaders.conversions')}
            value={popup.Conversions?.toLocaleString() ?? '—'}
            subtitles={[
              `Identified Conversions: ${popup.IdentifiedConversions?.toLocaleString() ?? '—'}`,
              popup.ConversionType === 2 ? 'Form Submitted' : 'Button Clicks'
            ]}
            onSubtitleClick={(index) => {
              if (index === 0) {
                handleIdentifiedConversionsClick();
              }
            }}
          />
          <StatItem
            icon={<TrendingUpIcon color="disabled" />}
            title={t('landingPages.popupManagement.tableHeaders.conversionRate')}
            value={`${popup.ConversionRate}%`}
            trend={popup.ConversionRateChange}
          />
        </Grid>
      </Box>
      <Box className={classes.actionsContainer}>
        <Button 
          size="small" 
          className={classes.actionButtonPopupManagement} 
          startIcon={<SettingsIcon />}
          onClick={handleSettings}
        >
          {t('landingPages.popupManagement.actions.settings')}
        </Button>
        <Button 
          size="small"
          className={classes.actionButtonPopupManagement}
          startIcon={<VisibilityIcon />}
          onClick={handlePreview}
        >
          {t('landingPages.popupManagement.actions.preview')}
        </Button>
        <Button 
          size="small" 
          className={classes.actionButtonPopupManagement} 
          startIcon={<EditIcon />}
          onClick={handleEdit}
        >
          {t('landingPages.EditResource1.HeaderText')}
        </Button>
        <Button 
          size="small" 
          className={classes.actionButtonPopupManagement} 
          startIcon={<FileCopyIcon />}
          onClick={handleDuplicate}
        >
          {t('landingPages.popupManagement.actions.duplicate')}
        </Button>
        <Button
          size="small"
          color="secondary"
          className={classes.actionButtonPopupManagement}
          startIcon={<DeleteIcon />}
          onClick={handleDelete}
        >
          {t('landingPages.GridButtonColumnResource1.HeaderText')}
        </Button>
      </Box>
    </Box>
  );
};

export default PopUpCard;