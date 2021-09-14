import { makeStyles } from '@material-ui/core/styles';
import { getDrawerStyle } from './drawerStyles'
import { appBarStyle } from './appBarStyles'
import { getManagmentStyle } from './managementStyle'
import { getGeneralStyle } from './ganaralStyle'
import { getNotificationStyle } from './notificationsStyles';
import { getDashboardStyle } from './dashboardStyles';

export const useClasses = (windowSize, isRTL = false) => makeStyles(theme => ({
  ...getDrawerStyle(windowSize, isRTL, theme),
  ...appBarStyle(windowSize, isRTL, theme),
  ...getManagmentStyle(windowSize, isRTL, theme),
  ...getGeneralStyle(windowSize, isRTL, theme),
  ...getNotificationStyle(windowSize, isRTL, theme),
  ...getDashboardStyle(windowSize, isRTL, theme)
}))
