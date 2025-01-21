import { makeStyles } from '@material-ui/core/styles';
import { getDrawerStyle } from './drawerStyles'
import { appBarStyle } from './appBarStyles'
import { getManagmentStyle } from './managementStyle'
import { getGeneralStyle } from './ganaralStyle'
import { getNotificationStyle } from './notificationsStyles';
import { getDashboardStyle } from './dashboardStyles';
import { getSmsStyle } from './smsStyles';
import { getSiteTrackingStyle } from './siteTrackingStyles';
import { getCampaignEditorStyle } from './campaignEditorStyles';
import { getGroupStyle } from './groupStyle'
import { getWhatsappStyle } from './whatsappStyles';
import { dynamicProductCatalog } from './dynamicProductCatalog';
import { surveyStyle } from './surveyStyles';

export const useClasses = (windowSize, isRTL = false) => makeStyles(theme => ({
  ...getDrawerStyle(windowSize, isRTL, theme),
  ...appBarStyle(windowSize, isRTL, theme),
  ...getManagmentStyle(windowSize, isRTL, theme),
  ...getGeneralStyle(windowSize, isRTL, theme),
  ...getNotificationStyle(windowSize, isRTL, theme),
  ...getDashboardStyle(windowSize, isRTL, theme),
  ...getSmsStyle(windowSize, isRTL, theme),
  ...getSiteTrackingStyle(windowSize, isRTL),
  ...getCampaignEditorStyle(windowSize, isRTL),
  ...getGroupStyle(windowSize, isRTL, theme),
  ...getWhatsappStyle(windowSize, isRTL, theme),
  ...dynamicProductCatalog(isRTL),
  ...surveyStyle(windowSize, isRTL, theme)
}))
