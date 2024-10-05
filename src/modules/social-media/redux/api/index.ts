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

type TAddSocielMediaResponse = {
  auth_url: string
}

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
    addFacebook: build.query<TAddSocielMediaResponse, void>({
      query: () => ({
        url: '/facebook/auth/',
        method: 'GET',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }),
      transformResponse: (response: TAddSocielMediaResponse) => response,
    }),
    addInstagram: build.query<TAddSocielMediaResponse, void>({
      query: () => ({
        url: '/instagram/auth/',
        method: 'GET',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }),
      transformResponse: (response: TAddSocielMediaResponse) => response,
    }),
    addLinkedin: build.query<string, void>({
      query: () => ({
        url: '/linkedin/auth/',
        method: 'GET',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }),
      transformResponse: (response: string) => response,
    }),
    addReddit: build.query<string, void>({
      query: () => ({
        url: '/reddit/auth/',
        method: 'GET',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }),
      transformResponse: (response: string) => response,
    }),
    addSnapchat: build.query<string, void>({
      query: () => ({
        url: '/snapchat/auth/',
        method: 'GET',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }),
      transformResponse: (response: string) => response,
    }),
    addTelegram: build.query<TAddSocielMediaResponse, void>({
      query: () => ({
        url: '/telegram/auth/',
        method: 'GET',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }),
      transformResponse: (response: TAddSocielMediaResponse) => response,
    }),
    addTiktok: build.query<string, void>({
      query: () => ({
        url: '/tiktok/auth/',
        method: 'GET',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }),
      transformResponse: (response: string) => response,
    }),
    addTumblr: build.query<string, void>({
      query: () => ({
        url: '/tumblr/auth/',
        method: 'GET',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }),
      transformResponse: (response: string) => response,
    }),
    addTwitter: build.query<TAddSocielMediaResponse, void>({
      query: () => ({
        url: '/twitter/auth/',
        method: 'GET',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }),
      transformResponse: (response: TAddSocielMediaResponse) => response,
    }),
    addVk: build.query<TAddSocielMediaResponse, void>({
      query: () => ({
        url: '/vk/auth/',
        method: 'GET',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }),
      transformResponse: (response: TAddSocielMediaResponse) => response,
    }),
    getTwitterCallback: build.query<TAddSocielMediaResponse, { oauth_token: string; oauth_verifier: string }>({
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
  useLazyAddFacebookQuery,
  useLazyAddInstagramQuery,
  useLazyAddLinkedinQuery,
  useLazyAddRedditQuery,
  useLazyAddSnapchatQuery,
  useLazyAddTelegramQuery,
  useLazyAddTiktokQuery,
  useLazyAddTumblrQuery,
  useLazyAddTwitterQuery,
  useLazyAddVkQuery,
  useLazyGetTwitterCallbackQuery,
} = postApi;
