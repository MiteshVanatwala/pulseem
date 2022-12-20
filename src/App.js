import React, { useEffect, useRef } from 'react';
import NewsletterManagment from './screens/Newsletter/Management/NewsletterManagment';
import CampaignEditorBee from './screens/HtmlCampaign/CampaignEditorBee';
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
import { BrowserRouter, useParams, Route, Routes, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setWindowSize, setCoreData, setLanguage, setRowsPerPage, setIsClal, setAccountFeatures } from './redux/reducers/coreSlice' //smsOldVersion
import { isClalAccount, getCommonFeatures } from './redux/reducers/commonSlice';
import { setUsername } from './redux/reducers/userSlice'
import { getTheme } from './style/theme'
import { useClasses } from './style/classes/index'
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import MomentUtils from '@date-io/moment';
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
import Groups from './screens/Groups/Management/Groups';
import MmsReport from './screens/Reports/MmsReport/MmsReport.js';
import NewsLetterWizard from './screens/Newsletter/Wizard/NewsLetterWizard';
import ClientSearchResult from './screens/ClientSearch/ClientSearchResult';
import ProductsReport from './screens/Reports/ProductsReport/ProductsReport';

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
    <Routes>
      <Route
        exact
        path="/"
        element={<DashboardScreen classes={classes} />}
      />
      <Route

        path="/sms/create/"
        element={<SmsCreator classes={classes} />}
      />
      <Route
        path="/sms/edit/:id"
        element={<SmsCreator classes={classes} />}
      />
      <Route

        path="/sms/send/:id"
        element={<SmsSend classes={classes} />}
      />
      <Route
        path={`/notifications/edit/:notificationID`}
        element={transferUrl('/Pulseem/notifications/Edit/', 'notification')}
      />
      <Route
        path={`/SendCampaign/:campaignID`}
        element={transferUrl('/Pulseem/SendCampaign.aspx?CampaignID=', 'campaign')}
      />
      <Route
        path={`/PreviewCampaign/:campaignID`}
        element={transferUrl('/Pulseem/PreviewCampaign.aspx?CampaignID=', 'campaign')}
      />
      <Route
        path={`/Editor/CampaignEdit/:campaignID`}
        element={transferUrl('/Pulseem/Editor/CampaignEdit/', 'campaign')}
      />
      <Route
        path={`/DuplicateCampign/:campaignID`}
        element={transferUrl('/Pulseem/DuplicateCampign/', 'campaign')}
      />
      <Route
        path={`/CampaignStatistics/:campaignID`}
        // element={transferUrl('/Pulseem/CampaignStatistics.aspx?CampaignID=', 'campaign')}
        element={<GraphicReport classes={classes} />}
      />
      <Route
        path={`/homepage`}
        element={transferUrl('/Pulseem/homepage.aspx')}
      />
      {/* <Route
        path={`/Groups`}
        element={transferUrl('/Pulseem/Groups.aspx')}
      /> */}
      <Route
        path={'/Groups'}
        element={<Groups classes={classes} />}
      />
      <Route
        path={`/ClientSearch`}
        element={transferUrl('/Pulseem/ClientSearch.aspx')}
      />
      {/* <Route
        path={`/ClientAdvancedSearch`}
        element={transferUrl('/Pulseem/ClientAdvancedSearch.aspx')}
      /> */}
      <Route
        path={`/DynamicGroups`}
        element={transferUrl('/Pulseem/DynamicGroups.aspx')}
      />
      <Route
        path={`/FileUploads`}
        element={transferUrl('/Pulseem/FileUploads.aspx')}
      />
      {/* Newsletter */}
      <Route
        exact
        path="/Campaigns"
        element={<NewsletterManagment classes={classes} />}
      />
      <Route
        exact
        path="/Campaigns/Create"
        element={<NewsLetterWizard classes={classes} />}
      />
      <Route
        path="/Campaigns/Create/:id"
        element={<NewsLetterWizard classes={classes} />}
      />
      <Route
        exact
        path="/Campaigns/editor"
        element={<CampaignEditorBee classes={classes} />}
      />
      <Route
        path="/Campaigns/editor/:id"
        element={<CampaignEditorBee classes={classes} />}
      />
      <Route
        exact
        path="/Campaigns/Archive"
        element={<ArchiveManagement classes={classes} />}
      />
      {/* <Route
        path={`/Editor/CampaignInfo`}
        element={transferUrl('/Pulseem/Editor/CampaignInfo?new=1')}
      />
      <Route
        path={`/CampaignsByResults`}
        element={transferUrl('/Pulseem/CampaignsByResults.aspx')}
      />
      <Route
        path={`/CampaignsAbTestings`}
        element={transferUrl('/Pulseem/CampaignsAbTestings.aspx')}
      />
      <Route
        path={`/AutoSendPlans`}
        element={transferUrl('/Pulseem/AutoSendPlans.aspx')}
      />
      <Route
        path={`/CampaignTemplates`}
        element={transferUrl('/Pulseem/CampaignTemplates.aspx')}
      />
      <Route
        path={`/CampaignEdit`}
        element={transferUrl('/Pulseem/CampaignEdit.aspx?NewsLetterType=Basic')}
      />
      {/* SMS */}
      <Route
        path={`/SMSCampaigns`}
        element={<SmsManagment classes={classes} />}
      />
      <Route
        path={`/SMSCampaignEdit`}
        element={transferUrl('/Pulseem/SMSCampaignEdit.aspx?action=edit&t=create')}
      />
      <Route
        path={`/SMSSmartResponses`}
        element={transferUrl('/Pulseem/SMSSmartResponses.aspx')}
      />
      <Route
        path={`/ResponsesReport`}
        element={transferUrl('/Pulseem/ResponsesReport.aspx')}
      />
      <Route
        path={`/SMSPreviewCampaign/:id`}
        element={transferUrl('/Pulseem/SMSPreviewCampaign.aspx?SMSCampaignID=', 'id')}
      />
      <Route
        path={`/Edit/SMSCampaignEdit/:id`}
        element={transferUrl('/Pulseem/SMSCampaignEdit.aspx?SMSCampaignID=', 'id')}
      />

      {/* MMS */}
      <Route
        path="/MmsCampaigns"
        element={<MmsManagment classes={classes} />}
      />
      <Route
        path="/CreateMmsCampaign"
        element={transferUrl('/Pulseem/MmsCampaignEdit.aspx')}
      />
      <Route
        path='/MmsCampaignEdit/:id'
        element={transferUrl('/Pulseem/MmsCampaignEdit.aspx?MmsCampaignID=', 'id')}
      />
      <Route
        path='/MmsPreviewCampaign/:id'
        element={transferUrl('/Pulseem/MmsPreviewCampaign.aspx?MmsCampaignID=', 'id')}
      />
      <Route
        path='/SendMmsCampaign/:id'
        element={transferUrl('/Pulseem/SendMmsCampaign.aspx?MmsCampaignID=', 'id')}
      />
      {/* Landing Pages */}

      <Route
        path='/NewWebForm/NewFormEdit/:id'
        element={transferUrl('/Pulseem/NewWebForm/NewFormEdit/', 'id')}
      />

      {/* <Route
        path="/ClientSearchResult/:id"
        element={transferUrl('/Pulseem/ClientSearchResult.aspx?FormID=', 'id')}
      /> */}
      {/* <Route
        path="/ClientSearchResult"
        element={<ClientSearchResult classes={classes} />}
      /> */}
      <Route path="/ClientSearchResult/">
        <Route
          path=""
          element={<ClientSearchResult classes={classes} />}
        />
        <Route
          path=":id"
          element={<ClientSearchResult classes={classes} />}
        />
      </Route>
      <Route
        path="/EditRegistrationPage"
        element={<LandingPagesesManagment classes={classes} />}
      />
      <Route
        path={`/LandingPageWizard`}
        element={transferUrl('/Pulseem/LandingPageWizard.aspx')}
      />
      <Route
        path={`/FormTemplates`}
        element={transferUrl('/Pulseem/FormTemplates.aspx')}
      />
      {/* Reports */}
      <Route
        path={`/Reports/NewsletterReports`}
        //component={transferUrl('/Pulseem/MainReport.aspx')}
        element={<NewslettersReport classes={classes} />}
      />
      <Route
        path={`/ClalReport`}
        element={transferUrl('/Pulseem/ClalReport.aspx')}
      />
      <Route
        path={`/Reports/SMSMainReport`}
        element={<SmsReport classes={classes} />}
      />
      <Route
        exact
        path={"/Reports/SmsReplies/:id"}
        element={<SmsReplies classes={classes} />}
      />
      <Route
        path={`/Reports/MmsMainReport`}
        element={<MmsReport classes={classes} />}
      />
      <Route
        exact
        path={`/Reports/ProductReport`}
        element={<ProductsReport classes={classes} />}
      />
      <Route
        path={`/AbTestsReport`}
        element={transferUrl('/Pulseem/AbTestsReport.aspx')}
      />
      <Route
        path={`/AccountReport`}
        element={transferUrl('/Pulseem/AccountReport.aspx')}
      />
      <Route
        path={`/Reports/ProductsReport`}
        element={<ProductsReport classes={classes} />}
      />
      {/* <Route
        path={`/CampaignComparison`}
        element={transferUrl('/Pulseem/CampaignComparison.aspx')}
      /> */}
      <Route
        path={`/ClientReport`}
        element={transferUrl('/Pulseem/ClientReport.aspx')}
      />
      <Route
        path={`/EmailAutoReports`}
        element={transferUrl('/Pulseem/EmailAutoReports.aspx')}
      />
      <Route
        path={`/RemovedStats`}
        element={transferUrl('/Pulseem/RemovedStats.aspx')}
      />
      <Route
        path={`/DirectEmailReport`}
        element={transferUrl('/Pulseem/DirectEmailReport.aspx')}
      />
      <Route
        exact
        path={`/Reports/DirectSendReport`}
        element={<DirectSendReport classes={classes} isArchive={false} />}
      />
      <Route
        exact
        path={`/Reports/DirectSendReport/Archive`}
        element={<DirectSendReport classes={classes} isArchive={true} />}
      />
      <Route
        path={`/EmailCampaignStatistics`}
        element={transferUrl('/Pulseem/EmailCampaignStatistics.aspx')}
      />
      {/* Automations */}
      <Route
        path="/Automations"
        element={<AutomationManagment classes={classes} />}
      />
      <Route
        path={`/CreateAutomations`}
        element={transferUrl('/Pulseem/CreateAutomations.aspx')}
      />

      <Route
        path="/EditAutomations/:id"
        element={transferUrl('/Pulseem/CreateAutomations.aspx?AutomationID=', 'id')}
      />
      <Route
        path="/PreviewAutomations/:id"
        element={transferUrl('/Pulseem/CreateAutomations.aspx?Mode=show&AutomationID=', 'id')}
      />
      <Route
        path="/AutomationReport/:id"
        element={transferUrl('/Pulseem/automationreport.aspx?AutomationID=', 'id')}
      />
      {/* Notifications */}
      <Route
        exact
        path={`/Notifications`}
        element={<NotificationManagement classes={classes} />}
      />
      <Route
        exact
        path={"/Notification/create"}
        element={<NotificationEditor classes={classes} />}
      />
      <Route
        exact
        path={"/Notification/edit/:id"}
        element={<NotificationEditor classes={classes} />}
      />
      <Route
        exact
        path={"/Notification/send/:id"}
        element={<NotificationEditor classes={classes} />}
      />
      {/* Settings */}
      <Route
        path={`/AccountSettings`}
        element={transferUrl('/Pulseem/AccountSettings.aspx')}
      />
      <Route
        path={`/AccountBilling`}
        element={transferUrl('/Pulseem/AccountBilling.aspx')}
      />
      <Route
        path={`/AccountUsers`}
        element={transferUrl('/Pulseem/AccountUsers.aspx')}
      />
      <Route
        path={`/AccountUsersReport`}
        element={transferUrl('/Pulseem/AccountUsersReport.aspx')}
      />
      <Route
        path={`/ExtraFieldsDefinition`}
        element={transferUrl('/Pulseem/ExtraFieldsDefinition.aspx')}
      />
      <Route
        path={`/ApiSettings`}
        element={transferUrl('/Pulseem/ApiSettings.aspx')}
      />
      {/* Support */}
      <Route
        path={`/Support`}
        element={() => {
          window.open("https://www.pulseem.co.il/Pages/Home.aspx?action=support", "_blank")
          return null
        }}
      />
      <Route
        exact
        path={`/SiteTracking`}
        element={<SiteTrackingEditor classes={classes} />}
      />
    </Routes>
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
  const userName = useRef();

  const initFeatures = async () => {
    if (!accountSettings) {
      //TODO: add promise to getCommonFeature & then setAccountFeature OR move setAccountFeatures to commonSlice.
      const settings = await dispatch(getCommonFeatures({ companyName: userName.current }));
      dispatch(setAccountFeatures(settings.payload));
    }
    const response = await dispatch(isClalAccount());
    dispatch(setIsClal(response.payload));
    setCookie('OldVersion', false);
  }

  useEffect(() => {
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
      userName.current = companyName;
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
    updateToken();
    initFeatures();
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
