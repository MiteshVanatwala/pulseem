import React, { useEffect, useRef } from 'react';
import NewsletterManagment from './screens/Newsletter/Management/NewsletterManagment';
import CampaignEditorBee from './screens/HtmlCampaign/CampaignEditorBee';
import ArchiveManagement from './screens/Newsletter/Management/ArchiveManagement';
import AutomationManagment from './screens/Automations/Management/AutomationsManagment';
import LandingPagesesManagment from './screens/LandingPages/Management/LandingPagesManagment';
import MmsManagment from './screens/Mms/Management/MmsManagment';
import SmsManagment from './screens/Sms/Management/SmsManagment';
import {
  getCookie,
  setCookie,
  cookieListener,
} from './helpers/Functions/cookies';
import { create } from 'jss';
import rtl from 'jss-rtl';
import jwt_decode from "jwt-decode";
import { StylesProvider, jssPreset, MuiThemeProvider } from '@material-ui/core/styles';
import i18n from './i18n'
import { BrowserRouter, useParams, Route, Routes, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  setWindowSize,
  setCoreData,
  setLanguage,
  setRowsPerPage,
  setIsClal
} from './redux/reducers/coreSlice'; //smsOldVersion
import { getCommonFeatures, isClalAccount } from './redux/reducers/commonSlice';
import { getNotificationUpdates } from './redux/reducers/notificationUpdateSlice';
import { setUsername } from './redux/reducers/userSlice';
import { getTheme } from './style/theme';
import { useClasses } from './style/classes/index';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import MomentUtils from '@date-io/moment';
import moment from 'moment';
import DirectSendReport from './screens/Reports/DirectSendReport/DirectSendReport';
import NotificationManagement from './screens/Notifications/Management/NotificationManagement';
import NotificationEdit from './screens/Notifications/Editor/NotificationEdit';
import NewslettersReport from './screens/Reports/NewslettersReport/NewslettersReport';
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
import SystemMessage from './screens/SystemFailure/SystemMessage';
import NotificationSend from './screens/Notifications/Editor/NotificationSend';
import WhatsappCreator from './screens/Whatsapp/Editor/WhatsappCreator';
import PageNotFound from './screens/404';
import NewsletterSendSettings from './screens/Newsletter/Wizard/NewsletterSendSettings';
import ProductsReport from './screens/Reports/ProductsReport/ProductsReport';
import InboundMessages from './screens/Reports/Inbound/InboundMessages';
import { whatsappRoutes } from './screens/Whatsapp/Constant';
import SaveCampain from './screens/Whatsapp/Campaign/SaveCampain';
import SendCampaign from './screens/Whatsapp/Campaign/SendCampaign';
import ManageWhatsAppTemplates from './screens/Whatsapp/management/ManageWhatsAppTemplates';
import WhatsappReports from './screens/Whatsapp/Reports/WhatsappReports';
import ManageWhatsAppCampaigns from './screens/Whatsapp/management/ManageWhatsAppCampaigns';
import WhatsappChat from './screens/Whatsapp/Chat/WhatsappChat';
import AccountSettingsEditor from './screens/Settings/AccountSettings/AccountSettingsEditor';
import DownloadFiles from './screens/Reports/DownloadFiles/DownloadFiles.tsx';
import Integrations from './screens/Integrations/Integrations';

const renderRoutes = (classes, redirect) => {
  const transferUrl =
    (url = '', param = '') =>
      () => {
        const { campaignID, automationID, id, notificationID } = useParams();
        const addParam = {
          campaign: campaignID,
          automation: automationID,
          notification: notificationID,
          id: id,
        };

        window.location.href = `https://www.pulseem.co.il/${url}${addParam[param] || ''}`
        return <></>
      }
  return (
    <Routes>
      <Route
        exact
        path="/react"
        element={<DashboardScreen classes={classes} />}
      />
      <Route

        path="/react/sms/create/"
        element={<SmsCreator classes={classes} key="create" />}
      />
      <Route
        path="/react/sms/edit/:id"
        element={<SmsCreator classes={classes} key="edit" />}
      />
      <Route

        path="/react/sms/send/:id"
        element={<SmsSend classes={classes} />}
      />
      <Route
        path={`/react/notifications/edit/:notificationID`}
        component={transferUrl('/Pulseem/notifications/Edit/', 'notification')}
      />
      {/* <Route
        path={`/react/SendCampaign/:campaignID`}
        component={transferUrl('/Pulseem/SendCampaign.aspx?CampaignID=', 'campaign')}
      /> */}
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
        path={`/react/CampaignStatistics/:campaignID`}
        element={<GraphicReport classes={classes} />}
      />
      <Route
        path={'/react/Groups'}
        element={<Groups classes={classes} />}
      />
      <Route
        path={`/ClientSearch`}
        element={transferUrl('/Pulseem/ClientSearch.aspx')}
      />
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
        path="/react/Campaigns"
        element={<NewsletterManagment classes={classes} />}
      />
      <Route
        exact
        path="/react/Campaigns/Create"
        element={<NewsLetterInfo classes={classes} key="create" />}
      />
      <Route
        path="/react/Campaigns/Create/:id"
        element={<NewsLetterInfo classes={classes} key="edit" />}
      />
      <Route
        exact
        path="/react/Campaigns/editor"
        element={<CampaignEditorBee classes={classes} />}
      />
      <Route
        path="/react/Campaigns/editor/:id"
        element={<CampaignEditorBee classes={classes} />}
      />
      <Route
        exact
        path="/react/Campaigns/SendSettings/:id"
        element={<NewsletterSendSettings classes={classes} />}
      />
      <Route
        exact
        path="/react/Campaigns/Archive"
        element={<ArchiveManagement classes={classes} />}
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
        path={`/react/SMSCampaigns`}
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
        path={`/SMSPreviewCampaign/:id`}
        element={transferUrl('/Pulseem/SMSPreviewCampaign.aspx?SMSCampaignID=', 'id')}
      />
      <Route
        path={`/Edit/SMSCampaignEdit/:id`}
        element={transferUrl('/Pulseem/SMSCampaignEdit.aspx?SMSCampaignID=', 'id')}
      />

      {/* MMS */}
      <Route
        path="/react/MmsCampaigns"
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
      {/* Whatsapp */}

      <Route
        path={whatsappRoutes.CREATE_TEMPLATE}
        element={<WhatsappCreator classes={classes} key="wa-create" />}
      />

      <Route
        path={whatsappRoutes.CREATE_CAMPAIGN_PAGE1}
        element={<SaveCampain classes={classes} />}
      />

      <Route
        path={whatsappRoutes.CREATE_CAMPAIGN_PAGE2}
        element={<SendCampaign classes={classes} key="wa-send" />}
      />

      <Route
        path={whatsappRoutes.TEMPLATE_MANAGEMENT}
        element={<ManageWhatsAppTemplates classes={classes}  key="wa-template-management" />}
      />

      <Route
        path={whatsappRoutes.REPORTS}
        element={<WhatsappReports classes={classes} key="wa-reports" />}
      />

      <Route
        path={whatsappRoutes.CAMPAIGN_MANAGEMENT}
        element={<ManageWhatsAppCampaigns classes={classes} key="wa-CAMPAIGN_MANAGEMENT" />}
      />

      <Route
        path={whatsappRoutes.EDIT_TEMPLATE}
        element={<WhatsappCreator classes={classes} key="wa-edit" />}
      />

      <Route
        path={whatsappRoutes.EDIT_CAMPAIGN_PAGE1}
        element={<SaveCampain classes={classes} />}
      />

      <Route
        path={whatsappRoutes.EDIT_CAMPAIGN_PAGE2}
        element={<SendCampaign classes={classes} key="wa-send-campaign-page2" />}
      />

      <Route
        path={whatsappRoutes.CHAT}
        element={<WhatsappChat classes={classes} key="wa-chate" />}
      />
      <Route
        path={whatsappRoutes.CHAT_CONVERSATION}
        element={<WhatsappChat classes={classes} key="wa-chat-conversation" />}
      />
      <Route
        path='/NewWebForm/NewFormEdit/:id'
        element={transferUrl('/Pulseem/NewWebForm/NewFormEdit/', 'id')}
      />
      <Route path='/react/ClientSearchResult/'>
        <Route path='' element={<ClientSearchResult classes={classes} />} />
        <Route path=':id' element={<ClientSearchResult classes={classes} />} />
      </Route>
      <Route
        path='/react/EditRegistrationPage'
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
        path={`/react/Reports/NewsletterReports`}
        element={<NewslettersReport classes={classes} />}
      />
      <Route
        path={`/ClalReport`}
        element={transferUrl('/Pulseem/ClalReport.aspx')}
      />
      <Route
        path={`/react/Reports/SMSMainReport`}
        element={<SmsReport classes={classes} />}
      />
      <Route
        exact
        path={'/react/Reports/SmsReplies/:id'}
        element={<SmsReplies classes={classes} key="byId" />}
      />
      <Route
        path={`/react/Reports/MmsMainReport`}
        element={<MmsReport classes={classes} />}
      />
      <Route
        exact
        path={`/react/reports/ProductsReport`}
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
        path={`/react/Reports/ProductsReport`}
        element={<ProductsReport classes={classes} />}
      />
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
        path={`/react/Reports/DirectSendReport`}
        element={<DirectSendReport classes={classes} isArchive={false} />}
      />
      <Route
        exact
        path={`/react/Reports/DirectSendReport/Archive`}
        element={<DirectSendReport classes={classes} isArchive={true} />}
      />
      <Route
        path={`/EmailCampaignStatistics`}
        element={transferUrl('/Pulseem/EmailCampaignStatistics.aspx')}
      />
      {/* Automations */}
      <Route
        path='/react/Automations'
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
        path={`/react/Notifications`}
        element={<NotificationManagement classes={classes} />}
      />
      <Route
        exact
        path={"/react/Notification/create"}
        element={<NotificationEdit classes={classes} key="create" />}
      />
      <Route
        exact
        path={"/react/Notification/edit/:id"}
        element={<NotificationEdit classes={classes} key="edit" />}
      />
      <Route
        exact
        path={"/react/Notification/send/:id"}
        element={<NotificationSend classes={classes} key="send" />}
      />
      {/* Settings */}
      <Route
        exact
        path={`/react/AccountSettings`}
        element={<AccountSettingsEditor classes={classes} />}
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
        path={`/react/SiteTracking`}
        element={<SiteTrackingEditor classes={classes} />}
      />
      <Route
        exact
        path={`/react/SystemMessage`}
        element={<SystemMessage classes={classes} />}
      />
      <Route exact
        path={`/react/Integrations`}
        element={<Integrations classes={classes} />}
      />
      <Route
        exact
        path={'/react/reports/Inbound'}
        element={<InboundMessages classes={classes} key="all" />}
      />
      <Route
        exact
        path={'/react/reports/Inbound/:type'}
        element={<InboundMessages classes={classes} key="byType" />}
      />
      <Route
        exact
        path={'/react/reports/Inbound/:type/:id'}
        element={<InboundMessages classes={classes} key="byTypeId" />}
      />
      <Route
        path="*"
        element={<PageNotFound classes={classes} />}
      />
      <Route
        exact
        path={'/react/Groups/Download'}
        element={<DownloadFiles classes={classes} />}
      />
    </Routes>
  )
}

const App = ({ screenSize }) => {
  let location = useLocation();
  const userName = useRef();
  const dispatch = useDispatch()
  const { language, isRTL, windowSize, isClal } = useSelector(state => state.core)
  const { accountSettings } = useSelector(state => state.common)
  setCookie('accountSettings', '');

  React.useEffect(() => {
    dispatch(getNotificationUpdates());
  }, [location]);

  useEffect(() => {
    screenSize && dispatch(setWindowSize(screenSize));
  }, [screenSize]);

  useEffect(() => {
    const initFeatures = async () => {
      if (!accountSettings) {
        await dispatch(getCommonFeatures());
      }
      if (isClal === null) {
        const response = await dispatch(isClalAccount());
        dispatch(setIsClal(response.payload));
      }
    }

    const updateToken = () => {
      const culture = getCookie('Culture');
      const token = getCookie('jtoken');
      const rpp = getCookie('rpp') || 6;
      if (!token) return;
      const jwt = jwt_decode(token);
      const {
        email = '',
        // unique_name = '',
        nameid: companyName,
        certthumbprint: billingTypeId,
        role: isAdmin,
        'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/homephone':
        phone = '',
        'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/locality':
        locality = 'he-IL',
        'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/stateorprovince':
        imageURL = '',
        'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/uri':
        isWhiteLabel = '',
        'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/authorizationdecision':
        cameFromSubAccount = '',
        // 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role': isAdmin = '',
        'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name':
        basename = '',
        'http://schemas.microsoft.com/ws/2008/06/identity/claims/userdata':
        isAllowSwitchAccount = '',
      } = jwt;

      dispatch(
        setCoreData({
          email,
          basename,
          phone,
          imageURL,
          isWhiteLabel,
          companyName,
          cameFromSubAccount,
          isAdmin,
          isAllowSwitchAccount,
          billingTypeId,
        })
      );
      let lang = culture || locality; //||'he'
      setCookie('Culture', lang.toLowerCase());
      lang = lang.split('-')[0];
      i18n.changeLanguage(lang.toLowerCase());
      dispatch(setRowsPerPage(rpp || 6));
      dispatch(setLanguage(lang.toLowerCase()));
      dispatch(setUsername(companyName));
      userName.current = companyName;
    };

    const cookieFunctionObj = {
      jtoken: updateToken,
    };

    // window.addEventListener('resize',setWindowWidth)
    cookieListener(({ name }) => {
      const cookieFunction = cookieFunctionObj[name] || null;
      if (!!cookieFunction) cookieFunction();
    });
    updateToken();
    initFeatures();
  }, [dispatch]);

  const classes = useClasses(windowSize, isRTL)();
  const theme = getTheme(language);
  const redirect = useNavigate();
  document.body.classList.add(classes.sidebar);

  if (isRTL) document.body.classList.add('rtl');
  else document.body.classList.remove('rtl');

  return accountSettings && (
    <MuiPickersUtilsProvider utils={MomentUtils} libInstance={moment} locale={language}>
      <MuiThemeProvider theme={theme}>
        <div dir={isRTL ? 'rtl' : 'ltr'}>
          {renderRoutes(classes, redirect)}
        </div>
      </MuiThemeProvider>
    </MuiPickersUtilsProvider>

  )
}

function useWidth() {
  const { language } = useSelector((state) => state.core);
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
  );
};

export default AppContainer;
