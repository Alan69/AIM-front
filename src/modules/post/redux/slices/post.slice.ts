import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TPostData } from '../api';

interface PostState {
  isPostGenerated: boolean;
  generatedPost: TPostData | null;
  isCustomPostCreated: boolean;
  createdCustomPost: TPostData | null;
  textGenerationStatus: 'pending' | 'in_progress' | 'completed' | 'failed';
  imageGenerationStatus: 'pending' | 'in_progress' | 'completed' | 'failed';
}

const initialState: PostState = {
  isPostGenerated: false,
  generatedPost: null,
  createdCustomPost: null,
  isCustomPostCreated: false,
  textGenerationStatus: 'pending',
  imageGenerationStatus: 'pending'
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
    setTextGenerationStatus: (state, { payload }: PayloadAction<'pending' | 'in_progress' | 'completed' | 'failed'>) => {
      state.textGenerationStatus = payload;
    },
    setImageGenerationStatus: (state, { payload }: PayloadAction<'pending' | 'in_progress' | 'completed' | 'failed'>) => {
      state.imageGenerationStatus = payload;
    },
  },
});

export const postReducer = postSlice.reducer;
export const postActions = postSlice.actions;
export type { PostState };
