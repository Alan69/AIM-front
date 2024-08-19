import { combineReducers } from '@reduxjs/toolkit';
import { authReducer } from '../modules/auth/redux/slices/auth.slice';
import baseApi from './api';

const rootReducer = combineReducers({
  [baseApi.reducerPath]: baseApi.reducer,
  auth: authReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
