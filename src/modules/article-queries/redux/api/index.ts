import { TCompanyData } from 'modules/company/redux/api';
import baseApi from '../../../../redux/api';
import { TProductData } from 'modules/product/redux/api';
import { TLanguagesData } from 'redux/api/languages/languagesApi';

export type TArticleTypeData = {
  id: string;
  name: string;
  description: string;
};

export type TArticleStyleData = {
  id: string;
  name: string;
  description: string;
};

export type TArticleWordLengthData = {
  id: string;
  name: string;
  description: string;
};

export type TArticleQueriesData = {
  id: string;
  text: string;
  created_at: string;
  updated_at?: string;
  company: TCompanyData | null;
  product: TProductData | null;
  type: TArticleTypeData;
  style: TArticleStyleData;
  word_length: TArticleWordLengthData;
  language: TLanguagesData;
  author: string;
};

export type TArticleQueriesCreateData = {
  id?: string;
  text: string;
  company: string;
  product: string;
  type: string;
  style: string;
  word_length: string;
  language: string;
};

export type TArticleQueriesCreateResponse = {
  id: string;
};

export const articleQueriesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getArticleQueriesList: build.query<TArticleQueriesData[], void>({
      query: () => ({
        url: '/article-queries/',
        method: 'GET'
      }),
      transformResponse: (response: TArticleQueriesData[]) => response,
    }),
    getArticleQueriesById: build.query<TArticleQueriesData, string>({
      query: (id) => ({
        url: `/article-queries/${id}/`,
        method: 'GET'
      }),
      transformResponse: (response: TArticleQueriesData) => response,
    }),
    createArticleQueries: build.mutation<TArticleQueriesCreateResponse, TArticleQueriesCreateData>({
      query: ({ text, company, product, type, style, word_length, language }) => ({
        url: '/article-queries/',
        method: 'POST',
        body: {
          text,
          company,
          product,
          type,
          style,
          word_length,
          language,
        }
      }),
      transformResponse: (response: TArticleQueriesCreateResponse) => response,
    }),
    createArticleQueriesReplay: build.mutation<TArticleQueriesCreateResponse, TArticleQueriesCreateData>({
      query: ({ id, text, company, product, type, style, word_length, language }) => ({
        url: `/article-queries/${id}/replay/`,
        method: 'POST',
        body: {
          text,
          company,
          product,
          type,
          style,
          word_length,
          language,
        }
      }),
      transformResponse: (response: TArticleQueriesCreateResponse) => response,
    }),
    getArticleTypesList: build.query<TArticleTypeData[], void>({
      query: () => ({
        url: '/article-types/',
        method: 'GET'
      }),
      transformResponse: (response: TArticleTypeData[]) => response,
    }),
    getArticleStylesList: build.query<TArticleStyleData[], void>({
      query: () => ({
        url: '/article-styles/',
        method: 'GET'
      }),
      transformResponse: (response: TArticleStyleData[]) => response,
    }),
    getArticleWordLengthsList: build.query<TArticleWordLengthData[], void>({
      query: () => ({
        url: '/article-word-lengths/',
        method: 'GET'
      }),
      transformResponse: (response: TArticleWordLengthData[]) => response,
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetArticleQueriesListQuery,
  useGetArticleQueriesByIdQuery,
  useCreateArticleQueriesMutation,
  useCreateArticleQueriesReplayMutation,
  useGetArticleTypesListQuery,
  useGetArticleStylesListQuery,
  useGetArticleWordLengthsListQuery
} = articleQueriesApi; 