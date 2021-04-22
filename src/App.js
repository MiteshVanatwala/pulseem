import React,{useEffect} from 'react';
import NewsletterManagnent from './screens/NewsletterManagnent';
import {create} from 'jss';
import rtl from 'jss-rtl';
import {StylesProvider,jssPreset,MuiThemeProvider} from '@material-ui/core/styles';
import i18n from './i18n'
import {BrowserRouter,useParams} from 'react-router-dom';
import {Router,Route} from 'react-router'
//import {history} from './helpers/history'
import {useSelector,useDispatch} from 'react-redux';
import {setWindowSize} from './redux/reducers/coreSlice'
import {getTheme} from './style/theme'
import {useClasses} from './style/classes/index'
import {MuiPickersUtilsProvider} from '@material-ui/pickers';
import MomentUtils from '@date-io/moment';
import {useHistory} from "react-router-dom";
import moment from 'moment'
import NotificationManagement from './screens/NotificationManagement';

const renderRoutes=(classes,history) => {
  const transferUrl=(url='',param='') => () => {
    const {campaignID,automationID}=useParams()
    const addParam={
      campaign: campaignID,
      automation: automationID
    }
    window.location.href=`https://www.pulseemdev.co.il/${url}${addParam[param]||''}`
    return null
  }

  const base=process.env.PUBLIC_URL
  return (
    <>
      <Route
        exact path={`/notifications`}
        /* component={() => {
          history.push(`${base}/Campaigns`)
          return null
        }} */
        render={props => <NotificationManagement {...props} classes={classes} />}
        // render={props => <NotificationManagement {...props} classes={classes} />}
      />
      <Route
        path={`${base}/SendCampaign/:campaignID`}
        component={transferUrl('/Pulseem/SendCampaign.aspx?CampaignID=','campaign')}
      />
      <Route
        path={`${base}/PreviewCampaign/:campaignID`}
        component={transferUrl('/Pulseem/PreviewCampaign.aspx?CampaignID=','campaign')}
      />
      <Route
        path={`${base}/Editor/CampaignEdit/:campaignID`}
        component={transferUrl('/Editor/CampaignEdit/','campaign')}
      />
      <Route
        path={`${base}/DuplicateCampign/:campaignID`}
        component={transferUrl('/DuplicateCampign/','campaign')}
      />
      <Route
        path={`${base}/CampaignStatistics/:campaignID`}
        component={transferUrl('/Pulseem/CampaignStatistics.aspx?CampaignID=','campaign')}
      />
      <Route
        path={`${base}/CreateAutomations/:automationID`}
        component={transferUrl('/Pulseem/CreateAutomations.aspx?Mode=show&AutomationID=','automation')}
      />
      <Route
        path={`${base}/homepage`}
        component={transferUrl('/Pulseem/homepage.aspx')}
      />
      {/* Groups */}
      <Route
        path={`${base}/Groups`}
        component={transferUrl('/Pulseem/Groups.aspx')}
      />
      <Route
        path={`${base}/ClientSearch`}
        component={transferUrl('/Pulseem/ClientSearch.aspx')}
      />
      <Route
        path={`${base}/ClientAdvancedSearch`}
        component={transferUrl('/Pulseem/ClientAdvancedSearch.aspx')}
      />
      <Route
        path={`${base}/DynamicGroups`}
        component={transferUrl('/Pulseem/DynamicGroups.aspx')}
      />
      <Route
        path={`/FileUploads`}
        component={transferUrl('/Pulseem/FileUploads.aspx')}
      />
      {/* Newsletter */}
      <Route
        path={`/Campaigns`}
        render={props => <NewsletterManagnent {...props} classes={classes} />}
      />

      <Route
        path={`${base}/Editor/CampaignInfo`}
        component={transferUrl('/Pulseem/Editor/CampaignInfo?new=1')}
      />
      <Route
        path={`${base}/CampaignsByResults`}
        component={transferUrl('/Pulseem/CampaignsByResults.aspx')}
      />
      <Route
        path={`${base}/CampaignsAbTestings`}
        component={transferUrl('/Pulseem/CampaignsAbTestings.aspx')}
      />
      <Route
        path={`${base}/AutoSendPlans`}
        component={transferUrl('/Pulseem/AutoSendPlans.aspx')}
      />
      <Route
        path={`${base}/CampaignTemplates`}
        component={transferUrl('/Pulseem/CampaignTemplates.aspx')}
      />
      <Route
        path={`${base}/CampaignEdit`}
        component={transferUrl('/Pulseem/CampaignEdit.aspx?NewsLetterType=Basic')}
      />
      {/* SMS */}
      <Route
        path={`${base}/SMSCampaigns`}
        component={transferUrl('/Pulseem/SMSCampaigns.aspx')}
      />
      <Route
        path={`${base}/SMSCampaignEdit`}
        component={transferUrl('/Pulseem/SMSCampaignEdit.aspx?action=edit&t=create')}
      />
      <Route
        path={`${base}/SMSSmartResponses`}
        component={transferUrl('/Pulseem/SMSSmartResponses.aspx')}
      />
      <Route
        path={`${base}/ResponsesReport`}
        component={transferUrl('/Pulseem/ResponsesReport.aspx')}
      />
      {/* MMS */}
      <Route
        path={`${base}/MmsCampaigns`}
        component={transferUrl('/Pulseem/MmsCampaigns.aspx')}
      />
      <Route
        path={`${base}/MmsCampaignEdit`}
        component={transferUrl('/Pulseem/MmsCampaignEdit.aspx')}
      />
      {/* Landing Pages */}
      <Route
        path={`${base}/EditRegistrationPage`}
        component={transferUrl('/Pulseem/EditRegistrationPage.aspx')}
      />
      <Route
        path={`${base}/LandingPageWizard`}
        component={transferUrl('/Pulseem/LandingPageWizard.aspx')}
      />
      <Route
        path={`${base}/FormTemplates`}
        component={transferUrl('/Pulseem/FormTemplates.aspx')}
      />
      {/* Reports */}
      <Route
        path={`${base}/MainReport`}
        component={transferUrl('/Pulseem/MainReport.aspx')}
      />
      <Route
        path={`${base}/ClalReport`}
        component={transferUrl('/Pulseem/ClalReport.aspx')}
      />
      <Route
        path={`${base}/SMSMainReport`}
        component={transferUrl('/Pulseem/SMSMainReport.aspx')}
      />
      <Route
        path={`${base}/MmsMainReport`}
        component={transferUrl('/Pulseem/MmsMainReport.aspx')}
      />
      <Route
        path={`${base}/AbTestsReport`}
        component={transferUrl('/Pulseem/AbTestsReport.aspx')}
      />
      <Route
        path={`${base}/AccountReport`}
        component={transferUrl('/Pulseem/AccountReport.aspx')}
      />
      <Route
        path={`${base}/CampaignComparison`}
        component={transferUrl('/Pulseem/CampaignComparison.aspx')}
      />
      <Route
        path={`${base}/ClientReport`}
        component={transferUrl('/Pulseem/ClientReport.aspx')}
      />
      <Route
        path={`${base}/EmailAutoReports`}
        component={transferUrl('/Pulseem/EmailAutoReports.aspx')}
      />
      <Route
        path={`${base}/RemovedStats`}
        component={transferUrl('/Pulseem/RemovedStats.aspx')}
      />
      <Route
        path={`${base}/DirectEmailReport`}
        component={transferUrl('/Pulseem/DirectEmailReport.aspx')}
      />
      <Route
        path={`${base}/DirectSmsReport`}
        component={transferUrl('/Pulseem/DirectSmsReport.aspx')}
      />
      <Route
        path={`${base}/EmailCampaignStatistics`}
        component={transferUrl('/Pulseem/EmailCampaignStatistics.aspx')}
      />
      {/* Automations */}
      <Route
        path={`${base}/Automations`}
        component={transferUrl('/Pulseem/Automations.aspx')}
      />
      <Route
        path={`${base}/CreateAutomations`}
        component={transferUrl('/Pulseem/CreateAutomations.aspx')}
      />
      {/* Notifications */}
      <Route
        path={`${base}/Notification`}
        component={transferUrl('/Pulseem/Notification.aspx?t=main')}
      />
      <Route
        path={`${base}/Notification/create`}
        component={transferUrl('/Pulseem/Notification.aspx?t=add')}
      />
      {/* Settings */}
      <Route
        path={`${base}/AccountSettings`}
        component={transferUrl('/Pulseem/AccountSettings.aspx')}
      />
      <Route
        path={`${base}/AccountBilling`}
        component={transferUrl('/Pulseem/AccountBilling.aspx')}
      />
      <Route
        path={`${base}/AccountUsers`}
        component={transferUrl('/Pulseem/AccountUsers.aspx')}
      />
      <Route
        path={`${base}/AccountUsersReport`}
        component={transferUrl('/Pulseem/AccountUsersReport.aspx')}
      />
      <Route
        path={`${base}/ExtraFieldsDefinition`}
        component={transferUrl('/Pulseem/ExtraFieldsDefinition.aspx')}
      />
      <Route
        path={`${base}/ApiSettings`}
        component={transferUrl('/Pulseem/ApiSettings.aspx')}
      />
      {/* Support */}
      <Route
        path={`${base}/Support`}
        component={() => {
          window.open("https://www.pulseem.co.il/Pages/Home.aspx?action=support","_blank")
          return null
        }}
      />
    </>
  )
}

const App=() => {
  const dispatch=useDispatch()
  useEffect(() => {
    const setWindowWidth=() => {
      const {innerWidth}=window
      let windowSize='xs'
      if(innerWidth>975&&innerWidth<1200)
        windowSize='sm'
      else if(innerWidth>=1200&&innerWidth<1300)
        windowSize='md'
      else if(innerWidth>=1300)
        windowSize='lg'
      dispatch(setWindowSize(windowSize))
    }

    window.addEventListener('resize',setWindowWidth)

    setWindowWidth()
  },[dispatch])
  const {language,isRTL,windowSize}=useSelector(state => state.core)
  const classes=useClasses(windowSize,isRTL)()
  i18n.changeLanguage(language)
  const theme=getTheme(language)
  const history=useHistory()

  return (
    <MuiPickersUtilsProvider utils={MomentUtils} libInstance={moment} locale={language}>
      <MuiThemeProvider theme={theme}>
        <div dir={isRTL? 'rtl':'ltr'}>
          {renderRoutes(classes,history)}
        </div>
      </MuiThemeProvider>
    </MuiPickersUtilsProvider>

  )
}

const AppContainer=() => {
  const jss=create({plugins: [...jssPreset().plugins,rtl()]});

  return (
    <StylesProvider jss={jss}>
      <BrowserRouter basename='react'>
        <App />
      </BrowserRouter>
    </StylesProvider>
  )
}

export default AppContainer;
