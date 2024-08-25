import { TUserData } from 'modules/account/redux/api';
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
    getAuthUser: build.query<TUserData, void>({
      query: () => ({
        url: '/auth/user/',
          method: 'GET'
        }),
      transformResponse: (response: TUserData) => response,
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(authActions.setUser(data));
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
