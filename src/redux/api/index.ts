import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { TTokenResponse } from 'modules/auth/redux/api';
import { authActions } from 'modules/auth/redux/slices/auth.slice';
import { RootState } from 'redux/rootReducer';

const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://api.aimmagic.com/api/',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;

      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }

      return headers;
    },
  }),
  endpoints: (builder) => ({}),
  // @ts-ignore
  async baseQuery(args, api, extraOptions) {
    let result = await fetchBaseQuery({
      baseUrl: 'https://api.aimmagic.com/api/',
      prepareHeaders: (headers, { getState }) => {
        const token = (getState() as RootState).auth.token;
        if (token) {
          headers.set('Authorization', `Bearer ${token}`);
        }
        return headers;
      },
    })(args, api, extraOptions);

    if (result.error && (result.error.status === 401 || result.error.status === 403)) {
      const refreshToken = (api.getState() as RootState).auth.refreshToken;

      if (refreshToken) {
        const refreshResult = await fetchBaseQuery({
          baseUrl: 'https://api.aimmagic.com/api/',
        })(
          {
            url: '/token/refresh/',
            method: 'POST',
            body: { refresh: refreshToken },
          },
          api,
          extraOptions
        );

        if (refreshResult.data) {
          const newTokens = refreshResult.data as TTokenResponse;
          api.dispatch(authActions.setToken({ token: newTokens.access, refreshToken: newTokens.refresh }));

          result = await fetchBaseQuery({
            baseUrl: 'https://api.aimmagic.com/api/',
            prepareHeaders: (headers) => {
              headers.set('Authorization', `Bearer ${newTokens.access}`);
              return headers;
            },
          })(args, api, extraOptions);
        } else {
          api.dispatch(authActions.logOut());
        }
      } else {
        api.dispatch(authActions.logOut());
      }
    }

    return result;
  },
});

export default baseApi;
