import React, { useEffect, useRef } from 'react';
import NewsletterManagment from './screens/Newsletter/Management/NewsletterManagment';
import CampaignEditorBee from './screens/HtmlCampaign/CampaignEditorBee';
import ArchiveManagement from './screens/Newsletter/Management/ArchiveManagement';
import AutomationManagment from './screens/Automations/Management/AutomationsManagment';
import LandingPagesesManagment from './screens/LandingPages/Management/LandingPagesManagment'
import MmsManagment from './screens/Mms/Management/MmsManagment';
import SmsManagment from './screens/Sms/Management/SmsManagment';
import { getCookie, setCookie, cookieListener } from './helpers/Functions/cookies'
import { create } from 'jss';
import rtl from 'jss-rtl';
import jwt_decode from "jwt-decode";
import { StylesProvider, jssPreset, MuiThemeProvider } from '@material-ui/core/styles';
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
import NotificationEdit from './screens/Notifications/Editor/NotificationEdit';
import NewslettersReport from './screens/Reports/NewslettersReport/NewslettersReport'
import { useMediaQuery } from '@material-ui/core';
import DashboardScreen from './screens/Dashboard/Dashboard';
import GraphicReport from './screens/Reports/NewslettersReport/GraphicReport';
import SmsReport from './screens/Reports/SmsReport/SmsReport';
import SmsCreator from './screens/Sms/Editor/SmsCreator';
import SmsSend from './screens/Sms/Editor/SmsSend';
import SiteTrackingEditor from './screens/SiteTracking/SiteTrackingEditor';
import SmsReplies from './screens/Reports/Inbound/Sms/SmsReplies';
import Groups from './screens/Groups/Management/Groups';
import MmsReport from './screens/Reports/MmsReport/MmsReport.js';
import NewsLetterInfo from './screens/Newsletter/Wizard/NewsLetterInfo';
import ClientSearchResult from './screens/ClientSearch/ClientSearchResult';
import ProductsReport from './screens/Reports/ProductsReport/ProductsReport';
import NotificationSend from './screens/Notifications/Editor/NotificationSend';
import PageNotFound from './screens/404';
import AccountSettingsEditor from './screens/Settings/AccountSettings/AccountSettingsEditor';
import BillingSettingsEditor from './screens/Settings/BillingSettings/BillingSettingsEditor';
import { sitePrefix } from './config/index'
// import ResponsesReports from './screens/Reports/ResponsesReports/ResponsesReports';
import InboundMessages from './screens/Reports/Inbound/InboundMessages';

const renderRoutes = (classes) => {
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
        path={sitePrefix}
        element={<DashboardScreen classes={classes} />}
      />
      <Route

        path={`${sitePrefix}sms/create/`}
        element={<SmsCreator classes={classes} />}
      />
      <Route
        path={`${sitePrefix}sms/edit/:id`}
        element={<SmsCreator classes={classes} />}
      />
      <Route

        path={`${sitePrefix}sms/send/:id`}
        element={<SmsSend classes={classes} />}
      />
      <Route
        path={`${sitePrefix}SendCampaign/:campaignID`}
        component={transferUrl('/Pulseem/SendCampaign.aspx?CampaignID=', 'campaign')}
      />
      <Route
        path={`/PreviewCampaign/:campaignID`}
        component={transferUrl('/Pulseem/PreviewCampaign.aspx?CampaignID=', 'campaign')}
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
        path={`${sitePrefix}CampaignStatistics/:campaignID`}
        // component={transferUrl('/Pulseem/CampaignStatistics.aspx?CampaignID=', 'campaign')}
        element={<GraphicReport classes={classes} />}
      />
      <Route
        path={`${sitePrefix}Groups`}
        element={<Groups classes={classes} />}
      />
      <Route
        path={`/ClientSearch`}
        component={transferUrl('/Pulseem/ClientSearch.aspx')}
      />
      {/* <Route
        path={`/ClientAdvancedSearch`}
        element={transferUrl('/Pulseem/ClientAdvancedSearch.aspx')}
      /> */}
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
        path={`${sitePrefix}Campaigns`}
        element={<NewsletterManagment classes={classes} />}
      />
      <Route
        exact
        path={`${sitePrefix}Campaigns/Create`}
        element={<NewsLetterInfo classes={classes} />}
      />
      <Route
        path={`${sitePrefix}Campaigns/Create/:id`}
        element={<NewsLetterInfo  classes={classes}/>}
      />
      <Route
        exact
        path={`${sitePrefix}Campaigns/editor`}
        element={<CampaignEditorBee classes={classes} />}
      />
      <Route
        path={`${sitePrefix}Campaigns/editor/:id`}
        element={<CampaignEditorBee classes={classes} />}
      />
      <Route
        exact
        path={`${sitePrefix}Campaigns/Archive`}
        element={<ArchiveManagement classes={classes} />}
      />
      {/* SMS */}
      <Route
        path={`${sitePrefix}SMSCampaigns`}
        element={<SmsManagment classes={classes} />}
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
        path={`${sitePrefix}MmsCampaigns`}
        element={<MmsManagment classes={classes} />}
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
        path={`${sitePrefix}ClientSearchResult/:referrer/:id`}
        element={<ClientSearchResult classes={classes} />}
      />
      <Route
        path={`${sitePrefix}ClientSearchResult`}
        element={<ClientSearchResult classes={classes} />}
      />
      <Route
        path={`${sitePrefix}EditRegistrationPage`}
        element={<LandingPagesesManagment classes={classes} />}
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
        path={`${sitePrefix}Reports/NewsletterReports`}
        element={<NewslettersReport classes={classes} />}
      />
      <Route
        path={`/ClalReport`}
        component={transferUrl('/Pulseem/ClalReport.aspx')}
      />
      <Route
        path={`${sitePrefix}Reports/SMSMainReport`}
        element={<SmsReport classes={classes} />}
      />
      <Route
        exact
        path={`${sitePrefix}Reports/SmsReplies/:id`}
        element={<SmsReplies classes={classes} />}
      />
      <Route
        path={`${sitePrefix}Reports/MmsMainReport`}
        element={<MmsReport classes={classes} />}
      />
      <Route
        exact
        path={`${sitePrefix}Reports/ProductsReport`}
        element={<ProductsReport classes={classes} />}
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
        element={transferUrl('/Pulseem/CampaignComparison.aspx')}
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
        path={`${sitePrefix}Reports/DirectSendReport`}
        element={<DirectSendReport classes={classes} isArchive={false} />}
      />
      <Route
        exact
        path={`${sitePrefix}Reports/DirectSendReport/Archive`}
        element={<DirectSendReport classes={classes} isArchive={true} />}
      />
      {/* <Route
        exact
        path={`${sitePrefix}Reports/ResponsesReports`}
        element={<ResponsesReports />}
      /> */}
      <Route
        path={`/EmailCampaignStatistics`}
        component={transferUrl('/Pulseem/EmailCampaignStatistics.aspx')}
      />
      {/* Automations */}
      <Route
        path={`${sitePrefix}Automations`}
        element={<AutomationManagment classes={classes} />}
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
        path={`${sitePrefix}Notifications`}
        element={<NotificationManagement classes={classes} />}
      />
      <Route
        exact
        path={`${sitePrefix}Notification/create`}
        element={<NotificationEdit classes={classes} />}
      />
      <Route
        exact
        path={`${sitePrefix}Notification/edit/:id`}
        element={<NotificationEdit classes={classes} />}
      />
      <Route
        exact
        path={`${sitePrefix}Notification/send/:id`}
        element={<NotificationSend classes={classes} />}
      />
      {/* Settings */}
      <Route
        exact
        path={`${sitePrefix}AccountSettings`}
        element={<AccountSettingsEditor classes={classes} />}
      />
      <Route
        exact
        path={`${sitePrefix}BillingSettings`}
        element={<BillingSettingsEditor classes={classes} />}
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
        element={() => {
          window.open("https://www.pulseem.co.il/Pages/Home.aspx?action=support", "_blank")
          return null
        }}
      />
      <Route
        exact
        path={`${sitePrefix}SiteTracking`}
        element={<SiteTrackingEditor classes={classes} />}
      />
      <Route
        exact
        path={`${sitePrefix}reports/Inbound`}
        element={<InboundMessages classes={classes} />}
      />
      <Route
        exact
        path={`${sitePrefix}reports/Inbound/:type`}
        element={<InboundMessages classes={classes} />}
      />
      <Route
        exact
        path={`${sitePrefix}reports/Inbound/:type/:id`}
        element={<InboundMessages classes={classes} />}
      />
      <Route
        path="*" element={<PageNotFound classes={classes} />}
      />
    </Routes>
  )
}

const App = ({ screenSize }) => {
  const dispatch = useDispatch()
  const { language, isRTL, windowSize, accountSettings } = useSelector(state => state.core)


  useEffect(() => {
    windowSize !== screenSize && dispatch(setWindowSize(screenSize))
  }, [screenSize])

  const userName = useRef();


  useEffect(() => {
    const initFeatures = async () => {
      const isClal = getCookie('isClal');
      if (!accountSettings) {
        //TODO: add promise to getCommonFeature & then setAccountFeature OR move setAccountFeatures to commonSlice.
        const settings = await dispatch(getCommonFeatures({ companyName: userName.current }));
        dispatch(setAccountFeatures(settings.payload));
      }
      if (isClal === undefined) {
        const response = await dispatch(isClalAccount());
        dispatch(setIsClal(response.payload));
      }
    }

    const updateToken = () => {
      const culture = getCookie('Culture')
      const token = getCookie('jtoken')
      const rpp = getCookie('rpp') || 6
      if (!token) return
      const jwt = jwt_decode(token)
      const {
        email = '',
        // unique_name = '',
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
    updateToken()
    initFeatures()

  }, [dispatch])
 

  const classes = useClasses(windowSize, isRTL)()
  const theme = getTheme(language)
  const redirect = useNavigate()
  document.body.classList.add(classes.sidebar);

  if (isRTL) document.body.classList.add('rtl');
  else document.body.classList.remove('rtl');

  return (
    <MuiPickersUtilsProvider utils={MomentUtils} libInstance={moment} locale={language}>
      <MuiThemeProvider theme={theme}>
        <div dir={isRTL ? 'rtl' : 'ltr'} className={classes.appBody}>
          {renderRoutes(classes, redirect)}
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
  const jss = create({ plugins: [...jssPreset().plugins, rtl()] });
  const width = useWidth();

  return (
    <StylesProvider jss={jss}>
      <BrowserRouter basename='/'>
        <App screenSize={width} />
      </BrowserRouter>
    </StylesProvider>
  )
}

export default AppContainer;
