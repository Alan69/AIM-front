import { TProfileData, TUserData } from 'modules/account/redux/api';
import baseApi from '../../../../redux/api';
import { authActions } from '../slices/auth.slice';

type TLogin = {
  email: string;
  password: string;
}

type TSignUp = {
  email: string;
  password: string;
  password2: string;
  first_name: string;
  last_name: string;
}

type TLoginResponse = {
  data: {
    access: string;
    refresh: string;
  }
}

type TSignUpResponse = {
  access: string;
  refresh: string;
  user: TUserData;
}

export type TTokenResponse = {
  access: string;
  refresh: string;
}

export const authApi = baseApi.injectEndpoints({
	endpoints: (build) => ({
    getAuthUser: build.query<TProfileData, void>({
      query: () => ({
        url: '/auth/user/',
          method: 'GET'
        }),
      transformResponse: (response: TProfileData) => response,
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          // @ts-ignore
          dispatch(authActions.setUser(data));
          dispatch(authActions.setCurrentCompany(data.profile.user.current_company));
        } catch (err) {
          console.error('Failed to fetch user data', err);
        }
      },
    }),
    login: build.mutation<TLoginResponse, TLogin>({
      query: ({ email, password }) => ({
        url: '/token/',
        method: 'POST',
        body: {
          email,
          password,
        }
      }),
			transformResponse: (response: TLoginResponse) => response,
      extraOptions: { showErrors: false }
    }),
    signUp: build.mutation<TSignUpResponse, TSignUp>({
      query: ({ email, password, password2, first_name, last_name }) => ({
        url: '/user/register/',
        method: 'POST',
        body: {
          email,
          password,
          password2,
          first_name,
          last_name
        }
      }),
			transformResponse: (response: TSignUpResponse) => response,
    }),
    refreshToken: build.mutation<TTokenResponse, { refresh: string }>({
      query: ({ refresh }) => ({
        url: '/token/refresh/',
        method: 'POST',
        body: { refresh },
        headers: {
          'Content-Type': 'application/json',
        },
      }),
      transformResponse: (response: TTokenResponse) => response,
    }),
	}),
	overrideExisting: false,
});

export const {
  useLazyGetAuthUserQuery,
  useGetAuthUserQuery,
  useLoginMutation,
  useSignUpMutation,
  useRefreshTokenMutation
} = authApi;
