import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import Cookies from 'js-cookie';
import { TProfileData } from 'modules/account/redux/api';
import { TCompanyData } from 'modules/company/redux/api';

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: TProfileData | null;
  current_company: TCompanyData | null;
}

const initialState: AuthState = {
  token: Cookies.get('token') || null,
  refreshToken: Cookies.get('refreshToken') || null,
  user: null,
  current_company: null
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
    setUser: (state, { payload }: PayloadAction<TProfileData | null>) => {
      state.user = payload;
    },
    setCurrentCompany: (state, { payload }: PayloadAction<TCompanyData | null>) => {
      state.current_company = payload;
    },
    logOut: (state) => {
      state.token = null;
      state.refreshToken = null;
      state.user = null;
      state.current_company = null

      Cookies.remove('token');
      Cookies.remove('refreshToken');
    },
  },
});

export const authReducer = authSlice.reducer;
export const authActions = authSlice.actions;
export type { AuthState };
