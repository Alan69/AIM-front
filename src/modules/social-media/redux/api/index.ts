import baseApi from '../../../../redux/api';

export type TSocialMediaData = {
  id: number;
  name: string;
  icon: string;
}

export type TSocialMediaByCurrentCompanyData = {
  id: string;
  platform: TSocialMediaData;
  username: string;
  profile_url: string;
  company: string;
}

type TTelegramResponse = {
  auth_url: string
}

type TTwitterResponse = TTelegramResponse

export const postApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getSocialMediaList: build.query<TSocialMediaData[], void>({
      query: () => ({
        url: '/platforms/',
        method: 'GET'
      }),
      transformResponse: (response: TSocialMediaData[]) => response,
    }),
    getSocialMediaListByCurrentCompany: build.query<TSocialMediaByCurrentCompanyData[], void>({
      query: () => ({
        url: '/platforms/accounts/current-company/',
        method: 'GET'
      }),
      transformResponse: (response: TSocialMediaByCurrentCompanyData[]) => response,
    }),
    addTelegram: build.query<TTelegramResponse, void>({
      query: () => ({
        url: '/telegram/auth/',
        method: 'GET'
      }),
      transformResponse: (response: TTelegramResponse) => response,
    }),
    addTwitter: build.query<TTwitterResponse, void>({
      query: () => ({
        url: '/twitter/auth/',
        method: 'GET'
      }),
      transformResponse: (response: TTwitterResponse) => response,
    }),
    getTwitterCallback: build.query<TTwitterResponse, { oauth_token: string; oauth_verifier: string }>({
      query: ({ oauth_token, oauth_verifier }) => ({
        url: `/twitter/callback/?oauth_token=${oauth_token}&oauth_verifier=${oauth_verifier}`,
        method: 'GET',
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetSocialMediaListQuery,
  useGetSocialMediaListByCurrentCompanyQuery,
  useLazyAddTelegramQuery,
  useLazyAddTwitterQuery,
  useLazyGetTwitterCallbackQuery
} = postApi;
