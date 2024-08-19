import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import Cookies from 'js-cookie';

interface AuthState {
  token: string | null;
  refreshToken: string | null;
}

const initialState: AuthState = {
  token: Cookies.get('token') || null,
  refreshToken: Cookies.get('refreshToken') || null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setToken: (
      state,
      { payload: { refreshToken, token } }: PayloadAction<{ token: string | null; refreshToken: string | null }>
    ) => {
      state.token = token;
      state.refreshToken = refreshToken;

      if (token) {
        Cookies.set('token', token, { expires: 7 });
      }
      if (refreshToken) {
        Cookies.set('refreshToken', refreshToken, { expires: 7 });
      }
    },
    logout: (state) => {
      state.token = null;
      state.refreshToken = null;

      // Remove tokens from cookies
      Cookies.remove('token');
      Cookies.remove('refreshToken');
    },
  },
});

export const authReducer = authSlice.reducer;
export const authActions = authSlice.actions;
export type { AuthState };
