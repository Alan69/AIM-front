import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TPostSerializer } from 'modules/content-plan/types';

interface ContentPlanState {
  post: TPostSerializer | null;
}

const initialState: ContentPlanState = {
  post: null,
};

const contentPlanSlice = createSlice({
  name: 'contentPlan',
  initialState,
  reducers: {
    setPost: (state, { payload }: PayloadAction<TPostSerializer | null>) => {
      state.post = payload;
    },
  },
});

export const contentPlanReducer = contentPlanSlice.reducer;
export const contentPlanActions = contentPlanSlice.actions;
export type { ContentPlanState };
