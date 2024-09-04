import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TPostSerializer } from 'modules/content-plan/types';

interface ContentPlanState {
  selectedPost: TPostSerializer | null | undefined;
}

const initialState: ContentPlanState = {
  selectedPost: undefined,
};

const contentPlanSlice = createSlice({
  name: 'contentPlan',
  initialState,
  reducers: {
    setSelectedPost: (state, { payload }: PayloadAction<TPostSerializer | null | undefined>) => {
      state.selectedPost = payload;
    },
  },
});

export const contentPlanReducer = contentPlanSlice.reducer;
export const contentPlanActions = contentPlanSlice.actions;
export type { ContentPlanState };
