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
    addTelegram: build.mutation<TTelegramResponse, string | undefined>({
      query: (company_id) => ({
        url: `/telegram/auth/${company_id}/`,
        method: 'GET'
      }),
      transformResponse: (response: TTelegramResponse) => response,
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetSocialMediaListQuery,
  useGetSocialMediaListByCurrentCompanyQuery,
  useAddTelegramMutation
} = postApi;
