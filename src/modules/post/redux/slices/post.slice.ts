import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TPostData } from '../api';

interface PostState {
  isPostGenerated: boolean;
  generatedPost: TPostData | null;
  isCustomPostCreated: boolean;
  createdCustomPost: TPostData | null;
}

const initialState: PostState = {
  isPostGenerated: false,
  generatedPost: null,
  createdCustomPost: null,
  isCustomPostCreated: false
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
    setCreatedCustomPost: (state, { payload }: PayloadAction<TPostData | null>) => {
      state.createdCustomPost = payload;
    },
    setIsCustomCreated: (state, { payload }: PayloadAction<boolean>) => {
      state.isCustomPostCreated = payload;
    },
  },
});

export const postReducer = postSlice.reducer;
export const postActions = postSlice.actions;
export type { PostState };
