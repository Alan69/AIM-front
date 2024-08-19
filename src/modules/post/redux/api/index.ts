import baseApi from '../../../../redux/api';

type PostData = {
  id: number,
  slug?: string,
  content: string,
  post_prompt: string,
  time_create: string,
  time_update: string,
  company: number,
  product: number,
  post_type: number,
  text_style: number,
  lang: number,
  author: number
}

export const postApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getPostList: build.query<PostData[], void>({
      query: () => ({
        url: '/post_queries/',
        method: 'GET'
      }),
      transformResponse: (response: PostData[]) => response,
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetPostListQuery,
} = postApi;
