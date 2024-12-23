import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TPostData } from 'modules/post/redux/api';
import { TReelData } from 'modules/reel/redux/api';
import { TStoriesData } from 'modules/stories/redux/api';

interface ContentPlanState {
  selectedPost: TPostData | TReelData | TStoriesData | null | undefined;
}

const initialState: ContentPlanState = {
  selectedPost: undefined,
};

const contentPlanSlice = createSlice({
  name: 'contentPlan',
  initialState,
  reducers: {
    setSelectedPost: (state, { payload }: PayloadAction<TPostData | TReelData | TStoriesData | null | undefined>) => {
      state.selectedPost = payload;
    },
  },
});

export const contentPlanReducer = contentPlanSlice.reducer;
export const contentPlanActions = contentPlanSlice.actions;
export type { ContentPlanState };
