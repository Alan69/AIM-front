import { TCompanyData } from 'modules/company/redux/api';
import baseApi from '../../../../redux/api';
import { TProductData } from 'modules/product/redux/api';
import { TLanguagesData } from 'redux/api/languages/languagesApi';
import { TContentTypesData } from 'redux/api/contentTypes/contentTypesApi';
import { TThemesData } from 'redux/api/themes/themesApi';

export type TIdeaQueriesData = {
  id: string;
  company: TCompanyData | null;
  product: TProductData | null;
  target_audience: string;
  content_type: TContentTypesData;
  theme: TThemesData;
  language: TLanguagesData;
  description: string;
  author: string;
  time_create: string;
  time_update?: string;
}

export type TIdeaQueriesCreateData = {
  id?: string;
  company: string | undefined;
  product: string;
  target_audience: string; 
  content_type: string;
  theme: string;
  language: string;
  description: string;
}

export type TIdeaQueriesCreateResponse = {
  id: string;
  ai_response?: string;
}

export const ideaQueriesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getIdeaQueriesList: build.query<TIdeaQueriesData[], void>({
      query: () => ({
        url: '/idea-queries/',
        method: 'GET'
      }),
      transformResponse: (response: TIdeaQueriesData[]) => response,
    }),
    getIdeaQueriesById: build.query<TIdeaQueriesData, string>({
      query: (id) => ({
        url: `/idea-queries/${id}`,
        method: 'GET'
      }),
      transformResponse: (response: TIdeaQueriesData) => response,
    }),
    createIdeaQueries: build.mutation<TIdeaQueriesCreateResponse, TIdeaQueriesCreateData>({
      query: ({ company, product, target_audience, content_type, theme, language, description }) => ({
        url: '/idea-queries/',
        method: 'POST',
        body: {
          company,
          product,
          target_audience,
          content_type,
          theme,
          language,
          description
        }
      }),
      transformResponse: (response: TIdeaQueriesCreateResponse) => response,
    }),
    createIdeaQueriesReplay: build.mutation<TIdeaQueriesCreateResponse, TIdeaQueriesCreateData>({
      query: ({ id, company, product, target_audience, content_type, theme, language, description }) => ({
        url: `/idea-queries/${id}/replay/`,
        method: 'POST',
        body: {
          company,
          product,
          target_audience,
          content_type,
          theme,
          language,
          description
        }
      }),
      transformResponse: (response: TIdeaQueriesCreateResponse) => response,
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetIdeaQueriesListQuery,
  useGetIdeaQueriesByIdQuery,
  useCreateIdeaQueriesMutation,
  useCreateIdeaQueriesReplayMutation
} = ideaQueriesApi;
