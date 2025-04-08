import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TStoriesData } from '../api';

interface StoriesState {
  createdCustomStories: TStoriesData | null;
  isCustomStoriesCreated: boolean;
}

const initialState: StoriesState = {
  createdCustomStories: null,
  isCustomStoriesCreated: false
};

const storiesSlice = createSlice({
  name: 'stories',
  initialState,
  reducers: {
    setIsCustomStoriesCreated: (state, { payload }: PayloadAction<boolean>) => {
      state.isCustomStoriesCreated = payload;
    },
    setCreatedCustomStories: (state, { payload }: PayloadAction<TStoriesData | null>) => {
      state.createdCustomStories = payload;
    },
  },
});

export const storiesReducer = storiesSlice.reducer;
export const storiesActions = storiesSlice.actions;
export type { StoriesState };
