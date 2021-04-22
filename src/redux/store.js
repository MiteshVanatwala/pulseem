import {configureStore} from '@reduxjs/toolkit';
import userReducer from './reducers/userSlice';
import coreReducer from './reducers/coreSlice'
import newsletterReducer from './reducers/newsletterSlice'
import landingPagesReducer from './reducers/landingPagesSlice'

export default configureStore({
  reducer: {
    core: coreReducer,
    user: userReducer,
    newsletter: newsletterReducer,
    landingPages: landingPagesReducer
  },
});
