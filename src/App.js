import React, { useEffect } from 'react';
import NewsletterManagment from './screens/Newsletter/Management/NewsletterManagment';
import CampaignEditor from './screens/HtmlCampaign/CampaignEditor';
import ArchiveManagement from './screens/Newsletter/Management/ArchiveManagement';
import AutomationManagment from './screens/Automations/Management/AutomationsManagment';
import LandingPagesesManagment from './screens/LandingPages/Management/LandingPagesManagment'
import MmsManagment from './screens/Mms/Management/MmsManagment';
import SmsManagment from './screens/Sms/Management/SmsManagment';
import { getCookie, setCookie, cookieListener } from './helpers/cookies'
import { create } from 'jss';
import rtl from 'jss-rtl';
import jwt_decode from "jwt-decode";
import { StylesProvider, jssPreset, MuiThemeProvider, useTheme } from '@material-ui/core/styles';
import i18n from './i18n'
import { BrowserRouter, useParams, Route } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setWindowSize, setCoreData, setLanguage, setRowsPerPage, setIsClal, setAccountFeatures } from './redux/reducers/coreSlice' //smsOldVersion
import { isClalAccount, getCommonFeatures } from './redux/reducers/commonSlice';
import { setUsername } from './redux/reducers/userSlice'
import { getTheme } from './style/theme'
import { useClasses } from './style/classes/index'
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import MomentUtils from '@date-io/moment';
import { useHistory } from "react-router-dom";
import moment from 'moment'
import DirectSendReport from './screens/Reports/DirectSendReport/DirectSendReport';
import NotificationManagement from './screens/Notifications/Management/NotificationManagement';
import NotificationEditor from './screens/Notifications/Editor/NotificationEditor';
import NewslettersReport from './screens/Reports/NewslettersReport/NewslettersReport'
import { useMediaQuery } from '@material-ui/core';
import DashboardScreen from './screens/Dashboard/Dashboard';
import GraphicReport from './screens/Reports/NewslettersReport/GraphicReport';
import SmsReport from './screens/Reports/SmsReport/SmsReport';
import SmsCreator from './screens/Sms/Editor/SmsCreator';
import SmsSend from './screens/Sms/Editor/SmsSend';
import SiteTrackingEditor from './screens/SiteTracking/SiteTrackingEditor';
import SmsReplies from './screens/Reports/SmsReport/SmsReplies';
//import { siteTrackingScriptUrl } from './config/index';
import Groups from './screens/Groups/Management/Groups';
import MmsReport from './screens/Reports/MmsReport/MmsReport.js';
import NewsLetterWizard from './screens/Newsletter/Wizard/NewsLetterWizard';
import ClientSearchResult from './screens/ClientSearch/ClientSearchResult';

const renderRoutes = (classes, history) => {
  const transferUrl = (url = '', param = '') => () => {
    const { campaignID, automationID, id, notificationID } = useParams()
    const addParam = {
      campaign: campaignID,
      automation: automationID,
      notification: notificationID,
      id: id
    }

    window.location.href = `https://www.pulseem.co.il/${url}${addParam[param] || ''}`
    return <></>
  }
  return (
    <>
      <Route
        exact
        path="/"
        render={props => <DashboardScreen {...props} classes={classes} />}
      />
      <Route

        path="/sms/create/"
        render={props => <SmsCreator {...props} classes={classes} />}
      />
      <Route
        path="/sms/edit/:id"
        render={props => <SmsCreator {...props} classes={classes} />}
      />
      <Route

        path="/sms/send/:id"
        render={props => <SmsSend {...props} classes={classes} />}
      />
      <Route
        path={`/notifications/edit/:notificationID`}
        component={transferUrl('/Pulseem/notifications/Edit/', 'notification')}
      />
      <Route
        path={`/SendCampaign/:campaignID`}
        component={transferUrl('/Pulseem/SendCampaign.aspx?CampaignID=', 'campaign')}
      />
      <Route
        path={`/PreviewCampaign/:campaignID`}
        component={transferUrl('/Pulseem/PreviewCampaign.aspx?CampaignID=', 'campaign')}
      />
      <Route
        path={`/Editor/CampaignEdit/:campaignID`}
        component={transferUrl('/Pulseem/Editor/CampaignEdit/', 'campaign')}
      />
      <Route
        path={`/DuplicateCampign/:campaignID`}
        component={transferUrl('/Pulseem/DuplicateCampign/', 'campaign')}
      />
      <Route
        path={`/CampaignStatistics/:campaignID`}
        // component={transferUrl('/Pulseem/CampaignStatistics.aspx?CampaignID=', 'campaign')}
        render={props => <GraphicReport props={props} classes={classes} />}
      />
      <Route
        path={`/homepage`}
        component={transferUrl('/Pulseem/homepage.aspx')}
      />
      {/* <Route
        path={`/Groups`}
        component={transferUrl('/Pulseem/Groups.aspx')}
      /> */}
      <Route
        path={'/Groups'}
        render={props => <Groups props={props} classes={classes} />}
      />
      <Route
        path={`/ClientSearch`}
        component={transferUrl('/Pulseem/ClientSearch.aspx')}
      />
      <Route
        path={`/ClientAdvancedSearch`}
        component={transferUrl('/Pulseem/ClientAdvancedSearch.aspx')}
      />
      <Route
        path={`/DynamicGroups`}
        component={transferUrl('/Pulseem/DynamicGroups.aspx')}
      />
      <Route
        path={`/FileUploads`}
        component={transferUrl('/Pulseem/FileUploads.aspx')}
      />
      {/* Newsletter */}
      <Route
        exact
        path="/Campaigns"
        render={props => <NewsletterManagment {...props} classes={classes} />}
      />
      <Route
        exact
        path="/newsletterwizard"
        render={props => <NewsLetterWizard {...props} classes={classes} />}
      />
      <Route
        exact
        path="/Campaigns/editor"
        render={props => <CampaignEditor {...props} classes={classes} />}
      />
      <Route
        path="/Campaigns/editor/:id"
        render={props => <CampaignEditor {...props} classes={classes} />}
      />
      <Route
        exact
        path="/Campaigns/Archive"
        render={props => <ArchiveManagement {...props} classes={classes} />}
      />
      <Route
        path={`/Editor/CampaignInfo`}
        component={transferUrl('/Pulseem/Editor/CampaignInfo?new=1')}
      />
      <Route
        path={`/CampaignsByResults`}
        component={transferUrl('/Pulseem/CampaignsByResults.aspx')}
      />
      <Route
        path={`/CampaignsAbTestings`}
        component={transferUrl('/Pulseem/CampaignsAbTestings.aspx')}
      />
      <Route
        path={`/AutoSendPlans`}
        component={transferUrl('/Pulseem/AutoSendPlans.aspx')}
      />
      <Route
        path={`/CampaignTemplates`}
        component={transferUrl('/Pulseem/CampaignTemplates.aspx')}
      />
      <Route
        path={`/CampaignEdit`}
        component={transferUrl('/Pulseem/CampaignEdit.aspx?NewsLetterType=Basic')}
      />
      {/* SMS */}
      <Route
        path={`/SMSCampaigns`}
        render={props => <SmsManagment {...props} classes={classes} />}
      />
      <Route
        path={`/SMSCampaignEdit`}
        component={transferUrl('/Pulseem/SMSCampaignEdit.aspx?action=edit&t=create')}
      />
      <Route
        path={`/SMSSmartResponses`}
        component={transferUrl('/Pulseem/SMSSmartResponses.aspx')}
      />
      <Route
        path={`/ResponsesReport`}
        component={transferUrl('/Pulseem/ResponsesReport.aspx')}
      />
      <Route
        path={`/SMSPreviewCampaign/:id`}
        component={transferUrl('/Pulseem/SMSPreviewCampaign.aspx?SMSCampaignID=', 'id')}
      />
      <Route
        path={`/Edit/SMSCampaignEdit/:id`}
        component={transferUrl('/Pulseem/SMSCampaignEdit.aspx?SMSCampaignID=', 'id')}
      />

      {/* MMS */}
      <Route
        path="/MmsCampaigns"
        render={props => <MmsManagment {...props} classes={classes} />}
      />
      <Route
        path="/CreateMmsCampaign"
        component={transferUrl('/Pulseem/MmsCampaignEdit.aspx')}
      />
      <Route
        path='/MmsCampaignEdit/:id'
        component={transferUrl('/Pulseem/MmsCampaignEdit.aspx?MmsCampaignID=', 'id')}
      />
      <Route
        path='/MmsPreviewCampaign/:id'
        component={transferUrl('/Pulseem/MmsPreviewCampaign.aspx?MmsCampaignID=', 'id')}
      />
      <Route
        path='/SendMmsCampaign/:id'
        component={transferUrl('/Pulseem/SendMmsCampaign.aspx?MmsCampaignID=', 'id')}
      />
      {/* Landing Pages */}

      <Route
        path='/NewWebForm/NewFormEdit/:id'
        component={transferUrl('/Pulseem/NewWebForm/NewFormEdit/', 'id')}
      />
      <Route
        path="/ClientSearchResult/:referrer/:id"
        render={props => <ClientSearchResult {...props} classes={classes} />}
      />

      <Route
        path="/EditRegistrationPage"
        render={props => <LandingPagesesManagment {...props} classes={classes} />}
      />
      <Route
        path={`/LandingPageWizard`}
        component={transferUrl('/Pulseem/LandingPageWizard.aspx')}
      />
      <Route
        path={`/FormTemplates`}
        component={transferUrl('/Pulseem/FormTemplates.aspx')}
      />
      {/* Reports */}
      <Route
        path={`/Reports/NewsletterReports`}
        render={props => <NewslettersReport {...props} classes={classes} />}
      />
      <Route
        path={`/ClalReport`}
        component={transferUrl('/Pulseem/ClalReport.aspx')}
      />
      <Route
        path={`/Reports/SMSMainReport`}
        render={props => <SmsReport {...props} classes={classes} />}
      />
      <Route
        exact
        path={"/Reports/SmsReplies/:id"}
        render={props => <SmsReplies props={props} classes={classes} />}
      />
      <Route
        path={`/Reports/MmsMainReport`}
        render={props => <MmsReport {...props} classes={classes} />}
      />
      <Route
        path={`/AbTestsReport`}
        component={transferUrl('/Pulseem/AbTestsReport.aspx')}
      />
      <Route
        path={`/AccountReport`}
        component={transferUrl('/Pulseem/AccountReport.aspx')}
      />
      {/* <Route
        path={`/CampaignComparison`}
        component={transferUrl('/Pulseem/CampaignComparison.aspx')}
      /> */}
      <Route
        path={`/ClientReport`}
        component={transferUrl('/Pulseem/ClientReport.aspx')}
      />
      <Route
        path={`/EmailAutoReports`}
        component={transferUrl('/Pulseem/EmailAutoReports.aspx')}
      />
      <Route
        path={`/RemovedStats`}
        component={transferUrl('/Pulseem/RemovedStats.aspx')}
      />
      <Route
        path={`/DirectEmailReport`}
        component={transferUrl('/Pulseem/DirectEmailReport.aspx')}
      />
      <Route
        exact
        path={`/Reports/DirectSendReport`}
        render={props => <DirectSendReport {...props} classes={classes} isArchive={false} />}
      />
      <Route
        exact
        path={`/Reports/DirectSendReport/Archive`}
        render={props => <DirectSendReport {...props} classes={classes} isArchive={true} />}
      />
      <Route
        path={`/EmailCampaignStatistics`}
        component={transferUrl('/Pulseem/EmailCampaignStatistics.aspx')}
      />
      {/* Automations */}
      <Route
        path="/Automations"
        render={props => <AutomationManagment {...props} classes={classes} />}
      />
      <Route
        path={`/CreateAutomations`}
        component={transferUrl('/Pulseem/CreateAutomations.aspx')}
      />

      <Route
        path="/EditAutomations/:id"
        component={transferUrl('/Pulseem/CreateAutomations.aspx?AutomationID=', 'id')}
      />
      <Route
        path="/PreviewAutomations/:id"
        component={transferUrl('/Pulseem/CreateAutomations.aspx?Mode=show&AutomationID=', 'id')}
      />
      <Route
        path="/AutomationReport/:id"
        component={transferUrl('/Pulseem/automationreport.aspx?AutomationID=', 'id')}
      />
      {/* Notifications */}
      <Route
        exact
        path={`/Notifications`}
        render={props => <NotificationManagement {...props} classes={classes} />}
      />
      <Route
        exact
        path={"/Notification/create"}
        render={props => <NotificationEditor props={props} classes={classes} />}
      />
      <Route
        exact
        path={"/Notification/edit/:id"}
        render={props => <NotificationEditor props={props} classes={classes} />}
      />
      <Route
        exact
        path={"/Notification/send/:id"}
        render={props => <NotificationEditor props={props} classes={classes} />}
      />
      {/* Settings */}
      <Route
        path={`/AccountSettings`}
        component={transferUrl('/Pulseem/AccountSettings.aspx')}
      />
      <Route
        path={`/AccountBilling`}
        component={transferUrl('/Pulseem/AccountBilling.aspx')}
      />
      <Route
        path={`/AccountUsers`}
        component={transferUrl('/Pulseem/AccountUsers.aspx')}
      />
      <Route
        path={`/AccountUsersReport`}
        component={transferUrl('/Pulseem/AccountUsersReport.aspx')}
      />
      <Route
        path={`/ExtraFieldsDefinition`}
        component={transferUrl('/Pulseem/ExtraFieldsDefinition.aspx')}
      />
      <Route
        path={`/ApiSettings`}
        component={transferUrl('/Pulseem/ApiSettings.aspx')}
      />
      {/* Support */}
      <Route
        path={`/Support`}
        component={() => {
          window.open("https://www.pulseem.co.il/Pages/Home.aspx?action=support", "_blank")
          return null
        }}
      />
      <Route
        exact
        path={`/SiteTracking`}
        render={props => <SiteTrackingEditor props={props} classes={classes} />}
      />
    </>
  )
}


const App = ({ isRTL, classes, theme, language }) => {
  return (
    <MuiPickersUtilsProvider utils={MomentUtils} libInstance={moment} locale={language}>
      <MuiThemeProvider theme={theme}>
        <div dir={isRTL ? 'rtl' : 'ltr'}>
          {renderRoutes(classes)}
        </div>
      </MuiThemeProvider>
    </MuiPickersUtilsProvider>

  )
}

function useWidth() {
  const { language } = useSelector(state => state.core)
  const theme = getTheme(language);
  const keys = [...theme.breakpoints.keys].reverse();
  return (
    keys.reduce((output, key) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const matches = useMediaQuery(theme.breakpoints.up(key));
      return !output && matches ? key : output;
    }, null) || 'xs'
  );
}

const AppContainer = () => {
  const dispatch = useDispatch()
  const { language, isRTL, windowSize, accountSettings } = useSelector(state => state.core)
  const classes = useClasses(windowSize, isRTL)()
   const theme = getTheme(language)
  // const navigate = useNavigate()
  const jss = create({ plugins: [...jssPreset().plugins, rtl()] });
  const width = useWidth();
  dispatch(setWindowSize(width))

  useEffect(() => {
    const initFeatures = async () => {
      if (!accountSettings) {
        const settings = await dispatch(getCommonFeatures());
        dispatch(setAccountFeatures(settings.payload));
      }
      const response = await dispatch(isClalAccount());
      dispatch(setIsClal(response.payload));
      setCookie('OldVersion', false);
    }


    const updateToken = () => {
      const culture = getCookie('Culture')
      const token = getCookie('jtoken')
      const rpp = getCookie('rpp') || 6
      if (!token) return
      const jwt = jwt_decode(token)
      const {
        email = '',
        unique_name = '',
        nameid: companyName,
        certthumbprint: billingTypeId,
        role: isAdmin,
        'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/homephone': phone = '',
        'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/locality': locality = 'he-IL',
        'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/stateorprovince': imageURL = '',
        'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/uri': isWhiteLabel = '',
        'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/authorizationdecision': cameFromSubAccount = '',
        // 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role': isAdmin = '',
        'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name': basename = '',
        'http://schemas.microsoft.com/ws/2008/06/identity/claims/userdata': isAllowSwitchAccount = ''
      } = jwt


      dispatch(setCoreData({ email, basename, phone, imageURL, isWhiteLabel, companyName, cameFromSubAccount, isAdmin, isAllowSwitchAccount, billingTypeId }))
      let lang = culture || locality; //||'he'
      setCookie('Culture', lang.toLowerCase())
      lang = lang.split('-')[0]
      i18n.changeLanguage(lang.toLowerCase())
      dispatch(setRowsPerPage(rpp || 6))
      dispatch(setLanguage(lang.toLowerCase()))
      dispatch(setUsername(companyName))

    }

    const cookieFunctionObj = {
      jtoken: updateToken
    }

    // window.addEventListener('resize',setWindowWidth)
    cookieListener(({ name }) => {
      const cookieFunction = cookieFunctionObj[name] || null
      if (!!cookieFunction)
        cookieFunction()
    })
    updateToken()
    initFeatures()
  }, [dispatch])


  document.body.classList.add(classes.sidebar);

  if (isRTL) document.body.classList.add('rtl');
  else document.body.classList.remove('rtl');

  return (
    <StylesProvider jss={jss}>
      <BrowserRouter basename='/react'>
        <App isRTL={isRTL}
          classes={classes}
          // navigate={navigate}
          theme={theme}
          language={language}
          screenSize={width} />
      </BrowserRouter>
    </StylesProvider>
  )
}

export default AppContainer;
