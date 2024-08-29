import { combineReducers } from '@reduxjs/toolkit';
import { authReducer } from '../modules/auth/redux/slices/auth.slice';
import baseApi from './api';
import { contentPlanReducer } from 'modules/content-plan/redux/slices/contentPlan.slice';

const rootReducer = combineReducers({
  [baseApi.reducerPath]: baseApi.reducer,
  auth: authReducer,
  contentPlan: contentPlanReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
