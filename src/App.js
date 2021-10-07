import React, { useEffect } from 'react';
import NewsletterManagment from './screens/Newsletter/Management/NewsletterManagment';
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
import { setWindowSize, setCoreData, setLanguage, setRowsPerPage, setIsClal, setAccountFeatures } from './redux/reducers/coreSlice'
import { isClalAccount, getAccountFeatures } from './redux/reducers/commonSlice';
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
import NewslettersReport from './screens/Reports/NewslettersReport'
import { useMediaQuery } from '@material-ui/core';
import DashboardScreen from './screens/Dashboard/Dashboard';
import SmsReport from './screens/Reports/SmsReport';
import SmsCreator from './screens/Sms/Management/SmsCreator';
import SmsSend from './screens/Sms/Management/SmsSend';

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
        component={transferUrl('/Pulseem/CampaignStatistics.aspx?CampaignID=', 'campaign')}
      />
      <Route
        path={`/homepage`}
        component={transferUrl('/Pulseem/homepage.aspx')}
      />
      {/* Groups */}
      <Route
        path={`/Groups`}
        component={transferUrl('/Pulseem/Groups.aspx')}
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
        path="/Campaigns"
        render={props => <NewsletterManagment {...props} classes={classes} />}
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
        path="/ClientSearchResult/:id"
        component={transferUrl('/Pulseem/ClientSearchResult.aspx?FormID=', 'id')}
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
        //component={transferUrl('/Pulseem/MainReport.aspx')}
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
        path={`/MmsMainReport`}
        component={transferUrl('/Pulseem/MmsMainReport.aspx')}
      />
      <Route
        path={`/AbTestsReport`}
        component={transferUrl('/Pulseem/AbTestsReport.aspx')}
      />
      <Route
        path={`/AccountReport`}
        component={transferUrl('/Pulseem/AccountReport.aspx')}
      />
      <Route
        path={`/CampaignComparison`}
        component={transferUrl('/Pulseem/CampaignComparison.aspx')}
      />
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
        path={`/Reports/DirectSendReport`}
        render={props => <DirectSendReport {...props} classes={classes} />}
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
    </>
  )
}

const App = () => {
  const dispatch = useDispatch()
  const { language, isRTL, windowSize } = useSelector(state => state.core)

  //dispatch(setWindowSize(screenSize))

  useEffect(() => {
    const initFeatures = async () => {
      const response = await dispatch(isClalAccount());
      dispatch(setIsClal(response.payload));
      const features = await dispatch(getAccountFeatures());
      dispatch(setAccountFeatures(features.payload));
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
        'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/homephone': phone = '',
        'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/locality': locality = 'he-IL',
        'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/stateorprovince': imageURL = '',
        'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/uri': isWhiteLabel = '',
        'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/authorizationdecision': cameFromSubAccount = '',
        'http://schemas.microsoft.com/ws/2008/06/identity/claims/role': isAdmin = '',
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


  const classes = useClasses(windowSize, isRTL)()
  const theme = getTheme(language)
  const history = useHistory()

  if (isRTL) document.body.classList.add('rtl');
  else document.body.classList.remove('rtl');

  return (
    <MuiPickersUtilsProvider utils={MomentUtils} libInstance={moment} locale={language}>
      <MuiThemeProvider theme={theme}>
        <div dir={isRTL ? 'rtl' : 'ltr'}>
          {renderRoutes(classes, history)}
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
  const jss = create({ plugins: [...jssPreset().plugins, rtl()] });
  const width = useWidth();

  dispatch(setWindowSize(width))

  return (
    <StylesProvider jss={jss}>
      <BrowserRouter basename='/react'>
        <App />
      </BrowserRouter>
    </StylesProvider>
  )
}

export default AppContainer;
