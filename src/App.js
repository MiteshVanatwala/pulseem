import React,{useEffect} from 'react';
import NewsletterManagment from './screens/NewsletterManagment';
import AutomationManagment from './screens/AutomationsManagment';
import LandingPagesesManagment from './screens/LandingPagesesManagment'
import MmsManagment from './screens/MmsManagment';
import SmsManagment from './screens/SmsManagment';
import Cookies from 'universal-cookie';
import {create} from 'jss';
import rtl from 'jss-rtl';
import jwt_decode from "jwt-decode";
import {StylesProvider,jssPreset,MuiThemeProvider} from '@material-ui/core/styles';
import i18n from './i18n'
import {BrowserRouter,useParams,Route} from 'react-router-dom';
import {useSelector,useDispatch} from 'react-redux';
import {setWindowSize} from './redux/reducers/coreSlice'
import {getTheme} from './style/theme'
import {useClasses} from './style/classes/index'
import {MuiPickersUtilsProvider} from '@material-ui/pickers';
import MomentUtils from '@date-io/moment';
import {useHistory} from "react-router-dom";
import moment from 'moment'
import NotificationManagement from './screens/NotificationManagement';
import TestScreen from './screens/TestScreen'

const renderRoutes=(classes,history) => {
  const transferUrl=(url='',param='') => () => {
    const {campaignID,automationID,id,notificationID}=useParams()
    const addParam={
      campaign: campaignID,
      automation: automationID,
      notification: notificationID,
      id: id
    }
    window.location.href=`https://www.pulseemdev.co.il/${url}${addParam[param]||''}`
    return <></>
  }
  return (
    <>

      <Route
        exact
        path="/"
        render={props => <TestScreen {...props} />}
      />
      <Route
        path={`/notifications/edit/:notificationID`}
        component={transferUrl('/Pulseem/notifications/Edit/','notification')}
      />
      <Route
        path={`/SendCampaign/:campaignID`}
        component={transferUrl('/Pulseem/SendCampaign.aspx?CampaignID=','campaign')}
      />
      <Route
        path={`/PreviewCampaign/:campaignID`}
        component={transferUrl('/Pulseem/PreviewCampaign.aspx?CampaignID=','campaign')}
      />
      <Route
        path={`/Editor/CampaignEdit/:campaignID`}
        component={transferUrl('/Pulseem/Editor/CampaignEdit/','campaign')}
      />
      <Route
        path={`/DuplicateCampign/:campaignID`}
        component={transferUrl('/Pulseem/DuplicateCampign/','campaign')}
      />
      <Route
        path={`/CampaignStatistics/:campaignID`}
        component={transferUrl('/Pulseem/CampaignStatistics.aspx?CampaignID=','campaign')}
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
        component={transferUrl('/Pulseem/SMSPreviewCampaign.aspx?SMSCampaignID=','id')}
      />
      <Route
        path={`/Edit/SMSCampaignEdit/:id`}
        component={transferUrl('/Pulseem/SMSCampaignEdit.aspx?SMSCampaignID=','id')}
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
        component={transferUrl('/Pulseem/MmsCampaignEdit.aspx?MmsCampaignID=','id')}
      />
      <Route
        path='/MmsPreviewCampaign/:id'
        component={transferUrl('/Pulseem/MmsPreviewCampaign.aspx?MmsCampaignID=','id')}
      />
      <Route
        path='/SendMmsCampaign/:id'
        component={transferUrl('/Pulseem/SendMmsCampaign.aspx?MmsCampaignID=','id')}
      />
      {/* Landing Pages */}

      <Route
        path='/NewWebForm/NewFormEdit/:id'
        component={transferUrl('/Pulseem/NewWebForm/NewFormEdit/','id')}
      />

      <Route
        path="/ClientSearchResult/:id"
        component={transferUrl('/Pulseem/ClientSearchResult.aspx?FormID=','id')}
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
        path={`/MainReport`}
        component={transferUrl('/Pulseem/MainReport.aspx')}
      />
      <Route
        path={`/ClalReport`}
        component={transferUrl('/Pulseem/ClalReport.aspx')}
      />
      <Route
        path={`/SMSMainReport`}
        component={transferUrl('/Pulseem/SMSMainReport.aspx')}
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
        path={`/DirectSmsReport`}
        component={transferUrl('/Pulseem/DirectSmsReport.aspx')}
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
        component={transferUrl('/Pulseem/CreateAutomations.aspx?AutomationID=','id')}
      />
      <Route
        path="/PreviewAutomations/:id"
        component={transferUrl('/Pulseem/CreateAutomations.aspx?Mode=show&AutomationID=','id')}
      />
      <Route
        path="/AutomationReport/:id"
        component={transferUrl('/Pulseem/automationreport.aspx?AutomationID=','id')}
      />
      {/* Notifications */}
      <Route
        path={`/Notifications`}
        render={props => <NotificationManagement {...props} classes={classes} />}
      />
      <Route
        path={`/Notification/create`}
        component={transferUrl('/Pulseem/Notification.aspx?t=add')}
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
          window.open("https://www.pulseem.co.il/Pages/Home.aspx?action=support","_blank")
          return null
        }}
      />
    </>
  )
}

const App=() => {
  const dispatch=useDispatch()
  const cookies=new Cookies();
  const token='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1bmlxdWVfbmFtZSI6IlBhdmVscyIsImh0dHA6Ly9zY2hlbWFzLnhtbHNvYXAub3JnL3dzLzIwMDUvMDUvaWRlbnRpdHkvY2xhaW1zL3NpZCI6IkZYYjc3TUFyMlUvWFRvYW85bnNZeFE9PSIsImh0dHA6Ly9zY2hlbWFzLnhtbHNvYXAub3JnL3dzLzIwMDUvMDUvaWRlbnRpdHkvY2xhaW1zL2RucyI6ImxvY2FsaG9zdCIsImh0dHA6Ly9zY2hlbWFzLnhtbHNvYXAub3JnL3dzLzIwMDUvMDUvaWRlbnRpdHkvY2xhaW1zL3VyaSI6IlRydWUiLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9sb2NhbGl0eSI6ImhlLUlMIiwiZW1haWwiOiJwb3N0bWFzdGVyQHB1bHNlZW0uY29tIiwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvd3MvMjAwNS8wNS9pZGVudGl0eS9jbGFpbXMvaG9tZXBob25lIjoid0wtMDktMTExMTExMSIsImh0dHA6Ly9zY2hlbWFzLnhtbHNvYXAub3JnL3dzLzIwMDUvMDUvaWRlbnRpdHkvY2xhaW1zL3N0YXRlb3Jwcm92aW5jZSI6IkNvbnRlbnQvaW1hZ2VzL1doaXRlTGFiZWxSaWdodENvcm5lckxvZ28ucG5nIiwiZ2l2ZW5fbmFtZSI6IiIsIm5iZiI6MTYyMDEzOTc3NiwiZXhwIjoxNjIwMTQzMzc2LCJpYXQiOjE2MjAxMzk3NzZ9.__vosPXeuSunBauj9_Zt9z7BA75rMsbGq0PTGY679GQ' //cookies.get('jtoken')
  const jwt=jwt_decode(token)
  console.log('JWT',jwt)
  useEffect(() => {
    const setWindowWidth=() => {
      const {innerWidth}=window
      let windowSize='xs'
      if(innerWidth>769&&innerWidth<1024)
        windowSize='sm'
      else if(innerWidth>=1025&&innerWidth<1200)
        windowSize='md'
      else if(innerWidth>=1201&&innerWidth<1400)
        windowSize='lg'
      else if(innerWidth>=1401)
        windowSize='xl'
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
      <BrowserRouter basename='/react'>
        <App />
      </BrowserRouter>
    </StylesProvider>
  )
}

export default AppContainer;
