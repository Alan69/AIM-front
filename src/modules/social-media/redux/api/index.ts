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
    addFacebook: build.query<string, void>({
      query: () => ({
        url: '/facebook/auth/',
        method: 'GET',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }),
      transformResponse: (response: string) => response,
    }),
    addInstagram: build.query<string, void>({
      query: () => ({
        url: '/instagram/auth/',
        method: 'GET',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }),
      transformResponse: (response: string) => response,
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
    addTelegram: build.query<string, void>({
      query: () => ({
        url: '/telegram/auth/',
        method: 'GET',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }),
      transformResponse: (response: string) => response,
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
    addTwitter: build.query<string, void>({
      query: () => ({
        url: '/twitter/auth/',
        method: 'GET',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }),
      transformResponse: (response: string) => response,
    }),
    addVk: build.query<string, void>({
      query: () => ({
        url: '/vk/auth/',
        method: 'GET',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }),
      transformResponse: (response: string) => response,
    }),
    addYoutube: build.query<string, void>({
      query: () => ({
        url: '/youtube/auth/',
        method: 'GET',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }),
      transformResponse: (response: string) => response,
    }),
    removePlatform: build.mutation<string, string>({
      query: (id) => ({
        url: `/platforms/accounts/remove/${id}/`,
        method: 'DELETE'
      })
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
  useLazyAddYoutubeQuery,
  useRemovePlatformMutation
} = postApi;
