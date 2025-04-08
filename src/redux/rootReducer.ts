import { combineReducers } from '@reduxjs/toolkit';
import { authReducer } from '../modules/auth/redux/slices/auth.slice';
import baseApi from './api';
import { contentPlanReducer } from 'modules/content-plan/redux/slices/contentPlan.slice';
import { postReducer } from 'modules/post/redux/slices/post.slice';
import { reelReducer } from 'modules/reel/redux/slices/reel.slice';
import { storiesReducer } from 'modules/stories/redux/slices/stories.slice';
import { videoReducer } from 'modules/video/redux/slices/video.slice';

const rootReducer = combineReducers({
  [baseApi.reducerPath]: baseApi.reducer,
  auth: authReducer,
  contentPlan: contentPlanReducer,
  post: postReducer,
  reel: reelReducer,
  stories: storiesReducer,
  video: videoReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
