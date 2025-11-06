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
  Delete as DeleteIcon,
  PersonPin as PersonPinIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  TrendingUp as TrendingUpIcon,
  StayCurrentPortrait as StayCurrentPortraitIcon,
  Computer as ComputerIcon,
  Tune as TuneIcon
} from '@material-ui/icons';
import { Assessment as AssessmentIcon } from '@material-ui/icons';
import { exportSurvey } from '../../../../src/redux/reducers/landingPagesSlice';
import { ExportFile } from '../../../helpers/Export/ExportFile';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { Page, togglePopupStatus } from '../../../../src/redux/reducers/popUpManagementSlice';
import clsx from 'clsx';
import { Switch } from '../../../components/managment';
import PopupPreviewModal from './PopupPreviewModal';
import { sitePrefix } from '../../../config';
import { DialogType } from './PopUpManagement';
import { useNavigate } from 'react-router-dom';
import { CLIENT_CONSTANTS } from '../../../model/Clients/Contants';

interface PopUpCardProps {
  popup: Page;
  classes: Record<string, string>;
  setDialogType: Dispatch<SetStateAction<DialogType | null>>;
}

interface StatItemProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  subtitles?: (string | number | React.ReactNode | null)[];
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
  const { userRoles } = useSelector((state: any) => state.core);
  const [showPreview, setShowPreview] = useState(false);

  const handleStatusChange = () => {
    const newStatus = popup.StatusName === 'Active' ? 5 : 2;
    (dispatch as any)(togglePopupStatus({ ID: popup.ID, Status: newStatus }));
  };

  const handleSettings = () => {
    navigate(`${sitePrefix}Popups/Create/${popup.ID}`);
  };

  const handleDisplayRules = () => {
    navigate(`${sitePrefix}Popups/DisplayRules/${popup.ID}`);
  };

  const handlePreview = () => {
    setShowPreview(true);
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
    if (popup.IdentifiedViewers > 0) {
      navigate(CLIENT_CONSTANTS.BASEURL, {
        state: {
          ...CLIENT_CONSTANTS.QUERY_PARAMS,
          CampaignID: popup.ID,
          PageType: CLIENT_CONSTANTS.PAGE_TYPES.PopUpIdentifiedViewers,
          ResultTitle: `${t("common.clientSubscriptionResultTitle")} ${popup.Name}`
        }
      })
    }
  };

  const handleSubmitsClick = () => {
    if (popup.Submits && popup.Submits > 0 && !userRoles?.HideRecipients) {
      navigate(CLIENT_CONSTANTS.BASEURL, {
        state: {
          ...CLIENT_CONSTANTS.QUERY_PARAMS,
          CampaignID: popup.ID,
          PageType: CLIENT_CONSTANTS.PAGE_TYPES.FormID,
          ResultTitle: `${t("common.clientSubscriptionResultTitle")} "${popup.Name}"`
        }
      });
    }
  };

  const handleIdentifiedConversionsClick = () => {
    if (popup.ConversionRate > 0) {
      navigate(CLIENT_CONSTANTS.BASEURL, {
        state: {
          ...CLIENT_CONSTANTS.QUERY_PARAMS,
          CampaignID: popup.ID,
          PageType: CLIENT_CONSTANTS.PAGE_TYPES.PopUPConversions,
          ResultTitle: `${t("common.clientSubscriptionResultTitle")} ${popup.Name}`
        }
      })
    }
  };

  const handleSurveyResults = async () => {
    if (popup.IsNewEditor) {
      // Navigate to survey details page for new editor
      navigate(`${sitePrefix}Popups/SurveyDetails/${popup.ID}`, {
        state: {
          from: 'popupManagement'
        }
      });
    } else {
      // Export survey for old editor
      if (userRoles?.AllowExport) {
        // @ts-ignore
        const surveysResponse = await dispatch(exportSurvey(popup.ID));
        const surveys = surveysResponse?.payload;
        const fields = surveys?.length > 0 && Object.keys(surveys[0]);
        ExportFile({
          data: surveys,
          fileName: 'surveyReport',
          exportType: 'xls',
          fields: fields
        });
      }
    }
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
    <Grid item xs={6} sm={3} lg={2} className={classes.statItem}>
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
        </Grid>
        <Grid item xs={12} md={4} style={{ textAlign: 'right' }}>
          {renderStatusControl()}
        </Grid>
      </Grid>
      <Box my={2} className={classes.statsContainer}>
        <Grid container spacing={1} justifyContent='space-between'>
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
            title={t('landingPages.SubmitsResource1.HeaderText')}
            value={popup.Submits?.toLocaleString() ?? '0'}
            onValueClick={!userRoles?.HideRecipients && popup.Submits && popup.Submits > 0 ? handleSubmitsClick : undefined}
          />
          <StatItem
            icon={<CheckCircleOutlineIcon color="disabled" />}
            title={t('landingPages.popupManagement.tableHeaders.conversions')}
            value={popup.Conversions?.toLocaleString() ?? '—'}
            subtitles={[
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {t('landingPages.popupManagement.tableHeaders.identifiedConversions')}: <span
                  style={{
                    cursor: 'pointer',
                    color: '#0371AD',
                    fontSize: 18,
                    fontWeight: 'bold',
                    marginLeft: 3
                  }}
                  onClick={handleIdentifiedConversionsClick}
                >
                  {popup.IdentifiedConversions?.toLocaleString() ?? '—'}
                </span>
              </div>,
              popup.ConversionType === 1 ? t('PopupTriggers.advanceSettings.postConversion.defineConversion.formSubmission') : popup.ConversionType === 2 ? t('PopupTriggers.advanceSettings.postConversion.defineConversion.buttonClick') : null
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
        {popup.IsSurvey && (popup.SurveyCount ?? 0) > 0 && (
          <Button
            size="small"
            className={classes.actionButtonPopupManagement}
            startIcon={<AssessmentIcon />}
            onClick={handleSurveyResults}
            disabled={!popup.IsNewEditor && !userRoles?.AllowExport}
          >
            {popup.IsNewEditor
              ? t('landingPages.SurveyExportTitle')
              : `${t('landingPages.SurveyExportTitle')} (${popup.SurveyCount})`
            }
          </Button>
        )}
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
        <Button
          size="small"
          color="secondary"
          className={classes.actionButtonPopupManagement}
          onClick={handleDisplayRules}
          startIcon={<TuneIcon />}
        >
          {t('PopupTriggers.popupDisplaySettings')}
        </Button>
      </Box>
      <PopupPreviewModal
        open={showPreview}
        onClose={() => setShowPreview(false)}
        popupId={popup.ID}
        classes={classes}
      />
    </Box>
  );
};

export default PopUpCard;