import baseApi from '../../../../redux/api';

export type TPostData = {
  id: string;
  title: string;
  slug?: string;
  img_prompt: string;
  txt_prompt?: string;
  main_text: string;
  hashtags: string;
  like?: boolean;
  picture?: string;
  time_create?: string;
  time_update?: string;
  active?: boolean;
  img_style?: string;
  post_query: string;
  author: string;
}

export const postApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getPostList: build.query<TPostData[], void>({
      query: () => ({
        url: '/posts/',
        method: 'GET'
      }),
      transformResponse: (response: TPostData[]) => response,
    }),
    getPostById: build.query<TPostData, string>({
      query: (id) => ({
        url: `/posts/${id}`,
        method: 'GET'
      }),
      transformResponse: (response: TPostData) => response,
    }),
    deletePost: build.mutation<string, string>({
      query: (id) => ({
        url: `posts/${id}/`,
        method: 'DELETE'
      })
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetPostListQuery,
  useGetPostByIdQuery,
  useDeletePostMutation
} = postApi;
