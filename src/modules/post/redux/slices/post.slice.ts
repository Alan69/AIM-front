import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface PostState {
  isPostCreated: boolean;
}

const initialState: PostState = {
  isPostCreated: false,
};

const contentPlanSlice = createSlice({
  name: 'post',
  initialState,
  reducers: {
    setPostCreated: (state, { payload }: PayloadAction<boolean>) => {
      state.isPostCreated = payload;
    },
  },
});

export const postReducer = contentPlanSlice.reducer;
export const postActions = contentPlanSlice.actions;
export type { PostState };
