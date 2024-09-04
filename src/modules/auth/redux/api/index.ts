import { TProfileData, TUserData } from 'modules/account/redux/api';
import baseApi from '../../../../redux/api';
import { authActions } from '../slices/auth.slice';

type TLogin = {
  email: string;
  password: string;
}

type TLoginResponse = {
  data: {
    access: string;
    refresh: string;
  }
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
	}),
	overrideExisting: false,
});

export const {
  useLazyGetAuthUserQuery,
  useGetAuthUserQuery,
  useLoginMutation
} = authApi;
