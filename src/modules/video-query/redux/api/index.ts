import { TCompanyData } from 'modules/company/redux/api';
import baseApi from '../../../../redux/api';
import { TProductData } from 'modules/product/redux/api';
import { TTextStylesData } from 'redux/api/textStyles/textStylesApi';
import { TLanguagesData } from 'redux/api/languages/languagesApi';
import { TVideoData } from 'modules/video/redux/api';
import { TVideoTypesData } from 'redux/api/videoTypes/videoTypesApi';

export type TVideoQueryData = {
  id: string;
  company: TCompanyData | null;
  product: TProductData | null;
  post_type: TVideoTypesData | null; 
  text_style: TTextStylesData | null;
  lang: TLanguagesData | null;
  author: string;
  content: string;
  time_create?: string;
  time_update?: string;
}

export type TVideoQueryCreateData = {
  company: string | undefined;
  product: string;
  post_type: string; 
  text_style: string;
  lang: string;
  content: string;
  with_image: boolean;
}

export type TVideoQueryDataResponse = {
  id: string;
  video_id: string;
  company: TCompanyData | null;
  product: TProductData | null;
  post_type: TVideoTypesData | null; 
  text_style: TTextStylesData | null;
  lang: TLanguagesData | null;
  author: string;
  content: string;
  time_create?: string;
  time_update?: string;
  error_message?: string;
}

export type TVideoQueryCreateReplayData = {
  id: string;
  company: string;
  product?: string;
  post_type: string; 
  text_style: string;
  lang: string;
  content: string;
}

export type TVideoQueryDataReplayResponse = {
  video_id: string;
  video_query_id: string;
}

export const videoQueryApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getVideoQueriesList: build.query<TVideoQueryData[], void>({
      query: () => ({
        url: '/videoqueries/company/',
        method: 'GET'
      }),
      transformResponse: (response: TVideoQueryData[]) => response,
    }),
    getVideoQueriesById: build.query<TVideoQueryData, string>({
      query: (id) => ({
        url: `/video_queries/${id}`,
        method: 'GET'
      }),
      transformResponse: (response: TVideoQueryData) => response,
    }),
    createVideoQuery: build.mutation<TVideoQueryDataResponse, TVideoQueryCreateData>({
      query: ({ content, company, product, post_type, text_style, lang, with_image }) => ({
        url: '/video_queries/',
        method: 'POST',
        body: {
          content,
          company,
          product,
          post_type,
          text_style,
          lang,
          with_image,
        }
      }),
      transformResponse: (response: TVideoQueryDataResponse) => response,
    }),
    createVideoQueryReplay: build.mutation<TVideoData, TVideoQueryCreateReplayData>({
      query: ({ id, content, company, product, post_type, text_style, lang }) => ({
        url: `/video_queries/${id}/replay/`,
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
      transformResponse: (response: TVideoData) => response,
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetVideoQueriesListQuery,
  useGetVideoQueriesByIdQuery,
  useCreateVideoQueryMutation,
  useCreateVideoQueryReplayMutation
} = videoQueryApi;
