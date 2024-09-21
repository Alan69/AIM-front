import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TPostData } from '../api';

interface PostState {
  isPostGenerated: boolean;
  generatedPost: TPostData | null;
}

const initialState: PostState = {
  isPostGenerated: false,
  generatedPost: null,
};

const postSlice = createSlice({
  name: 'post',
  initialState,
  reducers: {
    setIsPostGenerated: (state, { payload }: PayloadAction<boolean>) => {
      state.isPostGenerated = payload;
    },
    setGeneratedPost: (state, { payload }: PayloadAction<TPostData | null>) => {
      state.generatedPost = payload;
    },
  },
});

export const postReducer = postSlice.reducer;
export const postActions = postSlice.actions;
export type { PostState };
