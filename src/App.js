import React,{useEffect} from 'react';
import NewsletterManagnent from './screens/NewsletterManagnent';
import {create} from 'jss';
import rtl from 'jss-rtl';
import {StylesProvider,jssPreset,MuiThemeProvider} from '@material-ui/core/styles';
import i18n from './i18n'
import {BrowserRouter,useParams} from 'react-router-dom';
import {Router,Route} from 'react-router'
import {history} from './helpers/history'
import {useSelector,useDispatch} from 'react-redux';
import {setWindowSize} from './redux/reducers/coreSlice'
import {getTheme} from './style/theme'
import {useClasses} from './style/classes/index'
import {MuiPickersUtilsProvider} from '@material-ui/pickers';
import MomentUtils from '@date-io/moment';
//import {useHistory} from "react-router-dom";
import moment from 'moment'

const renderRoutes=(classes) => {
  const transferUrl=(url='',param='') => () => {
    const {campaignID,automationID}=useParams()
    const addParam={
      campaign: campaignID,
      automation: automationID
    }
    window.location.href=`https://www.pulseemdev.co.il/${url}${addParam[param]||''}`
    return null
  }
  return (
    <>
      <Route
        exact path="/"
        component={() => {
          history.push('/Campaigns')
          return null
        }}
      />
      <Route
        path="/SendCampaign/:campaignID"
        component={transferUrl('/Pulseem/SendCampaign.aspx?CampaignID=','campaign')}
      />
      <Route
        path="/PreviewCampaign/:campaignID"
        component={transferUrl('/Pulseem/PreviewCampaign.aspx?CampaignID=','campaign')}
      />
      <Route
        path="/Editor/CampaignEdit/:campaignID"
        component={transferUrl('/Editor/CampaignEdit/','campaign')}
      />
      <Route
        path="/DuplicateCampign/:campaignID"
        component={transferUrl('/DuplicateCampign/','campaign')}
      />
      <Route
        path="/CampaignStatistics/:campaignID"
        component={transferUrl('/Pulseem/CampaignStatistics.aspx?CampaignID=','campaign')}
      />
      <Route
        path="/CreateAutomations/:automationID"
        component={transferUrl('/Pulseem/CreateAutomations.aspx?Mode=show&AutomationID=','automation')}
      />
      <Route
        path="/homepage"
        component={transferUrl('/Pulseem/homepage.aspx')}
      />
      {/* Groups */}
      <Route
        path="/Groups"
        component={transferUrl('/Pulseem/Groups.aspx')}
      />
      <Route
        path="/ClientSearch"
        component={transferUrl('/Pulseem/ClientSearch.aspx')}
      />
      <Route
        path="/ClientAdvancedSearch"
        component={transferUrl('/Pulseem/ClientAdvancedSearch.aspx')}
      />
      <Route
        path="/DynamicGroups"
        component={transferUrl('/Pulseem/DynamicGroups.aspx')}
      />
      <Route
        path="/FileUploads"
        component={transferUrl('/Pulseem/FileUploads.aspx')}
      />
      {/* Newsletter */}
      <Route
        path="/Campaigns"
        render={props => <NewsletterManagnent {...props} classes={classes} />}
      />

      <Route
        path="/Editor/CampaignInfo"
        component={transferUrl('/Pulseem/Editor/CampaignInfo?new=1')}
      />
      <Route
        path="/CampaignsByResults"
        component={transferUrl('/Pulseem/CampaignsByResults.aspx')}
      />
      <Route
        path="/CampaignsAbTestings"
        component={transferUrl('/Pulseem/CampaignsAbTestings.aspx')}
      />
      <Route
        path="/AutoSendPlans"
        component={transferUrl('/Pulseem/AutoSendPlans.aspx')}
      />
      <Route
        path="/CampaignTemplates"
        component={transferUrl('/Pulseem/CampaignTemplates.aspx')}
      />
      <Route
        path="/CampaignEdit"
        component={transferUrl('/Pulseem/CampaignEdit.aspx?NewsLetterType=Basic')}
      />
      {/* SMS */}
      <Route
        path="/SMSCampaigns"
        component={transferUrl('/Pulseem/SMSCampaigns.aspx')}
      />
      <Route
        path="/SMSCampaignEdit"
        component={transferUrl('/Pulseem/SMSCampaignEdit.aspx?action=edit&t=create')}
      />
      <Route
        path="/SMSSmartResponses"
        component={transferUrl('/Pulseem/SMSSmartResponses.aspx')}
      />
      <Route
        path="/ResponsesReport"
        component={transferUrl('/Pulseem/ResponsesReport.aspx')}
      />
      {/* MMS */}
      <Route
        path="/MmsCampaigns"
        component={transferUrl('/Pulseem/MmsCampaigns.aspx')}
      />
      <Route
        path="/MmsCampaignEdit"
        component={transferUrl('/Pulseem/MmsCampaignEdit.aspx')}
      />
      {/* Landing Pages */}
      <Route
        path="/EditRegistrationPage"
        component={transferUrl('/Pulseem/EditRegistrationPage.aspx')}
      />
      <Route
        path="/LandingPageWizard"
        component={transferUrl('/Pulseem/LandingPageWizard.aspx')}
      />
      <Route
        path="/FormTemplates"
        component={transferUrl('/Pulseem/FormTemplates.aspx')}
      />
      {/* Reports */}
      <Route
        path="/MainReport"
        component={transferUrl('/Pulseem/MainReport.aspx')}
      />
      <Route
        path="/ClalReport"
        component={transferUrl('/Pulseem/ClalReport.aspx')}
      />
      <Route
        path="/SMSMainReport"
        component={transferUrl('/Pulseem/SMSMainReport.aspx')}
      />
      <Route
        path="/MmsMainReport"
        component={transferUrl('/Pulseem/MmsMainReport.aspx')}
      />
      <Route
        path="/AbTestsReport"
        component={transferUrl('/Pulseem/AbTestsReport.aspx')}
      />
      <Route
        path="/AccountReport"
        component={transferUrl('/Pulseem/AccountReport.aspx')}
      />
      <Route
        path="/CampaignComparison"
        component={transferUrl('/Pulseem/CampaignComparison.aspx')}
      />
      <Route
        path="/ClientReport"
        component={transferUrl('/Pulseem/ClientReport.aspx')}
      />
      <Route
        path="/EmailAutoReports"
        component={transferUrl('/Pulseem/EmailAutoReports.aspx')}
      />
      <Route
        path="/RemovedStats"
        component={transferUrl('/Pulseem/RemovedStats.aspx')}
      />
      <Route
        path="/DirectEmailReport"
        component={transferUrl('/Pulseem/DirectEmailReport.aspx')}
      />
      <Route
        path="/DirectSmsReport"
        component={transferUrl('/Pulseem/DirectSmsReport.aspx')}
      />
      <Route
        path="/EmailCampaignStatistics"
        component={transferUrl('/Pulseem/EmailCampaignStatistics.aspx')}
      />
      {/* Automations */}
      <Route
        path="/Automations"
        component={transferUrl('/Pulseem/Automations.aspx')}
      />
      <Route
        path="/CreateAutomations"
        component={transferUrl('/Pulseem/CreateAutomations.aspx')}
      />
      {/* Notifications */}
      <Route
        path="/Notification"
        component={transferUrl('/Pulseem/Notification.aspx?t=main')}
      />
      <Route
        path="/Notification/create"
        component={transferUrl('/Pulseem/Notification.aspx?t=add')}
      />
      {/* Settings */}
      <Route
        path="/AccountSettings"
        component={transferUrl('/Pulseem/AccountSettings.aspx')}
      />
      <Route
        path="/AccountBilling"
        component={transferUrl('/Pulseem/AccountBilling.aspx')}
      />
      <Route
        path="/AccountUsers"
        component={transferUrl('/Pulseem/AccountUsers.aspx')}
      />
      <Route
        path="/AccountUsersReport"
        component={transferUrl('/Pulseem/AccountUsersReport.aspx')}
      />
      <Route
        path="/ExtraFieldsDefinition"
        component={transferUrl('/Pulseem/ExtraFieldsDefinition.aspx')}
      />
      <Route
        path="/ApiSettings"
        component={transferUrl('/Pulseem/ApiSettings.aspx')}
      />
      {/* Support */}
      <Route
        path="/Support"
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
  //const history=useHistory()

  return (
    <MuiPickersUtilsProvider utils={MomentUtils} libInstance={moment} locale={language}>
      <MuiThemeProvider theme={theme}>
        <div dir={isRTL? 'rtl':'ltr'}>
          {renderRoutes(classes)}
        </div>
      </MuiThemeProvider>
    </MuiPickersUtilsProvider>

  )
}

const AppContainer=() => {
  const jss=create({plugins: [...jssPreset().plugins,rtl()]});
  //const history=createBrowserHistory({basename: '/React'})
  return (
    <StylesProvider jss={jss}>
      <Router history={history}>
        <App />
      </Router>
    </StylesProvider>
  )
}

export default AppContainer;
