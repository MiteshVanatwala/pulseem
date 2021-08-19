import { configureStore } from '@reduxjs/toolkit';
import userReducer from './reducers/userSlice';
import coreReducer from './reducers/coreSlice';
import newsletterReducer from './reducers/newsletterSlice';
import landingPagesReducer from './reducers/landingPagesSlice';
import mmsReducer from './reducers/mmsSlice';
import automationsReducer from './reducers/automationsSlice';
import notificationReducer from './reducers/notificationSlice';
import smsReducer from './reducers/smsSlice';
import dashboardReducer from './reducers/dashboardSlice';
import recipientReportsReducer from './reducers/recipientsReportSlice';
import shortcutReducer from './reducers/shortcutSlice';

export default configureStore({
  reducer: {
    core: coreReducer,
    user: userReducer,
    newsletter: newsletterReducer,
    landingPages: landingPagesReducer,
    mms: mmsReducer,
    automations: automationsReducer,
    notification: notificationReducer,
    sms: smsReducer,
    dashboard: dashboardReducer,
    recipientReports: recipientReportsReducer,
    shortcuts: shortcutReducer
  },
});
