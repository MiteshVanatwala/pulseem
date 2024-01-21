import { configureStore } from '@reduxjs/toolkit';
import userReducer from './reducers/userSlice';
import coreReducer from './reducers/coreSlice';
import newsletterReducer from './reducers/newsletterSlice';
import landingPagesReducer from './reducers/landingPagesSlice';
import mmsReducer from './reducers/mmsSlice';
import automationsReducer from './reducers/automationsSlice';
import notificationReducer from './reducers/notificationSlice';
import notificationUpdateSlice from './reducers/notificationUpdateSlice';
import smsReducer from './reducers/smsSlice';
import dashboardReducer from './reducers/dashboardSlice';
import recipientReportsReducer from './reducers/recipientsReportSlice';
import shortcutReducer from './reducers/shortcutSlice';
import paymentReducer from './reducers/paymentSlice';
import commonReducer from './reducers/commonSlice';
import siteTrackingReducer from './reducers/siteTrackingSlice';
import clientReducer from './reducers/clientSlice';
import campaignReducer from './reducers/campaignEditorSlice';
import groupSlice from './reducers/groupSlice';
import reportSlice from './reducers/reportSlice';
import ConnectorsSlice from './reducers/ConnectorsSlice';
import galleryReducer from './reducers/gallerySlice'
import whatsappReducer from './reducers/whatsappSlice'
import AccountSettingsSlice from './reducers/AccountSettingsSlice';
import DomainVerificationSlice from './reducers/DomainVerificationSlice';

export default configureStore({
  reducer: {
    core: coreReducer,
    user: userReducer,
    newsletter: newsletterReducer,
    landingPages: landingPagesReducer,
    mms: mmsReducer,
    automations: automationsReducer,
    notification: notificationReducer,
    notificationUpdate: notificationUpdateSlice,
    sms: smsReducer,
    dashboard: dashboardReducer,
    recipientReports: recipientReportsReducer,
    shortcuts: shortcutReducer,
    payment: paymentReducer,
    common: commonReducer,
    client: clientReducer,
    campaignEditor: campaignReducer,
    siteTracking: siteTrackingReducer,
    group: groupSlice,
    report: reportSlice,
    gallery: galleryReducer,
    whatsapp: whatsappReducer,
    accountSettings: AccountSettingsSlice,
    connectors: ConnectorsSlice,
    domainVerification: DomainVerificationSlice
  },
});
