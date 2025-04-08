import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TVideoData } from '../api';

interface VideoState {
  isVideoGenerated: boolean;
  generatedVideo: TVideoData | null;
  isCustomVideoCreated: boolean;
  createdCustomVideo: TVideoData | null;
  textGenerationStatus: 'pending' | 'in_progress' | 'completed' | 'failed';
  imageGenerationStatus: 'pending' | 'in_progress' | 'completed' | 'failed';
}

const initialState: VideoState = {
  isVideoGenerated: false,
  generatedVideo: null,
  createdCustomVideo: null,
  isCustomVideoCreated: false,
  textGenerationStatus: 'pending',
  imageGenerationStatus: 'pending'
};

const videoSlice = createSlice({
  name: 'video',
  initialState,
  reducers: {
    setIsVideoGenerated: (state, { payload }: PayloadAction<boolean>) => {
      state.isVideoGenerated = payload;
    },
    setGeneratedVideo: (state, { payload }: PayloadAction<TVideoData | null>) => {
      state.generatedVideo = payload;
    },
    setCreatedCustomVideo: (state, { payload }: PayloadAction<TVideoData | null>) => {
      state.createdCustomVideo = payload;
    },
    setIsCustomCreated: (state, { payload }: PayloadAction<boolean>) => {
      state.isCustomVideoCreated = payload;
    },
    setTextGenerationStatus: (state, { payload }: PayloadAction<'pending' | 'in_progress' | 'completed' | 'failed'>) => {
      state.textGenerationStatus = payload;
    },
    setImageGenerationStatus: (state, { payload }: PayloadAction<'pending' | 'in_progress' | 'completed' | 'failed'>) => {
      state.imageGenerationStatus = payload;
    },
  },
});

export const videoReducer = videoSlice.reducer;
export const videoActions = videoSlice.actions;
export type { VideoState };
