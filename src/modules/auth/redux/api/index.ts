import baseApi from '../../../../redux/api';

type TLogin = {
  email: string;
  password: string;
}

type TLoginResponse = {
  access: string;
  refresh: string;
}

export const authApi = baseApi.injectEndpoints({
	endpoints: (build) => ({
    getAuthUser: build.query<void, void>({
      query: () => ({
        url: '/auth-user/',
          method: 'GET'
        }),
      // transformResponse: (response: TProfilesData[]) => response,
    }),
    login: build.mutation<TLoginResponse, TLogin>({
      query: ({ email, password }) => ({
        url: 'user/login/',
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
