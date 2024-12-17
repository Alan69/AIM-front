import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TReelData } from '../api';

interface ReelState {
  isCustomReelCreated: boolean;
  createdCustomReel: TReelData | null;
}

const initialState: ReelState = {
  createdCustomReel: null,
  isCustomReelCreated: false
};

const reelSlice = createSlice({
  name: 'reel',
  initialState,
  reducers: {
    setCreatedCustomReel: (state, { payload }: PayloadAction<TReelData | null>) => {
      state.createdCustomReel = payload;
    },
    setIsCustomReelCreated: (state, { payload }: PayloadAction<boolean>) => {
      state.isCustomReelCreated = payload;
    },
  },
});

export const reelReducer = reelSlice.reducer;
export const reelActions = reelSlice.actions;
export type { ReelState };
