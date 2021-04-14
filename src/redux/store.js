import {configureStore} from '@reduxjs/toolkit';
import userReducer from './reducers/userSlice';
import coreReducer from './reducers/coreSlice'
import apiReducer from './reducers/apiSlice'

export default configureStore({
  reducer: {
    core: coreReducer,
    user: userReducer,
    api: apiReducer
  },
});
