import { TCompanyData } from 'modules/company/redux/api';
import baseApi from '../../../../redux/api';
import { TProductData } from 'modules/product/redux/api';
import { TPostTypesData } from 'redux/api/postTypes/postTypesApi';
import { TTextStylesData } from 'redux/api/textStyles/textStylesApi';
import { TLanguagesData } from 'redux/api/languages/languagesApi';
import { TPostData } from 'modules/post/redux/api';

export type TPostQueryData = {
  id: string;
  company: TCompanyData | null;
  product: TProductData | null;
  post_type: TPostTypesData | null; 
  text_style: TTextStylesData | null;
  lang: TLanguagesData | null;
  author: string;
  content: string;
  time_create?: string;
  time_update?: string;
}

export type TPostQueryCreateData = {
  company: string | undefined;
  product: string;
  post_type: string; 
  text_style: string;
  lang: string;
  content: string;
}

export type TPostQueryDataResponse = {
  id: string;
  post_id: string;
  company: TCompanyData | null;
  product: TProductData | null;
  post_type: TPostTypesData | null; 
  text_style: TTextStylesData | null;
  lang: TLanguagesData | null;
  author: string;
  content: string;
  time_create?: string;
  time_update?: string;
}

export type TPostQueryCreateReplayData = {
  id: string;
  company: string;
  product: string;
  post_type: string; 
  text_style: string;
  lang: string;
  content: string;
}

export type TPostQueryDataReplayResponse = {
  post_id: string;
  post_query_id: string;
}

export const postQueryApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getPostQueriesList: build.query<TPostQueryData[], void>({
      query: () => ({
        url: '/postqueries/company/',
        method: 'GET'
      }),
      transformResponse: (response: TPostQueryData[]) => response,
    }),
    getPostQueriesById: build.query<TPostQueryData, string>({
      query: (id) => ({
        url: `/post_queries/${id}`,
        method: 'GET'
      }),
      transformResponse: (response: TPostQueryData) => response,
    }),
    createPostQuery: build.mutation<TPostQueryDataResponse, TPostQueryCreateData>({
      query: ({ content, company, product, post_type, text_style, lang }) => ({
        url: '/post_queries/',
        method: 'POST',
        body: {
          content,
          company,
          product,
          post_type,
          text_style,
          lang,
        }
      }),
      transformResponse: (response: TPostQueryDataResponse) => response,
    }),
    createPostQueryReplay: build.mutation<TPostData, TPostQueryCreateReplayData>({
      query: ({ id, content, company, product, post_type, text_style, lang }) => ({
        url: `/post_queries/${id}/replay/`,
        method: 'POST',
        body: {
          content,
          company,
          product,
          post_type,
          text_style,
          lang,
        }
      }),
      transformResponse: (response: TPostData) => response,
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetPostQueriesListQuery,
  useGetPostQueriesByIdQuery,
  useCreatePostQueryMutation,
  useCreatePostQueryReplayMutation
} = postQueryApi;
