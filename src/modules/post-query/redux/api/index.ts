import { TCompanyData } from 'modules/company/redux/api';
import baseApi from '../../../../redux/api';
import { TProductData } from 'modules/product/redux/api';
import { TPostTypesData } from 'redux/api/postTypes/postTypesApi';
import { TTextStylesData } from 'redux/api/textStyles/textStylesApi';
import { TLanguagesData } from 'redux/api/languages/languagesApi';

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

export const postQueryApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getPostQueriesList: build.query<TPostQueryData[], void>({
      query: () => ({
        url: '/post_queries/',
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
    createPostQuery: build.mutation<TPostQueryDataResponse, TPostQueryData>({
      query: ({ content, company, product, post_type, text_style, lang, author }) => ({
        url: '/post_queries/',
        method: 'POST',
        body: {
          content,
          company,
          product,
          post_type,
          text_style,
          lang,
          author
        }
      }),
      transformResponse: (response: TPostQueryDataResponse) => response,
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetPostQueriesListQuery,
  useGetPostQueriesByIdQuery,
  useCreatePostQueryMutation
} = postQueryApi;
