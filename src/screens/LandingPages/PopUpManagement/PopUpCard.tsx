import React, { Dispatch, SetStateAction, useState } from 'react';
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
import { useDispatch } from 'react-redux';
import { Page, togglePopupStatus } from '../../../../src/redux/reducers/popUpManagementSlice';
import { getPageHeight } from '../../../../src/redux/reducers/landingPagesSlice';
import clsx from 'clsx';
import { Switch } from '../../../components/managment';
import { sitePrefix } from '../../../config';
import { DialogType } from './PopUpManagement';
import { useNavigate } from 'react-router-dom';
import { PopMassage } from '../../../components/managment/index';

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
}

const PopUpCard: React.FC<PopUpCardProps> = ({ popup, classes, setDialogType }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch<any>();
  const navigate = useNavigate();
  const [showCopied, setShowCopied] = useState<string | null>(null);
  const [copyLinkRef, setCopyLinkRef] = useState<any>(null);
  const [copyEmbedRef, setCopyEmbedRef] = useState<any>(null);

  const handleStatusChange = () => {
    const newStatus = popup.StatusName === 'Active' ? 5 : 2;
    (dispatch as any)(togglePopupStatus({ ID: popup.ID, Status: newStatus }));
  };

  const getPopupUrl = () => {
    const domain = popup.Domains && popup.Domains.length > 0 ? popup.Domains[0] : '';
    return `${domain}?pulseem_popup=${popup.PopupGuid}`;
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

  const handleCopyLink = async () => {
    if (popup.StatusName !== 'Active') {
      return;
    }
    
    const pageUrl = getPopupUrl();
    await navigator.clipboard.writeText(pageUrl);
    setShowCopied('link');
    setTimeout(() => {
      setShowCopied(null);
    }, 1000);
  };

  const handleCopyEmbed = async () => {
    if (popup.StatusName !== 'Active') {
      return;
    }

    const pageUrl = getPopupUrl();
    let embedCode = `<script src="${pageUrl}" type="text/javascript"></script>`;
    
    try {
      // @ts-ignore
      const res = await dispatch(getPageHeight(popup.ID));
      if (res.payload?.StatusCode === 201) {
        const height = res.payload?.Data;
        embedCode = embedCode.replace('##pageHeight##', height);
      }
    } catch (error) {
      console.error('Error getting page height:', error);
    }
    
    await navigator.clipboard.writeText(embedCode);
    setShowCopied('embed');
    setTimeout(() => {
      setShowCopied(null);
    }, 1000);
  };

  const handleDelete = () => {
    setDialogType({ type: 'delete', data: popup.ID });
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

  const StatItem: React.FC<StatItemProps> = ({ icon, title, value, subtitles, trend, mobilePercent, desktopPercent }) => (
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
      {subtitles?.map((subtitle, index) =>
        subtitle ? (
          <Typography key={index} variant="body2" color="textSecondary">
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

  const isActive = popup.StatusName === 'Active';

  return (
    <Box p={3} className={classes.popupCard}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} md={8}>
          <Typography variant="h6" className={classes.popupTitle}>
            {popup.Name}
          </Typography>
          <Typography variant="body2" className={classes.blueLink} color="textSecondary">
            {popup.Domains.join(', ')}
          </Typography>
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
          />
          <StatItem
            icon={<CheckCircleOutlineIcon color="disabled" />}
            title={t('landingPages.popupManagement.tableHeaders.conversions')}
            value={popup.Conversions?.toLocaleString() ?? '—'}
            subtitles={[
              `Identified Conversions: ${popup.IdentifiedConversions?.toLocaleString() ?? '—'}`,
              popup.ConversionType === 2 ? 'Form Submitted' : 'Button Clicks'
            ]}
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
        <Box display="inline-block" position="relative">
          <Button 
            ref={(el) => setCopyLinkRef(el)}
            size="small" 
            className={classes.actionButtonPopupManagement} 
            startIcon={<CodeIcon />}
            onClick={handleCopyLink}
            disabled={!isActive}
          >
            {t('landingPages.popupManagement.actions.copyLink')}
          </Button>
          {showCopied === 'link' && (
            <PopMassage
              classes={classes}
              show={true}
              timeout={1000}
              label={t('common.copyClip')}
              innerRef={copyLinkRef}
            />
          )}
        </Box>
        <Box display="inline-block" position="relative">
          <Button 
            ref={(el) => setCopyEmbedRef(el)}
            size="small" 
            className={classes.actionButtonPopupManagement} 
            startIcon={<CodeIcon />}
            onClick={handleCopyEmbed}
            disabled={!isActive}
          >
            {t('landingPages.popupManagement.actions.embed')}
          </Button>
          {showCopied === 'embed' && (
            <PopMassage
              classes={classes}
              show={true}
              timeout={1000}
              label={t('common.copyClip')}
              innerRef={copyEmbedRef}
            />
          )}
        </Box>
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