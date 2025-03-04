import baseApi from '../../../../redux/api';

export type TArticlesData = {
  id: string;
  query: string;
  title: string;
  text: string;
  created_at: string;
  updated_at: string;
};

export const articlesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getArticlesList: build.query<TArticlesData[], string>({
      query: (article_query_id) => ({
        url: `/article-queries/${article_query_id}/articles/`,
        method: 'GET'
      }),
      transformResponse: (response: TArticlesData[]) => response,
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetArticlesListQuery
} = articlesApi; 